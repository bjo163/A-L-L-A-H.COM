// Bidirectional reconciliation between the .plans/ payload (sent by VS Code Extension)
// and project.task records in PGlite. The Hub never reads the local filesystem directly;
// the Extension scans locally and POSTs a SyncPayload here.

import { dbEngine, BaseRepository, sha256Hex, SYSTEM_ACTOR, type TenantScope } from '@allah/arsy-orm';
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
  const projectRepo = new BaseRepository(ProjectProject, dbEngine);
  const taskRepo = new BaseRepository(ProjectTask, dbEngine);

  let tasksInserted = 0;
  let tasksUpdated = 0;
  const outboundPatches: OutboundPatch[] = [];

  for (const plan of plans) {
    // Load all existing tasks for this plan slug under this project.
    const existing = await taskRepo.find({
      scope,
      filters: [
        { field: 'project_id', operator: '=', value: projectId },
        { field: 'plan_slug', operator: '=', value: plan.slug },
      ],
    }) as Array<Record<string, unknown>>;

    const existingByLine = new Map<number, Record<string, unknown>>(
      existing.map((r) => [r.line_index as number, r])
    );

    // Inbound: local file -> hub DB.
    for (const scanned of plan.tasks) {
      const dbRecord = existingByLine.get(scanned.lineIndex);

      if (!dbRecord) {
        await taskRepo.create(
          {
            company_id: companyId,
            project_id: projectId,
            plan_slug: plan.slug,
            source_file: 'task.md',
            name: scanned.text,
            state: scanned.state,
            line_index: scanned.lineIndex,
            file_hash: scanned.fileHash,
          },
          scope,
          SYSTEM_ACTOR
        );
        tasksInserted++;
        continue;
      }

      // Task exists: inbound wins if file_hash changed (file was edited locally).
      if (dbRecord.file_hash !== scanned.fileHash) {
        await taskRepo.updateById(
          dbRecord.id as number,
          { state: scanned.state, file_hash: scanned.fileHash, name: scanned.text },
          scope,
          SYSTEM_ACTOR
        );
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

    // Handle tasks removed from the local file (not in scanned set).
    for (const dbRecord of existing) {
      const stillPresent = plan.tasks.some((t) => t.lineIndex === (dbRecord.line_index as number));
      if (!stillPresent) {
        // Fail-closed: never delete tasks under legal_hold.
        if (dbRecord.legal_hold === true) continue;
        await taskRepo.deleteById(dbRecord.id as number, scope, SYSTEM_ACTOR);
      }
    }
  }

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
}
