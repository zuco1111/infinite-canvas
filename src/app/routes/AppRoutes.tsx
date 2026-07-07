import { lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

import UserLayout from '../shell/UserLayout';
import { featureRegistry } from '../feature-registry';
import type { RouteContribution } from '../feature-registry';
import { useClientPathname } from '../../shared/router/client-router-state';
import { resolveRouteContribution } from './route-resolution';

const HomePage = lazy(() => import('../shell/HomePage'));
const enabledFeatureRoutes = featureRegistry.listRoutes().map(createRenderableRoute);

type RenderableRoute = RouteContribution & {
  Component: LazyExoticComponent<ComponentType>;
};

export function AppRoutes() {
  const pathname = useClientPathname();
  const RouteComponent = resolveRoute(pathname, enabledFeatureRoutes) ?? HomePage;

  return (
    <UserLayout>
      <Suspense fallback={<RouteFallback />}>
        <RouteComponent />
      </Suspense>
    </UserLayout>
  );
}

function createRenderableRoute(route: RouteContribution): RenderableRoute {
  return {
    ...route,
    Component: lazy(route.loadComponent),
  };
}

function resolveRoute(pathname: string, routes: readonly RenderableRoute[]) {
  if (pathname === '/' || pathname === '') return HomePage;
  return resolveRouteContribution(pathname, routes)?.Component ?? null;
}

function RouteFallback() {
  return (
    <main className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
      加载中...
    </main>
  );
}
