import type {
  CanvasConnection,
  CanvasConnectionId,
  CanvasNode,
  CanvasNodeId,
  CanvasViewport,
} from './canvas-document';

export type CanvasSelection = {
  nodeIds: CanvasNodeId[];
  connectionIds: CanvasConnectionId[];
};

export type CanvasCommand =
  | { type: 'canvas.node.add'; node: CanvasNode }
  | { type: 'canvas.node.update'; nodeId: CanvasNodeId; patch: Partial<CanvasNode> }
  | { type: 'canvas.node.move'; nodeId: CanvasNodeId; x: number; y: number }
  | { type: 'canvas.node.remove'; nodeId: CanvasNodeId }
  | { type: 'canvas.connection.add'; connection: CanvasConnection }
  | { type: 'canvas.connection.remove'; connectionId: CanvasConnectionId }
  | { type: 'canvas.selection.set'; selection: CanvasSelection }
  | { type: 'canvas.viewport.set'; viewport: CanvasViewport };

export type CanvasHistory = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};
