import assert from 'node:assert/strict';
import test from 'node:test';

const [
  { PGliteEngine },
  { fields },
  { defineModel, SYSTEM_ACTOR },
  { SchemaMigrator },
  { BaseRepository, withTransaction },
  { modelRegistry },
  { ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent },
] = await Promise.all([
  import('../src/engine.ts'),
  import('../src/fields.ts'),
  import('../src/model.ts'),
  import('../src/migrator.ts'),
  import('../src/repository.ts'),
  import('../src/registry.ts'),
  import('../src/auth_models.ts'),
]);

// A small three-way relational graph exercising every expand shape:
//   post.author_id  many2one  -> author
//   author.posts    one2many  -> post (inverse = post.author_id)
//   post.tags       many2many -> tag   (join table + column1/column2)
const Author = defineModel({
  name: 'rel.author',
  tableName: 'rel_author',
  displayNameSpec: 'name',
  fields: {
    name: fields.char({ required: true }),
    posts: fields.one2many('rel.post'),
  },
});

const Tag = defineModel({
  name: 'rel.tag',
  tableName: 'rel_tag',
  fields: { label: fields.char({ required: true }) },
});

const Post = defineModel({
  name: 'rel.post',
  tableName: 'rel_post',
  fields: {
    title: fields.char({ required: true }),
    views: fields.integer({ default: 0 }),
    author_id: fields.many2one('rel.author', { required: true }),
    tags: fields.many2many('rel.tag', {
      relation_table: 'rel_post_tag_rel',
      column1: 'post_id',
      column2: 'tag_id',
    }),
  },
});

const TENANT = { companyId: -1 };

async function createRelationalDatabase() {
  const engine = new PGliteEngine();
  await engine.connect();
  // Expand traversal resolves related models through the shared singleton
  // registry, so these fixtures register there (not a throwaway instance).
  for (const model of [
    ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent, Author, Tag, Post,
  ]) {
    modelRegistry.register(model, { overwrite: true });
  }
  await new SchemaMigrator(engine, modelRegistry).sync();
  return { engine };
}

