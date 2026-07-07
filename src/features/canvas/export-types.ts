import type { CanvasProject } from './domain/canvas-project';

export type CanvasExportFile = {
  app: 'infinite-canvas';
  version: 3;
  exportedAt: string;
  projects: CanvasProjectExportItem[];
};

export type CanvasProjectExportItem = {
  project: CanvasProject;
  files: CanvasExportAsset[];
};

export type CanvasExportAsset = {
  storageKey: string;
  path: string;
  mimeType: string;
  bytes: number;
};
