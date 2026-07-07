import type { FeatureManifest } from '@/shared/features';

export const promptsFeatureManifest = {
  id: 'prompts',
  title: '提示词库',
  routes: [
    {
      path: '/prompts',
      title: '提示词库',
      loadComponent: () => import('./pages/prompts-page'),
    },
  ],
  storageDomains: [{ id: 'prompts', title: '本地提示词库' }],
} satisfies FeatureManifest;
