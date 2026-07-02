import { lazy, Suspense } from 'react';

import UserLayout from '../(user)/layout';
import { featureRegistry } from '../feature-registry';
import { useClientPathname } from '../../shared/router/client-router-state';

const AssetsPage = lazy(() => import('../(user)/assets/page'));
const CanvasPage = lazy(() => import('../(user)/canvas/page'));
const CanvasClientPage = lazy(() => import('../(user)/canvas/[id]/canvas-client-page'));
const HomePage = lazy(() => import('../(user)/page'));
const ImagePage = lazy(() => import('../(user)/image/page'));
const PromptsPage = lazy(() => import('../(user)/prompts/page'));
const VideoPage = lazy(() => import('../(user)/video/page'));

export function AppRoutes() {
  const pathname = useClientPathname();

  return (
    <UserLayout>
      <Suspense fallback={<RouteFallback />}>
        {resolveRoute(pathname, enabledRoutePatterns())}
      </Suspense>
    </UserLayout>
  );
}

function resolveRoute(pathname: string, routePatterns: Set<string>) {
  if (pathname === '/' || pathname === '') return <HomePage />;
  if (routePatterns.has('/canvas') && pathname === '/canvas') return <CanvasPage />;
  if (routePatterns.has('/canvas/:id') && /^\/canvas\/[^/]+$/.test(pathname)) {
    return <CanvasClientPage />;
  }
  if (routePatterns.has('/image') && pathname === '/image') return <ImagePage />;
  if (routePatterns.has('/video') && pathname === '/video') return <VideoPage />;
  if (routePatterns.has('/prompts') && pathname === '/prompts') return <PromptsPage />;
  if (routePatterns.has('/assets') && pathname === '/assets') return <AssetsPage />;
  return <HomePage />;
}

function RouteFallback() {
  return (
    <main className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
      加载中...
    </main>
  );
}

function enabledRoutePatterns() {
  return new Set(featureRegistry.listRoutes().map((route) => route.path));
}
