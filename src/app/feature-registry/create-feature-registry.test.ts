import { describe, expect, it } from 'vitest';

import { createFeatureRegistry } from './create-feature-registry';
import type { FeatureManifest } from './feature-manifest';

describe('createFeatureRegistry', () => {
  it('returns only build-time enabled feature contributions', () => {
    const manifests: FeatureManifest[] = [
      {
        id: 'canvas',
        title: 'Canvas',
        routes: [{ path: '/canvas', title: 'Canvas' }],
      },
      {
        id: 'assets',
        title: 'Assets',
        routes: [{ path: '/assets', title: 'Assets' }],
      },
    ];

    const registry = createFeatureRegistry(manifests, ['canvas']);

    expect(registry.listAll()).toHaveLength(2);
    expect(registry.listEnabled()).toEqual([manifests[0]]);
    expect(registry.listRoutes()).toEqual([{ path: '/canvas', title: 'Canvas' }]);
  });

  it('rejects enabled features that were not registered', () => {
    expect(() => createFeatureRegistry([], ['missing'])).toThrow(
      'Enabled feature is not registered: missing',
    );
  });

  it('rejects disabled dependencies', () => {
    const manifests: FeatureManifest[] = [
      {
        id: 'assistant',
        title: 'Assistant',
        dependencies: ['canvas'],
      },
      {
        id: 'canvas',
        title: 'Canvas',
      },
    ];

    expect(() => createFeatureRegistry(manifests, ['assistant'])).toThrow(
      'Feature "assistant" requires disabled dependency "canvas"',
    );
  });
});
