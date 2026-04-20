import net from 'node:net';
import { spawn } from 'node:child_process';

const processes = [
  { label: 'server', script: 'server:dev', port: 4000 },
  { label: 'client', script: 'dev', port: 3000 },
];

let shuttingDown = false;
const children = [];

function isPortListening(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

for (const { label, script, port } of processes) {
  // If the service is already reachable on its expected port, don't launch a duplicate.
  if (await isPortListening(port)) {
    console.log(`${label} already appears to be running on port ${port}; skipping a duplicate process.`);
    continue;
  }

  const child = spawn(process.execPath, ['--run', script], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}.`);
      shutdown(code);
      return;
    }

    if (signal) {
      console.error(`${label} exited with signal ${signal}.`);
      shutdown(1);
    }
  });

  child.on('error', (error) => {
    if (shuttingDown) {
      return;
    }

    console.error(`Failed to start ${label}:`, error);
    shutdown(1);
  });

  children.push(child);
}

if (children.length === 0) {
  console.log('Nothing to start because both dev servers are already running.');
  process.exit(0);
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => process.exit(exitCode), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
