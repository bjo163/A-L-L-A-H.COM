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

  restore(value: unknown): void {
    if (!Array.isArray(value)) throw new Error('Stored workspace memory is not a list.');
    const restored = value.map((entry): ContextMemoryEntry => {
      if (
        typeof entry !== 'object'
        || entry === null
        || !('id' in entry)
        || typeof entry.id !== 'string'
        || !entry.id
        || !('scope' in entry)
        || (entry.scope !== 'workspace' && entry.scope !== 'session')
        || !('workspaceKey' in entry)
        || typeof entry.workspaceKey !== 'string'
        || !entry.workspaceKey
        || !('text' in entry)
        || typeof entry.text !== 'string'
        || !entry.text.trim()
        || entry.text.length > MAX_TEXT
        || !('createdAt' in entry)
        || typeof entry.createdAt !== 'number'
        || !Number.isFinite(entry.createdAt)
        || !('expiresAt' in entry)
        || typeof entry.expiresAt !== 'number'
        || !Number.isFinite(entry.expiresAt)
        || entry.expiresAt <= entry.createdAt
      ) {
        throw new Error('Stored workspace memory contains an invalid entry.');
      }
      return {
        id: entry.id,
        scope: entry.scope,
        workspaceKey: entry.workspaceKey,
        text: entry.text,
        createdAt: entry.createdAt,
        expiresAt: entry.expiresAt,
      };
    });
    this.entries.splice(0, this.entries.length, ...restored.slice(-MAX_ENTRIES));
    this.prune();
  }

  snapshot(): ContextMemoryEntry[] {
    this.prune();
    return this.entries.map((entry) => ({ ...entry }));
  }

  remember(input: Omit<ContextMemoryEntry, 'createdAt' | 'expiresAt'> & { retentionMs: number }): ContextMemoryEntry {
    const text = input.text.trim().slice(0, MAX_TEXT);
    if (!text) throw new Error('Memory text cannot be empty.');
    if (!input.id.trim() || !input.workspaceKey.trim()) {
      throw new Error('Memory id and workspace key cannot be empty.');
    }
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
