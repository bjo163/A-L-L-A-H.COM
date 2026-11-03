import type { PlanMarkdownBodies } from './planManager';

export interface GatewayModel {
  id: string;
  owned_by?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseModelCatalogResponse(payload: unknown): GatewayModel[] {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
    const message = isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string'
      ? payload.error.message
      : 'Gateway returned an invalid model catalog envelope.';
    throw new Error(message);
  }

  const catalog = payload.data;
  if (catalog.object !== 'list' || !Array.isArray(catalog.data)) {
    throw new Error('Gateway model catalog must contain a list of models.');
  }

  return catalog.data.map((model, index) => {
    if (!isRecord(model) || typeof model.id !== 'string' || model.id.trim().length === 0) {
      throw new Error(`Gateway model catalog entry ${index + 1} has no valid id.`);
    }
    const owner = model.owned_by;
    if (owner !== undefined && typeof owner !== 'string') {
      throw new Error(`Gateway model catalog entry ${index + 1} has an invalid owner.`);
    }
    return owner === undefined ? { id: model.id } : { id: model.id, owned_by: owner as string };
  });
}

export function parsePlanCompletionContent(content: unknown): PlanMarkdownBodies {
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Gateway returned an empty plan completion.');
  }

  const response = content.trim();
  if (response.startsWith('[Arsy LLM Gateway Mock]')) {
    throw new Error('Arsy returned a mock completion. Configure an upstream provider before generating an AI plan.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error('AI plan response must be a JSON object with spec, tasks, design, and rules Markdown fields.');
  }

  if (!isRecord(parsed)) {
    throw new Error('AI plan response must be a JSON object.');
  }

  const requireArtifact = (artifactName: keyof PlanMarkdownBodies): string => {
    const artifact = parsed[artifactName];
    if (typeof artifact !== 'string' || artifact.trim().length === 0) {
      throw new Error(`AI plan response is missing Markdown content for "${artifactName}".`);
    }
    return artifact.trim();
  };
  const tasks = requireArtifact('tasks');
  if (!tasks.split(/\r\n|\n|\r/).some((line) => /^\s*-\s*\[[ xX/]\]\s*\S/.test(line))) {
    throw new Error('AI plan tasks must contain at least one Markdown checklist item.');
  }

  return {
    spec: requireArtifact('spec'),
    tasks,
    design: requireArtifact('design'),
    rules: requireArtifact('rules'),
  };
}

export function parsePlanCompletionResponse(payload: unknown): PlanMarkdownBodies {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    const message = getGatewayErrorMessage(payload);
    throw new Error(message || 'Gateway returned an invalid chat completion response.');
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new Error('Gateway chat completion has no assistant message.');
  }

  return parsePlanCompletionContent(firstChoice.message.content);
}

export function getGatewayErrorMessage(payload: unknown): string | undefined {
  if (isRecord(payload) && isRecord(payload.error) && typeof payload.error.message === 'string') {
    return payload.error.message;
  }
  return undefined;
}
