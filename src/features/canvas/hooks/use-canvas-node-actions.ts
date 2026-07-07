'use client';

import { useCallback, useRef, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { AiConfig } from '@/features/settings';
import {
  NODE_STATUS_SUCCESS,
  applyNodeConfigPatch,
  createCanvasNode,
  getGenerationCount,
} from '../domain/canvas-workspace-helpers';
import {
  CanvasNodeType,
  type CanvasAssistantSession,
  type CanvasConnection,
  type CanvasNodeData,
  type ContextMenuState,
  type Position,
  type SelectionBox,
} from '../types';

type CanvasClipboard = {
  nodes: CanvasNodeData[];
  connections: CanvasConnection[];
};

type UseCanvasNodeActionsOptions = {
  effectiveConfig: AiConfig;
  projectId: string;
  chatSessions: CanvasAssistantSession[];
  nodesRef: MutableRefObject<CanvasNodeData[]>;
  connectionsRef: MutableRefObject<CanvasConnection[]>;
  selectedNodeIdsRef: MutableRefObject<Set<string>>;
  getCanvasCenter: () => Position;
  cleanupCanvasFiles: (extra?: unknown) => void;
  cancelPendingConnectionCreate: () => void;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setConnections: Dispatch<SetStateAction<CanvasConnection[]>>;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setContextMenu: Dispatch<SetStateAction<ContextMenuState | null>>;
  setSelectionBox: Dispatch<SetStateAction<SelectionBox | null>>;
  setHoveredNodeId: Dispatch<SetStateAction<string | null>>;
  setToolbarNodeId: Dispatch<SetStateAction<string | null>>;
  setDialogNodeId: Dispatch<SetStateAction<string | null>>;
  setEditingNodeId: Dispatch<SetStateAction<string | null>>;
  setInfoNodeId: Dispatch<SetStateAction<string | null>>;
  setCropNodeId: Dispatch<SetStateAction<string | null>>;
  setMaskEditNodeId: Dispatch<SetStateAction<string | null>>;
  setAngleNodeId: Dispatch<SetStateAction<string | null>>;
  setPreviewNodeId: Dispatch<SetStateAction<string | null>>;
  setRunningNodeId: Dispatch<SetStateAction<string | null>>;
  setClearConfirmOpen: Dispatch<SetStateAction<boolean>>;
  setEditRequestNonce: Dispatch<SetStateAction<number>>;
};

export function useCanvasNodeActions({
  effectiveConfig,
  projectId,
  chatSessions,
  nodesRef,
  connectionsRef,
  selectedNodeIdsRef,
  getCanvasCenter,
  cleanupCanvasFiles,
  cancelPendingConnectionCreate,
  setNodes,
  setConnections,
  setSelectedNodeIds,
  setSelectedConnectionId,
  setContextMenu,
  setSelectionBox,
  setHoveredNodeId,
  setToolbarNodeId,
  setDialogNodeId,
  setEditingNodeId,
  setInfoNodeId,
  setCropNodeId,
  setMaskEditNodeId,
  setAngleNodeId,
  setPreviewNodeId,
  setRunningNodeId,
  setClearConfirmOpen,
  setEditRequestNonce,
}: UseCanvasNodeActionsOptions) {
  const clipboardRef = useRef<CanvasClipboard | null>(null);
  const [collapsingBatchIds, setCollapsingBatchIds] = useState<Set<string>>(new Set());
  const [openingBatchIds, setOpeningBatchIds] = useState<Set<string>>(new Set());

  const createNode = useCallback(
    (type: CanvasNodeType, position?: Position) => {
      const targetPosition = position || getCanvasCenter();
      const configMetadata =
        type === CanvasNodeType.Config
          ? {
              model: effectiveConfig.imageModel || effectiveConfig.model,
              size: effectiveConfig.size,
              count: getGenerationCount(effectiveConfig.canvasImageCount || effectiveConfig.count),
            }
          : undefined;
      const newNode = createCanvasNode(type, targetPosition, configMetadata);

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeIds(new Set([newNode.id]));
      setSelectedConnectionId(null);
      if (type !== CanvasNodeType.Text && type !== CanvasNodeType.Audio)
        setDialogNodeId(newNode.id);
    },
    [
      effectiveConfig.canvasImageCount,
      effectiveConfig.count,
      effectiveConfig.imageModel,
      effectiveConfig.model,
      effectiveConfig.size,
      getCanvasCenter,
      setDialogNodeId,
      setNodes,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const deleteNodes = useCallback(
    (ids: Set<string>) => {
      if (!ids.size) return;
      const allIds = new Set(ids);
      nodesRef.current.forEach((node) => {
        if (ids.has(node.id))
          node.metadata?.batchChildIds?.forEach((childId) => allIds.add(childId));
      });
      setNodes((prev) => {
        const next = prev.filter((node) => !allIds.has(node.id));
        return next.map((node) => {
          const childIds = node.metadata?.batchChildIds?.filter((childId) => !allIds.has(childId));
          if (
            !node.metadata?.isBatchRoot ||
            childIds?.length === node.metadata.batchChildIds?.length
          )
            return node;
          const primaryImageId = childIds?.includes(node.metadata.primaryImageId || '')
            ? node.metadata.primaryImageId
            : childIds?.[0];
          const primaryNode = next.find((item) => item.id === primaryImageId);
          return {
            ...node,
            metadata: {
              ...node.metadata,
              batchChildIds: childIds,
              primaryImageId,
              content: primaryNode?.metadata?.content || node.metadata.content,
              naturalWidth: primaryNode?.metadata?.naturalWidth || node.metadata.naturalWidth,
              naturalHeight: primaryNode?.metadata?.naturalHeight || node.metadata.naturalHeight,
            },
          };
        });
      });
      setConnections((prev) =>
        prev.filter((conn) => !allIds.has(conn.fromNodeId) && !allIds.has(conn.toNodeId)),
      );
      setSelectedNodeIds(new Set());
      setSelectedConnectionId(null);
      setHoveredNodeId((current) => (current && allIds.has(current) ? null : current));
      setToolbarNodeId((current) => (current && allIds.has(current) ? null : current));
      setDialogNodeId((current) => (current && allIds.has(current) ? null : current));
      setEditingNodeId((current) => (current && allIds.has(current) ? null : current));
      setInfoNodeId((current) => (current && allIds.has(current) ? null : current));
      setCropNodeId((current) => (current && allIds.has(current) ? null : current));
      setMaskEditNodeId((current) => (current && allIds.has(current) ? null : current));
      setAngleNodeId((current) => (current && allIds.has(current) ? null : current));
      setPreviewNodeId((current) => (current && allIds.has(current) ? null : current));
      setRunningNodeId((current) => (current && allIds.has(current) ? null : current));
      setContextMenu((current) =>
        current?.type === 'node' && allIds.has(current.nodeId) ? null : current,
      );
      cleanupCanvasFiles({
        projectId,
        nodes: nodesRef.current.filter((node) => !allIds.has(node.id)),
        chatSessions,
      });
    },
    [
      chatSessions,
      cleanupCanvasFiles,
      nodesRef,
      projectId,
      setAngleNodeId,
      setConnections,
      setContextMenu,
      setCropNodeId,
      setDialogNodeId,
      setEditingNodeId,
      setHoveredNodeId,
      setInfoNodeId,
      setMaskEditNodeId,
      setNodes,
      setPreviewNodeId,
      setRunningNodeId,
      setSelectedConnectionId,
      setSelectedNodeIds,
      setToolbarNodeId,
    ],
  );

  const deleteConnection = useCallback(
    (connectionId: string) => {
      setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
      setSelectedConnectionId((current) => (current === connectionId ? null : current));
      setContextMenu((current) =>
        current?.type === 'connection' && current.connectionId === connectionId ? null : current,
      );
    },
    [setConnections, setContextMenu, setSelectedConnectionId],
  );

  const deselectCanvas = useCallback(() => {
    cancelPendingConnectionCreate();
    setSelectedNodeIds(new Set());
    setSelectedConnectionId(null);
    setContextMenu(null);
    setSelectionBox(null);
    setHoveredNodeId(null);
    setToolbarNodeId(null);
    setDialogNodeId(null);
    setEditingNodeId(null);
  }, [
    cancelPendingConnectionCreate,
    setContextMenu,
    setDialogNodeId,
    setEditingNodeId,
    setHoveredNodeId,
    setSelectedConnectionId,
    setSelectedNodeIds,
    setSelectionBox,
    setToolbarNodeId,
  ]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setInfoNodeId(null);
    setCropNodeId(null);
    setMaskEditNodeId(null);
    setAngleNodeId(null);
    setPreviewNodeId(null);
    setRunningNodeId(null);
    deselectCanvas();
    setClearConfirmOpen(false);
    cleanupCanvasFiles({ projectId, nodes: [], chatSessions: [] });
  }, [
    cleanupCanvasFiles,
    deselectCanvas,
    projectId,
    setAngleNodeId,
    setClearConfirmOpen,
    setConnections,
    setCropNodeId,
    setInfoNodeId,
    setMaskEditNodeId,
    setNodes,
    setPreviewNodeId,
    setRunningNodeId,
  ]);

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const source = nodesRef.current.find((node) => node.id === nodeId);
      if (!source) return;

      const id = `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const next: CanvasNodeData = {
        ...source,
        id,
        title: `${source.title} Copy`,
        position: { x: source.position.x + 36, y: source.position.y + 36 },
      };

      setNodes((prev) => [...prev, next]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
      setDialogNodeId(id);
    },
    [nodesRef, setDialogNodeId, setNodes, setSelectedConnectionId, setSelectedNodeIds],
  );

  const copySelectedNodes = useCallback(() => {
    const selectedIds = selectedNodeIdsRef.current;
    if (!selectedIds.size) return;

    const copiedNodes = nodesRef.current
      .filter((node) => selectedIds.has(node.id))
      .map((node) => ({
        ...node,
        position: { ...node.position },
        metadata: node.metadata ? { ...node.metadata } : undefined,
      }));

    if (!copiedNodes.length) return;

    clipboardRef.current = {
      nodes: copiedNodes,
      connections: connectionsRef.current
        .filter(
          (connection) =>
            selectedIds.has(connection.fromNodeId) && selectedIds.has(connection.toNodeId),
        )
        .map((connection) => ({ ...connection })),
    };
  }, [connectionsRef, nodesRef, selectedNodeIdsRef]);

  const pasteCopiedNodes = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (!clipboard?.nodes.length) return false;

    const center = getCanvasCenter();
    const bounds = clipboard.nodes.reduce(
      (acc, node) => ({
        left: Math.min(acc.left, node.position.x),
        top: Math.min(acc.top, node.position.y),
        right: Math.max(acc.right, node.position.x + node.width),
        bottom: Math.max(acc.bottom, node.position.y + node.height),
      }),
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    );
    const dx = center.x - (bounds.left + bounds.right) / 2;
    const dy = center.y - (bounds.top + bounds.bottom) / 2;
    const idMap = new Map<string, string>();
    const nextNodes = clipboard.nodes.map((node, index) => {
      const id = `${node.type}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      idMap.set(node.id, id);
      return {
        ...node,
        id,
        title: node.title.endsWith(' Copy') ? node.title : `${node.title} Copy`,
        position: {
          x: node.position.x + dx,
          y: node.position.y + dy,
        },
        metadata: node.metadata ? { ...node.metadata } : undefined,
      };
    });

    const nextConnections = clipboard.connections.flatMap((connection, index) => {
      const fromNodeId = idMap.get(connection.fromNodeId);
      const toNodeId = idMap.get(connection.toNodeId);
      if (!fromNodeId || !toNodeId) return [];
      return [
        {
          ...connection,
          id: `conn-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          fromNodeId,
          toNodeId,
        },
      ];
    });

    setNodes((prev) => [...prev, ...nextNodes]);
    setConnections((prev) => [...prev, ...nextConnections]);
    setSelectedNodeIds(new Set(nextNodes.map((node) => node.id)));
    setSelectedConnectionId(null);
    setContextMenu(null);
    setDialogNodeId(nextNodes[0]?.id || null);
    return true;
  }, [
    getCanvasCenter,
    setConnections,
    setContextMenu,
    setDialogNodeId,
    setNodes,
    setSelectedConnectionId,
    setSelectedNodeIds,
  ]);

  const createTextNodeFromClipboard = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const node = {
        ...createCanvasNode(CanvasNodeType.Text, getCanvasCenter(), {
          content: trimmed,
          status: NODE_STATUS_SUCCESS,
        }),
        title: trimmed.slice(0, 32) || '剪切板文本',
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([node.id]));
      setSelectedConnectionId(null);
      setContextMenu(null);
      setDialogNodeId(node.id);
      return true;
    },
    [
      getCanvasCenter,
      setContextMenu,
      setDialogNodeId,
      setNodes,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const handleNodeResize = useCallback(
    (nodeId: string, width: number, height: number, position?: Position) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, width, height, position: position || node.position }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const toggleNodeFreeResize = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== nodeId) return node;
          const freeResize = !node.metadata?.freeResize;
          if (freeResize || node.type !== CanvasNodeType.Image)
            return { ...node, metadata: { ...node.metadata, freeResize } };
          const ratio =
            (node.metadata?.naturalWidth || node.width) /
            (node.metadata?.naturalHeight || node.height || 1);
          const height = node.width / ratio;
          return {
            ...node,
            height,
            position: { x: node.position.x, y: node.position.y + node.height / 2 - height / 2 },
            metadata: { ...node.metadata, freeResize },
          };
        }),
      );
    },
    [setNodes],
  );

  const handleNodeContentChange = useCallback(
    (nodeId: string, content: string) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, metadata: { ...node.metadata, content } } : node,
        ),
      );
    },
    [setNodes],
  );

  const toggleBatchExpanded = useCallback(
    (nodeId: string) => {
      const isExpanded = Boolean(
        nodesRef.current.find((node) => node.id === nodeId)?.metadata?.imageBatchExpanded,
      );
      if (isExpanded) {
        setCollapsingBatchIds((prev) => new Set(prev).add(nodeId));
        window.setTimeout(() => {
          setCollapsingBatchIds((prev) => {
            const next = new Set(prev);
            next.delete(nodeId);
            return next;
          });
        }, 320);
      } else {
        setOpeningBatchIds((prev) => new Set(prev).add(nodeId));
        window.setTimeout(() => {
          setOpeningBatchIds((prev) => {
            const next = new Set(prev);
            next.delete(nodeId);
            return next;
          });
        }, 260);
      }
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            metadata: { ...node.metadata, imageBatchExpanded: !node.metadata?.imageBatchExpanded },
          };
        }),
      );
    },
    [nodesRef, setNodes],
  );

  const setBatchPrimary = useCallback(
    (child: CanvasNodeData) => {
      const rootId = child.metadata?.batchRootId;
      if (!rootId || !child.metadata?.content) return;
      setNodes((prev) =>
        prev.map((node) =>
          node.id === rootId
            ? {
                ...node,
                width: child.width,
                height: child.height,
                metadata: {
                  ...node.metadata,
                  content: child.metadata?.content,
                  primaryImageId: child.id,
                  naturalWidth: child.metadata?.naturalWidth,
                  naturalHeight: child.metadata?.naturalHeight,
                  freeResize: child.metadata?.freeResize,
                },
              }
            : node,
        ),
      );
    },
    [setNodes],
  );

  const openTextEditor = useCallback(
    (node: CanvasNodeData) => {
      if (node.type !== CanvasNodeType.Text) return;
      setSelectedNodeIds(new Set([node.id]));
      setSelectedConnectionId(null);
      setDialogNodeId(node.id);
      setEditingNodeId(node.id);
      setEditRequestNonce((value) => value + 1);
    },
    [
      setDialogNodeId,
      setEditRequestNonce,
      setEditingNodeId,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const handleNodePromptChange = useCallback(
    (nodeId: string, prompt: string) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, metadata: { ...node.metadata, prompt } } : node,
        ),
      );
    },
    [setNodes],
  );

  const handleConfigNodeChange = useCallback(
    (nodeId: string, patch: Partial<CanvasNodeData['metadata']>) => {
      setNodes((prev) =>
        prev.map((node) => (node.id === nodeId ? applyNodeConfigPatch(node, patch) : node)),
      );
    },
    [setNodes],
  );

  const handleFontSizeChange = useCallback(
    (nodeId: string, fontSize: number) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, metadata: { ...node.metadata, fontSize } } : node,
        ),
      );
    },
    [setNodes],
  );

  return {
    collapsingBatchIds,
    openingBatchIds,
    createNode,
    deleteNodes,
    deleteConnection,
    deselectCanvas,
    clearCanvas,
    duplicateNode,
    copySelectedNodes,
    pasteCopiedNodes,
    createTextNodeFromClipboard,
    handleNodeResize,
    toggleNodeFreeResize,
    handleNodeContentChange,
    toggleBatchExpanded,
    setBatchPrimary,
    openTextEditor,
    handleNodePromptChange,
    handleConfigNodeChange,
    handleFontSizeChange,
  };
}
