'use client';

import { StatePanel } from '@moonwitness/ui';

export default function Loading() {
  return (
    <StatePanel
      as="h3"
      kind="loading"
      title="Loading HARBOR portal..."
      cause="Retrieving your service information"
    />
  );
}