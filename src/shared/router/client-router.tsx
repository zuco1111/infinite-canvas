import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ClientRouterContext,
  currentLocation,
  hrefToNavigationUrl,
  isInternalHref,
  type RouterLocation,
} from './client-router-state';

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
      const next = hrefToNavigationUrl(href);
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
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
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
