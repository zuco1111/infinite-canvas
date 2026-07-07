export type RoutePattern = {
  path: string;
};

export function resolveRouteContribution<T extends RoutePattern>(
  pathname: string,
  routes: readonly T[],
): T | null {
  return routes.find((route) => matchRoutePath(route.path, pathname)) ?? null;
}

export function matchRoutePath(routePath: string, pathname: string) {
  if (routePath === pathname) return true;
  if (!routePath.includes(':')) return false;
  return routePatternRegex(routePath).test(pathname);
}

function routePatternRegex(routePath: string) {
  const segments = routePath.split('/').filter(Boolean);
  const pattern = segments
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : escapeRegex(segment)))
    .join('/');
  return new RegExp(`^/${pattern}$`);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
