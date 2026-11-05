import { test } from 'node:test';
import assert from 'node:assert';

process.env.NODE_ENV = 'test';
const { defineModel, fields, BaseRepository, SelectionValueError } = await import('../dist/index.js');

test('selection field validation', async (t) => {
  const testModel = defineModel({
    name: 'test.selection',
    tableName: 'test_selection',
    fields: {
      name: fields.char({ required: true }),
      state: fields.selection({
        draft: 'Draft',
        confirmed: 'Confirmed',
        done: 'Done',
      }),
    },
  });

  await t.test('rejects invalid selection value on create', async () => {
    const repo = new BaseRepository(testModel);
    await assert.rejects(
      async () => {
        await repo.create(
          { name: 'Test', state: 'invalid' },
          { systemScope: true },
          { type: 'system' }
        );
      },
      SelectionValueError,
      'Should throw SelectionValueError for invalid state'
    );
  });

  await t.test('accepts valid selection value on create', async () => {
    const repo = new BaseRepository(testModel);
    await assert.doesNotReject(async () => {
      try {
        await repo.create(
          { name: 'Test', state: 'confirmed' },
          { systemScope: true },
          { type: 'system' }
        );
      } catch (error) {
        if (error instanceof SelectionValueError) throw error;
      }
    }, 'Should not throw SelectionValueError for valid state');
  });

  await t.test('rejects invalid selection value on updateById', async () => {
    const repo = new BaseRepository(testModel);
    await assert.rejects(
      async () => {
        await repo.updateById(
          1,
          { state: 'bogus' },
          { systemScope: true },
          { type: 'system' }
        );
      },
      SelectionValueError,
      'Should throw SelectionValueError for invalid state'
    );
  });

  await t.test('allows null and undefined for optional selection', async () => {
    const repo = new BaseRepository(testModel);
    await assert.doesNotReject(async () => {
      try {
        await repo.create(
          { name: 'Test', state: null },
          { systemScope: true },
          { type: 'system' }
        );
      } catch (error) {
        if (error instanceof SelectionValueError) throw error;
      }
    }, 'Should not throw for null selection value');
  });

  await t.test('validates all rows in createMany', async () => {
    const repo = new BaseRepository(testModel);
    await assert.rejects(
      async () => {
        await repo.createMany(
          [
            { name: 'Test1', state: 'draft' },
            { name: 'Test2', state: 'invalid' },
          ],
          { systemScope: true },
          { type: 'system' }
        );
      },
      SelectionValueError,
      'Should throw SelectionValueError for invalid state in batch'
    );
  });

  await t.test('validates all updates in updateMany', async () => {
    const repo = new BaseRepository(testModel);
    await assert.rejects(
      async () => {
        await repo.updateMany(
          [
            { id: 1, data: { state: 'confirmed' } },
            { id: 2, data: { state: 'wrong' } },
          ],
          { systemScope: true },
          { type: 'system' }
        );
      },
      SelectionValueError,
      'Should throw SelectionValueError for invalid state in batch update'
    );
  });
});
