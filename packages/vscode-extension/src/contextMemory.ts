export type MemoryScope = 'workspace' | 'session';

export interface ContextMemoryEntry {
  id: string;
  scope: MemoryScope;
  workspaceKey: string;
  text: string;
  createdAt: number;
  expiresAt: number;
}

const MAX_ENTRIES = 100;
const MAX_TEXT = 2_000;

export class ContextMemory {
  private readonly entries: ContextMemoryEntry[] = [];

  constructor(private readonly now: () => number = Date.now) {}

  remember(input: Omit<ContextMemoryEntry, 'createdAt' | 'expiresAt'> & { retentionMs: number }): ContextMemoryEntry {
    const text = input.text.trim().slice(0, MAX_TEXT);
    if (!text) throw new Error('Memory text cannot be empty.');
    if (!Number.isFinite(input.retentionMs) || input.retentionMs <= 0) {
      throw new Error('Memory retention must be positive.');
    }
    const createdAt = this.now();
    const entry = {
      id: input.id,
      scope: input.scope,
      workspaceKey: input.workspaceKey,
      text,
      createdAt,
      expiresAt: createdAt + input.retentionMs,
    };
    this.entries.push(entry);
    this.prune();
    return entry;
  }

  list(scope: MemoryScope, workspaceKey: string): ContextMemoryEntry[] {
    this.prune();
    return this.entries
      .filter((entry) => entry.scope === scope && entry.workspaceKey === workspaceKey)
      .map((entry) => ({ ...entry }));
  }

  forget(id: string): boolean {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return false;
    this.entries.splice(index, 1);
    return true;
  }

  clearWorkspace(workspaceKey: string): void {
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      if (this.entries[index].workspaceKey === workspaceKey) this.entries.splice(index, 1);
    }
  }

  private prune(): void {
    const current = this.now();
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      if (this.entries[index].expiresAt <= current) this.entries.splice(index, 1);
    }
    if (this.entries.length > MAX_ENTRIES) this.entries.splice(0, this.entries.length - MAX_ENTRIES);
  }
}
