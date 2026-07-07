'use client';

import { useCallback, useRef } from 'react';
import type {
  ChangeEvent as ReactChangeEvent,
  DragEvent as ReactDragEvent,
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react';

import { uploadMediaFile } from '@/shared/storage/file-storage';
import { uploadImage } from '@/shared/storage/image-storage';
import { NODE_DEFAULT_SIZE } from '../constants';
import {
  audioMetadata,
  imageMetadata,
  isAudioFile,
  videoMetadata,
} from '../domain/canvas-workspace-helpers';
import { fitNodeSize } from '../utils/canvas-node-size';
import { CanvasNodeType, type CanvasNodeData, type Position } from '../types';

const VIDEO_NODE_MAX_WIDTH = 420;
const VIDEO_NODE_MAX_HEIGHT = 420;

type UseCanvasMediaNodesOptions = {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  size: { width: number; height: number };
  screenToCanvas: (clientX: number, clientY: number) => Position;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setDialogNodeId: Dispatch<SetStateAction<string | null>>;
};

export function useCanvasMediaNodes({
  containerRef,
  size,
  screenToCanvas,
  setNodes,
  setSelectedNodeIds,
  setSelectedConnectionId,
  setDialogNodeId,
}: UseCanvasMediaNodesOptions) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ nodeId?: string; position?: Position } | null>(null);

  const createImageFileNode = useCallback(
    async (file: File, position: Position) => {
      const image = await uploadImage(file);
      const nodeSize = fitNodeSize(image.width, image.height);
      const id = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newNode: CanvasNodeData = {
        id,
        type: CanvasNodeType.Image,
        title: file.name,
        position: { x: position.x - nodeSize.width / 2, y: position.y - nodeSize.height / 2 },
        width: nodeSize.width,
        height: nodeSize.height,
        metadata: imageMetadata(image),
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
      setDialogNodeId(id);
    },
    [setDialogNodeId, setNodes, setSelectedConnectionId, setSelectedNodeIds],
  );

  const createVideoFileNode = useCallback(
    async (file: File, position: Position) => {
      const video = await uploadMediaFile(file, 'video');
      const nodeSize = fitNodeSize(
        video.width || 1280,
        video.height || 720,
        VIDEO_NODE_MAX_WIDTH,
        VIDEO_NODE_MAX_HEIGHT,
      );
      const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setNodes((prev) => [
        ...prev,
        {
          id,
          type: CanvasNodeType.Video,
          title: file.name,
          position: { x: position.x - nodeSize.width / 2, y: position.y - nodeSize.height / 2 },
          width: nodeSize.width,
          height: nodeSize.height,
          metadata: videoMetadata(video),
        },
      ]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
      setDialogNodeId(id);
    },
    [setDialogNodeId, setNodes, setSelectedConnectionId, setSelectedNodeIds],
  );

  const createAudioFileNode = useCallback(
    async (file: File, position: Position) => {
      const audio = await uploadMediaFile(file, 'audio');
      const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Audio];
      const id = `audio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setNodes((prev) => [
        ...prev,
        {
          id,
          type: CanvasNodeType.Audio,
          title: file.name,
          position: { x: position.x - spec.width / 2, y: position.y - spec.height / 2 },
          width: spec.width,
          height: spec.height,
          metadata: audioMetadata(audio),
        },
      ]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
    },
    [setNodes, setSelectedConnectionId, setSelectedNodeIds],
  );

  const handleUploadRequest = useCallback((nodeId?: string, position?: Position) => {
    uploadTargetRef.current = { nodeId, position };
    imageInputRef.current?.click();
  }, []);

  const handleImageInputChange = useCallback(
    async (event: ReactChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const target = uploadTargetRef.current;
      if (
        !file ||
        (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !isAudioFile(file))
      )
        return;

      if (target?.nodeId) {
        if (isAudioFile(file)) {
          const audio = await uploadMediaFile(file, 'audio');
          const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Audio];
          setNodes((prev) =>
            prev.map((node) =>
              node.id === target.nodeId
                ? {
                    ...node,
                    type: CanvasNodeType.Audio,
                    title: file.name,
                    position: {
                      x: node.position.x + node.width / 2 - spec.width / 2,
                      y: node.position.y + node.height / 2 - spec.height / 2,
                    },
                    width: spec.width,
                    height: spec.height,
                    metadata: {
                      ...node.metadata,
                      ...audioMetadata(audio),
                      errorDetails: undefined,
                    },
                  }
                : node,
            ),
          );
          setSelectedNodeIds(new Set([target.nodeId]));
          setSelectedConnectionId(null);
          uploadTargetRef.current = null;
          event.target.value = '';
          return;
        }
        if (file.type.startsWith('video/')) {
          const video = await uploadMediaFile(file, 'video');
          const nextSize = fitNodeSize(
            video.width || 1280,
            video.height || 720,
            VIDEO_NODE_MAX_WIDTH,
            VIDEO_NODE_MAX_HEIGHT,
          );
          setNodes((prev) =>
            prev.map((node) =>
              node.id === target.nodeId
                ? {
                    ...node,
                    type: CanvasNodeType.Video,
                    title: file.name,
                    position: {
                      x: node.position.x + node.width / 2 - nextSize.width / 2,
                      y: node.position.y + node.height / 2 - nextSize.height / 2,
                    },
                    width: nextSize.width,
                    height: nextSize.height,
                    metadata: {
                      ...node.metadata,
                      ...videoMetadata(video),
                      errorDetails: undefined,
                    },
                  }
                : node,
            ),
          );
          setSelectedNodeIds(new Set([target.nodeId]));
          setSelectedConnectionId(null);
          setDialogNodeId(target.nodeId);
          uploadTargetRef.current = null;
          event.target.value = '';
          return;
        }
        const image = await uploadImage(file);
        const nodeSize = fitNodeSize(image.width, image.height);
        setNodes((prev) =>
          prev.map((node) =>
            node.id === target.nodeId
              ? {
                  ...node,
                  type: CanvasNodeType.Image,
                  title: file.name,
                  width: nodeSize.width,
                  height: nodeSize.height,
                  metadata: {
                    ...node.metadata,
                    ...imageMetadata(image),
                    errorDetails: undefined,
                    freeResize: false,
                    isBatchRoot: undefined,
                    batchRootId: undefined,
                    batchChildIds: undefined,
                    batchUsesReferenceImages: undefined,
                    generationType: undefined,
                    model: undefined,
                    size: undefined,
                    quality: undefined,
                    count: undefined,
                    references: undefined,
                    primaryImageId: undefined,
                    imageBatchExpanded: undefined,
                  },
                }
              : node,
          ),
        );
        setSelectedNodeIds(new Set([target.nodeId]));
        setSelectedConnectionId(null);
        setDialogNodeId(target.nodeId);
      } else {
        const position =
          target?.position ||
          screenToCanvas(
            (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
            (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
          );
        void (isAudioFile(file)
          ? createAudioFileNode(file, position)
          : file.type.startsWith('video/')
            ? createVideoFileNode(file, position)
            : createImageFileNode(file, position));
      }

      uploadTargetRef.current = null;
      event.target.value = '';
    },
    [
      containerRef,
      createAudioFileNode,
      createImageFileNode,
      createVideoFileNode,
      screenToCanvas,
      setDialogNodeId,
      setNodes,
      setSelectedConnectionId,
      setSelectedNodeIds,
      size.height,
      size.width,
    ],
  );

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = Array.from(event.dataTransfer.files).find(
        (item) =>
          item.type.startsWith('image/') || item.type.startsWith('video/') || isAudioFile(item),
      );
      if (!file) return;

      const pos = screenToCanvas(event.clientX, event.clientY);
      void (isAudioFile(file)
        ? createAudioFileNode(file, pos)
        : file.type.startsWith('video/')
          ? createVideoFileNode(file, pos)
          : createImageFileNode(file, pos));
    },
    [createAudioFileNode, createImageFileNode, createVideoFileNode, screenToCanvas],
  );

  return {
    imageInputRef,
    createImageFileNode,
    createVideoFileNode,
    createAudioFileNode,
    handleUploadRequest,
    handleImageInputChange,
    handleDrop,
  };
}
