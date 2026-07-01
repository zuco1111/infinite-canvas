import { ChildProcess, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const defaultAgentPort = 17371;
const configFilePath = path.join(os.homedir(), '.infinite-canvas', 'canvas-agent.json');

export type LocalAgentStatus = {
  available: boolean;
  running: boolean;
  url: string;
  token: string;
  pid?: number;
  error?: string;
};

let localAgentProcess: ChildProcess | null = null;
let lastError = '';

export async function startLocalAgent(agentEntryPath: string): Promise<LocalAgentStatus> {
  if (isAgentRunning()) {
    return readLocalAgentStatus();
  }

  lastError = '';
  localAgentProcess = spawn(process.execPath, [agentEntryPath], {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
    stdio: 'ignore',
  });
  localAgentProcess.unref();
  localAgentProcess.once('exit', () => {
    localAgentProcess = null;
  });
  localAgentProcess.once('error', (error) => {
    lastError = error.message;
    localAgentProcess = null;
  });

  await waitForAgentConfig();
  return readLocalAgentStatus();
}

export function stopLocalAgent(): LocalAgentStatus {
  if (isAgentRunning()) {
    localAgentProcess?.kill();
  }
  localAgentProcess = null;
  return readLocalAgentStatus();
}

export function readLocalAgentStatus(): LocalAgentStatus {
  const config = readConfig();
  return {
    available: true,
    running: isAgentRunning(),
    url: config.url || `http://127.0.0.1:${defaultAgentPort}`,
    token: config.token || '',
    pid: localAgentProcess?.pid,
    error: lastError,
  };
}

function isAgentRunning() {
  return Boolean(
    localAgentProcess && !localAgentProcess.killed && localAgentProcess.exitCode === null,
  );
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configFilePath, 'utf8')) as { url?: string; token?: string };
  } catch {
    return { url: `http://127.0.0.1:${defaultAgentPort}`, token: '' };
  }
}

async function waitForAgentConfig() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 3000) {
    const config = readConfig();
    if (config.url && config.token) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
