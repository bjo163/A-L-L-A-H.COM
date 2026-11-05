export interface PromptVersion {
  id: string;
  prompt: string;
  createdAt: string;
  tags: string[];
}

export function createPromptVersion(id: string, prompt: string, tags: string[] = [], now = new Date()): PromptVersion {
  if (!id.trim() || !prompt.trim()) throw new Error('Prompt version requires an id and prompt.');
  return { id, prompt: prompt.slice(0, 20_000), createdAt: now.toISOString(), tags: tags.slice(0, 10) };
}
