import { localForageStorage } from '@/shared/storage/localforage-storage';
import { collectResourceStorageKeys } from '@/shared/storage/resource-usage';
import { registerResourceUsageCollector } from '@/shared/storage/resource-usage-registry';
import type { CanvasProject } from '../domain/canvas-project';

const CANVAS_PROJECTS_KEY = 'infinite-canvas:canvas_projects';

type CanvasProjectsPayload = {
  version: 1;
  projects: CanvasProject[];
};

export type CanvasProjectRepository = {
  list: () => Promise<CanvasProject[]>;
  get: (projectId: string) => Promise<CanvasProject | null>;
  save: (project: CanvasProject) => Promise<void>;
  remove: (projectId: string) => Promise<void>;
  replace: (projects: CanvasProject[]) => Promise<void>;
  collectResourceKeys: () => Promise<Set<string>>;
  subscribe: (listener: (projects: CanvasProject[]) => void) => () => void;
};

const listeners = new Set<(projects: CanvasProject[]) => void>();

export const canvasProjectRepository: CanvasProjectRepository = {
  list: readProjects,
  get: async (projectId) =>
    (await readProjects()).find((project) => project.id === projectId) ?? null,
  save: async (project) => {
    const projects = await readProjects();
    const index = projects.findIndex((item) => item.id === project.id);
    const nextProjects =
      index >= 0
        ? projects.map((item) => (item.id === project.id ? project : item))
        : [project, ...projects];
    await writeProjects(nextProjects);
  },
  remove: async (projectId) => {
    await writeProjects((await readProjects()).filter((project) => project.id !== projectId));
  },
  replace: writeProjects,
  collectResourceKeys: async () => collectResourceStorageKeys(await readProjects()),
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

registerResourceUsageCollector({
  id: 'canvas-projects',
  collect: canvasProjectRepository.collectResourceKeys,
});

async function readProjects() {
  const value = await localForageStorage.getItem(CANVAS_PROJECTS_KEY);
  if (!value) return [];
  const payload = JSON.parse(value) as Partial<CanvasProjectsPayload>;
  return Array.isArray(payload.projects) ? payload.projects : [];
}

async function writeProjects(projects: CanvasProject[]) {
  const payload: CanvasProjectsPayload = { version: 1, projects };
  await localForageStorage.setItem(CANVAS_PROJECTS_KEY, JSON.stringify(payload));
  listeners.forEach((listener) => listener(projects));
}
