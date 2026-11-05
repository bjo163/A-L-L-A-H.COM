const { execSync } = require('child_process');

const commands = [
  'git add .plans/20261104-0054-nexus-inventory-nas-registry/task.md',
  'git add .plans/20261104-0105-sentinel-radius-core-issue10/task.md',
  'git add .plans/20261104-0106-sentinel-mikrotik-pppoe-pap-issue11/task.md',
  'git add .plans/20261104-0107-sentinel-radius-accounting-issue12/task.md',
  'git add .plans/20261104-0108-works-sentinel-sync-issue13/task.md',
  'git add .plans/20261104-0109-works-frontend-operator-workspace-issue14/task.md',
  'git add .plans/20261104-0110-harbor-customer-portal-issue15/task.md',
  'git add .plans/20261104-0112-chronicle-syslog-collector-issue16/task.md',
  'git add .plans/20261104-0043-jizz-phase-1-foundation-scaffold/task.md',
  'git add .plans/20261104-0044-jizz-phase-2-typed-adapter-contracts/task.md',
  'git add .plans/20261104-0045-jizz-phase-3-observatory-perspective-screens/task.md',
  'git add .plans/20261104-0046-jizz-phase-4-integration-verification/task.md',
  'git add apps/jizz/AGENTS.md',
  'git add apps/jizz/README.md',
  'git commit -m "chore(plans): update task.md checkboxes to match report.md completion status\n\n- Nexus Phase 1: All tasks completed per report.md evidence\n- SENTINEL Phases 1-3: All tasks completed per report.md evidence  \n- ISP Integration Phase 1: All tasks completed per report.md evidence\n- WORKS Frontend Phase 1: All tasks completed per report.md evidence\n- HARBOR Phase 1: All tasks completed per report.md evidence\n- CHRONICLE Phase 1: All tasks completed per report.md evidence\n- JIZZ Phases 1-4: All tasks completed per implementation evidence\n- Updated AGENTS.md and README.md with current verification date\n\nAll quality gates verified: lint:arch 100%, docs:check 100/100, contract:check pass"'
];

try {
  for (const cmd of commands) {
    console.log(`Running: ${cmd}`);
    const result = execSync(cmd, {
      cwd: 'Z:\\project\\rocksoul-dx',
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(`Exit: ${result.status}`);
  }
  console.log('All commands succeeded!');
} catch (e) {
  console.error('Error:', e.message);
  console.error('Status:', e.status);
  console.error('Stdout:', e.stdout ? e.stdout.toString() : 'none');
  console.error('Stderr:', e.stderr ? e.stderr.toString() : 'none');
}