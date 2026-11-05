import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SchemaMigrator,
  SYSTEM_ACTOR,
} from '@allah/arsy-orm';
import { registerAddonsFor } from '../../../addons/index.ts';
import { loadDefaultData as loadBaseDefaultData } from '../../../addons/base/data/index.ts';
import { loadDefaultData } from '../../../addons/mw_notify/data/index.ts';

test('sentinel registers and seeds the notification template catalog', async () => {
  registerAddonsFor(['nexus', 'mw_notify']);
  await dbEngine.connect();
  try {
    await new SchemaMigrator(dbEngine).sync();
    const repository = (modelName) => {
      const model = modelRegistry.get(modelName);
      assert.ok(model, `model ${modelName} is registered`);
      return new BaseRepository(model, dbEngine, dbEngine);
    };
    const context = { repository, actor: SYSTEM_ACTOR };

    await loadBaseDefaultData(context);
    await loadDefaultData(context);
    await loadBaseDefaultData(context);
    await loadDefaultData(context);

    const templates = await repository('notify.template').find({
      scope: { systemScope: true },
      filters: [{ field: 'code', operator: '=', value: 'radius.auth_failure' }],
      limit: 2,
    });
    assert.equal(templates.length, 1);
    assert.equal(templates[0].company_id, 0);
  } finally {
    await dbEngine.close();
  }
});
