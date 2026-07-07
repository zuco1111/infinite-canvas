import { afterEach, describe, expect, it } from 'vitest';

import {
  collectRegisteredResourceUsage,
  registerResourceUsageCollector,
} from './resource-usage-registry';
import { clearResourceUsageCollectorsForTest } from './resource-usage-registry';
import { collectResourceStorageKeys, isResourceStorageKey } from './resource-usage';

describe('resource usage collection', () => {
  afterEach(() => {
    clearResourceUsageCollectorsForTest();
  });

  it('collects resource storage keys from nested values', () => {
    const keys = collectResourceStorageKeys({
      image: { storageKey: 'image:one' },
      video: { storageKey: 'video:two' },
      model: 'default::gpt-image-2',
      nested: [{ value: 'audio-reference:three' }, { value: 'not-a-resource' }],
    });

    expect([...keys].sort()).toEqual(['audio-reference:three', 'image:one', 'video:two']);
  });

  it('identifies only supported resource storage keys', () => {
    expect(isResourceStorageKey('image:one')).toBe(true);
    expect(isResourceStorageKey('video-reference:one')).toBe(true);
    expect(isResourceStorageKey('default::gpt-image-2')).toBe(false);
  });

  it('combines registered collectors with extra in-flight usage', async () => {
    registerResourceUsageCollector({
      id: 'canvas',
      collect: () => ['image:canvas'],
    });
    registerResourceUsageCollector({
      id: 'assets',
      collect: async () => ['video:asset'],
    });

    const keys = await collectRegisteredResourceUsage({
      currentSession: { storageKey: 'audio:session' },
    });

    expect([...keys].sort()).toEqual(['audio:session', 'image:canvas', 'video:asset']);
  });
});
