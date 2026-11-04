import assert from 'node:assert/strict';
import test from 'node:test';

// Import the built package so these run against the shipped artifact.
process.env.NODE_ENV = 'test';
const { QueryBuilder, defineModel, fields, TenantScopeRequiredError, UnknownFieldError, UnsupportedOperatorError } =
  await import('../dist/index.js');

const Model = defineModel({
  name: 'demo.thing',
  tableName: 'demo_thing',
  fields: {
    company_id: fields.many2one('res.company', { required: true }),
    name: fields.char({ required: true }),
    amount: fields.integer({}),
  },
});

const qb = new QueryBuilder(Model);
const tenant = { companyId: 7 };

test('tenant scope is fail-closed', async (t) => {
  await t.test('a select with no scope throws instead of scanning all tenants', () => {
    assert.throws(() => qb.buildSelect({}), TenantScopeRequiredError);
  });

  await t.test('a system-scope select opts in explicitly and adds no tenant filter', () => {
    const { sql } = qb.buildSelect({ scope: { systemScope: true } });
    assert.ok(!sql.includes('company_id ='), 'systemScope must not inject a company_id predicate');
  });

  await t.test('a tenant scope pins the company_id predicate', () => {
    const { sql, params } = qb.buildSelect({ scope: tenant });
    assert.match(sql, /"company_id" = \$1/);
    assert.equal(params[0], 7);
  });
});

test('identifiers are whitelisted against the model', async (t) => {
  await t.test('an unknown filter field is rejected', () => {
    assert.throws(
      () => qb.buildSelect({ scope: tenant, filters: [{ field: 'password_hash', operator: '=', value: 'x' }] }),
      UnknownFieldError
    );
  });

  await t.test('a SQL fragment in orderBy is rejected, not interpolated', () => {
    assert.throws(
      () => qb.buildSelect({ scope: tenant, orderBy: 'name; DROP TABLE demo_thing' }),
      UnknownFieldError
    );
  });

  await t.test('an unsupported operator is rejected', () => {
    assert.throws(
      () => qb.buildSelect({ scope: tenant, filters: [{ field: 'name', operator: 'ILIKE;', value: 'x' }] }),
      UnsupportedOperatorError
    );
  });

  await t.test('a known filter field produces a parameterized predicate', () => {
    const { sql, params } = qb.buildSelect({ scope: tenant, filters: [{ field: 'amount', operator: '>', value: 5 }] });
    assert.match(sql, /"amount" > \$2/);
    assert.deepEqual(params, [7, 5]);
  });
});

test('inserts honour tenancy and column whitelist', async (t) => {
  await t.test('a caller-supplied company_id is dropped in tenant scope and replaced by the tenant', () => {
    const { sql, params } = qb.buildInsert({ name: 'a', company_id: 999 }, tenant, 1);
    assert.ok(!params.includes(999), 'body company_id must never win');
    assert.ok(params.includes(7));
  });

  await t.test('an unknown insert column is rejected', () => {
    assert.throws(() => qb.buildInsert({ bogus: 1 }, tenant, 1), UnknownFieldError);
  });

  await t.test('an ORM-managed column is rejected for writes', () => {
    assert.throws(() => qb.buildInsert({ create_date: 'x' }, tenant, 1), /managed by the ORM/);
  });

  await t.test('systemScope insert requires an explicit company_id', () => {
    assert.throws(() => qb.buildInsert({ name: 'a' }, { systemScope: true }, 1), /explicit company_id/);
  });
});
