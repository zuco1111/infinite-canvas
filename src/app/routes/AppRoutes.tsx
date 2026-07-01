import UserLayout from '../(user)/layout';
import AssetsPage from '../(user)/assets/page';
import CanvasPage from '../(user)/canvas/page';
import CanvasClientPage from '../(user)/canvas/[id]/canvas-client-page';
import HomePage from '../(user)/page';
import ImagePage from '../(user)/image/page';
import PromptsPage from '../(user)/prompts/page';
import VideoPage from '../(user)/video/page';
import { featureRegistry } from '../feature-registry';
import { useClientPathname } from '../../shared/router/client-router';

export function AppRoutes() {
  const pathname = useClientPathname();

  return <UserLayout>{resolveRoute(pathname, enabledRoutePatterns())}</UserLayout>;
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

function enabledRoutePatterns() {
  return new Set(featureRegistry.listRoutes().map((route) => route.path));
}
