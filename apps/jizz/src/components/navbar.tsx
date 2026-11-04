'use client';

import { EcosystemNavbar, resolveEcosystemEndpoints } from '@moonwitness/ui';

export function JizzNavbar() {
  return (
    <EcosystemNavbar
      apps={resolveEcosystemEndpoints(process.env)}
      currentApp="jizz"
    />
  );
}