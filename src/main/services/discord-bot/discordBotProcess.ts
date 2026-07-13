import { ChildProcess, spawn } from 'child_process';
import fsc from 'fs';
import path from 'path';
import log from 'electron-log';
import { app } from 'electron';
import { getDiscordBotDir, readDiscordBotConfig } from './discordBotConfig';

const LOG_BUFFER_LIMIT = 200;
const STOP_TIMEOUT_MS = 5000;

let botProcess: ChildProcess | null = null;
let lastError: string | null = null;
const logBuffer: string[] = [];

function pushLog(line: string) {
  const sanitized = line
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/token["']?\s*[:=]\s*["']?[^"'\s]+/gi, 'token=[REDACTED]');

  logBuffer.push(sanitized);
  if (logBuffer.length > LOG_BUFFER_LIMIT) {
    logBuffer.shift();
  }
}

function resolveNodeExecutable() {
  return process.platform === 'win32' ? 'node.exe' : 'node';
}

function resolveBotEntryPoint(botDir: string) {
  const distEntry = path.join(botDir, 'dist', 'index.js');

  if (fsc.existsSync(distEntry)) {
    return { mode: 'node' as const, entry: distEntry };
  }

  if (!app.isPackaged) {
    const srcEntry = path.join(botDir, 'src', 'index.ts');
    if (fsc.existsSync(srcEntry)) {
      return { mode: 'tsx' as const, entry: srcEntry };
    }
  }

  return null;
}

export function isDiscordBotRunning() {
  return botProcess !== null && botProcess.exitCode === null;
}

export function getDiscordBotLogs() {
  return [...logBuffer];
}

export function getDiscordBotLastError() {
  return lastError;
}

export async function stopDiscordBot() {
  if (!botProcess) {
    return;
  }

  const proc = botProcess;
  botProcess = null;

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (!proc.killed) {
        proc.kill('SIGKILL');
      }
      resolve();
    }, STOP_TIMEOUT_MS);

    proc.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    proc.kill('SIGTERM');
  });
}

export async function startDiscordBot() {
  const config = readDiscordBotConfig();

  if (!config.enabled) {
    await stopDiscordBot();
    return false;
  }

  if (!config.discord.token || !config.discord.clientId) {
    lastError = 'Discord token or clientId is missing';
    log.warn('[discord-bot]', lastError);
    return false;
  }

  await stopDiscordBot();

  const botDir = getDiscordBotDir();
  const entry = resolveBotEntryPoint(botDir);

  if (!entry) {
    lastError = 'Discord bot entry point not found. Run npm run build in discord-bot/';
    log.error('[discord-bot]', lastError);
    return false;
  }

  const env = {
    ...process.env,
    DISCORD_BOT_TOKEN: config.discord.token,
    MANAGEMENT_API_URL: config.managementApi.baseUrl,
    MANAGEMENT_API_KEY: config.managementApi.apiKey,
    DEFAULT_SERVER_ID: config.defaultServerId,
  };

  const command =
    entry.mode === 'tsx'
      ? process.platform === 'win32'
        ? 'npx.cmd'
        : 'npx'
      : resolveNodeExecutable();
  const args =
    entry.mode === 'tsx' ? ['tsx', entry.entry] : [entry.entry];

  botProcess = spawn(command, args, {
    cwd: botDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  lastError = null;

  const procPid = botProcess.pid ?? null;

  botProcess.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8').trim();
    if (text) {
      pushLog(text);
      log.info('[discord-bot]', text);
    }
  });

  botProcess.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8').trim();
    if (text) {
      pushLog(text);
      log.warn('[discord-bot]', text);
    }
  });

  botProcess.on('exit', (code, signal) => {
    if (botProcess?.pid === procPid) {
      botProcess = null;
    }

    if (code && code !== 0) {
      lastError = `Discord bot exited with code ${code}${signal ? ` (${signal})` : ''}`;
      log.error('[discord-bot]', lastError);
    }
  });

  log.info('[discord-bot] started', { pid: procPid, mode: entry.mode });
  return true;
}

export async function reloadDiscordBot() {
  return startDiscordBot();
}

export function getDiscordBotStatus() {
  return {
    running: isDiscordBotRunning(),
    lastError,
    pid: botProcess?.pid ?? null,
  };
}
