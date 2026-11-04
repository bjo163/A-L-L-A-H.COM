'use client';

import { createAuthClient } from 'better-auth/client';

const authBaseURL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  (typeof window === 'undefined'
    ? 'http://localhost:5150'
    : `${window.location.protocol}//${window.location.hostname}:5150`);

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  basePath: '/api/auth/better',
  fetchOptions: { credentials: 'include' },
});