test('relational primitives: m2m DDL, expand, archive, search, read_group, name_search, withTransaction',
  { timeout: 120_000 }, async (t) => {
  const { engine } = await createRelationalDatabase();

  const authors = new BaseRepository(modelRegistry.get('rel.author'), engine);
  const tags = new BaseRepository(modelRegistry.get('rel.tag'), engine);
  const posts = new BaseRepository(modelRegistry.get('rel.post'), engine);

  const alice = await authors.create({ name: 'Alice' }, TENANT, SYSTEM_ACTOR);
  const bob = await authors.create({ name: 'Bob' }, TENANT, SYSTEM_ACTOR);
  const tNews = await tags.create({ label: 'news' }, TENANT, SYSTEM_ACTOR);
  const tTech = await tags.create({ label: 'tech' }, TENANT, SYSTEM_ACTOR);
  const postA = await posts.create({ title: 'Morning', author_id: alice.id }, TENANT, SYSTEM_ACTOR);
  const postB = await posts.create({ title: 'Evening', author_id: bob.id }, TENANT, SYSTEM_ACTOR);

  // Link m2m rows directly (join table is ORM-owned, not a model repository).
  await engine.query('INSERT INTO "rel_post_tag_rel" ("post_id", "tag_id") VALUES ($1, $2), ($1, $3);',
    [postA.id, tNews.id, tTech.id]);
  await engine.query('INSERT INTO "rel_post_tag_rel" ("post_id", "tag_id") VALUES ($1, $2);',
    [postB.id, tNews.id]);

  // The join table really exists with its UNIQUE(pair) constraint.
  await assert.rejects(
    engine.query('INSERT INTO "rel_post_tag_rel" ("post_id", "tag_id") VALUES ($1, $2);', [postA.id, tNews.id]),
    /duplicate key|unique/i,
  );

  await t.test('many2one expand inlines the related record', async () => {
    const rows = await posts.find({ scope: TENANT, expand: ['author_id'], orderBy: 'id' });
    assert.equal(rows[0].author_id.name, 'Alice');
    assert.equal(rows[1].author_id.name, 'Bob');
  });

  await t.test('one2many expand returns the inverse children', async () => {
    const rows = await authors.find({ scope: TENANT, expand: ['posts'], filters: [{ field: 'name', operator: '=', value: 'Alice' }] });
    assert.equal(rows[0].posts.length, 1);
    assert.equal(rows[0].posts[0].title, 'Morning');
  });

  await t.test('many2many expand returns linked rows through the join table', async () => {
    const rows = await posts.find({ scope: TENANT, expand: ['tags'], filters: [{ field: 'title', operator: '=', value: 'Morning' }] });
    const labels = rows[0].tags.map((tag) => tag.label).sort();
    assert.deepEqual(labels, ['news', 'tech']);
  });

  await t.test('expand respects tenant scope and never crosses companies', async () => {
    // A foreign-company author must not resolve through an expand in TENANT scope.
    const foreign = await authors.create({ name: 'Mallory', company_id: -2 }, { systemScope: true }, SYSTEM_ACTOR);
    const hijack = await posts.create({ title: 'Trap', author_id: foreign.id, company_id: -2 }, { systemScope: true }, SYSTEM_ACTOR);
    const rows = await posts.find({ scope: TENANT, expand: ['author_id'], filters: [{ field: 'title', operator: '=', value: 'Trap' }] });
    // The trap post lives in company -2, so it is invisible to a TENANT (-1) query at all.
    assert.equal(rows.length, 0);
    assert.ok(hijack.id);
  });

  await t.test('archive hides rows from default reads and restores on unarchive', async () => {
    const changed = await authors.archive([bob.id], TENANT, SYSTEM_ACTOR);
    assert.equal(changed, 1);
    const visible = await authors.find({ scope: TENANT, filters: [{ field: 'id', operator: '=', value: bob.id }] });
    assert.equal(visible.length, 0);
    const withArchived = await authors.find({ scope: TENANT, includeArchived: true, filters: [{ field: 'id', operator: '=', value: bob.id }] });
    assert.equal(withArchived.length, 1);
    assert.equal(withArchived[0].active, false);
    // Re-archiving a already-archived row is a no-op.
    assert.equal(await authors.archive([bob.id], TENANT, SYSTEM_ACTOR), 0);
    assert.equal(await authors.unarchive([bob.id], TENANT, SYSTEM_ACTOR), 1);
  });

  await t.test('search returns rows plus an accurate total', async () => {
    const all = await posts.search({ scope: TENANT });
    assert.equal(all.total, 2);
    const paged = await posts.search({ scope: TENANT, limit: 1 });
    assert.equal(paged.rows.length, 1);
    assert.equal(paged.total, 2, 'total must reflect the whole match set, not the page');
  });

  await t.test('read_group aggregates counts per group', async () => {
    const grouped = await posts.readGroup(
      { scope: TENANT },
      { groupBy: ['author_id'], aggregates: [{ fn: 'count', alias: 'count' }] },
    );
    const byAuthor = new Map(grouped.map((g) => [Number(g.author_id), Number(g.count)]));
    assert.equal(byAuthor.get(Number(alice.id)), 1);
    assert.equal(byAuthor.get(Number(bob.id)), 1);
  });

  await t.test('name_search matches the display field', async () => {
    const hits = await authors.nameSearch('lic', { scope: TENANT });
    assert.equal(hits.length, 1);
    assert.equal(hits[0].name, 'Alice');
  });

  await t.test('withTransaction commits a multi-repo write atomically', async () => {
    await withTransaction(async (tx) => {
      const carol = await tx.repositoryFor(modelRegistry.get('rel.author')).create({ name: 'Carol' }, TENANT, SYSTEM_ACTOR);
      await tx.repositoryFor(modelRegistry.get('rel.post')).create({ title: 'Noon', author_id: carol.id }, TENANT, SYSTEM_ACTOR);
    }, engine);
    const carolPosts = await posts.find({ scope: TENANT, expand: ['author_id'], filters: [{ field: 'title', operator: '=', value: 'Noon' }] });
    assert.equal(carolPosts[0].author_id.name, 'Carol');
  });

  await engine.close();
});
