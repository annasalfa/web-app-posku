import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:net';

const rawArgs = process.argv.slice(2);
const forwardedArgs = rawArgs.filter((arg) => arg !== '--coverage');

if (rawArgs.includes('--coverage')) {
  console.warn(
    '[test] Ignoring --coverage because browser coverage is not configured for this Playwright suite.',
  );
}

const playwrightArgs =
  forwardedArgs.length > 0 ? forwardedArgs : ['--project=public'];

const npmExecPath = process.env.npm_execpath;
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? String(await findAvailablePort(3200));
const server = runNpm(['run', 'dev', '--', '--port', playwrightPort], {
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

  const result = runNpmSync(['run', 'e2e', '--', ...playwrightArgs], {
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

function getNpmCommand(npmArgs) {
  if (npmExecPath) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...npmArgs],
      options: {},
    };
  }

  return {
    command: 'npm',
    args: npmArgs,
    options: process.platform === 'win32' ? {shell: true} : {},
  };
}

function runNpm(npmArgs, options) {
  const command = getNpmCommand(npmArgs);

  return spawn(command.command, command.args, {
    ...options,
    ...command.options,
  });
}

function runNpmSync(npmArgs, options) {
  const command = getNpmCommand(npmArgs);

  return spawnSync(command.command, command.args, {
    ...options,
    ...command.options,
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await isPortAvailable(port)) {
      if (port !== startPort) {
        console.warn(`[test] Port ${startPort} is busy. Using ${port} for this smoke test run.`);
      }

      return port;
    }
  }

  throw new Error(`No available smoke-test port found from ${startPort} to ${startPort + 19}.`);
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
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
