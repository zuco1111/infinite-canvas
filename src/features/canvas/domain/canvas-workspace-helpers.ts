import { defaultConfig, type AiConfig } from '@/features/settings';
import { resolveMediaUrl, type UploadedFile } from '@/shared/storage/file-storage';
import { resolveImageUrl, uploadImage, type UploadedImage } from '@/shared/storage/image-storage';
import type { ReferenceImage } from '@/types/image';
import { NODE_DEFAULT_SIZE, getNodeSpec } from '../constants';
import type { CanvasImageAngleParams } from '../components/canvas-node-angle-dialog';
import type { NodeGenerationInput } from '../components/canvas-node-generation';
import { nodeSizeFromRatio } from '../utils/canvas-node-size';
import {
  CanvasNodeType,
  type CanvasAssistantSession,
  type CanvasConnection,
  type CanvasImageGenerationType,
  type CanvasNodeData,
  type CanvasNodeMetadata,
  type ConnectionHandle,
  type Position,
} from '../types';

export type CanvasNodeLookup = CanvasNodeData[] | ReadonlyMap<string, CanvasNodeData>;

export const NODE_STATUS_IDLE = 'idle' as const;
export const NODE_STATUS_LOADING = 'loading' as const;
export const NODE_STATUS_SUCCESS = 'success' as const;
export const NODE_STATUS_ERROR = 'error' as const;

export function createCanvasNode(
  type: CanvasNodeType,
  position: Position,
  metadata?: CanvasNodeMetadata,
): CanvasNodeData {
  const spec = getNodeSpec(type);
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    type,
    title: spec.title,
    position: {
      x: position.x - spec.width / 2,
      y: position.y - spec.height / 2,
    },
    width: spec.width,
    height: spec.height,
    metadata: { ...spec.metadata, ...metadata },
  };
}

export function imageExtension(dataUrl: string) {
  return (
    dataUrl.match(/^data:image[/]([^;]+)/)?.[1] || dataUrl.match(/image[/]([^;]+)/)?.[1] || 'png'
  );
}

export function audioExtension(mimeType?: string) {
  if (mimeType?.includes('wav')) return 'wav';
  if (mimeType?.includes('opus')) return 'opus';
  if (mimeType?.includes('aac')) return 'aac';
  if (mimeType?.includes('flac')) return 'flac';
  if (mimeType?.includes('pcm')) return 'pcm';
  return 'mp3';
}

export function cssSelectorEscape(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
}

export function imageMetadata(image: UploadedImage): CanvasNodeMetadata {
  return {
    content: image.url,
    storageKey: image.storageKey,
    status: 'success',
    naturalWidth: image.width,
    naturalHeight: image.height,
    bytes: image.bytes,
    mimeType: image.mimeType,
  };
}

export function videoMetadata(video: UploadedFile): CanvasNodeMetadata {
  return {
    content: video.url,
    storageKey: video.storageKey,
    status: 'success',
    naturalWidth: video.width,
    naturalHeight: video.height,
    bytes: video.bytes,
    mimeType: video.mimeType || 'video/mp4',
    durationMs: video.durationMs,
  };
}

export function audioMetadata(audio: UploadedFile): CanvasNodeMetadata {
  return {
    content: audio.url,
    storageKey: audio.storageKey,
    status: 'success',
    bytes: audio.bytes,
    mimeType: audio.mimeType || 'audio/mpeg',
    durationMs: audio.durationMs,
  };
}

export function buildImageGenerationMetadata(
  type: CanvasImageGenerationType,
  config: AiConfig,
  count: number,
  references: ReferenceImage[],
): CanvasNodeMetadata {
  return {
    generationType: type,
    model: config.model,
    size: config.size,
    quality: config.quality,
    count,
    references: references.map(referenceUrl).filter((url): url is string => Boolean(url)),
  };
}

export function buildAudioGenerationMetadata(config: AiConfig): CanvasNodeMetadata {
  return {
    model: config.model,
    audioVoice: config.audioVoice,
    audioFormat: config.audioFormat,
    audioSpeed: config.audioSpeed,
    audioInstructions: config.audioInstructions,
  };
}

export function referenceUrl(image: ReferenceImage) {
  return (
    image.storageKey ||
    image.url ||
    (!image.dataUrl.startsWith('data:') ? image.dataUrl : undefined)
  );
}

export function generationReferenceUrls(context: {
  referenceImages: ReferenceImage[];
  referenceVideos: Array<{ storageKey?: string; url?: string }>;
  referenceAudios?: Array<{ storageKey?: string; url?: string }>;
}) {
  return [
    ...context.referenceImages.map(referenceUrl).filter((url): url is string => Boolean(url)),
    ...context.referenceVideos
      .map((video) => video.storageKey || video.url)
      .filter((url): url is string => Boolean(url)),
    ...(context.referenceAudios || [])
      .map((audio) => audio.storageKey || audio.url)
      .filter((url): url is string => Boolean(url)),
  ];
}

