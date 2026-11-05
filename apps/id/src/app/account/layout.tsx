import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Account | MoonWitness ID',
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
