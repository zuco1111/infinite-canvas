import { create } from 'zustand';

import { nanoid } from 'nanoid';
import { initialCanvasViewport, type CanvasProject } from '../domain/canvas-project';
import { canvasProjectRepository } from '../repositories/canvas-project-repository';

type CanvasStore = {
  hydrated: boolean;
  projects: CanvasProject[];
  hydrate: () => Promise<void>;
  createProject: (title?: string) => string;
  importProject: (project: Partial<CanvasProject>) => string;
  openProject: (id: string) => CanvasProject | null;
  renameProject: (id: string, title: string) => void;
  deleteProjects: (ids: string[]) => void;
  replaceProjects: (projects: CanvasProject[]) => void;
  updateProject: (
    id: string,
    patch: Partial<
      Pick<
        CanvasProject,
        | 'nodes'
        | 'connections'
        | 'chatSessions'
        | 'activeChatId'
        | 'backgroundMode'
        | 'showImageInfo'
        | 'viewport'
      >
    >,
  ) => void;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let hydrationPromise: Promise<void> | null = null;

export const useCanvasStore = create<CanvasStore>()((set, get) => ({
  hydrated: false,
  projects: [],
  hydrate: async () => {
    await hydrateCanvasProjects();
  },
  createProject: (title = '未命名画布') => {
    const now = new Date().toISOString();
    const id = nanoid();
    const project: CanvasProject = {
      id,
      title,
      createdAt: now,
      updatedAt: now,
      nodes: [],
      connections: [],
      chatSessions: [],
      activeChatId: null,
      backgroundMode: 'lines',
      showImageInfo: false,
      viewport: initialCanvasViewport,
    };
    setAndPersistProjects([project, ...get().projects]);
    return id;
  },
  importProject: (source) => {
    const now = new Date().toISOString();
    const project: CanvasProject = {
      id: nanoid(),
      title: source.title || '导入画布',
      createdAt: source.createdAt || now,
      updatedAt: now,
      nodes: source.nodes || [],
      connections: source.connections || [],
      chatSessions: source.chatSessions || [],
      activeChatId: source.activeChatId || null,
      backgroundMode: source.backgroundMode || 'lines',
      showImageInfo: source.showImageInfo || false,
      viewport: source.viewport || initialCanvasViewport,
    };
    setAndPersistProjects([project, ...get().projects]);
    return project.id;
  },
  openProject: (id) => {
    return get().projects.find((item) => item.id === id) || null;
  },
  renameProject: (id, title) =>
    setAndPersistProjects(
      get().projects.map((project) =>
        project.id === id
          ? {
              ...project,
              title: title.trim() || project.title,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    ),
  deleteProjects: (ids) =>
    setAndPersistProjects(get().projects.filter((project) => !ids.includes(project.id))),
  replaceProjects: (projects) => setAndPersistProjects(projects),
  updateProject: (id, patch) =>
    setAndPersistProjects(
      get().projects.map((project) =>
        project.id === id ? { ...project, ...patch, updatedAt: new Date().toISOString() } : project,
      ),
    ),
}));

export function hydrateCanvasProjects() {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = canvasProjectRepository.list().then((projects) => {
    useCanvasStore.setState({ projects, hydrated: true });
  });
  return hydrationPromise;
}

function setAndPersistProjects(projects: CanvasProject[]) {
  useCanvasStore.setState({ projects });
  scheduleProjectSave(projects);
}

function scheduleProjectSave(projects: CanvasProject[]) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void canvasProjectRepository.replace(projects);
  }, 400);
}

if (typeof window !== 'undefined') {
  canvasProjectRepository.subscribe((projects) => {
    useCanvasStore.setState({ projects, hydrated: true });
  });
  void hydrateCanvasProjects();
}
