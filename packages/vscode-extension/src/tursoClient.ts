// Turso / LibSQL client adapter for VS Code Extension project sync.
// Uses native fetch to the Turso HTTP pipeline (v2/pipeline), requiring zero external npm dependencies.

export interface TursoConfig {
  url: string;
  authToken: string;
}

export interface TursoTaskRecord {
  id: string;
  project_id: string;
  plan_slug: string;
  source_file: string;
  line_index: number;
  text: string;
  state: string;
  source_line: string;
  file_hash: string;
}

export interface TursoProjectRecord {
  id: string;
  name: string;
  workspace_path: string;
  sync_mode: string;
  last_sync_at?: string;
  sync_hash?: string;
}

export class TursoClient {
  private pipelineUrl: string;

  constructor(private readonly config: TursoConfig) {
    const base = config.url.replace(/^libsql:\/\//, 'https://').replace(/\/+$/, '');
    this.pipelineUrl = `${base}/v2/pipeline`;
  }

  private async execute(stmts: Array<{ sql: string; args?: unknown[] }>): Promise<any[]> {
    const requests = stmts.map((s) => ({
      type: 'execute',
      stmt: {
        sql: s.sql,
        args: s.args
          ? s.args.map((arg) => {
              if (arg === null || arg === undefined) return { type: 'null' };
              if (typeof arg === 'number') return { type: 'integer', value: String(arg) };
              if (typeof arg === 'boolean') return { type: 'integer', value: arg ? '1' : '0' };
              return { type: 'text', value: String(arg) };
            })
          : [],
      },
    }));

    const response = await fetch(this.pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Turso HTTP error ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as { results: any[] };
    return json.results;
  }

  async getProjectByPath(workspacePath: string): Promise<TursoProjectRecord | null> {
    const results = await this.execute([
      {
        sql: 'SELECT id, name, workspace_path, sync_mode, last_sync_at, sync_hash FROM projects WHERE workspace_path = ? LIMIT 1;',
        args: [workspacePath],
      },
    ]);

    const res = results[0]?.response?.result;
    if (!res || !res.rows || res.rows.length === 0) return null;

    const row = res.rows[0];
    const cols = res.cols.map((c: any) => c.name);
    const obj: any = {};
    cols.forEach((name: string, i: number) => {
      obj[name] = row[i]?.value;
    });
    return obj as TursoProjectRecord;
  }

  async upsertProject(project: { id: string; name: string; workspace_path: string }): Promise<void> {
    await this.execute([
      {
        sql: `INSERT INTO projects (id, name, workspace_path, updated_at)
              VALUES (?, ?, ?, datetime('now'))
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                workspace_path = excluded.workspace_path,
                updated_at = datetime('now');`,
        args: [project.id, project.name, project.workspace_path],
      },
    ]);
  }

  async syncPlans(
    projectId: string,
    plans: Array<{
      slug: string;
      title: string;
      specStatus: string;
      folderHash: string;
      tasks: Array<{
        text: string;
        state: string;
        lineIndex: number;
        sourceLine: string;
        fileHash: string;
      }>;
    }>
  ): Promise<{ insertedOrUpdated: number }> {
    const stmts: Array<{ sql: string; args?: unknown[] }> = [];

    for (const plan of plans) {
      const planId = `${projectId}:${plan.slug}`;
      stmts.push({
        sql: `INSERT INTO plans (id, project_id, slug, title, spec_status, folder_hash, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                spec_status = excluded.spec_status,
                folder_hash = excluded.folder_hash,
                updated_at = datetime('now');`,
        args: [planId, projectId, plan.slug, plan.title, plan.specStatus, plan.folderHash],
      });

      for (const t of plan.tasks) {
        const taskId = `${projectId}:${plan.slug}:${t.lineIndex}`;
        stmts.push({
          sql: `INSERT INTO tasks (id, project_id, plan_slug, source_file, line_index, text, state, source_line, file_hash, updated_at)
                VALUES (?, ?, ?, 'task.md', ?, ?, ?, ?, ?, datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  text = excluded.text,
                  state = excluded.state,
                  source_line = excluded.source_line,
                  file_hash = excluded.file_hash,
                  updated_at = datetime('now');`,
          args: [taskId, projectId, plan.slug, t.lineIndex, t.text, t.state, t.sourceLine, t.fileHash],
        });
      }
    }

    stmts.push({
      sql: `UPDATE projects SET last_sync_at = datetime('now') WHERE id = ?;`,
      args: [projectId],
    });

    await this.execute(stmts);
    return { insertedOrUpdated: stmts.length - 1 };
  }

  async getTasks(projectId: string): Promise<TursoTaskRecord[]> {
    const results = await this.execute([
      {
        sql: 'SELECT id, project_id, plan_slug, source_file, line_index, text, state, source_line, file_hash FROM tasks WHERE project_id = ? ORDER BY plan_slug, line_index;',
        args: [projectId],
      },
    ]);

    const res = results[0]?.response?.result;
    if (!res || !res.rows) return [];

    const cols = res.cols.map((c: any) => c.name);
    return res.rows.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((name: string, i: number) => {
        obj[name] = row[i]?.value;
      });
      return obj as TursoTaskRecord;
    });
  }
}
