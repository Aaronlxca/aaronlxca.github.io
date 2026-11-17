// Use the reviewed, locked package without telemetry or automatic installation.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const args = process.argv.slice(2);
if (args.length === 0) args.push('--help');
const supported = new Set(['search', 'list', 'retrieve', 'legacy-scan', '--version', '-v', '--help', '-h']);
if (!supported.has(args[0])) {
  console.error('Use search, list, retrieve or legacy-scan. Installation, updates and feature opt-ins are reviewed separately.');
  process.exit(1);
}
const packageRoot = path.dirname(require.resolve('modern-web-guidance/package.json'));
const cli = path.join(packageRoot, 'skills/modern-web-guidance/modern-web.mjs');
const result = spawnSync(process.execPath, [cli, ...args], {
  stdio: 'inherit',
  env: { ...process.env, DISABLE_TELEMETRY: '1', ENABLE_FILE_LOGGING: 'false', DO_NOT_TRACK: '1' },
});
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
