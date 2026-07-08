const resourceStorageKeyPattern = /^(image|video|audio|file|video-reference|audio-reference):/;

export type ResourceUsageCollector = {
  id: string;
  collect: () => Promise<Iterable<string>> | Iterable<string>;
};

export async function collectResourceUsage(collectors: ResourceUsageCollector[]) {
  const keys = new Set<string>();
  for (const collector of collectors) {
    const collected = await collector.collect();
    for (const key of collected) {
      if (isResourceStorageKey(key)) keys.add(key);
    }
  }
  return keys;
}

export function collectResourceStorageKeys(value: unknown, keys = new Set<string>()) {
  if (typeof value === 'string') {
    if (isResourceStorageKey(value)) keys.add(value);
    return keys;
  }

  if (!value || typeof value !== 'object') return keys;

  if ('storageKey' in value && isResourceStorageKey(value.storageKey)) {
    keys.add(value.storageKey);
  }

  Object.values(value).forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((child) => collectResourceStorageKeys(child, keys));
      return;
    }
    collectResourceStorageKeys(item, keys);
  });

  return keys;
}

export function isResourceStorageKey(value: unknown): value is string {
  return typeof value === 'string' && resourceStorageKeyPattern.test(value);
}
