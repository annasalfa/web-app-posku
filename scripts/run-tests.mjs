import {spawnSync} from 'node:child_process';

const rawArgs = process.argv.slice(2);
const forwardedArgs = rawArgs.filter((arg) => arg !== '--coverage');

if (rawArgs.includes('--coverage')) {
  console.warn(
    '[test] Ignoring --coverage because browser coverage is not configured for this Playwright suite.',
  );
}

const playwrightArgs =
  forwardedArgs.length > 0 ? forwardedArgs : ['--project=public'];

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['playwright', 'test', ...playwrightArgs], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