export async function resolveMetadataReferences(metadata: CanvasNodeMetadata) {
  if (metadata.generationType !== 'edit') return [];
  if (!metadata.references?.length) return null;
  const references = await Promise.all(
    metadata.references.map(async (url, index) => {
      const dataUrl = url.startsWith('image:') ? await resolveImageUrl(url, '') : url;
      return dataUrl
        ? {
            id: `${index}`,
            name: `reference-${index}.png`,
            type: 'image/png',
            dataUrl,
            storageKey: url.startsWith('image:') ? url : undefined,
          }
        : null;
    }),
  );
  return references.every(Boolean) ? (references as ReferenceImage[]) : null;
}

export async function hydrateCanvasImages(nodes: CanvasNodeData[]) {
  return Promise.all(
    nodes.map(async (node) => {
      const content = node.metadata?.content;
      if (
        (node.type === CanvasNodeType.Video || node.type === CanvasNodeType.Audio) &&
        node.metadata?.storageKey
      )
        return {
          ...node,
          metadata: {
            ...node.metadata,
            content: await resolveMediaUrl(node.metadata.storageKey, content),
          },
        };
      if (node.type !== CanvasNodeType.Image || !content) return node;
      if (node.metadata?.storageKey)
        return {
          ...node,
          metadata: {
            ...node.metadata,
            content: await resolveImageUrl(node.metadata.storageKey, content),
          },
        };
      if (!content.startsWith('data:image/')) return node;
      return {
        ...node,
        metadata: { ...node.metadata, ...imageMetadata(await uploadImage(content)) },
      };
    }),
  );
}

export async function hydrateAssistantImages(sessions: CanvasAssistantSession[]) {
  const hydrateItem = async <T extends { dataUrl?: string; storageKey?: string }>(item: T) => {
    if (item.storageKey)
      return { ...item, dataUrl: await resolveImageUrl(item.storageKey, item.dataUrl) };
    if (item.dataUrl?.startsWith('data:image/')) {
      const image = await uploadImage(item.dataUrl);
      return { ...item, dataUrl: image.url, storageKey: image.storageKey };
    }
    return item;
  };
  return Promise.all(
    sessions.map(async (session) => ({
      ...session,
      messages: await Promise.all(
        session.messages.map(async (message) => ({
          ...message,
          references: await Promise.all((message.references || []).map(hydrateItem)),
        })),
      ),
    })),
  );
}

export function getGenerationCount(count: string) {
  return Math.max(1, Math.min(15, Math.floor(Math.abs(Number(count)) || 1)));
}

export function applyNodeConfigPatch(
  node: CanvasNodeData,
  patch: Partial<CanvasNodeData['metadata']>,
) {
  const safePatch = patch || {};
  const next = { ...node, metadata: { ...node.metadata, ...safePatch } };
  const spec =
    node.type === CanvasNodeType.Video
      ? NODE_DEFAULT_SIZE[CanvasNodeType.Video]
      : NODE_DEFAULT_SIZE[CanvasNodeType.Image];
  const size =
    typeof safePatch.size === 'string' && !node.metadata?.content
      ? nodeSizeFromRatio(safePatch.size, spec.width, spec.height)
      : null;
  return size && (node.type === CanvasNodeType.Image || node.type === CanvasNodeType.Video)
    ? {
        ...next,
        ...size,
        position: {
          x: node.position.x + node.width / 2 - size.width / 2,
          y: node.position.y + node.height / 2 - size.height / 2,
        },
      }
    : next;
}

export function getConnectionTargetAnchor(node: CanvasNodeData, current: ConnectionHandle) {
  return {
    x: current.handleType === 'source' ? node.position.x : node.position.x + node.width,
    y: node.position.y + node.height / 2,
  };
}

export function getCanvasNodeById(nodes: CanvasNodeLookup, id: string) {
  return Array.isArray(nodes) ? nodes.find((node) => node.id === id) : nodes.get(id);
}

export function normalizeConnection(
  firstNodeId: string,
  secondNodeId: string,
  nodes: CanvasNodeLookup,
  firstHandleType: 'source' | 'target',
) {
  const first = getCanvasNodeById(nodes, firstNodeId);
  const second = getCanvasNodeById(nodes, secondNodeId);
  if (!first || !second || first.id === second.id) return null;
  if (first.type === CanvasNodeType.Config && second.type === CanvasNodeType.Config) return null;
  if (second.type === CanvasNodeType.Config) return { fromNodeId: first.id, toNodeId: second.id };
  if (first.type === CanvasNodeType.Config && firstHandleType === 'target')
    return { fromNodeId: second.id, toNodeId: first.id };
  if (first.type === CanvasNodeType.Config) return { fromNodeId: first.id, toNodeId: second.id };
  return { fromNodeId: first.id, toNodeId: second.id };
}

export function getInputSummary(inputs: NodeGenerationInput[]) {
  return {
    textCount: inputs.filter((input) => input.type === 'text').length,
    imageCount: inputs.filter((input) => input.type === 'image').length,
    videoCount: inputs.filter((input) => input.type === 'video').length,
    audioCount: inputs.filter((input) => input.type === 'audio').length,
  };
}

