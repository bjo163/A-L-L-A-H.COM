import crypto from 'crypto';

export function chunkText(text: string, windowSize = 512, overlap = 64): Array<{ content: string; tokenCount: number }> {
  // Simple word-based approximation for token count
  const words = text.replace(/\r\n/g, '\n').split(/\s+/).filter(Boolean);
  const chunks: Array<{ content: string; tokenCount: number }> = [];
  
  if (words.length === 0) return chunks;
  
  for (let i = 0; i < words.length; ) {
    const chunkWords = words.slice(i, i + windowSize);
    const content = chunkWords.join(' ');
    chunks.push({
      content,
      tokenCount: Math.ceil(chunkWords.length * 1.3), // rough token estimate
    });
    if (i + windowSize >= words.length) break;
    i += windowSize - overlap;
  }
  
  return chunks;
}

export function computeSha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}
