import type { FeatureManifest } from '@/shared/features';

export const canvasFeatureManifest = {
  id: 'canvas',
  title: '我的画布',
  routes: [
    {
      path: '/canvas',
      title: '画布库',
      loadComponent: () => import('./pages/canvas-library-page'),
    },
    {
      path: '/canvas/:id',
      title: '无限画布',
      loadComponent: () => import('./pages/canvas-client-page'),
    },
  ],
  nodeTypes: [
    { id: 'text', title: '文本节点' },
    { id: 'image', title: '图片节点' },
    { id: 'video', title: '视频节点' },
    { id: 'audio', title: '音频节点' },
    { id: 'config', title: '配置节点' },
  ],
  storageDomains: [{ id: 'canvas', title: '画布项目' }],
  dependencies: ['settings'],
} satisfies FeatureManifest;
