import * as fs from 'fs';
import * as path from 'path';

export interface TaskItem {
  id: number;
  text: string;
  completed: boolean;
  lineIndex: number;
  filePath: string;
}

export interface PlanItem {
  id: string;
  folderName: string;
  dirPath: string;
  specPath?: string;
  taskPath?: string;
  title: string;
  status: string;
  tasks: TaskItem[];
}

export class PlanManager {
  /**
   * Scans a workspace root folder for `.plans/` subdirectories.
   */
  static scanWorkspace(workspaceRoot: string): PlanItem[] {
    const plansDir = path.join(workspaceRoot, '.plans');
    if (!fs.existsSync(plansDir)) {
      return [];
    }

    const entries = fs.readdirSync(plansDir, { withFileTypes: true });
    const plans: PlanItem[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const planDirPath = path.join(plansDir, entry.name);
      const specPath = path.join(planDirPath, 'spec.md');
      const taskPath = path.join(planDirPath, 'task.md');

      let title = entry.name;
      let status = 'in_progress';
      const tasks: TaskItem[] = [];

      // Parse spec.md if present for metadata
      if (fs.existsSync(specPath)) {
        try {
          const specContent = fs.readFileSync(specPath, 'utf-8');
          const titleMatch = specContent.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
          const statusMatch = specContent.match(/status:\s*"?([^"\r\n]+)"?/);
          if (statusMatch) {
            status = statusMatch[1].trim();
          }
        } catch {
          // Fallback to folder name
        }
      }

      // Parse task.md if present for checklist
      if (fs.existsSync(taskPath)) {
        try {
          const taskContent = fs.readFileSync(taskPath, 'utf-8');
          const lines = taskContent.split(/\r?\n/);
          let taskId = 1;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const checkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.+)$/);
            if (checkMatch) {
              const completed = checkMatch[2].toLowerCase() === 'x';
              const text = checkMatch[3].trim();
              tasks.push({
                id: taskId++,
                text,
                completed,
                lineIndex: i,
                filePath: taskPath,
              });
            }
          }
        } catch {
          // Ignore parsing errors
        }
      }

      plans.push({
        id: entry.name,
        folderName: entry.name,
        dirPath: planDirPath,
        specPath: fs.existsSync(specPath) ? specPath : undefined,
        taskPath: fs.existsSync(taskPath) ? taskPath : undefined,
        title,
        status,
        tasks,
      });
    }

    // Sort descending by folder name (timestamp prefix YYYYMMDD-HHMM)
    return plans.sort((a, b) => b.folderName.localeCompare(a.folderName));
  }

  /**
   * Toggles a checkbox in task.md on disk.
   */
  static toggleTask(task: TaskItem): boolean {
    if (!fs.existsSync(task.filePath)) {
      return false;
    }

    try {
      const content = fs.readFileSync(task.filePath, 'utf-8');
      const lines = content.split(/\r?\n/);

      if (task.lineIndex < 0 || task.lineIndex >= lines.length) {
        return false;
      }

      const targetLine = lines[task.lineIndex];
      const newCheck = task.completed ? ' ' : 'x';
      const updatedLine = targetLine.replace(/^(\s*-\s*\[)[ xX](\])/, `$1${newCheck}$2`);

      lines[task.lineIndex] = updatedLine;
      fs.writeFileSync(task.filePath, lines.join('\n'), 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates a new plan folder with boilerplate spec.md and task.md
   */
  static createPlan(workspaceRoot: string, title: string): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'new-plan';

    const folderName = `${ts}-${slug}`;
    const targetDir = path.join(workspaceRoot, '.plans', folderName);
    fs.mkdirSync(targetDir, { recursive: true });

    const specContent = `---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-${ts}"
title: "${title}"
status: "in_progress"
author: "developer"
created_at: "${now.toISOString()}"
---

# Feature Specification: ${title}

## 1. Context & User Story
Describe the problem, background, and the primary objective.

## 2. Technical Architecture & Constraints
Outline the software design, affected packages, and invariants.

## 3. Acceptance Criteria
- [ ] AC1: Feature satisfies core functional requirements.
- [ ] AC2: Verification gates pass cleanly.
`;

    const taskContent = `---
plan_id: "PLAN-${ts}"
---

# Execution Checklist

- [ ] 1. Define specifications and contracts
- [ ] 2. Implement core components
- [ ] 3. Run automated verification gates
- [ ] 4. Synchronize canonical documentation
`;

    fs.writeFileSync(path.join(targetDir, 'spec.md'), specContent, 'utf-8');
    fs.writeFileSync(path.join(targetDir, 'task.md'), taskContent, 'utf-8');

    return targetDir;
  }
}

