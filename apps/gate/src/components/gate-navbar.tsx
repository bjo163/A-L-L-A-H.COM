'use client';

import { EcosystemNavbar, resolveEcosystemEndpoints } from "@moonwitness/ui";
import { useEffect, useState } from "react";
import { mwClient } from "@allah/sdk";
import { getCurrentUser, type GateUser } from "@/lib/auth";
import { useTranslationCatalog } from "@/lib/translation-catalog";

export function GateNavbar() {
  const { tm } = useTranslationCatalog();
  const [user, setUser] = useState<GateUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleSignOut = async () => {
    await mwClient.auth.signOut();
    setUser(null);
  };

  const endpoints = resolveEcosystemEndpoints(process.env);

  return (
    <EcosystemNavbar
      apps={endpoints}
      currentApp="gate"
      userName={user?.name}
      userEmail={user?.email}
      onSignOut={handleSignOut}
      showAuthActions={true}
    />
  );
}
