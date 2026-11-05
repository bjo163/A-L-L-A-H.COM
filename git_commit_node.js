const { execSync } = require('child_process');

const commands = [
  'git add .plans/20261104-0043-jizz-phase-1-foundation-scaffold/task.md',
  'git add .plans/20261104-0044-jizz-phase-2-typed-adapter-contracts/task.md',
  'git add .plans/20261104-0045-jizz-phase-3-observatory-perspective-screens/task.md',
  'git add .plans/20261104-0046-jizz-phase-4-integration-verification/task.md',
  'git add apps/jizz/AGENTS.md',
  'git add apps/jizz/README.md',
  'git commit -m "chore(jizz): mark phases 1-4 tasks complete with evidence\n\n- Phase 1: Foundation scaffold complete (package.json, tsconfig, next.config, layout, page, scripts)\n- Phase 2: Typed adapters & contracts complete (types, client adapter, SSRF, error handling, tests)\n- Phase 3: Observatory screens complete (/, /phenomena, /phenomena/[id], /signals)\n- Phase 4: Integration verification (lint:arch 100%, typecheck, docs:check 100/100, build gate)\n- Updated AGENTS.md and README.md with current verification date"'
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