export function buildGenerationConfig(
  config: AiConfig,
  node: CanvasNodeData | undefined,
  mode: 'text' | 'image' | 'video' | 'audio',
): AiConfig {
  const defaultModel =
    mode === 'image'
      ? config.imageModel
      : mode === 'video'
        ? config.videoModel
        : mode === 'audio'
          ? config.audioModel
          : config.textModel;
  return {
    ...config,
    model:
      node?.metadata?.model ||
      defaultModel ||
      (mode === 'audio' ? defaultConfig.audioModel : config.model || defaultConfig.model),
    quality: node?.metadata?.quality || config.quality || defaultConfig.quality,
    size: node?.metadata?.size || config.size || defaultConfig.size,
    videoSeconds: node?.metadata?.seconds || config.videoSeconds || defaultConfig.videoSeconds,
    vquality: node?.metadata?.vquality || config.vquality || defaultConfig.vquality,
    videoGenerateAudio:
      node?.metadata?.generateAudio ||
      config.videoGenerateAudio ||
      defaultConfig.videoGenerateAudio,
    videoWatermark:
      node?.metadata?.watermark || config.videoWatermark || defaultConfig.videoWatermark,
    audioVoice: node?.metadata?.audioVoice || config.audioVoice || defaultConfig.audioVoice,
    audioFormat: node?.metadata?.audioFormat || config.audioFormat || defaultConfig.audioFormat,
    audioSpeed: node?.metadata?.audioSpeed || config.audioSpeed || defaultConfig.audioSpeed,
    audioInstructions:
      node?.metadata?.audioInstructions ||
      config.audioInstructions ||
      defaultConfig.audioInstructions,
    count: String(
      node?.metadata?.count ||
        (mode === 'image' ? config.canvasImageCount || config.count : config.count) ||
        defaultConfig.count,
    ),
  };
}

export function resetInterruptedGeneration(nodes: CanvasNodeData[]) {
  return nodes.map((node) =>
    node.metadata?.status === 'loading'
      ? {
          ...node,
          metadata: {
            ...node.metadata,
            status: 'error' as const,
            errorDetails: '页面刷新后生成已中断，请重新生成。',
          },
        }
      : node,
  );
}

export function isGenerationCanceled(error: unknown) {
  return error instanceof Error && (error.message === '请求已取消' || error.name === 'AbortError');
}

export function findRetrySourceNode(
  nodeId: string,
  nodes: CanvasNodeData[],
  connections: CanvasConnection[],
) {
  const queue = connections
    .filter((connection) => connection.toNodeId === nodeId)
    .map((connection) => connection.fromNodeId);
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = nodes.find((item) => item.id === id);
    if (node?.type === CanvasNodeType.Config) return node;
    connections
      .filter((connection) => connection.toNodeId === id)
      .forEach((connection) => queue.push(connection.fromNodeId));
  }
  return null;
}

export function sourceNodeReferenceImages(node: CanvasNodeData | null) {
  if (!node || node.type !== CanvasNodeType.Image || !node.metadata?.content) return [];
  return [
    {
      id: node.id,
      name: `${node.title || node.id}.png`,
      type: node.metadata.mimeType || 'image/png',
      dataUrl: node.metadata.content,
      storageKey: node.metadata.storageKey,
    },
  ];
}

export function isAudioFile(file: File) {
  return file.type.startsWith('audio/') || /\.(mp3|wav)$/i.test(file.name);
}

export function isHiddenBatchChild(
  node: CanvasNodeData,
  nodes: CanvasNodeLookup,
  collapsingBatchIds?: Set<string>,
) {
  const rootId = node.metadata?.batchRootId;
  if (!rootId) return false;
  const root = getCanvasNodeById(nodes, rootId);
  if (root && collapsingBatchIds?.has(rootId)) return false;
  return Boolean(root && !root.metadata?.imageBatchExpanded);
}

export function isHiddenBatchConnectionEndpoint(node: CanvasNodeData, nodes: CanvasNodeLookup) {
  const rootId = node.metadata?.batchRootId;
  if (!rootId) return false;
  const root = getCanvasNodeById(nodes, rootId);
  return Boolean(root && !root.metadata?.imageBatchExpanded);
}

export function buildAngleLabel(params: CanvasImageAngleParams) {
  const horizontal =
    params.horizontalAngle === 0
      ? '正面视角'
      : params.horizontalAngle > 0
        ? `向右旋转 ${params.horizontalAngle} 度`
        : `向左旋转 ${Math.abs(params.horizontalAngle)} 度`;
  const pitch =
    params.pitchAngle === 0
      ? '水平视角'
      : params.pitchAngle > 0
        ? `俯视 ${params.pitchAngle} 度`
        : `仰视 ${Math.abs(params.pitchAngle)} 度`;
  return `AI 多角度：${horizontal}，${pitch}，镜头距离 ${params.cameraDistance.toFixed(1)}，${params.wideAngle ? '广角' : '标准'}镜头`;
}

export function buildAnglePrompt(params: CanvasImageAngleParams) {
  return `基于参考图重新生成同一主体的新视角，保持主体、颜色、材质和画面风格一致，不要只做透视变形。${buildAngleLabel(params)}。`;
}
