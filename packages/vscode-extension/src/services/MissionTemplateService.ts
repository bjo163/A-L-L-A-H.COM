/**
 * Mission Template Service
 * Manages mission templates and template library
 */

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: 'ask' | 'plan' | 'code' | 'debug' | 'ideate';
  variables: TemplateVariable[];
  promptTemplate: string;
  contextRules: ContextRule[];
  approvedCommands: string[];
  estimatedTokens?: number;
  author?: string;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  prompt: string;
  type?: 'string' | 'select' | 'multiline';
  options?: string[];
  default?: string;
  required?: boolean;
}

export interface ContextRule {
  action: 'include' | 'exclude';
  pattern: string;
  description?: string;
}

export class MissionTemplateService {
  private static instance: MissionTemplateService;
  private templates: Map<string, MissionTemplate> = new Map();
  private customTemplates: Map<string, MissionTemplate> = new Map();

  private constructor() {
    this.initializeBuiltInTemplates();
  }

  static getInstance(): MissionTemplateService {
    if (!MissionTemplateService.instance) {
      MissionTemplateService.instance = new MissionTemplateService();
    }
    return MissionTemplateService.instance;
  }

  /**
   * Initialize built-in templates
   */
  private initializeBuiltInTemplates(): void {
    const builtIn: MissionTemplate[] = [
      {
        id: 'add-rest-endpoint',
        title: 'Add REST Endpoint',
        description: 'Scaffold a new REST API endpoint with error handling',
        category: 'api',
        mode: 'code',
        variables: [
          { name: 'endpoint_path', prompt: 'Endpoint path (e.g., /users/:id)', type: 'string', required: true },
          { name: 'http_method', prompt: 'HTTP method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], required: true },
          { name: 'description', prompt: 'Brief endpoint description', type: 'multiline' },
        ],
        promptTemplate: `Add a new {{http_method}} endpoint at {{endpoint_path}}.
Description: {{description}}
Include proper error handling, validation, and follow existing project conventions.`,
        contextRules: [
          { action: 'include', pattern: 'package.json', description: 'Project dependencies' },
          { action: 'include', pattern: 'src/routes/**/*.ts', description: 'Existing routes' },
          { action: 'include', pattern: 'src/types/**/*.ts', description: 'Type definitions' },
          { action: 'exclude', pattern: 'node_modules/**' },
        ],
        approvedCommands: ['git-status', 'extension-tests', 'typecheck'],
        tags: ['api', 'backend', 'rest'],
      },
      {
        id: 'fix-test-failure',
        title: 'Fix Failing Test',
        description: 'Debug and fix a failing unit test',
        category: 'testing',
        mode: 'debug',
        variables: [
          { name: 'test_name', prompt: 'Test name or file path', type: 'string', required: true },
          { name: 'error_message', prompt: 'Error message from test failure', type: 'multiline', required: true },
        ],
        promptTemplate: `Fix the failing test: {{test_name}}

Error: {{error_message}}

Analyze the failure, identify the root cause, and provide a fix.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.test.ts' },
          { action: 'include', pattern: 'src/**/*.spec.ts' },
        ],
        approvedCommands: ['extension-tests', 'typecheck'],
        tags: ['testing', 'debug', 'quality'],
      },
      {
        id: 'add-unit-tests',
        title: 'Add Unit Tests',
        description: 'Generate unit tests for a function or component',
        category: 'testing',
        mode: 'code',
        variables: [
          { name: 'target', prompt: 'File or function to test', type: 'string', required: true },
          { name: 'test_framework', prompt: 'Test framework', type: 'select', options: ['vitest', 'jest', 'mocha'], default: 'vitest' },
          { name: 'coverage_focus', prompt: 'Coverage focus (happy path, edge cases, errors)', type: 'multiline' },
        ],
        promptTemplate: `Generate comprehensive unit tests for: {{target}}

Use {{test_framework}} framework.
Focus on: {{coverage_focus}}

Include happy path, edge cases, and error scenarios.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['extension-tests', 'typecheck'],
        tags: ['testing', 'quality', 'coverage'],
      },
      {
        id: 'refactor-function',
        title: 'Refactor Function',
        description: 'Improve code quality, readability, or performance',
        category: 'refactoring',
        mode: 'code',
        variables: [
          { name: 'target', prompt: 'Function or code block to refactor', type: 'string', required: true },
          { name: 'improvement_goal', prompt: 'Goal (readability, performance, maintainability, etc)', type: 'string', required: true },
          { name: 'constraints', prompt: 'Any constraints or requirements', type: 'multiline' },
        ],
        promptTemplate: `Refactor {{target}} to improve {{improvement_goal}}.

Constraints: {{constraints}}

Maintain existing functionality while improving code quality.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['typecheck', 'extension-tests'],
        tags: ['refactoring', 'quality', 'optimization'],
      },
      {
        id: 'add-documentation',
        title: 'Add Documentation',
        description: 'Generate documentation for functions and APIs',
        category: 'documentation',
        mode: 'code',
        variables: [
          { name: 'target', prompt: 'Function or module to document', type: 'string', required: true },
          { name: 'doc_type', prompt: 'Documentation type', type: 'select', options: ['JSDoc', 'README', 'OpenAPI'], default: 'JSDoc' },
          { name: 'audience', prompt: 'Target audience (developers, API users, etc)', type: 'string' },
        ],
        promptTemplate: `Generate {{doc_type}} documentation for: {{target}}

Audience: {{audience}}

Include clear descriptions, parameters, return values, and examples.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['docs-check'],
        tags: ['documentation', 'quality'],
      },
      {
        id: 'debug-issue',
        title: 'Debug Issue',
        description: 'Troubleshoot and fix a reported issue',
        category: 'debugging',
        mode: 'debug',
        variables: [
          { name: 'issue_description', prompt: 'Describe the issue', type: 'multiline', required: true },
          { name: 'reproduction_steps', prompt: 'Steps to reproduce', type: 'multiline', required: true },
          { name: 'expected_behavior', prompt: 'Expected behavior', type: 'string' },
        ],
        promptTemplate: `Debug and fix this issue:

Issue: {{issue_description}}

Reproduction: {{reproduction_steps}}

Expected: {{expected_behavior}}

Analyze the problem and provide a fix.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['git-status', 'typecheck', 'extension-tests'],
        tags: ['debugging', 'bug-fix', 'troubleshooting'],
      },
      {
        id: 'add-error-handling',
        title: 'Add Error Handling',
        description: 'Add comprehensive error handling to code',
        category: 'quality',
        mode: 'code',
        variables: [
          { name: 'target', prompt: 'Function or code to add error handling to', type: 'string', required: true },
          { name: 'error_types', prompt: 'Types of errors to handle', type: 'multiline' },
        ],
        promptTemplate: `Add error handling to: {{target}}

Handle these error types: {{error_types}}

Include try-catch blocks, error messages, and recovery strategies.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['typecheck', 'extension-tests'],
        tags: ['quality', 'reliability', 'error-handling'],
      },
      {
        id: 'optimize-performance',
        title: 'Optimize Performance',
        description: 'Improve code performance and efficiency',
        category: 'optimization',
        mode: 'code',
        variables: [
          { name: 'target', prompt: 'Function or code to optimize', type: 'string', required: true },
          { name: 'bottleneck', prompt: 'Known bottleneck or performance concern', type: 'string' },
        ],
        promptTemplate: `Optimize {{target}} for better performance.

Bottleneck: {{bottleneck}}

Improve efficiency while maintaining functionality and readability.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: ['typecheck'],
        tags: ['optimization', 'performance', 'quality'],
      },
      {
        id: 'explain-code',
        title: 'Explain Code',
        description: 'Get detailed explanation of code functionality',
        category: 'understanding',
        mode: 'ask',
        variables: [
          { name: 'target', prompt: 'Code block or file to explain', type: 'string', required: true },
          { name: 'focus_area', prompt: 'Specific area to focus on', type: 'string' },
        ],
        promptTemplate: `Explain this code: {{target}}

Focus on: {{focus_area}}

Provide clear explanation of what it does, why it's designed this way, and any important patterns.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: [],
        tags: ['learning', 'explanation', 'understanding'],
      },
      {
        id: 'security-audit',
        title: 'Security Audit',
        description: 'Review code for security vulnerabilities',
        category: 'security',
        mode: 'plan',
        variables: [
          { name: 'target', prompt: 'Code area to audit', type: 'string', required: true },
          { name: 'focus', prompt: 'Security focus areas', type: 'multiline' },
        ],
        promptTemplate: `Perform security audit on: {{target}}

Focus areas: {{focus}}

Identify vulnerabilities and recommend fixes.`,
        contextRules: [
          { action: 'include', pattern: 'src/**/*.ts' },
        ],
        approvedCommands: [],
        tags: ['security', 'audit', 'quality'],
      },
    ];

    for (const template of builtIn) {
      this.templates.set(template.id, template);
    }
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): MissionTemplate | undefined {
    return this.templates.get(templateId) || this.customTemplates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): MissionTemplate[] {
    return [
      ...Array.from(this.templates.values()),
      ...Array.from(this.customTemplates.values()),
    ];
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): MissionTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category);
  }

  /**
   * Get unique categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const template of this.getAllTemplates()) {
      categories.add(template.category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Create custom template
   */
  createCustomTemplate(template: MissionTemplate): void {
    this.customTemplates.set(template.id, template);
  }

  /**
   * Delete custom template
   */
  deleteCustomTemplate(templateId: string): boolean {
    return this.customTemplates.delete(templateId);
  }

  /**
   * Substitute variables in template
   */
  substituteVariables(template: MissionTemplate, values: Record<string, string>): string {
    let prompt = template.promptTemplate;

    for (const [key, value] of Object.entries(values)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    return prompt;
  }

  /**
   * Export custom templates
   */
  exportCustomTemplates(): string {
    const templates = Array.from(this.customTemplates.values());
    return JSON.stringify(templates, null, 2);
  }

  /**
   * Import custom templates
   */
  importCustomTemplates(json: string): number {
    try {
      const templates = JSON.parse(json) as MissionTemplate[];
      let imported = 0;

      for (const template of templates) {
        this.createCustomTemplate(template);
        imported++;
      }

      return imported;
    } catch {
      return 0;
    }
  }
}
