'use client';

import { EcosystemNavbar, resolveEcosystemEndpoints, useEcosystemSession } from "@moonwitness/ui";
import { mwClient } from "@allah/sdk";
import { useTranslationCatalog } from "@/lib/translation-catalog";

const sessionAuth = {
  getCurrentUser: () => mwClient.auth.getCurrentUser(),
  signOut: () => mwClient.auth.signOut(),
};

export function GateNavbar() {
  const { tm } = useTranslationCatalog();
  const { user, signOut } = useEcosystemSession(sessionAuth);

  const endpoints = resolveEcosystemEndpoints(process.env);

  return (
    <EcosystemNavbar
      apps={endpoints}
      currentApp="gate"
      userName={user?.name}
      userEmail={user?.email}
      onSignOut={signOut}
      showAuthActions={true}
    />
  );
}
