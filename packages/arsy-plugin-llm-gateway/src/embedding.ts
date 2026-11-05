// A dependency-free, deterministic prompt embedding for the semantic cache (roadmap F2).
// The hub runs on embedded PGlite with no external embedding service or vector store, so a
// real neural embedding is out of scope for the single-process invariant. This hashed
// bag-of-words projects text onto a fixed-dimension unit vector: prompts sharing most of
// their vocabulary land close together under cosine similarity (fail-closed equal-dimension
// math from T4), while unrelated prompts diverge. It is stable across processes, which lets
// near-duplicate detection be reasoned about and unit-tested without a model call.
export const EMBEDDING_DIMS = 256;

function fnv1a(token: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Project free text onto a fixed-length, L2-normalized vector. Identical text yields an
 * identical vector; a one-word change moves it only slightly, which is what "near-duplicate
 * prompt short-circuits a provider call" needs. Always returns exactly `EMBEDDING_DIMS`
 * entries so cosineSimilarity's fail-closed dimension check (T4) is never tripped.
 */
export function embedPrompt(text: string, dims: number = EMBEDDING_DIMS): number[] {
  const vec = new Array<number>(dims).fill(0);
  const tokens = tokenize(text);
  for (const tok of tokens) {
    // Two independent hash slots per token dampens collisions on small vocabularies.
    vec[fnv1a(tok) % dims] += 1;
    vec[fnv1a(`x:${tok}`) % dims] += 0.5;
  }
  let magnitude = 0;
  for (const v of vec) magnitude += v * v;
  magnitude = Math.sqrt(magnitude);
  if (magnitude === 0) return vec;
  return vec.map((v) => v / magnitude);
}
