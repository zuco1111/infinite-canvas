'use client';

import { readImageMeta } from '@/shared/media/image-utils';
import {
  cleanupUnusedResourceBlobs,
  createResourceStorageKey,
  getResourceBlob,
  putResourceBlob,
  removeResourceBlobs,
  resolveResourceBlobUrl,
} from './blob-store';
import { collectResourceStorageKeys } from './resource-usage';
import { maybeProxyRemoteUrl } from '@/shared/platform/remote-proxy';

export type UploadedImage = {
  url: string;
  storageKey: string;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

export async function uploadImage(input: string | Blob): Promise<UploadedImage> {
  const blob = typeof input === 'string' ? await imageSourceToBlob(input) : input;
  const storageKey = createResourceStorageKey('image');
  const url = await putResourceBlob(storageKey, blob);
  const meta = await readImageMeta(url);
  return {
    url,
    storageKey,
    width: meta.width,
    height: meta.height,
    bytes: blob.size,
    mimeType: blob.type || meta.mimeType,
  };
}

async function imageSourceToBlob(input: string) {
  if (input.startsWith('data:')) return dataUrlToBlob(input);
  return fetchImageBlob(input);
}

function dataUrlToBlob(dataUrl: string) {
  const [header, content] = dataUrl.split(',', 2);
  const mimeType = header.match(/^data:([^;]+)/)?.[1] || 'image/png';
  const binary = atob(content || '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function resolveImageUrl(storageKey?: string, fallback = '') {
  return resolveResourceBlobUrl(storageKey, fallback);
}

export async function getImageBlob(storageKey: string) {
  return getResourceBlob(storageKey);
}

export async function setImageBlob(storageKey: string, blob: Blob) {
  return putResourceBlob(storageKey, blob);
}

export async function imageToDataUrl(image: {
  url?: string;
  dataUrl?: string;
  storageKey?: string;
}) {
  if (image.dataUrl?.startsWith('data:')) return image.dataUrl;

  if (image.storageKey) {
    const blob = await getImageBlob(image.storageKey);
    if (blob) return blobToDataUrl(blob);
  }

  const storedUrl = await resolveImageUrl(image.storageKey, image.url || '');
  const url = image.dataUrl || storedUrl;
  if (!url) return url;

  try {
    return blobToDataUrl(await fetchImageBlob(url));
  } catch (error) {
    if (!storedUrl || storedUrl === url) throw error;
    return blobToDataUrl(await fetchImageBlob(storedUrl));
  }
}

async function fetchImageBlob(url: string) {
  const response = await fetch(proxiedImageUrl(url));
  if (!response.ok) throw new Error(`读取图片失败：${response.status}`);
  return response.blob();
}

function proxiedImageUrl(url: string) {
  return maybeProxyRemoteUrl(url, 'resource');
}

export async function deleteStoredImages(keys: Iterable<string>) {
  await removeResourceBlobs(keys);
}

export async function cleanupUnusedImages(usedData: unknown) {
  await cleanupUnusedResourceBlobs(collectImageStorageKeys(usedData));
}

export function collectImageStorageKeys(value: unknown, keys = new Set<string>()) {
  const allKeys = collectResourceStorageKeys(value, keys);
  return new Set(Array.from(allKeys).filter((key) => key.startsWith('image:')));
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(blob);
  });
}
