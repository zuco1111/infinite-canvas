export type RemoteProxyKind = 'ai' | 'resource';

const LOCAL_PROXY_PATHS: Record<RemoteProxyKind, string> = {
  ai: '/__ai-proxy',
  resource: '/__resource-proxy',
};

const ELECTRON_PROXY_HOSTS: Record<RemoteProxyKind, string> = {
  ai: 'ai-proxy',
  resource: 'resource-proxy',
};

export function maybeProxyRemoteUrl(targetUrl: string, kind: RemoteProxyKind) {
  return shouldProxyRemoteUrl(targetUrl, kind) ? proxyRemoteUrl(targetUrl, kind) : targetUrl;
}

function shouldProxyRemoteUrl(targetUrl: string, kind: RemoteProxyKind) {
  if (typeof window === 'undefined') return false;

  const target = parseRemoteTarget(targetUrl);
  if (!target) return false;
  if (target.origin === window.location.origin) return false;

  if (isElectronFileRuntime() || isLocalWebRuntime()) return true;

  return Boolean(configuredSameOriginProxyPath(kind) && !isLocalApiHost(target.hostname));
}

function proxyRemoteUrl(targetUrl: string, kind: RemoteProxyKind) {
  if (isElectronFileRuntime()) {
    return `infinite-canvas://${ELECTRON_PROXY_HOSTS[kind]}?target=${encodeURIComponent(targetUrl)}`;
  }

  return appendTargetParam(
    configuredSameOriginProxyPath(kind) || LOCAL_PROXY_PATHS[kind],
    targetUrl,
  );
}

function appendTargetParam(proxyPath: string, targetUrl: string) {
  const separator = proxyPath.includes('?') ? '&' : '?';
  return `${proxyPath}${separator}target=${encodeURIComponent(targetUrl)}`;
}

function configuredSameOriginProxyPath(kind: RemoteProxyKind) {
  const rawValue =
    kind === 'ai' ? import.meta.env.VITE_AI_PROXY_PATH : import.meta.env.VITE_RESOURCE_PROXY_PATH;
  const value = rawValue?.trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function parseRemoteTarget(targetUrl: string) {
  try {
    const url = new URL(targetUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

function isElectronFileRuntime() {
  return (
    typeof window !== 'undefined' &&
    window.location.protocol === 'file:' &&
    window.infiniteCanvasPlatform?.runtime === 'electron'
  );
}

function isLocalWebRuntime() {
  if (typeof window === 'undefined') return false;
  return isLocalApiHost(window.location.hostname);
}

function isLocalApiHost(hostname: string) {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}
