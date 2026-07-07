'use client';

import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { PendingConnectionCreate } from '../components/workspace/connection-create-menu';
import type { CanvasNodeData, ConnectionHandle, ContextMenuState, SelectionBox } from '../types';

type UseCanvasKeyboardShortcutsOptions = {
  nodesRef: MutableRefObject<CanvasNodeData[]>;
  selectedNodeIdsRef: MutableRefObject<Set<string>>;
  selectedConnectionId: string | null;
  copySelectedNodes: () => void;
  pasteCopiedNodes: () => boolean;
  pasteSystemClipboard: () => Promise<void>;
  deleteNodes: (ids: Set<string>) => void;
  deleteConnection: (connectionId: string) => void;
  undoCanvas: () => void;
  redoCanvas: () => void;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setContextMenu: Dispatch<SetStateAction<ContextMenuState | null>>;
  setSelectionBox: Dispatch<SetStateAction<SelectionBox | null>>;
  setConnecting: (next: ConnectionHandle | null) => void;
  setHoveredNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setDialogNodeId: Dispatch<SetStateAction<string | null>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setInfoNodeId: Dispatch<SetStateAction<string | null>>;
  setCropNodeId: Dispatch<SetStateAction<string | null>>;
  setMaskEditNodeId: Dispatch<SetStateAction<string | null>>;
  setPendingConnectionCreate: Dispatch<SetStateAction<PendingConnectionCreate | null>>;
};

export function useCanvasKeyboardShortcuts({
  nodesRef,
  selectedNodeIdsRef,
  selectedConnectionId,
  copySelectedNodes,
  pasteCopiedNodes,
  pasteSystemClipboard,
  deleteNodes,
  deleteConnection,
  undoCanvas,
  redoCanvas,
  setSelectedNodeIds,
  setSelectedConnectionId,
  setContextMenu,
  setSelectionBox,
  setConnecting,
  setHoveredNodeId,
  setToolbarNodeId,
  setDialogNodeId,
  setEditingNodeId,
  setInfoNodeId,
  setCropNodeId,
  setMaskEditNodeId,
  setPendingConnectionCreate,
}: UseCanvasKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        target?.closest("[contenteditable='true'],[data-canvas-no-zoom]")
      )
        return;

      const key = event.key.toLowerCase();
      const isModifierShortcut = event.metaKey || event.ctrlKey;

      if (isModifierShortcut && !event.altKey && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoCanvas();
        else undoCanvas();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'y') {
        event.preventDefault();
        redoCanvas();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'a') {
        event.preventDefault();
        setSelectedNodeIds(new Set(nodesRef.current.map((node) => node.id)));
        setSelectedConnectionId(null);
        setContextMenu(null);
        setSelectionBox(null);
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'c') {
        event.preventDefault();
        copySelectedNodes();
        return;
      }

      if (isModifierShortcut && !event.altKey && key === 'v') {
        event.preventDefault();
        if (!pasteCopiedNodes()) void pasteSystemClipboard();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeIdsRef.current.size) {
          deleteNodes(new Set(selectedNodeIdsRef.current));
        } else if (selectedConnectionId) {
          deleteConnection(selectedConnectionId);
        }
      }

      if (event.key === 'Escape') {
        setSelectedNodeIds(new Set());
        setSelectedConnectionId(null);
        setContextMenu(null);
        setSelectionBox(null);
        setConnecting(null);
        setHoveredNodeId(null);
        setToolbarNodeId(null);
        setDialogNodeId(null);
        setEditingNodeId(null);
        setInfoNodeId(null);
        setCropNodeId(null);
        setMaskEditNodeId(null);
        setPendingConnectionCreate(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    copySelectedNodes,
    deleteConnection,
    deleteNodes,
    nodesRef,
    pasteCopiedNodes,
    pasteSystemClipboard,
    redoCanvas,
    selectedConnectionId,
    selectedNodeIdsRef,
    setConnecting,
    setContextMenu,
    setCropNodeId,
    setDialogNodeId,
    setEditingNodeId,
    setHoveredNodeId,
    setInfoNodeId,
    setMaskEditNodeId,
    setPendingConnectionCreate,
    setSelectedConnectionId,
    setSelectedNodeIds,
    setSelectionBox,
    setToolbarNodeId,
    undoCanvas,
  ]);
}
