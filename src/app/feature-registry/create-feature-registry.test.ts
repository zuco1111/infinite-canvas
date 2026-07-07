import { describe, expect, it } from 'vitest';

import { availableFeatureManifests, createFeatureRegistry } from '.';
import type { FeatureManifest } from '@/shared/features';

const EmptyRoute = () => null;
const loadEmptyRoute = () => Promise.resolve({ default: EmptyRoute });

describe('createFeatureRegistry', () => {
  it('returns only build-time enabled feature contributions', () => {
    const canvasCommand = { id: 'canvas.create', title: 'Create canvas', handler: () => undefined };
    const assetCommand = { id: 'assets.import', title: 'Import asset', handler: () => undefined };
    const manifests: FeatureManifest[] = [
      {
        id: 'canvas',
        title: 'Canvas',
        routes: [{ path: '/canvas', title: 'Canvas', loadComponent: loadEmptyRoute }],
        toolbarItems: [{ id: 'canvas.text', title: 'Text', commandId: 'canvas.create' }],
        nodeTypes: [{ id: 'text', title: 'Text node' }],
        commands: [canvasCommand],
        storageDomains: [{ id: 'canvas', title: 'Canvas projects' }],
        settingsPanels: [{ id: 'canvas-defaults', title: 'Canvas defaults' }],
        backgroundTasks: [{ id: 'canvas.autosave', title: 'Canvas autosave' }],
      },
      {
        id: 'assets',
        title: 'Assets',
        routes: [{ path: '/assets', title: 'Assets', loadComponent: loadEmptyRoute }],
        toolbarItems: [{ id: 'assets.import', title: 'Import', commandId: 'assets.import' }],
        nodeTypes: [{ id: 'asset', title: 'Asset node' }],
        commands: [assetCommand],
        storageDomains: [{ id: 'assets', title: 'Assets' }],
        settingsPanels: [{ id: 'asset-defaults', title: 'Asset defaults' }],
        backgroundTasks: [{ id: 'assets.cleanup', title: 'Assets cleanup' }],
      },
    ];

    const registry = createFeatureRegistry(manifests, ['canvas']);

    expect(registry.listAll()).toHaveLength(2);
    expect(registry.listEnabled()).toEqual([manifests[0]]);
    expect(registry.listRoutes()).toEqual([
      { path: '/canvas', title: 'Canvas', loadComponent: loadEmptyRoute },
    ]);
    expect(registry.listToolbarItems()).toEqual([
      { id: 'canvas.text', title: 'Text', commandId: 'canvas.create' },
    ]);
    expect(registry.listNodeTypes()).toEqual([{ id: 'text', title: 'Text node' }]);
    expect(registry.listCommands()).toEqual([canvasCommand]);
    expect(registry.listStorageDomains()).toEqual([{ id: 'canvas', title: 'Canvas projects' }]);
    expect(registry.listSettingsPanels()).toEqual([
      { id: 'canvas-defaults', title: 'Canvas defaults' },
    ]);
    expect(registry.listBackgroundTasks()).toEqual([
      { id: 'canvas.autosave', title: 'Canvas autosave' },
    ]);
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

  it('applies the real feature contribution matrix from enabled manifests only', () => {
    const registry = createFeatureRegistry(availableFeatureManifests, [
      'settings',
      'canvas',
      'generation',
    ]);

    expect(registry.listEnabled().map((manifest) => manifest.id)).toEqual([
      'settings',
      'canvas',
      'generation',
    ]);
    expect(registry.listRoutes().map((route) => route.path)).toEqual([
      '/canvas',
      '/canvas/:id',
      '/image',
      '/video',
    ]);
    expect(registry.listNodeTypes().map((nodeType) => nodeType.id)).toEqual([
      'text',
      'image',
      'video',
      'audio',
      'config',
    ]);
    expect(registry.listCommands().map((command) => command.id)).toEqual([
      'generation.image.create',
      'generation.video.create',
      'generation.audio.create',
    ]);
    expect(registry.listStorageDomains().map((domain) => domain.id)).toEqual([
      'settings',
      'canvas',
      'image-workbench',
      'video-workbench',
    ]);
    expect(registry.listSettingsPanels().map((panel) => panel.id)).toEqual([
      'model-channels',
      'generation-preferences',
      'webdav-sync',
    ]);
    expect(registry.listBackgroundTasks()).toEqual([]);
  });

  it('rejects invalid real feature disable combinations', () => {
    expect(() =>
      createFeatureRegistry(availableFeatureManifests, ['canvas', 'generation']),
    ).toThrow('Feature "canvas" requires disabled dependency "settings"');
    expect(() =>
      createFeatureRegistry(availableFeatureManifests, ['settings', 'assistant']),
    ).toThrow('Feature "assistant" requires disabled dependency "canvas"');
    expect(() =>
      createFeatureRegistry(availableFeatureManifests, ['settings', 'canvas', 'local-agent']),
    ).toThrow('Feature "local-agent" requires disabled dependency "assistant"');
  });
});
