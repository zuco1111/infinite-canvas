import { nanoid } from 'nanoid';

import { uploadMediaFile } from '@/shared/storage/file-storage';
import { uploadImage } from '@/shared/storage/image-storage';
import type { ReferenceImage } from '@/shared/media/reference-types';
import type { ReferenceAudio, ReferenceVideo } from '@/shared/media/reference-types';

export type ReferenceUploadLimits = {
  images: number;
  videos: number;
  audios: number;
  imageMaxBytes: number;
  videoMaxBytes: number;
  audioMaxBytes: number;
};

export async function createImageReferencesFromFiles(files: File[]) {
  return Promise.all(files.map((file) => createImageReference(file, file.name)));
}

export async function createImageReferencesFromBlobs(blobs: Blob[], namePrefix = 'clipboard') {
  return Promise.all(
    blobs.map((blob, index) => createImageReference(blob, `${namePrefix}-${index + 1}.png`)),
  );
}

export async function readClipboardImageBlobs(clipboard: Clipboard = navigator.clipboard) {
  const items = await clipboard.read();
  return Promise.all(
    items.flatMap((item) =>
      item.types.filter((type) => type.startsWith('image/')).map((type) => item.getType(type)),
    ),
  );
}

export async function createVideoReferencesFromFiles(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      const video = await uploadMediaFile(file, 'video-reference');
      return {
        id: nanoid(),
        name: file.name,
        type: video.mimeType,
        url: video.url,
        storageKey: video.storageKey,
        bytes: video.bytes,
        width: video.width,
        height: video.height,
        durationMs: video.durationMs,
      } satisfies ReferenceVideo;
    }),
  );
}

export async function createAudioReferencesFromFiles(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      const audio = await uploadMediaFile(file, 'audio-reference');
      return {
        id: nanoid(),
        name: file.name,
        type: audio.mimeType,
        url: audio.url,
        storageKey: audio.storageKey,
        durationMs: audio.durationMs,
      } satisfies ReferenceAudio;
    }),
  );
}

export function isSupportedAudioReferenceFile(file: File) {
  return (
    file.type === 'audio/mpeg' ||
    file.type === 'audio/mp3' ||
    file.type === 'audio/wav' ||
    file.type === 'audio/x-wav' ||
    /\.(mp3|wav)$/i.test(file.name)
  );
}

export function filterAudioReferencesByDuration(
  existing: ReferenceAudio[],
  next: ReferenceAudio[],
  warn: (content: string) => void,
) {
  let total = existing.reduce((sum, item) => sum + (item.durationMs || 0), 0);
  const accepted: ReferenceAudio[] = [];
  let skipped = false;
  for (const item of next) {
    if (item.durationMs && (item.durationMs < 2000 || item.durationMs > 15000)) {
      skipped = true;
      continue;
    }
    if (item.durationMs && total + item.durationMs > 15000) {
      skipped = true;
      continue;
    }
    total += item.durationMs || 0;
    accepted.push(item);
  }
  if (skipped) warn('已忽略不符合时长要求的参考音频：单个 2-15 秒，总时长不超过 15 秒');
  return accepted;
}

export function pickSeedanceReferenceFiles(
  files: File[],
  limits: ReferenceUploadLimits,
  counts: { images: number; videos: number; audios: number },
) {
  return {
    unsupported: files.filter(
      (file) =>
        !file.type.startsWith('image/') &&
        !file.type.startsWith('video/') &&
        !isSupportedAudioReferenceFile(file),
    ),
    oversizedImages: files.filter(
      (file) => file.type.startsWith('image/') && file.size > limits.imageMaxBytes,
    ),
    oversizedVideos: files.filter(
      (file) => file.type.startsWith('video/') && file.size > limits.videoMaxBytes,
    ),
    oversizedAudios: files.filter(
      (file) => isSupportedAudioReferenceFile(file) && file.size > limits.audioMaxBytes,
    ),
    imageFiles: files
      .filter((file) => file.type.startsWith('image/') && file.size <= limits.imageMaxBytes)
      .slice(0, limits.images - counts.images),
    videoFiles: files
      .filter((file) => file.type.startsWith('video/') && file.size <= limits.videoMaxBytes)
      .slice(0, limits.videos - counts.videos),
    audioFiles: files
      .filter((file) => isSupportedAudioReferenceFile(file) && file.size <= limits.audioMaxBytes)
      .slice(0, limits.audios - counts.audios),
  };
}

async function createImageReference(blob: Blob, name: string): Promise<ReferenceImage> {
  const image = await uploadImage(blob);
  return {
    id: nanoid(),
    name,
    type: image.mimeType,
    dataUrl: image.url,
    storageKey: image.storageKey,
  };
}
