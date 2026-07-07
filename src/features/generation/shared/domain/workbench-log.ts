import { nanoid } from 'nanoid';

import { resolveMediaUrl } from '@/shared/storage/file-storage';
import { resolveImageUrl } from '@/shared/storage/image-storage';
import type { ReferenceImage } from '@/types/image';
import type { ReferenceAudio, ReferenceVideo } from '@/types/media';

export type WorkbenchLogBase<TConfig, TStatus extends string> = {
  id: string;
  createdAt: number;
  title: string;
  prompt: string;
  time: string;
  model: string;
  config: TConfig;
  durationMs: number;
  status: TStatus;
};

export function createWorkbenchLogBase<TConfig, TStatus extends string>({
  prompt,
  model,
  config,
  durationMs,
  status,
}: {
  prompt: string;
  model: string;
  config: TConfig;
  durationMs: number;
  status: TStatus;
}): WorkbenchLogBase<TConfig, TStatus> {
  return {
    id: nanoid(),
    createdAt: Date.now(),
    title: buildWorkbenchLogTitle(prompt),
    prompt,
    time: formatWorkbenchLogTime(),
    model,
    config,
    durationMs,
    status,
  };
}

export function buildWorkbenchLogTitle(prompt: string) {
  return prompt.slice(0, 12) || '未命名';
}

export function formatWorkbenchLogTime() {
  return new Date().toLocaleString('zh-CN', { hour12: false });
}

export function sortWorkbenchLogsByCreatedAt<TLog extends { createdAt?: number }>(logs: TLog[]) {
  return [...logs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function hydrateReferenceImages(items: ReferenceImage[] = []) {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      dataUrl: await resolveImageUrl(item.storageKey, item.dataUrl),
    })),
  );
}

export function serializeReferenceImages(items: ReferenceImage[] = []) {
  return items.map((item) => ({
    ...item,
    dataUrl: item.storageKey ? '' : item.dataUrl,
  }));
}

export async function hydrateStoredImages<TImage extends { storageKey?: string; dataUrl: string }>(
  items: TImage[] = [],
) {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      dataUrl: await resolveImageUrl(item.storageKey, item.dataUrl),
    })),
  );
}

export function serializeStoredImages<TImage extends { storageKey?: string; dataUrl: string }>(
  items: TImage[] = [],
) {
  return items.map((item) => ({
    ...item,
    dataUrl: item.storageKey ? '' : item.dataUrl,
  }));
}

export async function hydrateReferenceVideos(items: ReferenceVideo[] = []) {
  return hydrateStoredMediaItems(items);
}

export function serializeReferenceVideos(items: ReferenceVideo[] = []) {
  return serializeStoredMediaItems(items);
}

export async function hydrateReferenceAudios(items: ReferenceAudio[] = []) {
  return hydrateStoredMediaItems(items);
}

export function serializeReferenceAudios(items: ReferenceAudio[] = []) {
  return serializeStoredMediaItems(items);
}

export async function hydrateStoredMediaItem<TMedia extends { storageKey?: string; url: string }>(
  item: TMedia | undefined,
) {
  if (!item) return undefined;
  return {
    ...item,
    url: item.storageKey ? await resolveMediaUrl(item.storageKey, item.url) : item.url,
  };
}

export async function hydrateStoredMediaItems<TMedia extends { storageKey?: string; url: string }>(
  items: TMedia[] = [],
) {
  return Promise.all(items.map(hydrateStoredMediaItem)) as Promise<TMedia[]>;
}

export function serializeStoredMediaItem<TMedia extends { storageKey?: string; url: string }>(
  item: TMedia | undefined,
) {
  if (!item) return undefined;
  return item.storageKey ? { ...item, url: '' } : item;
}

export function serializeStoredMediaItems<TMedia extends { storageKey?: string; url: string }>(
  items: TMedia[] = [],
) {
  return items.map(serializeStoredMediaItem) as TMedia[];
}
