'use client';

import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { CanvasBackgroundMode } from '@/shared/tokens/canvas-theme';
import {
  hydrateAssistantImages,
  hydrateCanvasImages,
  resetInterruptedGeneration,
} from '../domain/canvas-workspace-helpers';
import type { CanvasHistoryEntry } from './use-canvas-history';
import type { CanvasProject } from '../domain/canvas-project';
import type {
  CanvasAssistantSession,
  CanvasConnection,
  CanvasNodeData,
  ViewportTransform,
} from '../types';

type CanvasProjectSessionOptions = {
  hydrated: boolean;
  projectId: string;
  openProject: (projectId: string) => CanvasProject | null;
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
      >
    >,
  ) => void;
  onMissingProject: () => void;
  projectLoaded: boolean;
  historyPausedRef: MutableRefObject<boolean>;
  setProjectLoaded: Dispatch<SetStateAction<boolean>>;
  nodes: CanvasNodeData[];
  connections: CanvasConnection[];
  chatSessions: CanvasAssistantSession[];
  activeChatId: string | null;
  backgroundMode: CanvasBackgroundMode;
  showImageInfo: boolean;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setConnections: Dispatch<SetStateAction<CanvasConnection[]>>;
  setChatSessions: Dispatch<SetStateAction<CanvasAssistantSession[]>>;
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  setBackgroundMode: Dispatch<SetStateAction<CanvasBackgroundMode>>;
  setShowImageInfo: Dispatch<SetStateAction<boolean>>;
  setViewport: Dispatch<SetStateAction<ViewportTransform>>;
  resetHistory: (entry: CanvasHistoryEntry) => void;
};

export function useCanvasProjectSession({
  hydrated,
  projectId,
  openProject,
  updateProject,
  onMissingProject,
  projectLoaded,
  historyPausedRef,
  setProjectLoaded,
  nodes,
  connections,
  chatSessions,
  activeChatId,
  backgroundMode,
  showImageInfo,
  setNodes,
  setConnections,
  setChatSessions,
  setActiveChatId,
  setBackgroundMode,
  setShowImageInfo,
  setViewport,
  resetHistory,
}: CanvasProjectSessionOptions) {
  useEffect(() => {
    if (!hydrated) return;
    setProjectLoaded(false);
    const project = openProject(projectId);
    if (!project) {
      onMissingProject();
      return;
    }

    const restore = async () => {
      const restoredNodes = await hydrateCanvasImages(resetInterruptedGeneration(project.nodes));
      const restoredSessions = await hydrateAssistantImages(project.chatSessions || []);
      setNodes(restoredNodes);
      setConnections(project.connections);
      setChatSessions(restoredSessions);
      setActiveChatId(project.activeChatId || null);
      setBackgroundMode(project.backgroundMode);
      setShowImageInfo(project.showImageInfo || false);
      setViewport(project.viewport);
      resetHistory({
        nodes: restoredNodes,
        connections: project.connections,
        chatSessions: restoredSessions,
        activeChatId: project.activeChatId || null,
        backgroundMode: project.backgroundMode,
        showImageInfo: project.showImageInfo || false,
      });
      setProjectLoaded(true);
    };
    void restore();
  }, [
    hydrated,
    onMissingProject,
    openProject,
    projectId,
    resetHistory,
    setActiveChatId,
    setBackgroundMode,
    setChatSessions,
    setConnections,
    setNodes,
    setProjectLoaded,
    setShowImageInfo,
    setViewport,
  ]);

  useEffect(() => {
    if (!projectLoaded || historyPausedRef.current) return;
    updateProject(projectId, {
      nodes,
      connections,
      chatSessions,
      activeChatId,
      backgroundMode,
      showImageInfo,
    });
  }, [
    activeChatId,
    backgroundMode,
    chatSessions,
    connections,
    historyPausedRef,
    nodes,
    projectId,
    projectLoaded,
    showImageInfo,
    updateProject,
  ]);
}
