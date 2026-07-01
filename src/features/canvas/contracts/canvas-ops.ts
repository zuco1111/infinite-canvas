import type { CanvasCommand } from './canvas-command';
import type { CanvasDocument } from './canvas-document';

export type CanvasOpsRequest =
  { type: 'canvas.snapshot.read' } | { type: 'canvas.command.apply'; command: CanvasCommand };

export type CanvasOpsResult =
  { type: 'canvas.snapshot'; document: CanvasDocument } | { type: 'canvas.command.applied' };

export type CanvasOpsPort = {
  request: (request: CanvasOpsRequest) => Promise<CanvasOpsResult>;
};
