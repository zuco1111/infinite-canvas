import type { FeatureManifest } from '@/shared/features';

export const assetsFeatureManifest = {
  id: 'assets',
  title: '我的素材',
  routes: [
    {
      path: '/assets',
      title: '我的素材',
      loadComponent: () => import('./pages/assets-page'),
    },
  ],
  storageDomains: [{ id: 'assets', title: '素材库' }],
  dependencies: ['settings'],
} satisfies FeatureManifest;
