import type { FeatureManifest } from '@/shared/features';

export const generationFeatureManifest = {
  id: 'generation',
  title: '生成工作台',
  routes: [
    {
      path: '/image',
      title: '生图工作台',
      loadComponent: () => import('./image/pages/image-workbench-page'),
    },
    {
      path: '/video',
      title: '视频创作台',
      loadComponent: () => import('./video/pages/video-workbench-page'),
    },
  ],
  commands: [
    { id: 'generation.image.create', title: '创建图片生成任务', handler: () => undefined },
    { id: 'generation.video.create', title: '创建视频生成任务', handler: () => undefined },
    { id: 'generation.audio.create', title: '创建音频生成任务', handler: () => undefined },
  ],
  storageDomains: [
    { id: 'image-workbench', title: '生图工作台记录' },
    { id: 'video-workbench', title: '视频创作台记录' },
  ],
  dependencies: ['settings'],
} satisfies FeatureManifest;
