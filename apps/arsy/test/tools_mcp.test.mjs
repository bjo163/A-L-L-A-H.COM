import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();

const mcp = async (payload) => {
  const res = await app.inject({
    method: 'POST',
    url: '/v1/mcp/message',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.statusCode, body: res.json() };
};

test('Tools & MCP Integration', async (t) => {
  await t.test('tools/list exposes the safe tools and no raw-SQL escape hatch', async () => {
    const res = await mcp({ jsonrpc: '2.0', method: 'tools/list', id: 1 });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const names = res.body.result.tools.map((tool) => tool.name);
    assert.ok(names.includes('storage_cas'));
    assert.ok(names.includes('web_fetch'));
    assert.ok(names.includes('qorpus_retrieve'));
    assert.ok(!names.includes('pglite_query'), 'pglite_query must not be publicly reachable');
    for (const tool of res.body.result.tools) {
      assert.ok(tool.name && tool.description && tool.inputSchema);
    }
  });

  await t.test('tools/call on the removed pglite_query is method-not-found', async () => {
    const res = await mcp({
      jsonrpc: '2.0', method: 'tools/call', id: 2,
      params: { name: 'pglite_query', arguments: { sql: 'SELECT 1' } },
    });
    assert.equal(res.body.error.code, -32601);
  });

  await t.test('storage_cas put then get round-trips through the MCP surface', async () => {
    const put = await mcp({
      jsonrpc: '2.0', method: 'tools/call', id: 3,
      params: { name: 'storage_cas', arguments: { action: 'put', content: 'MWCAS-TEST-CONTENT' } },
    });
    assert.ok(put.body.result.structuredContent.success, JSON.stringify(put.body));
    const digest = put.body.result.structuredContent.output.digest;
    assert.match(digest, /^[0-9a-f]{64}$/);

    const get = await mcp({
      jsonrpc: '2.0', method: 'tools/call', id: 4,
      params: { name: 'storage_cas', arguments: { action: 'get', digest } },
    });
    assert.equal(get.body.result.structuredContent.output.content, 'MWCAS-TEST-CONTENT');
  });

  await t.test('web_fetch refuses a loopback target (SSRF guard)', async () => {
    const res = await mcp({
      jsonrpc: '2.0', method: 'tools/call', id: 5,
      params: { name: 'web_fetch', arguments: { url: 'http://127.0.0.1:5150/v1/models' } },
    });
    assert.equal(res.body.result.isError, true);
    assert.match(res.body.result.structuredContent.error || '', /SSRF_GUARD/);
  });

  await t.test('unknown JSON-RPC method reports method-not-found', async () => {
    const res = await mcp({ jsonrpc: '2.0', method: 'tools/nonexistent', id: 6 });
    assert.equal(res.body.error.code, -32601);
  });

  await t.test('missing tool name reports invalid-params', async () => {
    const res = await mcp({ jsonrpc: '2.0', method: 'tools/call', params: {}, id: 7 });
    assert.equal(res.body.error.code, -32602);
  });

  await t.test('GET /v1/mcp/audit returns the tool execution log', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/mcp/audit', headers });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    const log = body.audit || body.data?.audit || body.data || [];
    assert.ok(Array.isArray(log));
    assert.ok(log.length >= 1, 'audit log should contain prior executions');
  });

  await app.close();
});
