import type { FeatureManifest } from '../../app/feature-registry/feature-manifest';

export const canvasFeatureManifest = {
  id: 'canvas',
  title: '我的画布',
  routes: [
    { path: '/canvas', title: '画布库' },
    { path: '/canvas/:id', title: '无限画布' },
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

export type { CanvasCommand, CanvasHistory, CanvasSelection } from './contracts/canvas-command';
export type {
  CanvasBackground,
  CanvasConnection,
  CanvasConnectionId,
  CanvasDocument,
  CanvasDocumentId,
  CanvasNode,
  CanvasNodeId,
  CanvasResourceId,
  CanvasResourceKind,
  CanvasResourceRef,
  CanvasViewport,
} from './contracts/canvas-document';
export type { CanvasOpsPort, CanvasOpsRequest, CanvasOpsResult } from './contracts/canvas-ops';
