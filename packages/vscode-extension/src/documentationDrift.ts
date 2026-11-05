export interface DocumentationDrift {
  kind: 'missing-script' | 'missing-manifest' | 'missing-doc';
  value: string;
  suggestion: string;
}

export function findDocumentationDrift(
  scripts: string[],
  manifests: string[],
  documentation: string[]
): DocumentationDrift[] {
  const drift: DocumentationDrift[] = [];
  if (scripts.length > 0 && !documentation.some((file) => /README/i.test(file))) {
    drift.push({ kind: 'missing-doc', value: 'README', suggestion: 'Document the available project scripts.' });
  }
  if (manifests.some((file) => /package\.json$/i.test(file)) && !scripts.includes('test')) {
    drift.push({ kind: 'missing-script', value: 'test', suggestion: 'Add or document a test script before relying on automated validation.' });
  }
  if (manifests.length === 0) {
    drift.push({ kind: 'missing-manifest', value: 'project manifest', suggestion: 'Add a project manifest so the agent can identify scripts and dependencies.' });
  }
  return drift;
}
