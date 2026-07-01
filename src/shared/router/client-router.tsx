import type { MouseEvent, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type RouterLocation = {
  pathname: string;
  search: string;
  hash: string;
};

type ClientRouterContextValue = {
  location: RouterLocation;
  navigate: (href: string, options?: { replace?: boolean }) => void;
  back: () => void;
};

const ClientRouterContext = createContext<ClientRouterContextValue | null>(null);

function currentLocation(): RouterLocation {
  return {
    pathname: window.location.pathname || '/',
    search: window.location.search,
    hash: window.location.hash,
  };
}

function isInternalHref(href: string) {
  if (!href || href.startsWith('#')) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin && url.pathname.startsWith('/');
  } catch {
    return href.startsWith('/');
  }
}

function hrefToPath(href: string) {
  const url = new URL(href, window.location.href);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function ClientRouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<RouterLocation>(() => currentLocation());

  const syncLocation = useCallback(() => {
    setLocation(currentLocation());
  }, []);

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (!isInternalHref(href)) {
        window.location.href = href;
        return;
      }
      const next = hrefToPath(href);
      if (options?.replace) {
        window.history.replaceState(null, '', next);
      } else {
        window.history.pushState(null, '', next);
      }
      syncLocation();
    },
    [syncLocation],
  );

  const back = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, [syncLocation]);

  useEffect(() => {
    const handleDocumentClick = (event: globalThis.MouseEvent) => {
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
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      const href = target.getAttribute('href');
      if (!href || target.target || !isInternalHref(href)) return;
      event.preventDefault();
      navigate(href);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [navigate]);

  const value = useMemo(() => ({ location, navigate, back }), [back, location, navigate]);

  return <ClientRouterContext.Provider value={value}>{children}</ClientRouterContext.Provider>;
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
  const match = /^\/canvas\/([^/]+)$/.exec(pathname);
  return useMemo(() => (match ? { id: decodeURIComponent(match[1]) } : {}), [match]);
}

export function handleInternalLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
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
