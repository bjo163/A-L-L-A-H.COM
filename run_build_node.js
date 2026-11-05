const { execSync } = require('child_process');
try {
  const result = execSync('pnpm --filter @moonwitness/jizz build', {
    cwd: 'Z:\\project\\rocksoul-dx',
    stdio: 'pipe',
    env: { ...process.env }
  });
  console.log('STDOUT:', result.stdout.toString());
  console.log('STDERR:', result.stderr.toString());
  console.log('Exit code:', result.status);
} catch (e) {
  console.log('STDOUT:', e.stdout ? e.stdout.toString() : 'none');
  console.log('STDERR:', e.stderr ? e.stderr.toString() : 'none');
  console.log('Exit code:', e.status);
}