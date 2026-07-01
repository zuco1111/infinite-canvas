import type { FeatureManifest } from '../../app/feature-registry/feature-manifest';

export const syncFeatureManifest = {
  id: 'sync',
  title: 'WebDAV 同步',
  commands: [{ id: 'sync.webdav.run', title: '执行 WebDAV 同步', handler: () => undefined }],
  storageDomains: [{ id: 'sync-manifest', title: '同步清单' }],
  dependencies: ['settings', 'canvas', 'assets', 'generation'],
} satisfies FeatureManifest;
