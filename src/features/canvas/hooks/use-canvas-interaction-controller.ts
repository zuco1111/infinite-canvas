'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  Dispatch,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from 'react';
import { nanoid } from 'nanoid';

import type { AiConfig } from '@/features/settings';
import { getConnectionPathD } from '../utils/canvas-connection-path';
import type { PendingConnectionCreate } from '../components/workspace/connection-create-menu';
import {
  createCanvasNode,
  cssSelectorEscape,
  getConnectionTargetAnchor,
  getGenerationCount,
  isHiddenBatchChild,
  normalizeConnection,
} from '../domain/canvas-workspace-helpers';
import {
  CanvasNodeType,
  type CanvasConnection,
  type CanvasNodeData,
  type ConnectionHandle,
  type ContextMenuState,
  type Position,
  type SelectionBox,
} from '../types';

type MessageApi = {
  warning: (content: string) => unknown;
};

type ViewportState = {
  x: number;
  y: number;
  k: number;
};

type ConnectionDropTarget = {
  nodeId: string | null;
  isNearNode: boolean;
};

type UseCanvasInteractionControllerOptions = {
  effectiveConfig: AiConfig;
  message: MessageApi;
  nodesRef: MutableRefObject<CanvasNodeData[]>;
  nodeByIdRef: MutableRefObject<Map<string, CanvasNodeData>>;
  connectionsRef: MutableRefObject<CanvasConnection[]>;
  selectedNodeIdsRef: MutableRefObject<Set<string>>;
  viewportRef: MutableRefObject<ViewportState>;
  historyPausedRef: MutableRefObject<boolean>;
  screenToCanvas: (clientX: number, clientY: number) => Position;
  nodeImageSettingsOpen: boolean;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setConnections: Dispatch<SetStateAction<CanvasConnection[]>>;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setContextMenu: Dispatch<SetStateAction<ContextMenuState | null>>;
  setHoveredNodeId: Dispatch<SetStateAction<string | null>>;
  setDialogNodeId: Dispatch<SetStateAction<string | null>>;
};

const CONNECTION_HANDLE_HIT_RADIUS = 40;
const CONNECTION_NODE_HIT_PADDING = 32;

