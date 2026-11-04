'use client';

import { StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <StatePanel
      as="h3"
      kind="loading"
      title="Loading MOONSKY Console..."
      cause="Initializing channel connections and operator session"
    />
  );
}