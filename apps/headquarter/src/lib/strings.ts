/**
 * Centralized UI copy for Headquarter control pages. The app declares
 * `lang="en"`, so every reader-facing string lives here in a single English voice.
 * Page-specific labels that drift (the Swarm badges and empty state were shipping
 * Indonesian literals) are pulled back to this one source.
 */

export const COMMON_UI = {
  refresh: 'Refresh',
  refreshing: 'Refreshing…',
  retry: 'Retry',
  stop: 'Stop',
  running: 'Running…',
  notReported: 'Not reported',
} as const;

export const SWARM_UI = {
  title: 'Swarm Operations',
  summary: 'Hierarchical multi-agent orchestration with supervisor, researcher, builder, and reviewer roles.',
  missionStatus: 'Mission status',
  ready: 'Ready',
  runningState: 'Running swarm orchestration…',
  completed: 'Completed',
  stopped: 'Stopped',
  failed: 'Failed',
  badge: {
    active: 'ACTIVE',
    done: 'DONE',
    idle: 'READY',
  },
  success: 'SUCCESS',
  emptyLog: 'No swarm activity yet. Enter a goal above and run the swarm.',
  launchButton: 'Run Swarm',
  runningButton: 'Running Swarm…',
} as const;
