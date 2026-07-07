'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import {
  useAppTheme,
  useEffectiveConfig,
  useIsAiConfigReady,
  useOpenConfigDialog,
} from '@/features/settings';
import { canvasThemes, type CanvasBackgroundMode } from '@/shared/tokens/canvas-theme';
import { useCleanupAssetResources } from '@/features/assets';
import { App } from 'antd';
import { ActiveConnectionPath, ConnectionPath } from '../components/canvas-connections';
import { CanvasConfigComposer } from '../components/canvas-config-composer';
import { CanvasConfigNodePanel } from '../components/canvas-config-node-panel';
import type { CanvasAgentMode } from '@/features/assistant';
import { CanvasNodeContextMenu } from '../components/canvas-context-menu';
import {
  buildNodeGenerationInputs,
  type NodeGenerationInput,
} from '../components/canvas-node-generation';
import {
  NODE_STATUS_SUCCESS,
  createCanvasNode,
  getInputSummary,
  isHiddenBatchChild,
  isHiddenBatchConnectionEndpoint,
} from '../domain/canvas-workspace-helpers';
import { CanvasNodeHoverToolbar } from '../components/canvas-node-hover-toolbar';
import { InfiniteCanvas } from '../components/infinite-canvas';
import { Minimap } from '../components/canvas-mini-map';
import { CanvasNode } from '../components/canvas-node';
import {
  CanvasNodePromptPanel,
  type CanvasNodeGenerationMode,
} from '../components/canvas-node-prompt-panel';
import { CanvasToolbar } from '../components/canvas-toolbar';
import { CanvasZoomControls } from '../components/canvas-zoom-controls';
import {
  CANVAS_AGENT_PANEL_MOTION_MS,
  CanvasAgentDock,
} from '../components/workspace/canvas-agent-dock';
import { CanvasOverlays } from '../components/workspace/canvas-overlays';
import { CanvasRefreshShell } from '../components/workspace/canvas-refresh-shell';
import { CanvasTopBar } from '../components/workspace/canvas-top-bar';
import { ConnectionCreateMenu } from '../components/workspace/connection-create-menu';
import { useCanvasHistory } from '../hooks/use-canvas-history';
import { useCanvasImageNodeActions } from '../hooks/use-canvas-image-node-actions';
import { useCanvasInteractionController } from '../hooks/use-canvas-interaction-controller';
import { useCanvasKeyboardShortcuts } from '../hooks/use-canvas-keyboard-shortcuts';
import { useCanvasMediaNodes } from '../hooks/use-canvas-media-nodes';
import { useCanvasNodeActions } from '../hooks/use-canvas-node-actions';
import { useCanvasProjectSession } from '../hooks/use-canvas-project-session';
import { useCanvasViewport } from '../hooks/use-canvas-viewport';
import {
  useLocalAgentActivity,
  useLocalAgentConnected,
  useLocalAgentEnabled,
} from '@/features/local-agent';
import { useCanvasStore } from '../stores/use-canvas-store';
import { useCanvasAgentBridge } from '../bridges/use-canvas-agent-bridge';
import { useCanvasAssetBridge } from '../bridges/use-canvas-asset-bridge';
import { useCanvasGenerationActions } from '../bridges/use-canvas-generation-actions';
import { useCanvasGenerationRequests } from '../bridges/use-canvas-generation-requests';
import {
  buildCanvasResourceReferences,
  buildNodeMentionReferences,
} from '../utils/canvas-resource-references';
import {
  CanvasNodeType,
  type CanvasAssistantSession,
  type CanvasConnection,
  type CanvasNodeData,
  type ContextMenuState,
} from '../types';

const EMPTY_MENTION_REFERENCES: ReturnType<typeof buildNodeMentionReferences> = [];

export default function CanvasPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <CanvasRefreshShell />;

  return <InfiniteCanvasPage />;
}

