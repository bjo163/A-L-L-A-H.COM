// Bidirectional reconciliation between the .plans/ payload (sent by VS Code Extension)
// and project.task records in PGlite. The Hub never reads the local filesystem directly;
// the Extension scans locally and POSTs a SyncPayload here.

import { withTransaction, sha256Hex, SYSTEM_ACTOR, type TenantScope } from '@allah/arsy-orm';
import { ProjectProject } from '../models/project_project';
import { ProjectTask } from '../models/project_task';
import type { ScannedPlan, TaskMarkerState } from './plan_scanner';

export interface SyncResult {
  projectId: number;
  plansScanned: number;
  tasksInserted: number;
  tasksUpdated: number;
  outboundPatches: OutboundPatch[];
}

// Returned to the caller so the Extension can apply outbound patches to task.md files.
export interface OutboundPatch {
  planSlug: string;
  lineIndex: number;
  sourceLine: string;
  newState: TaskMarkerState;
}

export async function reconcilePlans(
  companyId: number,
  projectId: number,
  plans: ScannedPlan[]
): Promise<SyncResult> {
  const scope: TenantScope = { companyId };

  // Roadmap T3.5: the whole reconcile is one atomic batch. All existing tasks for
  // the project are read once (not per-plan), inserts/updates are collected and
  // flushed through createMany/updateMany, and the single project-metadata update
  // rides the same transaction (withTransaction keeps every write audit-safe).
  return withTransaction(async (tx) => {
    const projectRepo = tx.repositoryFor(ProjectProject);
    const taskRepo = tx.repositoryFor(ProjectTask);

    const existingAll = (await taskRepo.find({
      scope,
      filters: [{ field: 'project_id', operator: '=', value: projectId }],
    })) as Array<Record<string, unknown>>;
    const existingByKey = new Map<string, Record<string, unknown>>(
      existingAll.map((r) => [`${String(r.plan_slug)}|${Number(r.line_index)}`, r])
    );

    let tasksInserted = 0;
    let tasksUpdated = 0;
    const outboundPatches: OutboundPatch[] = [];
    const insertRows: Record<string, unknown>[] = [];
    const updateEntries: Array<{ id: number; data: Record<string, unknown> }> = [];
    const deleteIds: number[] = [];

    for (const plan of plans) {
      // Inbound: local file -> hub DB.
      for (const scanned of plan.tasks) {
        const dbRecord = existingByKey.get(`${plan.slug}|${scanned.lineIndex}`);

        if (!dbRecord) {
          insertRows.push({
            company_id: companyId,
            project_id: projectId,
            plan_slug: plan.slug,
            source_file: 'task.md',
            name: scanned.text,
            state: scanned.state,
            line_index: scanned.lineIndex,
            file_hash: scanned.fileHash,
          });
          tasksInserted++;
          continue;
        }

        // Task exists: inbound wins if file_hash changed (file was edited locally).
        if (dbRecord.file_hash !== scanned.fileHash) {
          updateEntries.push({
            id: Number(dbRecord.id),
            data: { state: scanned.state, file_hash: scanned.fileHash, name: scanned.text },
          });
          tasksUpdated++;
          continue;
        }

        // File unchanged: hub state may have been updated from UI/API.
        // Emit outbound patch so Extension can apply the state back to task.md.
        if (dbRecord.state !== scanned.state) {
          outboundPatches.push({
            planSlug: plan.slug,
            lineIndex: scanned.lineIndex,
            sourceLine: scanned.sourceLine,
            newState: dbRecord.state as TaskMarkerState,
          });
        }
      }

      // Handle tasks removed from this plan's local file (not in the scanned set).
      for (const dbRecord of existingAll) {
        if (dbRecord.plan_slug !== plan.slug) continue;
        const stillPresent = plan.tasks.some((t) => t.lineIndex === Number(dbRecord.line_index));
        if (!stillPresent) {
          // Fail-closed: never delete tasks under legal_hold.
          if (dbRecord.legal_hold === true) continue;
          deleteIds.push(Number(dbRecord.id));
        }
      }
    }

    if (insertRows.length > 0) await taskRepo.createMany(insertRows, scope, SYSTEM_ACTOR);
    if (updateEntries.length > 0) await taskRepo.updateMany(updateEntries, scope, SYSTEM_ACTOR);
    // Physical delete has no batched primitive; removals are rare relative to
    // inserts/updates, so the fail-closed per-row delete loop stays.
    for (const id of deleteIds) await taskRepo.deleteById(id, scope, SYSTEM_ACTOR);

    // Update project sync metadata.
    const syncHash = sha256Hex(JSON.stringify(plans.map((p) => p.folderHash)));
    await projectRepo.updateById(
      projectId,
      { last_sync_at: new Date().toISOString(), sync_hash: syncHash },
      scope,
      SYSTEM_ACTOR
    );

    // Sync complete.
    return {
      projectId,
      plansScanned: plans.length,
      tasksInserted,
      tasksUpdated,
      outboundPatches,
    };
  });
}
