export { canvasFeatureManifest } from './manifest';
export { hydrateCanvasProjects } from './stores/use-canvas-store';
export {
  canvasProjectRepository,
  type CanvasProjectRepository,
} from './repositories/canvas-project-repository';
export type { CanvasProject } from './domain/canvas-project';
export {
  applyCanvasAgentOps,
  summarizeCanvasAgentOps,
  type CanvasAgentOp,
  type CanvasAgentSnapshot,
} from './utils/canvas-agent-ops';
export { NODE_DEFAULT_SIZE, getNodeSpec } from './constants';
export { CanvasNodeType } from './types';
export type {
  CanvasAssistantMessage,
  CanvasAssistantReference,
  CanvasAssistantSession,
  CanvasConnection as RuntimeCanvasConnection,
  CanvasGenerationMode,
  CanvasNodeData,
  CanvasNodeMetadata,
  ViewportTransform,
} from './types';
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
