import type { MouseEvent } from 'react';
import { createContext, useContext, useMemo } from 'react';

export type RouterEnvironment = {
  protocol: string;
  origin: string;
  href: string;
  pathname: string;
  search: string;
  hash: string;
};

export type RouterLocation = {
  pathname: string;
  search: string;
  hash: string;
};

export type ClientRouterContextValue = {
  location: RouterLocation;
  navigate: (href: string, options?: { replace?: boolean }) => void;
  back: () => void;
};

export const ClientRouterContext = createContext<ClientRouterContextValue | null>(null);

const FILE_ROUTE_ORIGIN = 'http://infinite-canvas.local';

export function currentLocation(environment = currentRouterEnvironment()): RouterLocation {
  if (isFileRouteMode(environment)) {
    return routeLocationFromHash(environment.hash);
  }

  return {
    pathname: environment.pathname || '/',
    search: environment.search,
    hash: environment.hash,
  };
}

export function isInternalHref(href: string, environment = currentRouterEnvironment()) {
  if (!href || href.startsWith('#')) return false;
  try {
    const url = new URL(href, routeBaseUrl(environment));
    return url.origin === routeOrigin(environment) && url.pathname.startsWith('/');
  } catch {
    return href.startsWith('/');
  }
}

export function hrefToPath(href: string, environment = currentRouterEnvironment()) {
  const url = new URL(href, routeBaseUrl(environment));
  return `${url.pathname}${url.search}${url.hash}`;
}

export function hrefToNavigationUrl(href: string, environment = currentRouterEnvironment()) {
  const routePath = hrefToPath(href, environment);
  return isFileRouteMode(environment) ? `#${routePath}` : routePath;
}

export function hrefToClientHref(href: string, environment = currentRouterEnvironment()) {
  return isInternalHref(href, environment) ? hrefToNavigationUrl(href, environment) : href;
}

export function useClientHref(href: string) {
  useClientRouter();
  return hrefToClientHref(href);
}

function currentRouterEnvironment(): RouterEnvironment {
  return {
    protocol: window.location.protocol,
    origin: window.location.origin,
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}

function isFileRouteMode(environment: RouterEnvironment) {
  return environment.protocol === 'file:';
}

function routeLocationFromHash(hash: string): RouterLocation {
  const routePath = hash.startsWith('#') ? hash.slice(1) : hash;
  return routeLocationFromPath(routePath || '/');
}

function routeLocationFromPath(path: string): RouterLocation {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, `${FILE_ROUTE_ORIGIN}/`);
  return {
    pathname: url.pathname || '/',
    search: url.search,
    hash: url.hash,
  };
}

function routeBaseUrl(environment: RouterEnvironment) {
  if (!isFileRouteMode(environment)) return environment.href;
  const location = currentLocation(environment);
  return `${FILE_ROUTE_ORIGIN}${location.pathname}${location.search}${location.hash}`;
}

function routeOrigin(environment: RouterEnvironment) {
  return isFileRouteMode(environment) ? FILE_ROUTE_ORIGIN : environment.origin;
}

export function useClientRouter() {
  const value = useContext(ClientRouterContext);
  if (!value) {
    throw new Error('useClientRouter must be used inside ClientRouterProvider');
  }
  return value;
}

export function useClientPathname() {
  return useClientRouter().location.pathname;
}

export function useClientSearchParams() {
  const { location } = useClientRouter();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export function useClientParams() {
  const pathname = useClientPathname();
  return useMemo(() => {
    const match = /^\/canvas\/([^/]+)$/.exec(pathname);
    return match ? { id: decodeURIComponent(match[1]) } : {};
  }, [pathname]);
}

export function handleInternalLinkClick(
  event: MouseEvent<HTMLElement>,
  href: string,
  navigate: (href: string) => void,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  ) {
    return;
  }
  if (!isInternalHref(href)) return;
  event.preventDefault();
  navigate(href);
}
