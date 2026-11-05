// Parses markdown task checkboxes from .plans/ directory structure.
// Runs in the VS Code Extension context; the Hub never reads the filesystem directly.
// The parsed payload is pushed to the Hub via REST for DB reconciliation.

export type TaskMarkerState = 'pending' | 'in_progress' | 'completed';

export interface ScannedTask {
  text: string;
  state: TaskMarkerState;
  lineIndex: number;
  sourceLine: string;
  fileHash: string;
}

export interface ScannedPlan {
  slug: string;
  title: string;
  specStatus: string;
  tasks: ScannedTask[];
  specContent?: string;
  designContent?: string;
  rulesContent?: string;
  folderHash: string;
}

export interface SyncPayload {
  projectId: number;
  workspacePath: string;
  plans: ScannedPlan[];
}

// Marker -> internal state mapping (mirrors PlanManager in vscode-extension).
export function markerToState(marker: string): TaskMarkerState {
  if (marker === '/') return 'in_progress';
  if (marker.toLowerCase() === 'x') return 'completed';
  return 'pending';
}

// Internal state -> markdown marker.
export function stateToMarker(state: TaskMarkerState): string {
  if (state === 'in_progress') return '/';
  if (state === 'completed') return 'x';
  return ' ';
}

// Computed SHA-256 for a string without Node.js crypto (pure JS, works in both
// Hub and Extension contexts). Delegates to the platform sha256Hex when available.
export async function hashString(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
