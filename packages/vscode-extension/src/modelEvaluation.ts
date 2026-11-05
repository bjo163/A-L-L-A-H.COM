export interface ModelEvaluationCase {
  id: string;
  prompt: string;
  expectedSignals: string[];
}

export interface ModelEvaluationResult {
  caseId: string;
  model: string;
  passed: boolean;
  matchedSignals: string[];
}

export function evaluateModelResponse(
  model: string,
  testCase: ModelEvaluationCase,
  response: string
): ModelEvaluationResult {
  const normalized = response.toLocaleLowerCase();
  const matchedSignals = testCase.expectedSignals.filter((signal) => normalized.includes(signal.toLocaleLowerCase()));
  return { caseId: testCase.id, model, passed: matchedSignals.length === testCase.expectedSignals.length, matchedSignals };
}
