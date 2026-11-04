import assert from 'node:assert/strict';
import test from 'node:test';

// Import the built package so these run against the shipped artifact.
process.env.NODE_ENV = 'test';
const { ModelRegistry, ModelCollisionError, defineModel, fields, dotProduct, cosineSimilarity, euclideanDistance } =
  await import('../dist/index.js');

function model(name, tableName) {
  return defineModel({ name, tableName, fields: { label: fields.char({}) } });
}

test('registering a different model under the same name throws ModelCollisionError', () => {
  const registry = new ModelRegistry();
  registry.register(model('dupe.thing', 'dupe_thing_a'));
  assert.throws(
    () => registry.register(model('dupe.thing', 'dupe_thing_b')),
    (err) => err instanceof ModelCollisionError && err.name === 'ModelCollisionError',
  );
});

test('registering a different model under the same table throws ModelCollisionError', () => {
  const registry = new ModelRegistry();
  registry.register(model('table.a', 'shared_table'));
  assert.throws(() => registry.register(model('table.b', 'shared_table')), ModelCollisionError);
});

test('re-registering the identical definition is idempotent', () => {
  const registry = new ModelRegistry();
  const shared = model('shared.instance', 'shared_instance');
  registry.register(shared);
  registry.register(shared);
  assert.equal(registry.get('shared.instance'), shared);
});

test('overwrite option permits replacing a divergent definition', () => {
  const registry = new ModelRegistry();
  registry.register(model('over.thing', 'over_a'));
  const replacement = model('over.thing', 'over_b');
  registry.register(replacement, { overwrite: true });
  assert.equal(registry.get('over.thing'), replacement);
});

test('vector math fails closed on mismatched dimensions', () => {
  assert.throws(() => dotProduct([1, 2, 3], [1, 2]), RangeError);
  assert.throws(() => cosineSimilarity([1, 2, 3], [1, 2]), RangeError);
  assert.throws(() => euclideanDistance([1, 2, 3], [1, 2]), RangeError);
});

test('vector math matches equal-length inputs', () => {
  assert.equal(dotProduct([1, 2, 3], [4, 5, 6]), 32);
  assert.equal(euclideanDistance([0, 0], [3, 4]), 5);
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
});
