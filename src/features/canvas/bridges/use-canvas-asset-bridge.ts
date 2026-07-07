'use client';

import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import { useAddAsset, type InsertAssetPayload } from '@/features/assets';
import { getDataUrlByteSize, readImageMeta } from '@/shared/media/image-utils';
import { uploadImage } from '@/shared/storage/image-storage';
import { NODE_DEFAULT_SIZE } from '../constants';
import { imageMetadata, NODE_STATUS_SUCCESS } from '../domain/canvas-workspace-helpers';
import { fitNodeSize } from '../utils/canvas-node-size';
import {
  CanvasNodeType,
  type CanvasAssistantImage,
  type CanvasNodeData,
  type Position,
} from '../types';

const VIDEO_NODE_MAX_WIDTH = 420;
const VIDEO_NODE_MAX_HEIGHT = 420;

type MessageApi = {
  success: (content: string) => unknown;
  error: (content: string) => unknown;
};

type CanvasAssetBridgeOptions = {
  message: MessageApi;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  size: { width: number; height: number };
  screenToCanvas: (clientX: number, clientY: number) => Position;
  createCanvasTextNode: (text: string) => CanvasNodeData;
  createImageFileNode: (file: File, position: Position) => Promise<void>;
  setNodes: Dispatch<SetStateAction<CanvasNodeData[]>>;
  setSelectedNodeIds: Dispatch<SetStateAction<Set<string>>>;
  setSelectedConnectionId: Dispatch<SetStateAction<string | null>>;
  setDialogNodeId: Dispatch<SetStateAction<string | null>>;
  setAssetPickerOpen: Dispatch<SetStateAction<boolean>>;
};

