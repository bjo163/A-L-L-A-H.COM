'use client';

import { useEffect, useState } from 'react';
import { RouteShell, PageHero, SectionHeading, StatePanel, Button } from '@moonwitness/ui';

interface TursoTaskItem {
  id: string;
  project_id: string;
  plan_slug: string;
  text: string;
  state: string;
  line_index: number;
}

export default function ProjectsPage() {
  const [tasks, setTasks] = useState<TursoTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        // Proxy through same-origin Next.js server route handler to maintain NO_SECRETS and UNIVERSAL_SDK compliance
        const response = await fetch('/api/projects');

        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json.tasks)) {
            setTasks(json.tasks as TursoTaskItem[]);
          }
        }
      } catch {
        // Offline or server route unreachable
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const pendingCount = tasks.filter((t) => t.state === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.state === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.state === 'completed').length;

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.state === filter);

  // Group tasks by plan_slug
  const plansMap = new Map<string, TursoTaskItem[]>();
  for (const t of filteredTasks) {
    const list = plansMap.get(t.plan_slug) || [];
    list.push(t);
    plansMap.set(t.plan_slug, list);
  }

  return (
    <RouteShell title="Project & Task Manager">
      <PageHero
        kicker="Odoo-Style Project Management"
        title="Rocksoul Ecosystem Plans"
        summary="Real-time multi-tenant plan management synchronized across VS Code, Arsy ORM Hub, and Turso LibSQL Cloud."
      />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({inProgressCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </Button>
      </div>

      {loading ? (
        <StatePanel
          kind="loading"
          title="Loading Plan Tasks..."
          cause="Fetching synchronized records from Turso LibSQL Cloud Database."
          nextAction="Please wait a moment while the records stream in."
        />
      ) : plansMap.size === 0 ? (
        <StatePanel
          kind="empty"
          title="No Tasks Found"
          cause="No tasks match the active filter or no plans have been synchronized yet."
          nextAction="Run 'A-L-L-A-H: Sync .plans to Turso Cloud' from VS Code to push tasks."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Array.from(plansMap.entries()).map(([slug, planTasks]) => (
            <div
              key={slug}
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                padding: '1.5rem',
                backgroundColor: 'var(--surface, rgba(255,255,255,0.02))',
              }}
            >
              <SectionHeading
                kicker="Plan Spec"
                title={slug}
                description={`${planTasks.length} task checklist item(s)`}
              />
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {planTasks.map((task) => (
                  <li
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        backgroundColor:
                          task.state === 'completed'
                            ? 'rgba(46, 204, 113, 0.2)'
                            : task.state === 'in_progress'
                            ? 'rgba(241, 196, 15, 0.2)'
                            : 'rgba(149, 165, 166, 0.2)',
                      }}
                    >
                      {task.state === 'completed' ? 'PASS [x]' : task.state === 'in_progress' ? 'RUN [/]' : 'TODO [ ]'}
                    </span>
                    <span>{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </RouteShell>
  );
}
