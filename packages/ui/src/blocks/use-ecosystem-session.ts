'use client';

import * as React from 'react';

export interface EcosystemSessionPrincipal {
  name: string;
  email: string;
}

export interface EcosystemSessionAuthClient<TUser> {
  getCurrentUser(): Promise<{ user?: TUser | null } | null>;
  signOut(): Promise<void>;
}

export interface EcosystemSession<TUser> {
  user: TUser | null;
  loading: boolean;
  /** One shared error surface: a failed session read is never shown as signed-out. */
  notice: string | null;
  dismissNotice: () => void;
  signOut: () => Promise<void>;
}

/**
 * One session bootstrap for the whole ecosystem. Dock, headquarter, and gate
 * each hand-rolled this flow against the same navbar props; the injected client
 * keeps the design system free of hub-specific transport code.
 */
export function useEcosystemSession<TUser extends EcosystemSessionPrincipal>(
  auth: EcosystemSessionAuthClient<TUser>
): EcosystemSession<TUser> {
  const [user, setUser] = React.useState<TUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    auth.getCurrentUser()
      .then((result) => {
        if (!active) return;
        if (result?.user) setUser(result.user);
      })
      .catch((error: unknown) => {
        if (active) {
          setNotice(error instanceof Error ? error.message : 'Session status is unavailable.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [auth]);

  const dismissNotice = React.useCallback(() => setNotice(null), []);

  const signOut = React.useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setNotice(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  }, [auth]);

  return { user, loading, notice, dismissNotice, signOut };
}
