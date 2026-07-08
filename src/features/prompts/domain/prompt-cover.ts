import type { Prompt } from '../api/prompts-api';

export function resolvePromptCoverUrl(item: Pick<Prompt, 'coverUrl' | 'preview'>) {
  return [item.coverUrl, ...extractPreviewImageUrls(item.preview)].find(
    (url) => url && !isBadgeImageUrl(url),
  );
}

function extractPreviewImageUrls(value: string) {
  return Array.from(value.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g), (match) =>
    match[1].trim(),
  );
}

function isBadgeImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === 'img.shields.io' || url.hostname.endsWith('.shields.io');
  } catch {
    return value.includes('img.shields.io/');
  }
}
