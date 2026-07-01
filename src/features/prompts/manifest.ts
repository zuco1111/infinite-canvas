import type { FeatureManifest } from '../../app/feature-registry/feature-manifest';

export const promptsFeatureManifest = {
  id: 'prompts',
  title: '提示词库',
  routes: [{ path: '/prompts', title: '提示词库' }],
  storageDomains: [{ id: 'prompts', title: '远程提示词缓存' }],
} satisfies FeatureManifest;
