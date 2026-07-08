import { describe, expect, it } from 'vitest';

import { resolvePromptCoverUrl } from '../domain/prompt-cover';

describe('resolvePromptCoverUrl', () => {
  it('keeps a normal cover image', () => {
    expect(
      resolvePromptCoverUrl({
        coverUrl: 'https://example.com/cover.jpg',
        preview: '![](https://img.shields.io/badge/Language-EN-blue)',
      }),
    ).toBe('https://example.com/cover.jpg');
  });

  it('uses the first non-badge preview image when coverUrl is a badge', () => {
    expect(
      resolvePromptCoverUrl({
        coverUrl: 'https://img.shields.io/badge/Language-EN-blue',
        preview:
          '![](https://img.shields.io/badge/Language-EN-blue)\n\n![](https://example.com/preview.png)',
      }),
    ).toBe('https://example.com/preview.png');
  });

  it('omits the cover when only badge images are available', () => {
    expect(
      resolvePromptCoverUrl({
        coverUrl: 'https://img.shields.io/badge/Language-EN-blue',
        preview:
          '![](https://img.shields.io/badge/Language-EN-blue)\n\n![](https://img.shields.io/badge/Raycast-Friendly-purple)',
      }),
    ).toBeUndefined();
  });
});
