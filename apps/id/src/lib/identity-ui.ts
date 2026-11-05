import type { ActiveSession, UserSubject } from '@moonwitness/types';

export type IdentityHomeState =
  | { kind: 'authenticated'; user: Pick<UserSubject, 'name' | 'email'> }
  | { kind: 'guest'; onboarding: 'available' | 'closed' | 'unavailable' }
  | { kind: 'unavailable' };

interface SessionResult {
  data: { user?: unknown } | null;
  error?: unknown;
}

interface IdentityHomeReaders {
  getSession: () => Promise<SessionResult>;
  getCurrentUser: () => Promise<{ user?: Pick<UserSubject, 'name' | 'email'> | null }>;
  getOnboardingStatus: () => Promise<{ available: boolean }>;
}

export type AccountReadState =
  | { kind: 'ready'; user: UserSubject; sessions: ActiveSession[] }
  | { kind: 'signed-out' }
  | { kind: 'unavailable' };

export async function readAccountData(
  getCurrentUser: () => Promise<{ user?: UserSubject | null }>,
  getSessions: () => Promise<ActiveSession[]>
): Promise<AccountReadState> {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { kind: 'signed-out' };
    return { kind: 'ready', user, sessions: await getSessions() };
  } catch {
    return { kind: 'unavailable' };
  }
}

export async function resolveIdentityHomeState(
  readers: IdentityHomeReaders
): Promise<IdentityHomeState> {
  let session: SessionResult;
  try {
    session = await readers.getSession();
  } catch {
    return { kind: 'unavailable' };
  }

  if (session.error) return { kind: 'unavailable' };

  if (session.data?.user) {
    try {
      const { user } = await readers.getCurrentUser();
      return user ? { kind: 'authenticated', user } : { kind: 'unavailable' };
    } catch {
      return { kind: 'unavailable' };
    }
  }

  try {
    const { available } = await readers.getOnboardingStatus();
    return { kind: 'guest', onboarding: available ? 'available' : 'closed' };
  } catch {
    return { kind: 'guest', onboarding: 'unavailable' };
  }
}

export async function resolveOnboardingFailureState(
  getOnboardingStatus: () => Promise<{ available: boolean }>
): Promise<'available' | 'closed' | 'unavailable'> {
  try {
    const { available } = await getOnboardingStatus();
    return available ? 'available' : 'closed';
  } catch {
    return 'unavailable';
  }
}

export async function signInAfterOnboarding(
  signIn: () => Promise<{ error?: unknown }>
): Promise<'signed-in' | 'created-sign-in-required'> {
  try {
    const { error } = await signIn();
    return error ? 'created-sign-in-required' : 'signed-in';
  } catch {
    return 'created-sign-in-required';
  }
}

export function canStartSessionAction(actionInFlight: boolean, signOutInFlight: boolean): boolean {
  return !actionInFlight && !signOutInFlight;
}

export async function revokeSessionAndSignOut(
  revoke: () => Promise<unknown>,
  signOut: () => Promise<{ error?: unknown }>,
  isCurrent: boolean
): Promise<'revoked' | 'current-session-revoked' | 'current-session-signout-failed'> {
  await revoke();
  if (!isCurrent) return 'revoked';

  try {
    const { error } = await signOut();
    return error ? 'current-session-signout-failed' : 'current-session-revoked';
  } catch {
    return 'current-session-signout-failed';
  }
}

export type IdentityErrorContext = 'login' | 'registration' | 'onboarding' | 'account' | 'revoke' | 'signout';

const userFacingErrors: Record<IdentityErrorContext, string> = {
  login: 'The email or password could not be verified. Check your details and try again.',
  registration: 'The account could not be created. Check your details and try again.',
  onboarding: 'Initial setup could not be completed. Check your details and try again.',
  account: 'Account data is unavailable. Check your connection and try again.',
  revoke: 'The hub did not confirm revocation. The session remains listed.',
  signout: 'The hub did not confirm sign-out. Try again or return to sign in.',
};

export function getUserFacingAuthError(context: IdentityErrorContext): string {
  return userFacingErrors[context];
}

export function validatePasswordPair(
  password: string,
  confirmation: string,
  minimumLength: number
): string | null {
  if (password !== confirmation) return 'The passwords do not match.';
  if (password.length < minimumLength) {
    return `Use at least ${minimumLength} characters for the password.`;
  }
  return null;
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  const [first, second] = octets;
  return first === 0 || first === 10 || first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second !== undefined && second >= 16 && second <= 31) ||
    (first === 192 && second === 168);
}

export function getSafeDestinationUrl(value: string, isProduction: boolean): string | null {
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && !isProduction)) return null;

    if (isProduction) {
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.endsWith('.localhost') ||
        hostname === '::1' ||
        hostname === '[::1]' ||
        hostname.startsWith('[fc') ||
        hostname.startsWith('[fd') ||
        hostname.startsWith('[fe80:') ||
        isPrivateIpv4(hostname)
      ) {
        return null;
      }
    }

    return url.href;
  } catch {
    return null;
  }
}
