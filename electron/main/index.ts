import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import path from 'node:path';
import { readLocalAgentStatus, startLocalAgent, stopLocalAgent } from './local-agent-manager';

const appRoot = path.resolve(__dirname, '..', '..');
const preloadPath = path.join(appRoot, 'dist-electron', 'preload', 'index.cjs');
const rendererDistPath = path.join(appRoot, 'dist', 'index.html');
const localAgentEntryPath = path.join(appRoot, 'dist-electron', 'agent', 'index.cjs');
const devServerUrl = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'infinite-canvas',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'Infinite Canvas',
    backgroundColor: '#101418',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(rendererDistPath);
  }
}

ipcMain.handle('platform:get-version', () => app.getVersion());
ipcMain.handle('platform:open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});
ipcMain.handle('platform:local-agent-status', () => readLocalAgentStatus());
ipcMain.handle('platform:local-agent-start', () => startLocalAgent(localAgentEntryPath));
ipcMain.handle('platform:local-agent-stop', () => stopLocalAgent());

app.whenReady().then(() => {
  protocol.handle('infinite-canvas', handleInfiniteCanvasProtocol);
  void createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function handleInfiniteCanvasProtocol(request: Request) {
  const url = new URL(request.url);
  if (url.hostname !== 'ai-proxy' && url.hostname !== 'resource-proxy') {
    return proxyErrorResponse(404, '未知的本地代理路径');
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  const target = url.searchParams.get('target');
  const targetUrl = parseProxyTarget(target);
  if (!targetUrl) return proxyErrorResponse(400, '代理目标地址无效');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers:
        url.hostname === 'resource-proxy'
          ? proxyResourceRequestHeaders(request.headers)
          : proxyRequestHeaders(request.headers),
      body: canSendRequestBody(request.method) ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
    });
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      statusText: response.statusText,
      headers: proxyResponseHeaders(request, response.headers),
    });
  } catch (error) {
    return proxyErrorResponse(
      502,
      error instanceof Error ? error.message : '本地代理请求失败',
      request,
    );
  }
}

function parseProxyTarget(target: string | null) {
  if (!target) return null;
  try {
    const url = new URL(target);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

function canSendRequestBody(method = 'GET') {
  return method !== 'GET' && method !== 'HEAD';
}

function proxyRequestHeaders(headers: Headers) {
  const next = new Headers();
  const skippedHeaders = new Set([
    'accept-encoding',
    'connection',
    'content-length',
    'host',
    'origin',
    'priority',
    'referer',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'user-agent',
  ]);
  headers.forEach((value, key) => {
    if (skippedHeaders.has(key.toLowerCase())) return;
    next.set(key, value);
  });
  return next;
}

function proxyResourceRequestHeaders(headers: Headers) {
  const next = proxyRequestHeaders(headers);
  next.delete('content-type');
  return next;
}

function proxyResponseHeaders(request: Request, headers: Headers) {
  const next = corsHeaders(request);
  headers.forEach((value, key) => {
    if (!shouldForwardResponseHeader(key)) return;
    next.set(key, value);
  });
  return next;
}

function shouldForwardResponseHeader(key: string) {
  return !['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(
    key.toLowerCase(),
  );
}

function proxyErrorResponse(status: number, message: string, request?: Request) {
  return new Response(JSON.stringify({ error: { message }, msg: message }), {
    status,
    headers: {
      ...Object.fromEntries(corsHeaders(request).entries()),
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function corsHeaders(request?: Request) {
  return new Headers({
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers':
      request?.headers.get('access-control-request-headers') || 'authorization,content-type',
  });
}
