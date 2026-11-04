function assertSameDimensions(a: number[], b: number[]): void {
  if (a.length !== b.length) {
    throw new RangeError(
      `Vector dimension mismatch: cannot compare a ${a.length}-dimension vector with a ${b.length}-dimension vector.`
    );
  }
}

export function dotProduct(a: number[], b: number[]): number {
  assertSameDimensions(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export function magnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
  return Math.sqrt(sum);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  assertSameDimensions(a, b);
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

export function euclideanDistance(a: number[], b: number[]): number {
  assertSameDimensions(a, b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
