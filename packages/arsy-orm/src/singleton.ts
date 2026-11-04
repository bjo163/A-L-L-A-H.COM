// Symbol.for keys a process-wide registry, so duplicate module copies (a bundled
// build plus a symlinked source import) share one instance instead of two.
const GLOBAL_PREFIX = '@allah/arsy-orm.';

export function singleton<T>(key: string, create: () => T): T {
  const symbol = Symbol.for(`${GLOBAL_PREFIX}${key}`);
  const store = globalThis as Record<symbol, T | undefined>;
  return store[symbol] ?? (store[symbol] = create());
}
