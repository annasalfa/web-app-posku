import {spawn, spawnSync} from 'node:child_process';

const rawArgs = process.argv.slice(2);
const forwardedArgs = rawArgs.filter((arg) => arg !== '--coverage');

if (rawArgs.includes('--coverage')) {
  console.warn(
    '[test] Ignoring --coverage because browser coverage is not configured for this Playwright suite.',
  );
}

const playwrightArgs =
  forwardedArgs.length > 0 ? forwardedArgs : ['--project=public'];

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '3200';
const server = spawn(command, ['run', 'dev', '--', '--port', playwrightPort], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PLAYWRIGHT_PORT: playwrightPort,
  },
});

let serverExitCode = null;
server.on('exit', (code) => {
  serverExitCode = code;
});

try {
  await waitForServer(`http://127.0.0.1:${playwrightPort}/id/login`, server);

  const result = spawnSync(command, ['run', 'e2e', '--', ...playwrightArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_PORT: playwrightPort,
      PLAYWRIGHT_DISABLE_WEBSERVER: '1',
    },
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
} finally {
  if (server.exitCode === null && serverExitCode === null) {
    server.kill('SIGTERM');
  }
}

async function waitForServer(url, server) {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    if (server.exitCode !== null || serverExitCode !== null) {
      throw new Error(`Smoke-test server exited early with code ${server.exitCode ?? serverExitCode}.`);
    }

    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for smoke-test server at ${url}.`);
}
