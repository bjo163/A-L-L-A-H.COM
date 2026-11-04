import assert from 'node:assert/strict';
import { buildArsyApp } from '../src/app.ts';

let accountSeq = 0;

async function signIn(app, email, password) {
  const res = await app.inject({ method: 'POST', url: '/api/auth/sign-in', payload: { email, password } });
  assert.equal(res.statusCode, 200, res.payload);
  return { 'x-session-token': JSON.parse(res.payload).data.sessionToken };
}

/** Onboarding is one-shot and an in-memory hub starts empty, so each app gets one owner tenant. */
export async function buildAuthenticatedApp() {
  const app = await buildArsyApp({ enableLogging: false });
  accountSeq += 1;
  const email = `owner-${accountSeq}@example.test`;
  const password = `owner-password-${accountSeq}`;

  const onboarding = await app.inject({
    method: 'POST',
    url: '/api/auth/onboarding',
    payload: { name: 'Test Owner', email, password },
  });
  assert.equal(onboarding.statusCode, 201, onboarding.payload);

  return { app, headers: await signIn(app, email, password) };
}

/** A second registration lands in its own tenant, which is what isolation tests need. */
export async function authenticateSecondTenant(app) {
  accountSeq += 1;
  const email = `intruder-${accountSeq}@example.test`;
  const password = `intruder-password-${accountSeq}`;

  const registered = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name: 'Second Tenant', email, password },
  });
  assert.equal(registered.statusCode, 201, registered.payload);

  return signIn(app, email, password);
}

export async function createPlan(app, headers, name) {
  const res = await app.inject({
    method: 'POST',
    url: '/v1/works/plans',
    headers,
    payload: { name, download_mbps: 50, upload_mbps: 20, price: 250000, currency: 'IDR' },
  });
  assert.equal(res.statusCode, 201, res.payload);
  return JSON.parse(res.payload).data;
}
