import react from '@vitejs/plugin-react';
import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http';
import { fileURLToPath, URL } from 'node:url';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';

const AI_PROXY_PATH = '/__ai-proxy';
const RESOURCE_PROXY_PATH = '/__resource-proxy';

function localAiProxyPlugin(): Plugin {
  const attachProxy = (
    middlewares: ViteDevServer['middlewares'] | PreviewServer['middlewares'],
  ) => {
    middlewares.use(AI_PROXY_PATH, async (req, res) => {
      if (!req.url) {
        writeProxyError(res, 400, '缺少代理请求地址');
        return;
      }

      const target = new URL(req.url, 'http://127.0.0.1').searchParams.get('target');
      if (!target) {
        writeProxyError(res, 400, '缺少代理目标地址');
        return;
      }

      let targetUrl: URL;
      try {
        targetUrl = new URL(target);
      } catch {
        writeProxyError(res, 400, '代理目标地址无效');
        return;
      }

      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        writeProxyError(res, 400, '代理目标地址仅支持 HTTP/HTTPS');
        return;
      }

      try {
        const response = await fetch(targetUrl, {
          method: req.method,
          headers: proxyRequestHeaders(req.headers),
          body: canSendRequestBody(req.method) ? await readRequestBody(req) : undefined,
          redirect: 'manual',
        });
        res.statusCode = response.status;
        res.statusMessage = response.statusText;
        response.headers.forEach((value, key) => {
          if (!shouldForwardResponseHeader(key)) return;
          res.setHeader(key, value);
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        writeProxyError(res, 502, error instanceof Error ? error.message : 'AI 代理请求失败');
      }
    });

    middlewares.use(RESOURCE_PROXY_PATH, async (req, res) => {
      if (!req.url) {
        writeProxyError(res, 400, '缺少资源请求地址');
        return;
      }

      const target = new URL(req.url, 'http://127.0.0.1').searchParams.get('target');
      const targetUrl = parseProxyTarget(target, res);
      if (!targetUrl) return;

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: proxyResourceRequestHeaders(req.headers),
          redirect: 'manual',
        });
        res.statusCode = response.status;
        res.statusMessage = response.statusText;
        response.headers.forEach((value, key) => {
          if (!shouldForwardResponseHeader(key)) return;
          res.setHeader(key, value);
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        writeProxyError(res, 502, error instanceof Error ? error.message : '资源代理请求失败');
      }
    });
  };

  return {
    name: 'local-ai-proxy',
    configureServer(server) {
      attachProxy(server.middlewares);
    },
    configurePreviewServer(server) {
      attachProxy(server.middlewares);
    },
  };
}

function parseProxyTarget(target: string | null, res: ServerResponse) {
  if (!target) {
    writeProxyError(res, 400, '缺少代理目标地址');
    return null;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    writeProxyError(res, 400, '代理目标地址无效');
    return null;
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    writeProxyError(res, 400, '代理目标地址仅支持 HTTP/HTTPS');
    return null;
  }

  return targetUrl;
}

function canSendRequestBody(method = 'GET') {
  return method !== 'GET' && method !== 'HEAD';
}

function proxyRequestHeaders(headers: IncomingHttpHeaders) {
  const next = new Headers();
  const skippedHeaders = new Set([
    'accept-encoding',
    'connection',
    'content-length',
    'host',
    'origin',
    'referer',
  ]);
  Object.entries(headers).forEach(([key, value]) => {
    if (!value || skippedHeaders.has(key.toLowerCase())) return;
    next.set(key, Array.isArray(value) ? value.join(', ') : value);
  });
  return next;
}

function proxyResourceRequestHeaders(headers: IncomingHttpHeaders) {
  const next = proxyRequestHeaders(headers);
  next.delete('content-type');
  return next;
}

function shouldForwardResponseHeader(key: string) {
  return !['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(
    key.toLowerCase(),
  );
}

function readRequestBody(req: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
    );
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function writeProxyError(res: ServerResponse, statusCode: number, message: string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: { message }, msg: message }));
}

export default defineConfig({
  base: './',
  plugins: [react(), localAiProxyPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'next/link': fileURLToPath(new URL('./src/shared/router/next-link.tsx', import.meta.url)),
      'next/navigation': fileURLToPath(
        new URL('./src/shared/router/next-navigation.ts', import.meta.url),
      ),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    css: true,
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', 'dist-electron/**'],
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/shared/testing/setup-tests.ts'],
  },
});