export function useCanvasInteractionController({
  effectiveConfig,
  message,
  nodesRef,
  nodeByIdRef,
  connectionsRef,
  selectedNodeIdsRef,
  viewportRef,
  historyPausedRef,
  screenToCanvas,
  nodeImageSettingsOpen,
  setNodes,
  setConnections,
  setSelectedNodeIds,
  setSelectedConnectionId,
  setContextMenu,
  setHoveredNodeId,
  setDialogNodeId,
}: UseCanvasInteractionControllerOptions) {
  const rafRef = useRef<number | null>(null);
  const toolbarHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodeDraggingRef = useRef(false);
  const canvasPanningRef = useRef(false);
  const dragRef = useRef<{
    isDraggingNode: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    initialSelectedNodes: { id: string; x: number; y: number }[];
    initialSelectedNodeById: Map<string, { x: number; y: number }>;
  }>({
    isDraggingNode: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialSelectedNodes: [],
    initialSelectedNodeById: new Map(),
  });
  const connectingParamsRef = useRef<ConnectionHandle | null>(null);
  const connectionTargetNodeIdRef = useRef<string | null>(null);
  const selectionBoxRef = useRef<SelectionBox | null>(null);
  const pendingConnectionCreateRef = useRef<PendingConnectionCreate | null>(null);

  const [connectingParams, setConnectingParams] = useState<ConnectionHandle | null>(null);
  const [connectionTargetNodeId, setConnectionTargetNodeId] = useState<string | null>(null);
  const [pendingConnectionCreate, setPendingConnectionCreate] =
    useState<PendingConnectionCreate | null>(null);
  const [mouseWorld, setMouseWorld] = useState<Position>({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [toolbarNodeId, setToolbarNodeId] = useState<string | null>(null);
  const [isNodeDragging, setIsNodeDragging] = useState(false);

  useLayoutEffect(() => {
    connectingParamsRef.current = connectingParams;
    connectionTargetNodeIdRef.current = connectionTargetNodeId;
    pendingConnectionCreateRef.current = pendingConnectionCreate;
    selectionBoxRef.current = selectionBox;
  }, [connectingParams, connectionTargetNodeId, pendingConnectionCreate, selectionBox]);

  useEffect(
    () => () => {
      if (toolbarHideTimerRef.current) clearTimeout(toolbarHideTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const setConnecting = useCallback((next: ConnectionHandle | null) => {
    connectingParamsRef.current = next;
    setConnectingParams(next);
    if (!next) {
      connectionTargetNodeIdRef.current = null;
      setConnectionTargetNodeId(null);
    }
  }, []);

  const keepNodeToolbar = useCallback(
    (nodeId: string) => {
      if (nodeDraggingRef.current || nodeImageSettingsOpen) return;
      if (toolbarHideTimerRef.current) {
        clearTimeout(toolbarHideTimerRef.current);
        toolbarHideTimerRef.current = null;
      }
      setToolbarNodeId(nodeId);
    },
    [nodeImageSettingsOpen],
  );

  const hideNodeToolbar = useCallback(() => {
    if (toolbarHideTimerRef.current) clearTimeout(toolbarHideTimerRef.current);
    toolbarHideTimerRef.current = setTimeout(() => {
      setToolbarNodeId(null);
      toolbarHideTimerRef.current = null;
    }, 120);
  }, []);

  const connectNodes = useCallback(
    (current: ConnectionHandle, targetNodeId: string) => {
      if (current.nodeId === targetNodeId) return;

      const connection = normalizeConnection(
        current.nodeId,
        targetNodeId,
        nodesRef.current,
        current.handleType,
      );
      if (!connection) {
        message.warning('配置节点之间不能连接');
        return;
      }
      const { fromNodeId, toNodeId } = connection;
      const exists = connectionsRef.current.some(
        (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId,
      );
      if (!exists) {
        setConnections((prev) => [...prev, { id: `conn-${Date.now()}`, fromNodeId, toNodeId }]);
      }
      setContextMenu(null);
    },
    [connectionsRef, message, nodesRef, setConnections, setContextMenu],
  );

  const createConnectedNode = useCallback(
    (
      type:
        | CanvasNodeType.Image
        | CanvasNodeType.Text
        | CanvasNodeType.Config
        | CanvasNodeType.Video
        | CanvasNodeType.Audio,
      pending: PendingConnectionCreate,
    ) => {
      const metadata =
        type === CanvasNodeType.Config
          ? {
              model: effectiveConfig.imageModel || effectiveConfig.model,
              size: effectiveConfig.size,
              count: getGenerationCount(effectiveConfig.canvasImageCount || effectiveConfig.count),
            }
          : undefined;
      const newNode = createCanvasNode(type, pending.position, metadata);
      const connection = normalizeConnection(
        pending.connection.nodeId,
        newNode.id,
        [...nodesRef.current, newNode],
        pending.connection.handleType,
      );
      if (!connection) {
        message.warning('配置节点之间不能连接');
        return;
      }
      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [...prev, { id: nanoid(), ...connection }]);
      setSelectedNodeIds(new Set([newNode.id]));
      setSelectedConnectionId(null);
      if (type !== CanvasNodeType.Text && type !== CanvasNodeType.Audio)
        setDialogNodeId(newNode.id);
      pendingConnectionCreateRef.current = null;
      setPendingConnectionCreate(null);
      setConnecting(null);
    },
    [
      effectiveConfig.canvasImageCount,
      effectiveConfig.count,
      effectiveConfig.imageModel,
      effectiveConfig.model,
      effectiveConfig.size,
      message,
      nodesRef,
      setConnecting,
      setConnections,
      setDialogNodeId,
      setNodes,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const cancelPendingConnectionCreate = useCallback(() => {
    pendingConnectionCreateRef.current = null;
    setPendingConnectionCreate(null);
    setConnecting(null);
  }, [setConnecting]);

  const getConnectionDropTarget = useCallback(
    (clientX: number, clientY: number, current: ConnectionHandle): ConnectionDropTarget => {
      const world = screenToCanvas(clientX, clientY);
      const scale = Math.max(viewportRef.current.k, 0.05);
      const padding = CONNECTION_NODE_HIT_PADDING / scale;
      const handleRadius = CONNECTION_HANDLE_HIT_RADIUS / scale;
      const currentNodes = nodesRef.current;
      const currentNodeById = nodeByIdRef.current;
      let isNearNode = false;
      let bestNodeId: string | null = null;
      let bestPriority = Number.POSITIVE_INFINITY;

      for (let index = currentNodes.length - 1; index >= 0; index -= 1) {
        const node = currentNodes[index];
        if (isHiddenBatchChild(node, currentNodeById)) continue;

        const anchor = getConnectionTargetAnchor(node, current);
        const dx = world.x - anchor.x;
        const dy = world.y - anchor.y;
        const hitsHandle = dx * dx + dy * dy <= handleRadius * handleRadius;
        const hitsInside =
          world.x >= node.position.x &&
          world.x <= node.position.x + node.width &&
          world.y >= node.position.y &&
          world.y <= node.position.y + node.height;
        const hitsExpanded =
          world.x >= node.position.x - padding &&
          world.x <= node.position.x + node.width + padding &&
          world.y >= node.position.y - padding &&
          world.y <= node.position.y + node.height + padding;

        if (!hitsHandle && !hitsInside && !hitsExpanded) continue;
        isNearNode = true;
        if (
          node.id === current.nodeId ||
          !normalizeConnection(current.nodeId, node.id, currentNodeById, current.handleType)
        )
          continue;

        const priority = hitsInside ? 0 : hitsHandle ? 1 : 2;
        if (priority < bestPriority) {
          bestNodeId = node.id;
          bestPriority = priority;
          if (priority === 0) break;
        }
      }

      return { nodeId: bestNodeId, isNearNode };
    },
    [nodeByIdRef, nodesRef, screenToCanvas, viewportRef],
  );

  const handleCanvasMouseDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setContextMenu(null);
      if (pendingConnectionCreateRef.current) cancelPendingConnectionCreate();
      if (event.button !== 0) return;

      if (!event.ctrlKey && !event.metaKey) {
        selectionBoxRef.current = null;
        setSelectionBox(null);
        setSelectedNodeIds(new Set());
        setSelectedConnectionId(null);
        return;
      }

      const world = screenToCanvas(event.clientX, event.clientY);
      const nextSelectionBox = {
        startWorldX: world.x,
        startWorldY: world.y,
        currentWorldX: world.x,
        currentWorldY: world.y,
        additive: event.shiftKey,
        initialSelectedNodeIds: event.shiftKey ? Array.from(selectedNodeIdsRef.current) : [],
      };
      selectionBoxRef.current = nextSelectionBox;
      setSelectionBox(nextSelectionBox);
      if (!event.shiftKey) {
        setSelectedNodeIds(new Set());
      }

      setSelectedConnectionId(null);
    },
    [
      cancelPendingConnectionCreate,
      screenToCanvas,
      selectedNodeIdsRef,
      setContextMenu,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const handleNodeMouseDown = useCallback(
    (event: ReactMouseEvent, nodeId: string) => {
      event.stopPropagation();
      setContextMenu(null);
      setHoveredNodeId(null);
      setToolbarNodeId(null);
      setSelectedConnectionId(null);

      const currentSelected = selectedNodeIdsRef.current;
      const currentNodes = nodesRef.current;
      const nextSelected = new Set(currentSelected);

      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        if (nextSelected.has(nodeId)) {
          nextSelected.delete(nodeId);
        } else {
          nextSelected.add(nodeId);
        }
      } else if (!nextSelected.has(nodeId)) {
        nextSelected.clear();
        nextSelected.add(nodeId);
      }

      setSelectedNodeIds(nextSelected);
      const dragIds = new Set(nextSelected);
      currentNodes.forEach((node) => {
        if (nextSelected.has(node.id))
          node.metadata?.batchChildIds?.forEach((childId) => dragIds.add(childId));
      });
      const initialSelectedNodes = currentNodes
        .filter((node) => dragIds.has(node.id))
        .map((node) => ({ id: node.id, x: node.position.x, y: node.position.y }));
      dragRef.current = {
        isDraggingNode: true,
        hasMoved: false,
        startX: event.clientX,
        startY: event.clientY,
        initialSelectedNodes,
        initialSelectedNodeById: new Map(
          initialSelectedNodes.map((node) => [node.id, { x: node.x, y: node.y }]),
        ),
      };
      historyPausedRef.current = true;
      nodeDraggingRef.current = true;
      setIsNodeDragging(true);
    },
    [
      historyPausedRef,
      nodesRef,
      selectedNodeIdsRef,
      setContextMenu,
      setHoveredNodeId,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const applyNodeDragPreview = useCallback(
    (initialPositionById: Map<string, Position>, dx: number, dy: number) => {
      const movedNodeById = new Map<string, CanvasNodeData>();
      initialPositionById.forEach((initial, id) => {
        const node = nodeByIdRef.current.get(id);
        if (!node) return;
        const position = { x: initial.x + dx, y: initial.y + dy };
        movedNodeById.set(id, { ...node, position });
        const nodeElement = document.querySelector<HTMLElement>(
          `[data-node-id="${cssSelectorEscape(id)}"]`,
        );
        if (nodeElement)
          nodeElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
      });

      if (!movedNodeById.size) return;
      connectionsRef.current.forEach((connection) => {
        if (!movedNodeById.has(connection.fromNodeId) && !movedNodeById.has(connection.toNodeId))
          return;
        const from =
          movedNodeById.get(connection.fromNodeId) ||
          nodeByIdRef.current.get(connection.fromNodeId);
        const to =
          movedNodeById.get(connection.toNodeId) || nodeByIdRef.current.get(connection.toNodeId);
        if (!from || !to) return;
        const pathD = getConnectionPathD(from, to);
        const hitPath = document.querySelector<SVGPathElement>(
          `[data-connection-id="${cssSelectorEscape(connection.id)}"]`,
        );
        hitPath?.setAttribute('d', pathD);
        const visualPath = hitPath?.nextElementSibling;
        if (visualPath instanceof SVGPathElement) visualPath.setAttribute('d', pathD);
      });
    },
    [connectionsRef, nodeByIdRef],
  );

  const finishNodeDrag = useCallback(
    (clientX?: number, clientY?: number) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!dragRef.current.isDraggingNode) return;

      const wasClick =
        !dragRef.current.hasMoved && dragRef.current.initialSelectedNodes.length === 1;
      const clickedNodeId = dragRef.current.initialSelectedNodes[0]?.id;
      const currentViewport = viewportRef.current;
      const dx = clientX == null ? 0 : (clientX - dragRef.current.startX) / currentViewport.k;
      const dy = clientY == null ? 0 : (clientY - dragRef.current.startY) / currentViewport.k;
      const initialPositionById = dragRef.current.initialSelectedNodeById;

      historyPausedRef.current = false;
      nodeDraggingRef.current = false;
      setIsNodeDragging(false);
      if (clientX == null || clientY == null) applyNodeDragPreview(initialPositionById, 0, 0);
      if (dragRef.current.hasMoved && clientX != null && clientY != null) {
        setNodes((prev) =>
          prev.map((node) => {
            const initial = initialPositionById.get(node.id);
            if (!initial) return node;
            return { ...node, position: { x: initial.x + dx, y: initial.y + dy } };
          }),
        );
      }

      dragRef.current.isDraggingNode = false;
      dragRef.current.hasMoved = false;
      dragRef.current.initialSelectedNodes = [];
      dragRef.current.initialSelectedNodeById = new Map();
      if (wasClick && clickedNodeId) {
        const clickedNode = nodesRef.current.find((node) => node.id === clickedNodeId);
        if (clickedNode?.type === CanvasNodeType.Text) {
          setDialogNodeId((current) => (current === clickedNodeId ? current : null));
        } else {
          setDialogNodeId(clickedNodeId);
        }
      }
    },
    [applyNodeDragPreview, historyPausedRef, nodesRef, setDialogNodeId, setNodes, viewportRef],
  );

  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      const currentViewport = viewportRef.current;

      if (dragRef.current.isDraggingNode) {
        const dx = (event.clientX - dragRef.current.startX) / currentViewport.k;
        const dy = (event.clientY - dragRef.current.startY) / currentViewport.k;
        const initialPositionById = dragRef.current.initialSelectedNodeById;
        if (
          Math.abs(event.clientX - dragRef.current.startX) > 3 ||
          Math.abs(event.clientY - dragRef.current.startY) > 3
        ) {
          dragRef.current.hasMoved = true;
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          applyNodeDragPreview(initialPositionById, dx, dy);
          rafRef.current = null;
        });
        return;
      }

      if (connectingParamsRef.current && !pendingConnectionCreateRef.current) {
        const dropTarget = getConnectionDropTarget(
          event.clientX,
          event.clientY,
          connectingParamsRef.current,
        );
        connectionTargetNodeIdRef.current = dropTarget.nodeId;
        setConnectionTargetNodeId(dropTarget.nodeId);
        setMouseWorld(screenToCanvas(event.clientX, event.clientY));
      }
    },
    [applyNodeDragPreview, getConnectionDropTarget, screenToCanvas, viewportRef],
  );

  const handleGlobalPointerMove = useCallback(
    (event: PointerEvent) => {
      const currentSelection = selectionBoxRef.current;
      if (!currentSelection) return;

      if (event.buttons === 0) {
        selectionBoxRef.current = null;
        setSelectionBox(null);
        return;
      }

      const world = screenToCanvas(event.clientX, event.clientY);
      const rectX = Math.min(currentSelection.startWorldX, world.x);
      const rectY = Math.min(currentSelection.startWorldY, world.y);
      const rectW = Math.abs(world.x - currentSelection.startWorldX);
      const rectH = Math.abs(world.y - currentSelection.startWorldY);
      const nextSelected = new Set<string>(
        currentSelection.additive ? currentSelection.initialSelectedNodeIds : [],
      );
      const currentNodeById = nodeByIdRef.current;

      nodesRef.current
        .filter((node) => !isHiddenBatchChild(node, currentNodeById))
        .forEach((node) => {
          const intersects =
            rectX < node.position.x + node.width &&
            rectX + rectW > node.position.x &&
            rectY < node.position.y + node.height &&
            rectY + rectH > node.position.y;

          if (intersects) nextSelected.add(node.id);
        });

      const nextSelectionBox = {
        ...currentSelection,
        currentWorldX: world.x,
        currentWorldY: world.y,
      };
      selectionBoxRef.current = nextSelectionBox;
      setSelectionBox(nextSelectionBox);
      setSelectedNodeIds(nextSelected);
    },
    [nodeByIdRef, nodesRef, screenToCanvas, setSelectedNodeIds],
  );

  const handleGlobalMouseUp = useCallback(
    (event: MouseEvent) => {
      finishNodeDrag(event.clientX, event.clientY);

      selectionBoxRef.current = null;
      setSelectionBox(null);

      if (pendingConnectionCreateRef.current) return;

      const currentConnection = connectingParamsRef.current;
      if (currentConnection) {
        const dropTarget = getConnectionDropTarget(event.clientX, event.clientY, currentConnection);
        if (dropTarget.nodeId) {
          connectNodes(currentConnection, dropTarget.nodeId);
          setConnecting(null);
        } else if (dropTarget.isNearNode) {
          setConnecting(null);
        } else {
          setMouseWorld(screenToCanvas(event.clientX, event.clientY));
          const nextPendingConnectionCreate = {
            connection: currentConnection,
            position: screenToCanvas(event.clientX, event.clientY),
          };
          pendingConnectionCreateRef.current = nextPendingConnectionCreate;
          setPendingConnectionCreate(nextPendingConnectionCreate);
        }
      }
    },
    [connectNodes, finishNodeDrag, getConnectionDropTarget, screenToCanvas, setConnecting],
  );

  useEffect(() => {
    const handlePointerUp = (event: PointerEvent) => finishNodeDrag(event.clientX, event.clientY);
    const cancelNodeDrag = () => finishNodeDrag();
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', cancelNodeDrag);
    window.addEventListener('blur', cancelNodeDrag);
    window.addEventListener('pointermove', handleGlobalPointerMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', cancelNodeDrag);
      window.removeEventListener('blur', cancelNodeDrag);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
    };
  }, [finishNodeDrag, handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalPointerMove]);

  const handleConnectStart = useCallback(
    (event: ReactMouseEvent, nodeId: string, handleType: 'source' | 'target') => {
      event.stopPropagation();
      setMouseWorld(screenToCanvas(event.clientX, event.clientY));
      setConnecting({ nodeId, handleType });
      connectionTargetNodeIdRef.current = null;
      setConnectionTargetNodeId(null);
      setSelectedConnectionId(null);
    },
    [screenToCanvas, setConnecting, setSelectedConnectionId],
  );

  const handleCanvasNodeHoverStart = useCallback(
    (nodeId: string) => {
      if (nodeDraggingRef.current || canvasPanningRef.current) return;
      setHoveredNodeId(nodeId);
      keepNodeToolbar(nodeId);
    },
    [keepNodeToolbar, setHoveredNodeId],
  );

  const handleCanvasNodeHoverEnd = useCallback(
    (nodeId: string) => {
      if (canvasPanningRef.current) return;
      setHoveredNodeId((current) => (current === nodeId ? null : current));
      hideNodeToolbar();
    },
    [hideNodeToolbar, setHoveredNodeId],
  );

  const handleCanvasPanStateChange = useCallback(
    (isPanning: boolean) => {
      canvasPanningRef.current = isPanning;
      if (!isPanning) return;
      if (toolbarHideTimerRef.current) {
        clearTimeout(toolbarHideTimerRef.current);
        toolbarHideTimerRef.current = null;
      }
      setHoveredNodeId(null);
      setToolbarNodeId(null);
    },
    [setHoveredNodeId],
  );

  const handleCanvasNodeContextMenu = useCallback(
    (event: ReactMouseEvent, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu({ type: 'node', x: event.clientX, y: event.clientY, nodeId: id });
    },
    [setContextMenu],
  );

  return {
    connectingParams,
    connectionTargetNodeId,
    pendingConnectionCreate,
    mouseWorld,
    selectionBox,
    toolbarNodeId,
    isNodeDragging,
    setConnecting,
    setSelectionBox,
    setPendingConnectionCreate,
    setToolbarNodeId,
    keepNodeToolbar,
    hideNodeToolbar,
    createConnectedNode,
    cancelPendingConnectionCreate,
    handleCanvasMouseDown,
    handleNodeMouseDown,
    handleConnectStart,
    handleCanvasNodeHoverStart,
    handleCanvasNodeHoverEnd,
    handleCanvasPanStateChange,
    handleCanvasNodeContextMenu,
  };
}