function InfiniteCanvasPage() {
  const { message, modal } = App.useApp();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id;
  const localAgentConnected = useLocalAgentConnected();
  const localAgentActivity = useLocalAgentActivity();
  const localAgentEnabled = useLocalAgentEnabled();

  const effectiveConfig = useEffectiveConfig();
  const isAiConfigReady = useIsAiConfigReady();
  const openConfigDialog = useOpenConfigDialog();
  const cleanupAssetImages = useCleanupAssetResources();
  const hydrated = useCanvasStore((state) => state.hydrated);
  const createProject = useCanvasStore((state) => state.createProject);
  const openProject = useCanvasStore((state) => state.openProject);
  const updateProject = useCanvasStore((state) => state.updateProject);
  const renameProject = useCanvasStore((state) => state.renameProject);
  const deleteProjects = useCanvasStore((state) => state.deleteProjects);
  const currentProject = useCanvasStore((state) =>
    state.projects.find((project) => project.id === projectId),
  );
  const theme = canvasThemes[useAppTheme()];
  const [nodes, setNodes] = useState<CanvasNodeData[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [chatSessions, setChatSessions] = useState<CanvasAssistantSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [runningNodeId, setRunningNodeId] = useState<string | null>(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState<CanvasBackgroundMode>('lines');
  const [showImageInfo, setShowImageInfo] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [nodeImageSettingsOpen, setNodeImageSettingsOpen] = useState(false);
  const [dialogNodeId, setDialogNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editRequestNonce, setEditRequestNonce] = useState(0);
  const [infoNodeId, setInfoNodeId] = useState<string | null>(null);
  const [cropNodeId, setCropNodeId] = useState<string | null>(null);
  const [maskEditNodeId, setMaskEditNodeId] = useState<string | null>(null);
  const [splitNodeId, setSplitNodeId] = useState<string | null>(null);
  const [upscaleNodeId, setUpscaleNodeId] = useState<string | null>(null);
  const [superResolveNodeId, setSuperResolveNodeId] = useState<string | null>(null);
  const [angleNodeId, setAngleNodeId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const [assistantMounted, setAssistantMounted] = useState(false);
  const [assistantClosing, setAssistantClosing] = useState(false);
  const [agentMode, setAgentMode] = useState<CanvasAgentMode>('online');
  const codexAutoConnect = ['new', 'recent', 'choose'].includes(searchParams.get('mode') || '');
  const codexCompactAgent = codexAutoConnect && searchParams.has('agentUrl');
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const nodesRef = useRef(nodes);
  const nodeByIdRef = useRef<Map<string, CanvasNodeData>>(new Map());
  const connectionsRef = useRef(connections);
  const selectedNodeIdsRef = useRef(selectedNodeIds);
  const agentModeRef = useRef(agentMode);
  const generateNodeRef = useRef<
    ((nodeId: string, mode: CanvasNodeGenerationMode, prompt: string) => Promise<void>) | null
  >(null);
  const agentCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { startGenerationRequest, finishGenerationRequest, confirmStopGeneration } =
    useCanvasGenerationRequests({
      modal,
      setNodes,
      setRunningNodeId,
    });
  const {
    containerRef,
    viewport,
    viewportRef,
    setViewport,
    size,
    screenToCanvas,
    getCanvasCenter,
    resetViewport,
    setZoomScale,
    handleViewportChange,
  } = useCanvasViewport({
    projectId,
    projectLoaded,
    updateProject,
    setContextMenu,
  });
  const {
    imageInputRef,
    createImageFileNode,
    handleUploadRequest,
    handleImageInputChange,
    handleDrop,
  } = useCanvasMediaNodes({
    containerRef,
    size,
    screenToCanvas,
    setNodes,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setDialogNodeId,
  });
  const {
    historyRef,
    lastHistoryRef,
    historyPausedRef,
    historyState,
    resetHistory,
    undoCanvas,
    redoCanvas,
  } = useCanvasHistory({
    projectLoaded,
    nodes,
    connections,
    chatSessions,
    activeChatId,
    backgroundMode,
    showImageInfo,
    nodesRef,
    connectionsRef,
    setNodes,
    setConnections,
    setChatSessions,
    setActiveChatId,
    setBackgroundMode,
    setShowImageInfo,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setContextMenu,
  });
  const handleMissingProject = useCallback(() => {
    router.replace('/canvas');
  }, [router]);
  useCanvasProjectSession({
    hydrated,
    projectId,
    openProject,
    updateProject,
    onMissingProject: handleMissingProject,
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
  });
  const { handleGenerateNode, handleRetryNode, generateImageFromTextNode } =
    useCanvasGenerationActions({
      effectiveConfig,
      isAiConfigReady,
      openConfigDialog,
      message,
      nodesRef,
      connectionsRef,
      setNodes,
      setConnections,
      setSelectedNodeIds,
      setSelectedConnectionId,
      setDialogNodeId,
      setRunningNodeId,
      startGenerationRequest,
      finishGenerationRequest,
    });
  const {
    downloadNodeImage,
    createImageReversePromptNodes,
    cropImageNode,
    splitImageNode,
    maskEditImageNode,
    upscaleImageNode,
    generateAngleNode,
  } = useCanvasImageNodeActions({
    effectiveConfig,
    isAiConfigReady,
    openConfigDialog,
    message,
    setNodes,
    setConnections,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setDialogNodeId,
    setCropNodeId,
    setMaskEditNodeId,
    setSplitNodeId,
    setUpscaleNodeId,
    setAngleNodeId,
    setRunningNodeId,
    startGenerationRequest,
    finishGenerationRequest,
  });
  useEffect(() => {
    generateNodeRef.current = handleGenerateNode;
  }, [handleGenerateNode]);
  const { agentSnapshot, canUndoAgentOps, applyAgentOps, undoAgentOps } = useCanvasAgentBridge({
    projectId,
    title: currentProject?.title || '未命名画布',
    nodes,
    connections,
    selectedNodeIds,
    viewport,
    nodesRef,
    connectionsRef,
    selectedNodeIdsRef,
    viewportRef,
    generateNodeRef,
    setNodes,
    setConnections,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setViewport,
    setContextMenu,
  });
  const createCanvasTextNode = useCallback(
    (text: string) => ({
      ...createCanvasNode(CanvasNodeType.Text, getCanvasCenter(), {
        content: text,
        status: NODE_STATUS_SUCCESS,
      }),
      title: text.slice(0, 32) || 'Assistant Text',
    }),
    [getCanvasCenter],
  );
  const openAgent = useCallback((mode: CanvasAgentMode = agentModeRef.current) => {
    if (agentCloseTimerRef.current) {
      clearTimeout(agentCloseTimerRef.current);
      agentCloseTimerRef.current = null;
    }
    setAgentMode(mode);
    setAssistantMounted(true);
    setAssistantClosing(false);
    setAssistantCollapsed(false);
  }, []);

  useEffect(() => {
    agentModeRef.current = agentMode;
  }, [agentMode]);

  const cleanupCanvasFiles = useCallback(
    (extra?: unknown) => {
      cleanupAssetImages({
        extra,
        history: historyRef.current,
        lastHistory: lastHistoryRef.current,
      });
    },
    [cleanupAssetImages, historyRef, lastHistoryRef],
  );

  useEffect(() => {
    if (!projectLoaded || !['new', 'recent', 'choose'].includes(searchParams.get('mode') || ''))
      return;
    if (searchParams.has('agentUrl')) {
      setAgentMode('local');
      return;
    }
    openAgent('local');
  }, [openAgent, projectLoaded, searchParams]);

  useEffect(
    () => () => {
      if (agentCloseTimerRef.current) clearTimeout(agentCloseTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!dialogNodeId) setNodeImageSettingsOpen(false);
  }, [dialogNodeId]);

  const {
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
  } = useCanvasInteractionController({
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
  });

  useLayoutEffect(() => {
    nodesRef.current = nodes;
    nodeByIdRef.current = new Map(nodes.map((node) => [node.id, node]));
    connectionsRef.current = connections;
    selectedNodeIdsRef.current = selectedNodeIds;
  }, [connections, nodes, selectedNodeIds]);

  const {
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
  } = useCanvasNodeActions({
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
  });

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const visibleNodes = useMemo(() => {
    const padding = 280;
    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width || size.width;
    const height = rect?.height || size.height;
    const viewLeft = -viewport.x / viewport.k - padding;
    const viewTop = -viewport.y / viewport.k - padding;
    const viewRight = viewLeft + width / viewport.k + padding * 2;
    const viewBottom = viewTop + height / viewport.k + padding * 2;

    return nodes.filter(
      (node) =>
        !isHiddenBatchChild(node, nodeById, collapsingBatchIds) &&
        node.position.x + node.width > viewLeft &&
        node.position.x < viewRight &&
        node.position.y + node.height > viewTop &&
        node.position.y < viewBottom,
    );
  }, [
    collapsingBatchIds,
    containerRef,
    nodeById,
    nodes,
    size.height,
    size.width,
    viewport.k,
    viewport.x,
    viewport.y,
  ]);

  const toolbarNode = toolbarNodeId ? nodeById.get(toolbarNodeId) || null : null;
  const infoNode = infoNodeId ? nodeById.get(infoNodeId) || null : null;
  const cropNode = cropNodeId ? nodeById.get(cropNodeId) || null : null;
  const maskEditNode = maskEditNodeId ? nodeById.get(maskEditNodeId) || null : null;
  const splitNode = splitNodeId ? nodeById.get(splitNodeId) || null : null;
  const upscaleNode = upscaleNodeId ? nodeById.get(upscaleNodeId) || null : null;
  const superResolveNode = superResolveNodeId ? nodeById.get(superResolveNodeId) || null : null;
  const angleNode = angleNodeId ? nodeById.get(angleNodeId) || null : null;
  const previewNode = previewNodeId ? nodeById.get(previewNodeId) || null : null;
  const hasMultipleSelectedNodes = selectedNodeIds.size > 1;
  const activeNodeId = hasMultipleSelectedNodes
    ? null
    : hoveredNodeId || (selectedNodeIds.size === 1 ? Array.from(selectedNodeIds)[0] : null);
  const batchChildCountById = useMemo(() => {
    const map = new Map<string, number>();
    nodes.forEach((node) => {
      if (node.metadata?.isBatchRoot) map.set(node.id, node.metadata.batchChildIds?.length || 0);
    });
    return map;
  }, [nodes]);
  const batchMotionById = useMemo(() => {
    const map = new Map<string, { x: number; y: number; index: number }>();
    nodes.forEach((node) => {
      const rootId = node.metadata?.batchRootId;
      if (!rootId) return;
      const root = nodeById.get(rootId);
      const index = root?.metadata?.batchChildIds?.indexOf(node.id) ?? 0;
      const stackX = root ? root.position.x + 34 + index * 14 : node.position.x;
      const stackY = root ? root.position.y + 14 + index * 8 : node.position.y;
      map.set(node.id, {
        x: stackX - node.position.x,
        y: stackY - node.position.y,
        index: Math.max(index, 0),
      });
    });
    return map;
  }, [nodeById, nodes]);
  const relatedHighlight = useMemo(() => {
    const nodeIds = new Set<string>();
    const connectionIds = new Set<string>();

    if (!activeNodeId) return { nodeIds, connectionIds };

    nodeIds.add(activeNodeId);
    connections.forEach((connection) => {
      if (connection.fromNodeId !== activeNodeId && connection.toNodeId !== activeNodeId) return;
      connectionIds.add(connection.id);
      nodeIds.add(connection.fromNodeId);
      nodeIds.add(connection.toNodeId);
    });

    return { nodeIds, connectionIds };
  }, [activeNodeId, connections]);

  const configInputsById = useMemo(() => {
    const map = new Map<string, NodeGenerationInput[]>();
    nodes.forEach((node) => {
      if (node.type !== CanvasNodeType.Config) return;
      map.set(node.id, buildNodeGenerationInputs(node.id, nodes, connections));
    });
    return map;
  }, [connections, nodes]);
  const resourceContextNodeId = dialogNodeId || activeNodeId;
  const canvasResourceReferences = useMemo(
    () => buildCanvasResourceReferences(nodes, connections, resourceContextNodeId),
    [connections, nodes, resourceContextNodeId],
  );
  const resourceReferenceByNodeId = useMemo(
    () => new Map(canvasResourceReferences.map((reference) => [reference.nodeId, reference])),
    [canvasResourceReferences],
  );
  const mentionReferencesByNodeId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildNodeMentionReferences>>();
    nodes.forEach((node) => map.set(node.id, buildNodeMentionReferences(node, nodes, connections)));
    return map;
  }, [connections, nodes]);

  const createAndOpenProject = useCallback(() => {
    const id = createProject(`无限画布 ${useCanvasStore.getState().projects.length + 1}`);
    router.push(`/canvas/${id}`);
  }, [createProject, router]);

  const deleteCurrentProject = useCallback(() => {
    deleteProjects([projectId]);
    cleanupAssetImages();
    router.push('/canvas');
  }, [cleanupAssetImages, deleteProjects, projectId, router]);

  const { saveNodeAsset, handleAssetInsert, pasteAssistantImage } = useCanvasAssetBridge({
    message,
    containerRef,
    size,
    screenToCanvas,
    createCanvasTextNode,
    createImageFileNode,
    setNodes,
    setSelectedNodeIds,
    setSelectedConnectionId,
    setDialogNodeId,
    setAssetPickerOpen,
  });

  const pasteSystemClipboard = useCallback(async () => {
    if (!navigator.clipboard) return;

    const items = await navigator.clipboard.read();
    const imageItem = items.find((item) => item.types.some((type) => type.startsWith('image/')));
    if (imageItem) {
      const imageType = imageItem.types.find((type) => type.startsWith('image/'));
      if (!imageType) return;
      const blob = await imageItem.getType(imageType);
      const file = new File([blob], 'clipboard-image.png', { type: imageType });
      void createImageFileNode(file, getCanvasCenter());
      message.success('已从剪切板添加图片');
      return;
    }

    const text = await navigator.clipboard.readText();
    if (createTextNodeFromClipboard(text)) message.success('已从剪切板添加文本');
  }, [createImageFileNode, createTextNodeFromClipboard, getCanvasCenter, message]);

  useCanvasKeyboardShortcuts({
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
  });

  const handleAssistantSessionsChange = useCallback(
    (sessions: CanvasAssistantSession[], activeId: string | null) => {
      setChatSessions(sessions);
      setActiveChatId(activeId);
    },
    [],
  );

  const startTitleEditing = useCallback(() => {
    setTitleDraft(currentProject?.title || '未命名画布');
    setTitleEditing(true);
  }, [currentProject?.title]);

  const finishTitleEditing = useCallback(() => {
    const nextTitle = titleDraft.trim();
    if (nextTitle) renameProject(projectId, nextTitle);
    setTitleEditing(false);
  }, [projectId, renameProject, titleDraft]);

  const preventCanvasContextMenu = useCallback((event: ReactMouseEvent) => {
    if ((event.target as HTMLElement).closest('[data-node-id]')) return;
    event.preventDefault();
    setContextMenu(null);
  }, []);

  const renderCanvasNodePanel = useCallback(
    (panelNode: CanvasNodeData) =>
      panelNode.type === CanvasNodeType.Config ? (
        <CanvasConfigComposer
          value={panelNode.metadata?.composerContent ?? panelNode.metadata?.prompt ?? ''}
          inputs={configInputsById.get(panelNode.id) || []}
          onChange={(composerContent) => handleConfigNodeChange(panelNode.id, { composerContent })}
          onClose={() => setDialogNodeId(null)}
        />
      ) : (
        <CanvasNodePromptPanel
          node={panelNode}
          isRunning={runningNodeId === panelNode.id}
          mentionReferences={
            mentionReferencesByNodeId.get(panelNode.id) || EMPTY_MENTION_REFERENCES
          }
          onPromptChange={handleNodePromptChange}
          onConfigChange={handleConfigNodeChange}
          onGenerate={handleGenerateNode}
          onStop={confirmStopGeneration}
          onImageSettingsOpenChange={(open) => {
            setNodeImageSettingsOpen(open);
            if (open) setToolbarNodeId(null);
          }}
        />
      ),
    [
      configInputsById,
      confirmStopGeneration,
      handleConfigNodeChange,
      handleGenerateNode,
      handleNodePromptChange,
      mentionReferencesByNodeId,
      runningNodeId,
      setToolbarNodeId,
    ],
  );

  const renderCanvasNodeContent = useCallback(
    (contentNode: CanvasNodeData) => (
      <CanvasConfigNodePanel
        node={contentNode}
        isRunning={runningNodeId === contentNode.id}
        inputSummary={getInputSummary(configInputsById.get(contentNode.id) || [])}
        onConfigChange={handleConfigNodeChange}
        onComposerToggle={() =>
          setDialogNodeId((current) => (current === contentNode.id ? null : contentNode.id))
        }
        onStop={confirmStopGeneration}
        onGenerate={(nodeId) => {
          const target = nodesRef.current.find((item) => item.id === nodeId);
          void handleGenerateNode(
            nodeId,
            target?.metadata?.generationMode || 'image',
            target?.metadata?.composerContent ?? target?.metadata?.prompt ?? '',
          );
        }}
      />
    ),
    [
      configInputsById,
      confirmStopGeneration,
      handleConfigNodeChange,
      handleGenerateNode,
      runningNodeId,
    ],
  );

  const assistantOpen = assistantMounted && !assistantCollapsed;
  const closeAgent = () => {
    if (!assistantMounted || assistantClosing) return;
    setAssistantCollapsed(true);
    setAssistantClosing(true);
    agentCloseTimerRef.current = setTimeout(() => {
      agentCloseTimerRef.current = null;
      setAssistantMounted(false);
      setAssistantClosing(false);
    }, CANVAS_AGENT_PANEL_MOTION_MS);
  };

  if (!projectLoaded) return <CanvasRefreshShell />;

  return (
    <main
      className="flex h-full min-h-0 overflow-hidden"
      style={{ background: theme.canvas.background, color: theme.node.text }}
    >
      <section className="relative min-w-0 flex-1 overflow-hidden">
        <CanvasTopBar
          title={currentProject?.title || '未命名画布'}
          titleDraft={titleDraft}
          isTitleEditing={titleEditing}
          onTitleDraftChange={setTitleDraft}
          onStartTitleEditing={startTitleEditing}
          onFinishTitleEditing={finishTitleEditing}
          onCancelTitleEditing={() => setTitleEditing(false)}
          canUndo={historyState.canUndo}
          canRedo={historyState.canRedo}
          onHome={() => router.push('/')}
          onProjects={() => router.push('/canvas')}
          onCreateProject={createAndOpenProject}
          onDeleteProject={deleteCurrentProject}
          onImportImage={() => handleUploadRequest()}
          onUndo={undoCanvas}
          onRedo={redoCanvas}
          agentOpen={assistantOpen}
          compactAgentStatus={
            codexCompactAgent
              ? {
                  connected: localAgentConnected,
                  enabled: localAgentEnabled,
                  activity: localAgentActivity,
                }
              : undefined
          }
          onToggleAgent={() => (assistantOpen ? closeAgent() : openAgent())}
        />

        <InfiniteCanvas
          containerRef={containerRef}
          viewport={viewport}
          backgroundMode={backgroundMode}
          onViewportChange={handleViewportChange}
          onPanStateChange={handleCanvasPanStateChange}
          onCanvasMouseDown={handleCanvasMouseDown}
          onCanvasDeselect={deselectCanvas}
          onContextMenu={preventCanvasContextMenu}
          onDrop={handleDrop}
        >
          <svg
            className="absolute left-0 top-0 h-[10000px] w-[10000px] overflow-visible"
            style={{ pointerEvents: 'none', transform: 'translateZ(0)', zIndex: 0 }}
          >
            {connections
              .filter((connection) => {
                const from = nodeById.get(connection.fromNodeId);
                const to = nodeById.get(connection.toNodeId);
                return Boolean(
                  from &&
                  to &&
                  !isHiddenBatchConnectionEndpoint(from, nodeById) &&
                  !isHiddenBatchConnectionEndpoint(to, nodeById),
                );
              })
              .map((connection) => {
                const from = nodeById.get(connection.fromNodeId);
                const to = nodeById.get(connection.toNodeId);
                if (!from || !to) return null;

                return (
                  <ConnectionPath
                    key={connection.id}
                    connection={connection}
                    from={from}
                    to={to}
                    active={
                      selectedConnectionId === connection.id ||
                      relatedHighlight.connectionIds.has(connection.id)
                    }
                    onSelect={() => {
                      setSelectedConnectionId(connection.id);
                      setSelectedNodeIds(new Set());
                      setContextMenu(null);
                    }}
                    onContextMenu={(event) => {
                      setSelectedConnectionId(connection.id);
                      setSelectedNodeIds(new Set());
                      setContextMenu({
                        type: 'connection',
                        x: event.clientX,
                        y: event.clientY,
                        connectionId: connection.id,
                      });
                    }}
                  />
                );
              })}
            {connectingParams ? (
              <ActiveConnectionPath
                node={nodeById.get(connectingParams.nodeId)}
                handle={connectingParams}
                mouseWorld={mouseWorld}
                target={connectionTargetNodeId ? nodeById.get(connectionTargetNodeId) : undefined}
              />
            ) : null}
          </svg>

          {visibleNodes.map((node) => (
            <CanvasNode
              key={node.id}
              data={node}
              scale={viewport.k}
              isSelected={selectedNodeIds.has(node.id)}
              isRelated={relatedHighlight.nodeIds.has(node.id)}
              isFocusRelated={activeNodeId === node.id}
              isConnectionTarget={connectionTargetNodeId === node.id}
              isConnecting={Boolean(connectingParams)}
              editRequestNonce={editingNodeId === node.id ? editRequestNonce : 0}
              showPanel={dialogNodeId === node.id && !selectionBox}
              batchCount={batchChildCountById.get(node.id) || 0}
              batchExpanded={Boolean(node.metadata?.imageBatchExpanded)}
              batchClosing={Boolean(
                node.metadata?.batchRootId && collapsingBatchIds.has(node.metadata.batchRootId),
              )}
              batchOpening={openingBatchIds.has(node.id)}
              batchRecovering={collapsingBatchIds.has(node.id)}
              batchMotion={batchMotionById.get(node.id)}
              showImageInfo={showImageInfo}
              resourceLabel={resourceReferenceByNodeId.get(node.id)}
              mentionReferences={mentionReferencesByNodeId.get(node.id) || EMPTY_MENTION_REFERENCES}
              renderPanel={renderCanvasNodePanel}
              renderNodeContent={renderCanvasNodeContent}
              onMouseDown={handleNodeMouseDown}
              onHoverStart={handleCanvasNodeHoverStart}
              onHoverEnd={handleCanvasNodeHoverEnd}
              onConnectStart={handleConnectStart}
              onResize={handleNodeResize}
              onContentChange={handleNodeContentChange}
              onToggleBatch={toggleBatchExpanded}
              onSetBatchPrimary={setBatchPrimary}
              onRetry={(node) => void handleRetryNode(node)}
              onGenerateImage={generateImageFromTextNode}
              onViewImage={(node) => setPreviewNodeId(node.id)}
              onContextMenu={handleCanvasNodeContextMenu}
            />
          ))}

          {selectionBox ? (
            <div
              className="pointer-events-none absolute z-[100] border"
              style={{
                left: Math.min(selectionBox.startWorldX, selectionBox.currentWorldX),
                top: Math.min(selectionBox.startWorldY, selectionBox.currentWorldY),
                width: Math.abs(selectionBox.currentWorldX - selectionBox.startWorldX),
                height: Math.abs(selectionBox.currentWorldY - selectionBox.startWorldY),
                borderColor: theme.canvas.selectionStroke,
                background: theme.canvas.selectionFill,
              }}
            />
          ) : null}
          {pendingConnectionCreate ? (
            <ConnectionCreateMenu
              pending={pendingConnectionCreate}
              onCreate={(type) => createConnectedNode(type, pendingConnectionCreate)}
              onClose={cancelPendingConnectionCreate}
            />
          ) : null}
        </InfiniteCanvas>

        <CanvasNodeHoverToolbar
          node={isNodeDragging || nodeImageSettingsOpen ? null : toolbarNode}
          viewport={viewport}
          onKeep={keepNodeToolbar}
          onLeave={hideNodeToolbar}
          onInfo={(node) => setInfoNodeId(node.id)}
          onEditText={openTextEditor}
          onDecreaseFont={(node) =>
            handleFontSizeChange(node.id, Math.max(10, (node.metadata?.fontSize || 14) - 2))
          }
          onIncreaseFont={(node) =>
            handleFontSizeChange(node.id, Math.min(32, (node.metadata?.fontSize || 14) + 2))
          }
          onToggleDialog={(node) =>
            setDialogNodeId((current) => (current === node.id ? null : node.id))
          }
          onGenerateImage={generateImageFromTextNode}
          onUpload={(node) => handleUploadRequest(node.id)}
          onDownload={downloadNodeImage}
          onSaveAsset={(node) => void saveNodeAsset(node)}
          onMaskEdit={(node) => setMaskEditNodeId(node.id)}
          onCrop={(node) => setCropNodeId(node.id)}
          onSplit={(node) => setSplitNodeId(node.id)}
          onUpscale={(node) => setUpscaleNodeId(node.id)}
          onSuperResolve={(node) => setSuperResolveNodeId(node.id)}
          onAngle={(node) => setAngleNodeId(node.id)}
          onViewImage={(node) => setPreviewNodeId(node.id)}
          onReversePrompt={createImageReversePromptNodes}
          onRetry={(node) => void handleRetryNode(node)}
          onToggleFreeResize={(node) => toggleNodeFreeResize(node.id)}
          onDelete={(node) => deleteNodes(new Set([node.id]))}
        />

        <CanvasToolbar
          selectedCount={selectedNodeIds.size}
          canUndo={historyState.canUndo}
          canRedo={historyState.canRedo}
          backgroundMode={backgroundMode}
          showImageInfo={showImageInfo}
          onAddImage={() => createNode(CanvasNodeType.Image)}
          onAddVideo={() => createNode(CanvasNodeType.Video)}
          onAddAudio={() => createNode(CanvasNodeType.Audio)}
          onAddText={() => createNode(CanvasNodeType.Text)}
          onAddConfig={() => createNode(CanvasNodeType.Config)}
          onUndo={undoCanvas}
          onRedo={redoCanvas}
          onUpload={() => handleUploadRequest()}
          onDelete={() => deleteNodes(new Set(selectedNodeIds))}
          onClear={() => setClearConfirmOpen(true)}
          onDeselect={deselectCanvas}
          onBackgroundModeChange={setBackgroundMode}
          onShowImageInfoChange={setShowImageInfo}
          onOpenMyAssets={() => {
            setAssetPickerOpen(true);
          }}
        />

        {isMiniMapOpen ? (
          <Minimap
            nodes={nodes}
            viewport={viewport}
            viewportSize={size}
            onViewportChange={setViewport}
          />
        ) : null}

        <CanvasZoomControls
          scale={viewport.k}
          onScaleChange={setZoomScale}
          onReset={resetViewport}
          isMiniMapOpen={isMiniMapOpen}
          onToggleMiniMap={() => setIsMiniMapOpen((value) => !value)}
        />

        {contextMenu ? (
          <CanvasNodeContextMenu
            menu={contextMenu}
            onClose={() => setContextMenu(null)}
            onDuplicate={() => {
              if (contextMenu.type !== 'node') return;
              duplicateNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            onDelete={() => {
              if (contextMenu.type === 'node') {
                deleteNodes(new Set([contextMenu.nodeId]));
              } else {
                deleteConnection(contextMenu.connectionId);
              }
              setContextMenu(null);
            }}
          />
        ) : null}

        <CanvasOverlays
          imageInputRef={imageInputRef}
          onImageInputChange={handleImageInputChange}
          infoNode={infoNode}
          cropNode={cropNode}
          maskEditNode={maskEditNode}
          splitNode={splitNode}
          upscaleNode={upscaleNode}
          superResolveNode={superResolveNode}
          angleNode={angleNode}
          previewNode={previewNode}
          clearConfirmOpen={clearConfirmOpen}
          assetPickerOpen={assetPickerOpen}
          onInfoClose={() => setInfoNodeId(null)}
          onCropClose={() => setCropNodeId(null)}
          onCropConfirm={(node, crop) => void cropImageNode(node, crop)}
          onMaskEditClose={() => setMaskEditNodeId(null)}
          onMaskEditConfirm={(node, payload) => void maskEditImageNode(node, payload)}
          onSplitClose={() => setSplitNodeId(null)}
          onSplitConfirm={(node, params) => void splitImageNode(node, params)}
          onUpscaleClose={() => setUpscaleNodeId(null)}
          onUpscaleConfirm={(node, params) => void upscaleImageNode(node, params)}
          onSuperResolveClose={() => setSuperResolveNodeId(null)}
          onAngleClose={() => setAngleNodeId(null)}
          onAngleConfirm={(node, params) => void generateAngleNode(node, params)}
          onPreviewClose={() => setPreviewNodeId(null)}
          onClearClose={() => setClearConfirmOpen(false)}
          onClearConfirm={clearCanvas}
          onAssetInsert={handleAssetInsert}
          onAssetPickerClose={() => setAssetPickerOpen(false)}
        />
      </section>
      <CanvasAgentDock
        codexCompactAgent={codexCompactAgent}
        assistantMounted={assistantMounted}
        agentSnapshot={agentSnapshot}
        canUndoAgentOps={canUndoAgentOps}
        applyAgentOps={applyAgentOps}
        undoAgentOps={undoAgentOps}
        codexAutoConnect={codexAutoConnect}
        nodes={nodes}
        selectedNodeIds={selectedNodeIds}
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        onSelectNodeIds={setSelectedNodeIds}
        onAssistantSessionsChange={handleAssistantSessionsChange}
        onPasteAssistantImage={pasteAssistantImage}
        agentMode={agentMode}
        onAgentModeChange={setAgentMode}
        assistantClosing={assistantClosing}
        onCollapse={closeAgent}
      />
    </main>
  );
}
