'use client';

import {
  cleanupUnusedResourceBlobs,
  createResourceStorageKey,
  getResourceBlob,
  putResourceBlob,
  removeResourceBlobs,
  resolveResourceBlobUrl,
} from './blob-store';
import { collectResourceStorageKeys } from './resource-usage';

export type UploadedFile = {
  url: string;
  storageKey: string;
  bytes: number;
  mimeType: string;
  width?: number;
  height?: number;
  durationMs?: number;
};

export async function uploadMediaFile(
  input: string | Blob,
  prefix = 'file',
): Promise<UploadedFile> {
  const blob = typeof input === 'string' ? await (await fetch(input)).blob() : input;
  const storageKey = createResourceStorageKey(
    prefix as 'file' | 'video' | 'audio' | 'video-reference' | 'audio-reference',
  );
  const url = await putResourceBlob(storageKey, blob);
  const meta = blob.type.startsWith('video/')
    ? await readVideoMeta(url)
    : blob.type.startsWith('audio/')
      ? await readAudioMeta(url)
      : {};
  return {
    url,
    storageKey,
    bytes: blob.size,
    mimeType: blob.type || 'application/octet-stream',
    ...meta,
  };
}

export async function resolveMediaUrl(storageKey?: string, fallback = '') {
  return resolveResourceBlobUrl(storageKey, fallback);
}

export async function getMediaBlob(storageKey: string) {
  return getResourceBlob(storageKey);
}

export async function setMediaBlob(storageKey: string, blob: Blob) {
  return putResourceBlob(storageKey, blob);
}

export async function deleteStoredMedia(keys: Iterable<string>) {
  await removeResourceBlobs(keys);
}

export async function cleanupUnusedMedia(usedData: unknown) {
  await cleanupUnusedResourceBlobs(collectMediaStorageKeys(usedData));
}

export function collectMediaStorageKeys(value: unknown, keys = new Set<string>()) {
  const allKeys = collectResourceStorageKeys(value, keys);
  return new Set(Array.from(allKeys).filter((key) => !key.startsWith('image:')));
}

function readVideoMeta(url: string) {
  return new Promise<{ width: number; height: number; durationMs?: number }>((resolve) => {
    const video = document.createElement('video');
    const done = () =>
      resolve({
        width: video.videoWidth || 1280,
        height: video.videoHeight || 720,
        durationMs: Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : undefined,
      });
    video.onloadedmetadata = done;
    video.onerror = done;
    video.src = url;
  });
}

function readAudioMeta(url: string) {
  return new Promise<{ durationMs?: number }>((resolve) => {
    const audio = document.createElement('audio');
    const done = () =>
      resolve({
        durationMs: Number.isFinite(audio.duration) ? Math.round(audio.duration * 1000) : undefined,
      });
    audio.onloadedmetadata = done;
    audio.onerror = done;
    audio.src = url;
  });
}
