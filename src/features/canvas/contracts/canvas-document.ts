export type CanvasDocumentId = string;
export type CanvasNodeId = string;
export type CanvasConnectionId = string;
export type CanvasResourceId = string;

export type CanvasResourceKind = 'image' | 'video' | 'audio' | 'prompt' | 'external';

export type CanvasResourceRef = {
  id: CanvasResourceId;
  kind: CanvasResourceKind;
  storageKey?: string;
  sourceUrl?: string;
};

export type CanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type CanvasBackground = {
  mode: 'grid' | 'plain';
};

export type CanvasNode<TData = unknown> = {
  id: CanvasNodeId;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: TData;
  resourceRefs?: CanvasResourceRef[];
};

export type CanvasConnection = {
  id: CanvasConnectionId;
  fromNodeId: CanvasNodeId;
  toNodeId: CanvasNodeId;
};

export type CanvasDocument = {
  id: CanvasDocumentId;
  title: string;
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  viewport: CanvasViewport;
  background: CanvasBackground;
  updatedAt: string;
};
