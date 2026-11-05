import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createServer, type Server } from 'node:http';
import { StandaloneHttpClient } from './standaloneHttpClient';

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

test('provider timeout covers stalled response bodies', async () => {
  let releaseBody: NodeJS.Timeout | undefined;
  let requestReceived!: () => void;
  const received = new Promise<void>((resolve) => {
    requestReceived = resolve;
  });
  const server = createServer((_request, response) => {
    requestReceived();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.flushHeaders();
    releaseBody = setTimeout(() => response.end('{"status":"ok"}'), 500);
  });
  const baseUrl = await listen(server);
  const client = new StandaloneHttpClient(baseUrl, {}, 80);

  try {
    const request = client.health.check();
    await received;
    await assert.rejects(request, /timed out after 80 ms/);
  } finally {
    if (releaseBody) clearTimeout(releaseBody);
    await close(server);
  }
});

test('caller cancellation aborts response-body reads', async () => {
  let releaseBody: NodeJS.Timeout | undefined;
  let requestReceived!: () => void;
  const received = new Promise<void>((resolve) => {
    requestReceived = resolve;
  });
  const server = createServer((_request, response) => {
    requestReceived();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.flushHeaders();
    response.write('{"choices":');
    releaseBody = setTimeout(() => response.end('[]}'), 500);
  });
  const baseUrl = await listen(server);
  const client = new StandaloneHttpClient(baseUrl, {}, 2_000);
  const controller = new AbortController();

  try {
    const request = client.router.chat({ model: 'test-model', messages: [] }, controller.signal);
    await received;
    await new Promise((resolve) => setTimeout(resolve, 30));
    controller.abort();
    await assert.rejects(request, (error: unknown) =>
      error instanceof Error && error.name === 'AbortError'
    );
  } finally {
    if (releaseBody) clearTimeout(releaseBody);
    await close(server);
  }
});

test('successful responses with invalid JSON are reported as errors', async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('{invalid');
  });
  const baseUrl = await listen(server);
  const client = new StandaloneHttpClient(baseUrl, {}, 1_000);

  try {
    await assert.rejects(client.health.check(), /invalid JSON response/);
  } finally {
    await close(server);
  }
});
