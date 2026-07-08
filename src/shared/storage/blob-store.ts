'use client';

import localforage from 'localforage';
import { nanoid } from 'nanoid';

export type ResourceBlobPrefix =
  'image' | 'video' | 'audio' | 'file' | 'video-reference' | 'audio-reference';

export type ResourceBlobRecord = {
  storageKey: string;
  blob: Blob;
};

const resourceBlobStore = localforage.createInstance({
  name: 'infinite-canvas',
  storeName: 'resource_blobs',
});

const objectUrls = new Map<string, string>();

export function createResourceStorageKey(prefix: ResourceBlobPrefix) {
  return `${prefix}:${nanoid()}`;
}

export async function putResourceBlob(storageKey: string, blob: Blob) {
  await resourceBlobStore.setItem(storageKey, blob);
  return cacheObjectUrl(storageKey, blob);
}

export async function getResourceBlob(storageKey: string) {
  return resourceBlobStore.getItem<Blob>(storageKey);
}

export async function resolveResourceBlobUrl(storageKey?: string, fallback = '') {
  if (!storageKey) return fallback;
  const cached = objectUrls.get(storageKey);
  if (cached) return cached;
  const blob = await getResourceBlob(storageKey);
  if (!blob) return fallback;
  return cacheObjectUrl(storageKey, blob);
}

async function removeResourceBlobs(keys: Iterable<string>) {
  await Promise.all(
    Array.from(new Set(keys)).map(async (key) => {
      revokeObjectUrl(key);
      await resourceBlobStore.removeItem(key);
    }),
  );
}

async function listResourceBlobKeys() {
  const keys: string[] = [];
  await resourceBlobStore.iterate((_value, key) => {
    keys.push(key);
  });
  return keys;
}

export async function cleanupUnusedResourceBlobs(usedKeys: Iterable<string>) {
  const used = new Set(usedKeys);
  const keys = await listResourceBlobKeys();
  await removeResourceBlobs(keys.filter((key) => !used.has(key)));
}

function cacheObjectUrl(storageKey: string, blob: Blob) {
  revokeObjectUrl(storageKey);
  const url = URL.createObjectURL(blob);
  objectUrls.set(storageKey, url);
  return url;
}

function revokeObjectUrl(storageKey: string) {
  const url = objectUrls.get(storageKey);
  if (url) URL.revokeObjectURL(url);
  objectUrls.delete(storageKey);
}
