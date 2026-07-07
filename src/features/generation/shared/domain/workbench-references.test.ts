import { describe, expect, it, vi } from 'vitest';

import {
  filterAudioReferencesByDuration,
  isSupportedAudioReferenceFile,
  pickSeedanceReferenceFiles,
} from './workbench-references';

describe('workbench-references', () => {
  it('classifies Seedance reference files by type, size, and remaining slots', () => {
    const files = [
      new File(['x'], 'ok.png', { type: 'image/png' }),
      new File([new Uint8Array(12)], 'large.png', { type: 'image/png' }),
      new File(['x'], 'clip.mp4', { type: 'video/mp4' }),
      new File(['x'], 'voice.wav', { type: 'audio/wav' }),
      new File(['x'], 'notes.txt', { type: 'text/plain' }),
    ];

    const picked = pickSeedanceReferenceFiles(
      files,
      { images: 2, videos: 1, audios: 1, imageMaxBytes: 4, videoMaxBytes: 4, audioMaxBytes: 4 },
      { images: 1, videos: 0, audios: 0 },
    );

    expect(picked.imageFiles.map((file) => file.name)).toEqual(['ok.png']);
    expect(picked.videoFiles.map((file) => file.name)).toEqual(['clip.mp4']);
    expect(picked.audioFiles.map((file) => file.name)).toEqual(['voice.wav']);
    expect(picked.oversizedImages.map((file) => file.name)).toEqual(['large.png']);
    expect(picked.unsupported.map((file) => file.name)).toEqual(['notes.txt']);
  });

  it('accepts mp3 and wav audio references by mime or extension', () => {
    expect(isSupportedAudioReferenceFile(new File(['x'], 'voice.mp3', { type: '' }))).toBe(true);
    expect(
      isSupportedAudioReferenceFile(new File(['x'], 'voice.wav', { type: 'audio/x-wav' })),
    ).toBe(true);
    expect(isSupportedAudioReferenceFile(new File(['x'], 'voice.aac', { type: 'audio/aac' }))).toBe(
      false,
    );
  });

  it('filters audio references outside the duration contract', () => {
    const warn = vi.fn();

    expect(
      filterAudioReferencesByDuration(
        [{ id: 'existing', name: 'existing', type: 'audio/wav', url: 'blob:a', durationMs: 5000 }],
        [
          { id: 'short', name: 'short', type: 'audio/wav', url: 'blob:b', durationMs: 1000 },
          { id: 'ok', name: 'ok', type: 'audio/wav', url: 'blob:c', durationMs: 3000 },
          { id: 'long-total', name: 'long', type: 'audio/wav', url: 'blob:d', durationMs: 9000 },
        ],
        warn,
      ).map((item) => item.id),
    ).toEqual(['ok']);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
