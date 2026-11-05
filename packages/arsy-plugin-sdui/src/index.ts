import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ok, fail } from '@allah/arsy-core';
import { BaseRepository, PLATFORM_COMPANY_ID, dbEngine, modelRegistry } from '@allah/arsy-orm';

export interface SduiPluginOptions {
  prefix?: string;
}

// Platform-owned view definitions live at the shared tenant (company_id 0); they
// are design-time schema metadata, not tenant data, so a system-scoped read is
// correct and leaks nothing. A tenant-specific override (a row at that company)
// is preferred when one exists.
async function loadPersistedView(
  model: string,
  viewType: string,
  companyId: number | undefined,
): Promise<{ title: string; arch: Record<string, unknown> } | null> {
  const viewDef = modelRegistry.get('ir.ui.view');
  if (!viewDef) return null;
  // Boot resilience: if the view model is not yet migrated, fall back silently.
  try {
    const repo = new BaseRepository<Record<string, unknown>>(viewDef, dbEngine, dbEngine);
    const rows = await repo.find({
      scope: { systemScope: true },
      filters: [
        { field: 'model', operator: '=', value: model },
        { field: 'view_type', operator: '=', value: viewType },
      ],
      limit: 50,
    });
    const chosen =
      (companyId !== undefined ? rows.find((r) => Number(r.company_id) === companyId) : undefined) ??
      rows.find((r) => Number(r.company_id) === PLATFORM_COMPANY_ID) ??
      rows[0];
    if (!chosen) return null;
    const arch = (chosen.arch_json ?? {}) as Record<string, unknown>;
    const title = typeof arch.title === 'string' ? arch.title : String(chosen.name ?? `${model} (${viewType})`);
    return { title, arch };
  } catch {
    return null;
  }
}

const sduiPluginAsync: FastifyPluginAsync<SduiPluginOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/v1/sdui';

  fastify.get<{
    Params: { model: string; view_type: string };
  }>(`${prefix}/:model/:view_type`, async (request, reply) => {
    const { model, view_type } = request.params;
    const modelDef = modelRegistry.get(model);

    if (!modelDef) {
      reply.status(404);
      return fail('MODEL_NOT_FOUND', `Model '${model}' is not registered`);
    }

    // Prefer a persisted view declaration from `ir.ui.view` (roadmap T3.1); the
    // boot seeder writes manifest-declared views there. When no row exists we
    // fall back to the synthetic arch derived from model fields (prior behavior)
    // so the endpoint stays non-breaking for models without a declared view.
    const principal = (request as { principal?: { companyId?: string | number } }).principal;
    const companyId = principal?.companyId === undefined ? undefined : Number(principal.companyId);
    const persisted = await loadPersistedView(model, view_type, companyId);
    if (persisted) {
      return ok({ model, view_type, title: persisted.title, arch: persisted.arch });
    }

    // Fallback dynamic view schema, built from the ORM's own fields_get
    // introspection rather than a hand-listed subset, so selection options and
    // relation targets reach the renderer (roadmap S4.4, AC-12).
    const fieldMeta = new BaseRepository(modelDef).fieldsGet();
    const fieldsList = Object.entries(fieldMeta).map(([name, def]) => ({
      name,
      label: (def.string as string) || name,
      type: def.type,
      required: def.required ?? false,
      ...(def.relation ? { relation: def.relation } : {}),
      ...(def.selection ? { selection: def.selection } : {}),
    }));

    const viewSchema = {
      model,
      view_type,
      title: `${modelDef.displayName} (${view_type})`,
      arch: {
        fields: fieldsList,
      },
    };

    return ok(viewSchema);
  });
};

export const sduiPlugin = fp(sduiPluginAsync, {
  name: '@allah/arsy-plugin-sdui',
  fastify: '5.x',
});

export default sduiPlugin;
