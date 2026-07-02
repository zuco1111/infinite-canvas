import { useMemo } from 'react';

import {
  useClientParams,
  useClientPathname,
  useClientRouter,
  useClientSearchParams,
} from './client-router-state';

export function usePathname() {
  return useClientPathname();
}

export function useSearchParams() {
  return useClientSearchParams();
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useClientParams() as T;
}

export function useRouter() {
  const { back, navigate } = useClientRouter();

  return useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, { replace: true }),
      back,
      refresh: () => undefined,
    }),
    [back, navigate],
  );
}
