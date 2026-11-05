import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rawUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '';
    const token = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || '';

    if (!rawUrl || !token) {
      return NextResponse.json({ error: 'Turso configuration not found in environment' }, { status: 500 });
    }

    const base = rawUrl.replace(/^libsql:\/\//, 'https://').replace(/\/+$/, '');
    const pipelineUrl = `${base}/v2/pipeline`;

    const response = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: 'SELECT id, project_id, plan_slug, text, state, line_index FROM tasks ORDER BY plan_slug DESC, line_index ASC LIMIT 200;',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Turso cloud' }, { status: response.status });
    }

    const json = await response.json();
    const rows = json.results?.[0]?.response?.result?.rows || [];
    const cols: string[] = json.results?.[0]?.response?.result?.cols?.map((c: any) => c.name) || [];

    const tasks = rows.map((r: any[]) => {
      const item: Record<string, unknown> = {};
      cols.forEach((col, idx) => {
        item[col] = r[idx]?.value;
      });
      return item;
    });

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