export function useCanvasAssetBridge({
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
}: CanvasAssetBridgeOptions) {
  const addAsset = useAddAsset();

  const getCanvasCenterFromViewport = useCallback(
    () =>
      screenToCanvas(
        (containerRef.current?.getBoundingClientRect().left || 0) + size.width / 2,
        (containerRef.current?.getBoundingClientRect().top || 0) + size.height / 2,
      ),
    [containerRef, screenToCanvas, size.height, size.width],
  );

  const saveNodeAsset = useCallback(
    async (node: CanvasNodeData) => {
      if (node.type === CanvasNodeType.Text) {
        const content = node.metadata?.content?.trim();
        if (!content) return message.error('没有可保存的文本');
        addAsset({
          kind: 'text',
          title: node.metadata?.prompt?.slice(0, 24) || '画布文本',
          coverUrl: '',
          tags: [],
          source: 'Canvas',
          data: { content },
          metadata: { source: 'canvas', nodeId: node.id },
        });
        message.success('已加入我的素材');
        return;
      }
      if (node.type === CanvasNodeType.Video) {
        if (!node.metadata?.content) return message.error('没有可保存的视频');
        addAsset({
          kind: 'video',
          title: node.metadata?.prompt?.slice(0, 24) || '画布视频',
          coverUrl: '',
          tags: [],
          source: 'Canvas',
          data: {
            url: node.metadata.content,
            storageKey: node.metadata.storageKey,
            width: node.width,
            height: node.height,
            bytes: node.metadata.bytes || 0,
            mimeType: node.metadata.mimeType || 'video/mp4',
          },
          metadata: { source: 'canvas', nodeId: node.id, prompt: node.metadata?.prompt },
        });
        message.success('已加入我的素材');
        return;
      }
      if (!node.metadata?.content) return message.error('没有可保存的图片');
      const dataUrl = node.metadata.storageKey ? '' : node.metadata.content;
      addAsset({
        kind: 'image',
        title: node.metadata?.prompt?.slice(0, 24) || '画布图片',
        coverUrl: node.metadata.content,
        tags: [],
        source: 'Canvas',
        data: {
          dataUrl,
          storageKey: node.metadata.storageKey,
          width: node.metadata.naturalWidth || node.width,
          height: node.metadata.naturalHeight || node.height,
          bytes: node.metadata.bytes || getDataUrlByteSize(dataUrl),
          mimeType: node.metadata.mimeType || 'image/png',
        },
        metadata: { source: 'canvas', nodeId: node.id, prompt: node.metadata?.prompt },
      });
      message.success('已加入我的素材');
    },
    [addAsset, message],
  );

  const insertAssistantImage = useCallback(
    async (image: CanvasAssistantImage) => {
      const storedImage = image.storageKey
        ? {
            url: image.dataUrl,
            storageKey: image.storageKey,
            width: 1,
            height: 1,
            bytes: 0,
            mimeType: 'image/png',
          }
        : await uploadImage(image.dataUrl);
      const meta =
        storedImage.width === 1 && storedImage.height === 1
          ? await readImageMeta(storedImage.url)
          : storedImage;
      const config = fitNodeSize(meta.width, meta.height);
      const center = getCanvasCenterFromViewport();
      const id = `image-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const node: CanvasNodeData = {
        id,
        type: CanvasNodeType.Image,
        title: image.prompt.slice(0, 32) || 'Generated Image',
        position: { x: center.x - config.width / 2, y: center.y - config.height / 2 },
        width: config.width,
        height: config.height,
        metadata: {
          ...imageMetadata({ ...storedImage, width: meta.width, height: meta.height }),
          prompt: image.prompt,
        },
      };

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([id]));
      setSelectedConnectionId(null);
      setDialogNodeId(id);
    },
    [
      getCanvasCenterFromViewport,
      setDialogNodeId,
      setNodes,
      setSelectedConnectionId,
      setSelectedNodeIds,
    ],
  );

  const insertAssistantText = useCallback(
    (text: string) => {
      const node = createCanvasTextNode(text);

      setNodes((prev) => [...prev, node]);
      setSelectedNodeIds(new Set([node.id]));
      setSelectedConnectionId(null);
    },
    [createCanvasTextNode, setNodes, setSelectedConnectionId, setSelectedNodeIds],
  );

  const handleAssetInsert = useCallback(
    (payload: InsertAssetPayload) => {
      if (payload.kind === 'text') {
        insertAssistantText(payload.content);
      } else if (payload.kind === 'video') {
        const spec = NODE_DEFAULT_SIZE[CanvasNodeType.Video];
        const center = getCanvasCenterFromViewport();
        const id = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const nextSize = fitNodeSize(
          payload.width || spec.width,
          payload.height || spec.height,
          VIDEO_NODE_MAX_WIDTH,
          VIDEO_NODE_MAX_HEIGHT,
        );
        setNodes((prev) => [
          ...prev,
          {
            id,
            type: CanvasNodeType.Video,
            title: payload.title,
            position: { x: center.x - nextSize.width / 2, y: center.y - nextSize.height / 2 },
            width: nextSize.width,
            height: nextSize.height,
            metadata: {
              content: payload.url,
              storageKey: payload.storageKey,
              status: NODE_STATUS_SUCCESS,
              naturalWidth: payload.width,
              naturalHeight: payload.height,
            },
          },
        ]);
        setSelectedNodeIds(new Set([id]));
      } else {
        void insertAssistantImage({
          id: `asset-${Date.now()}`,
          prompt: payload.title,
          dataUrl: payload.dataUrl,
          storageKey: payload.storageKey,
        });
      }
      setAssetPickerOpen(false);
    },
    [
      getCanvasCenterFromViewport,
      insertAssistantImage,
      insertAssistantText,
      setAssetPickerOpen,
      setNodes,
      setSelectedNodeIds,
    ],
  );

  const pasteAssistantImage = useCallback(
    (file: File) => {
      void createImageFileNode(file, getCanvasCenterFromViewport());
      message.success('已从剪切板添加图片');
    },
    [createImageFileNode, getCanvasCenterFromViewport, message],
  );

  return {
    saveNodeAsset,
    insertAssistantImage,
    insertAssistantText,
    handleAssetInsert,
    pasteAssistantImage,
  };
}
