import { describe, expect, it } from 'vitest';

import { createFeatureRegistry } from '../feature-registry';
import type { FeatureManifest } from '../feature-registry';
import { matchRoutePath, resolveRouteContribution } from './route-resolution';

const EmptyRoute = () => null;
const loadEmptyRoute = () => Promise.resolve({ default: EmptyRoute });

describe('route resolution', () => {
  it('matches exact and dynamic feature route paths', () => {
    expect(matchRoutePath('/canvas', '/canvas')).toBe(true);
    expect(matchRoutePath('/canvas/:id', '/canvas/project-1')).toBe(true);
    expect(matchRoutePath('/canvas/:id', '/canvas/project-1/extra')).toBe(false);
  });

  it('does not resolve routes from disabled features', () => {
    const manifests: FeatureManifest[] = [
      {
        id: 'canvas',
        title: 'Canvas',
        routes: [{ path: '/canvas', title: 'Canvas', loadComponent: loadEmptyRoute }],
      },
      {
        id: 'assets',
        title: 'Assets',
        routes: [{ path: '/assets', title: 'Assets', loadComponent: loadEmptyRoute }],
      },
    ];
    const registry = createFeatureRegistry(manifests, ['canvas']);

    expect(resolveRouteContribution('/canvas', registry.listRoutes())?.title).toBe('Canvas');
    expect(resolveRouteContribution('/assets', registry.listRoutes())).toBeNull();
  });
});
