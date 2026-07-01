import type { FeatureManifest } from '../../app/feature-registry/feature-manifest';

export const assetsFeatureManifest = {
  id: 'assets',
  title: '我的素材',
  routes: [{ path: '/assets', title: '我的素材' }],
  storageDomains: [{ id: 'assets', title: '素材库' }],
  dependencies: ['settings'],
} satisfies FeatureManifest;
