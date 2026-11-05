/**
 * Single source of truth for Headquarter navigation. The rail (shell) and the
 * overview module grid both derive from this registry so the two lists can never
 * drift apart again.
 */
export interface HqNavEntry {
  href: string;
  /** Rail label and overview card title. */
  label: string;
  /** Short sub-label shown under the rail link. */
  note: string;
  /**
   * Longer description for the overview card. Empty for the Overview entry
   * itself, which is the page that renders the grid rather than a module in it.
   */
  description: string;
}

export const HQ_NAV: HqNavEntry[] = [
  { href: '/', label: 'Overview', note: 'Platform map', description: '' },
  {
    href: '/ai-gateway',
    label: 'AI Gateway',
    note: 'Routing & usage',
    description: 'Route requests, monitor providers, and inspect usage.',
  },
  {
    href: '/agent',
    label: 'Agent Studio',
    note: 'Run an agent',
    description: 'Run agents with tools and review execution.',
  },
  {
    href: '/swarm',
    label: 'Swarm Ops',
    note: 'Coordinate tasks',
    description: 'Coordinate multi-agent tasks and inspect results.',
  },
  {
    href: '/tools',
    label: 'Tool Registry',
    note: 'MCP tools',
    description: 'Browse registered MCP tools and capabilities.',
  },
  {
    href: '/knowledge',
    label: 'Knowledge',
    note: 'Qorpus search',
    description: 'Search Qorpus with grounded results.',
  },
];

/** Everything the left rail links to, Overview included. */
export const HQ_RAIL_NAV: HqNavEntry[] = HQ_NAV;

/** The operational modules the overview grid promotes (drops Overview itself). */
export const HQ_MODULE_NAV: HqNavEntry[] = HQ_NAV.filter((entry) => entry.description.length > 0);

/** Zero-padded index label used by the rail and cards, e.g. 0 -> "01". */
export function hqIndexLabel(index: number): string {
  return String(index + 1).padStart(2, '0');
}
