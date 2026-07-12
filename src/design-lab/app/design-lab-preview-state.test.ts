import { describe, expect, it } from 'vitest';

import {
  createDesignLabPreviewMessage,
  createDesignLabPreviewUrl,
  isDesignLabPreviewMessage,
  readDesignLabPreviewState,
} from './design-lab-preview-state';

describe('Design Lab preview state protocol', () => {
  it('round-trips theme and motion-freeze state through the preview URL', () => {
    const url = createDesignLabPreviewUrl({ theme: 'dark', motionFreeze: true });

    expect(url).toBe('./design-lab-preview.html?theme=dark&motionFreeze=true');
    expect(readDesignLabPreviewState(new URL(url, 'http://localhost').search)).toEqual({
      theme: 'dark',
      motionFreeze: true,
    });
  });

  it('uses deterministic safe defaults for unsupported query values', () => {
    expect(readDesignLabPreviewState('?theme=system&motionFreeze=unknown')).toEqual({
      theme: 'light',
      motionFreeze: false,
    });
  });

  it('reads the legacy initial reduced-motion query without emitting it', () => {
    expect(readDesignLabPreviewState('?theme=dark&reducedMotion=reduce')).toEqual({
      theme: 'dark',
      motionFreeze: true,
    });
    expect(
      readDesignLabPreviewState('?theme=dark&motionFreeze=false&reducedMotion=reduce'),
    ).toEqual({
      theme: 'dark',
      motionFreeze: false,
    });
  });

  it('accepts only the same protocol message shape used by the preview frame', () => {
    const message = createDesignLabPreviewMessage({ theme: 'light', motionFreeze: false });

    expect(isDesignLabPreviewMessage(message)).toBe(true);
    expect(isDesignLabPreviewMessage({ ...message, theme: 'system' })).toBe(false);
    expect(isDesignLabPreviewMessage({ ...message, motionFreeze: 'true' })).toBe(false);
    expect(isDesignLabPreviewMessage({ ...message, channel: 'other' })).toBe(false);
    expect(isDesignLabPreviewMessage(null)).toBe(false);
  });
});
