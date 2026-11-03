import * as fs from 'fs';
import * as path from 'path';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface TaskItem {
  id: number;
  text: string;
  status: TaskStatus;
  lineIndex: number;
  filePath: string;
  sourceLine: string;
}

export interface PlanItem {
  id: string;
  folderName: string;
  dirPath: string;
  workspaceRoot: string;
  workspaceName: string;
  specPath?: string;
  taskPath?: string;
  title: string;
  status: string;
  tasks: TaskItem[];
}

export interface PlanMarkdownBodies {
  spec: string;
  tasks: string;
  design: string;
  rules: string;
}

const TASK_LINE = /^(\s*-\s*\[)([ xX/])(\])\s*(\S.*)$/;

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function readOptionalFile(filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

function parseStatus(marker: string): TaskStatus {
  if (marker === '/') {
    return 'in-progress';
  }
  if (marker.toLowerCase() === 'x') {
    return 'completed';
  }
  return 'pending';
}

function statusMarker(status: TaskStatus): string {
  switch (status) {
    case 'pending':
      return ' ';
    case 'in-progress':
      return '/';
    case 'completed':
      return 'x';
  }
}

export function parseTaskItems(content: string, filePath: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  const lines = content.split(/\r\n|\n|\r/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const sourceLine = lines[lineIndex];
    const match = sourceLine.match(TASK_LINE);
    if (!match) {
      continue;
    }

    tasks.push({
      id: tasks.length + 1,
      text: match[4].trim(),
      status: parseStatus(match[2]),
      lineIndex,
      filePath,
      sourceLine,
    });
  }

  return tasks;
}

export class PlanManager {
  static scanWorkspace(workspaceRoot: string): PlanItem[] {
    const plansDir = path.join(workspaceRoot, '.plans');
    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(plansDir, { withFileTypes: true });
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }

    const plans: PlanItem[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dirPath = path.join(plansDir, entry.name);
      const specPath = path.join(dirPath, 'spec.md');
      const taskPath = path.join(dirPath, 'task.md');
      const specContent = readOptionalFile(specPath);
      const taskContent = readOptionalFile(taskPath);
      const titleMatch = specContent?.match(/^#\s+(.+)$/m);
      const frontmatter = specContent?.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      const statusMatch = frontmatter?.[1].match(/^status:\s*["']?([^"'\r\n]+)["']?\s*$/m);

      plans.push({
        id: entry.name,
        folderName: entry.name,
        dirPath,
        workspaceRoot,
        workspaceName: path.basename(workspaceRoot),
        specPath: specContent === undefined ? undefined : specPath,
        taskPath: taskContent === undefined ? undefined : taskPath,
        title: titleMatch?.[1].trim() || entry.name,
        status: statusMatch?.[1].trim() || 'status not set',
        tasks: taskContent === undefined ? [] : parseTaskItems(taskContent, taskPath),
      });
    }

    return plans.sort((a, b) => b.folderName.localeCompare(a.folderName));
  }

  static setTaskStatus(task: TaskItem, status: TaskStatus): void {
    const content = fs.readFileSync(task.filePath, 'utf-8');
    const parts = content.split(/(\r\n|\n|\r)/);
    const contentPartIndex = task.lineIndex * 2;
    const currentLine = parts[contentPartIndex];

    if (currentLine !== task.sourceLine) {
      throw new Error(`Task changed since it was loaded. Refresh the plan before updating ${task.filePath}.`);
    }

    const match = currentLine.match(TASK_LINE);
    if (!match) {
      throw new Error(`Task is no longer a valid checklist item at ${task.filePath}:${task.lineIndex + 1}.`);
    }

    if (parseStatus(match[2]) === status) {
      return;
    }

    const markerIndex = match[1].length;
    parts[contentPartIndex] = `${currentLine.slice(0, markerIndex)}${statusMarker(status)}${currentLine.slice(markerIndex + 1)}`;
    fs.writeFileSync(task.filePath, parts.join(''), 'utf-8');
  }

  static createPlan(workspaceRoot: string, title: string): string {
    const normalizedTitle = this.normalizeTitle(title);
    return this.writePlan(workspaceRoot, normalizedTitle, {
      spec: [
        '## Problem and context',
        '[Describe the verified problem, affected users, and why this work is needed.]',
        '',
        '## Scope and constraints',
        '[State what is included, what is excluded, and the relevant system boundaries.]',
        '',
        '## Acceptance criteria',
        '- [ ] Define observable outcomes for this work.',
        '- [ ] Verify the relevant behavior and report evidence.',
      ].join('\n'),
      tasks: [
        `- [ ] Define the acceptance criteria for ${normalizedTitle}.`,
        `- [ ] Implement ${normalizedTitle} within the stated boundaries.`,
        '- [ ] Run focused verification and update affected documentation.',
      ].join('\n'),
      design: [
        '## User experience',
        '[Describe the users, primary workflow, interaction states, and accessibility needs.]',
        '',
        '## Technical approach',
        '[Describe the affected components and the reason for the selected approach.]',
      ].join('\n'),
      rules: [
        '- Preserve existing behavior outside the stated scope.',
        '- Keep errors visible and do not report success when an operation fails.',
        '- Add only evidence-backed claims and requirements.',
      ].join('\n'),
    });
  }

  static createPlanWithContent(workspaceRoot: string, title: string, bodies: PlanMarkdownBodies): string {
    const normalizedTitle = this.normalizeTitle(title);
    const requiredArtifacts: (keyof PlanMarkdownBodies)[] = ['spec', 'tasks', 'design', 'rules'];
    for (const name of requiredArtifacts) {
      const content = bodies[name];
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error(`Generated plan artifact "${name}" must contain Markdown content.`);
      }
    }
    if (!bodies.tasks.split(/\r\n|\n|\r/).some((line) => TASK_LINE.test(line))) {
      throw new Error('Generated plan tasks must contain at least one Markdown checklist item.');
    }
    return this.writePlan(workspaceRoot, normalizedTitle, bodies);
  }

  private static normalizeTitle(title: string): string {
    const normalizedTitle = title.trim().replace(/\s+/g, ' ');
    if (!normalizedTitle) {
      throw new Error('Plan title cannot be empty.');
    }
    return normalizedTitle;
  }

  private static writePlan(workspaceRoot: string, title: string, bodies: PlanMarkdownBodies): string {
    const plansDir = path.join(workspaceRoot, '.plans');
    fs.mkdirSync(plansDir, { recursive: true });

    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'new-plan';
    let targetDir = '';
    let folderName = '';

    for (let suffix = 1; ; suffix++) {
      folderName = `${timestamp}-${slug}${suffix === 1 ? '' : `-${suffix}`}`;
      targetDir = path.join(plansDir, folderName);
      try {
        fs.mkdirSync(targetDir);
        break;
      } catch (error) {
        if (!isNodeError(error) || error.code !== 'EEXIST') {
          throw error;
        }
      }
    }

    const planId = `PLAN-${folderName}`;
    const metadata = [
      '---',
      'contract: "SPEC_DRIVEN_PLAN"',
      `id: ${JSON.stringify(planId)}`,
      `title: ${JSON.stringify(title)}`,
      'status: "in_progress"',
      'author: "developer"',
      `created_at: "${now.toISOString()}"`,
      '---',
    ].join('\n');
    const files: Record<string, string> = {
      'spec.md': `${metadata}\n\n# Feature Specification: ${title}\n\n${bodies.spec.trim()}\n`,
      'task.md': `---\nplan_id: ${JSON.stringify(planId)}\n---\n\n# Execution Checklist\n\n${bodies.tasks.trim()}\n`,
      'design.md': `---\ntitle: ${JSON.stringify(`Design: ${title}`)}\nplan: ${JSON.stringify(folderName)}\n---\n\n# Design Specification\n\n${bodies.design.trim()}\n`,
      'rules.md': `---\ntitle: ${JSON.stringify(`Rules: ${title}`)}\nplan: ${JSON.stringify(folderName)}\n---\n\n# Invariants and Boundary Rules\n\n${bodies.rules.trim()}\n`,
    };
    const createdFiles: string[] = [];

    try {
      for (const [fileName, content] of Object.entries(files)) {
        const filePath = path.join(targetDir, fileName);
        fs.writeFileSync(filePath, content, { encoding: 'utf-8', flag: 'wx' });
        createdFiles.push(filePath);
      }
    } catch (error) {
      const cleanupErrors: unknown[] = [];
      for (const filePath of createdFiles) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
      try {
        fs.rmdirSync(targetDir);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
      if (cleanupErrors.length > 0) {
        throw new AggregateError([error, ...cleanupErrors], `Plan creation failed and cleanup was incomplete: ${targetDir}`);
      }
      throw error;
    }

    return targetDir;
  }
}
