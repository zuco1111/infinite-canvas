import {
  useClientParams,
  useClientPathname,
  useClientRouter,
  useClientSearchParams,
} from './client-router';

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
  const router = useClientRouter();

  return {
    push: (href: string) => router.navigate(href),
    replace: (href: string) => router.navigate(href, { replace: true }),
    back: router.back,
    refresh: () => undefined,
  };
}
