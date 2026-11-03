import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArsyApp } from '../src/app.ts';

const mcpMessage = async (app, body) => {
  const res = await app.inject({
    method: 'POST',
    url: '/v1/mcp/message',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.statusCode, body: JSON.parse(res.body) };
};

test('Phase 3 - Tools & MCP Integration Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  t.after(async () => {
    await app.close();
  });

  await t.test('POST /v1/mcp/message tools/list returns registered native tools', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.jsonrpc, '2.0');
    assert.equal(res.body.id, 1);
    assert.ok(Array.isArray(res.body.result.tools));
    const names = res.body.result.tools.map((t) => t.name);
    assert.ok(names.includes('pglite_query'), 'pglite_query should be registered');
    assert.ok(names.includes('storage_cas'), 'storage_cas should be registered');
    assert.ok(names.includes('web_fetch'), 'web_fetch should be registered');
    assert.ok(names.includes('qorpus_retrieve'), 'qorpus_retrieve should be registered');
    for (const tool of res.body.result.tools) {
      assert.ok(tool.name);
      assert.ok(tool.description);
      assert.ok(tool.inputSchema);
    }
  });

  await t.test('POST /v1/mcp/message tools/call pglite_query executes read-only SQL', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'pglite_query',
        arguments: { query: 'SELECT 1 as ok' },
      },
      id: 2,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.jsonrpc, '2.0');
    assert.ok(res.body.result.structuredContent.success, 'pglite_query should succeed');
    assert.ok(Array.isArray(res.body.result.structuredContent.output.rows));
  });

  await t.test('POST /v1/mcp/message tools/call pglite_query rejects mutating SQL', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'pglite_query',
        arguments: { query: 'DROP TABLE ai_usage_log' },
      },
      id: 3,
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.result.isError === true, 'mutating SQL should be an error');
    assert.ok(/UNSAFE_SQL_QUERY/.test(res.body.result.structuredContent.error || ''), 'should return UNSAFE_SQL_QUERY');
  });

  await t.test('POST /v1/mcp/message tools/call storage_cas put then get roundtrip', async () => {
    const putRes = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'storage_cas',
        arguments: { action: 'put', content: 'MWCAS-TEST-CONTENT' },
      },
      id: 4,
    });
    assert.equal(putRes.status, 200);
    assert.ok(putRes.body.result.structuredContent.success, 'storage_cas put should succeed');
    const digest = putRes.body.result.structuredContent.output.digest;
    assert.ok(digest && typeof digest === 'string', 'should return a digest');

    const getRes = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'storage_cas',
        arguments: { action: 'get', digest },
      },
      id: 5,
    });
    assert.equal(getRes.status, 200);
    assert.ok(getRes.body.result.structuredContent.success, 'storage_cas get should succeed');
    assert.equal(getRes.body.result.structuredContent.output.content, 'MWCAS-TEST-CONTENT');
  });

  await t.test('POST /v1/mcp/message tools/call web_fetch is SSRF-guarded (localhost blocked)', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'web_fetch',
        arguments: { url: 'http://127.0.0.1:5150/v1/models' },
      },
      id: 6,
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.result.isError === true, 'SSRF-blocked fetch should error');
    assert.ok(/SSRF_GUARD/.test(res.body.result.structuredContent.error || ''), 'should return SSRF_GUARD');
  });

  await t.test('POST /v1/mcp/message tools/call qorpus_retrieve executes safely', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'qorpus_retrieve',
        arguments: { query: 'architecture', limit: 3 },
      },
      id: 7,
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.result.structuredContent.success, 'qorpus_retrieve should succeed');
    assert.ok(Array.isArray(res.body.result.structuredContent.output.chunks));
  });

  await t.test('POST /v1/mcp/message returns JSON-RPC method not found for unknown method', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/nonexistent',
      id: 8,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.jsonrpc, '2.0');
    assert.equal(res.body.error.code, -32601);
    assert.equal(res.body.error.message, 'Method not found');
  });

  await t.test('POST /v1/mcp/message returns JSON-RPC invalid params for missing tool name', async () => {
    const res = await mcpMessage(app, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {},
      id: 9,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.error.code, -32602);
    assert.equal(res.body.error.message, 'Invalid params');
  });

  await t.test('GET /v1/mcp/audit returns tool execution audit log', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/mcp/audit',
    });
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.ok(body.success === true || body.data !== undefined);
    const log = body.audit || (body.data && body.data.audit) || [];
    assert.ok(Array.isArray(log));
    assert.ok(log.length >= 1, 'audit log should contain prior tool executions');
  });
});
