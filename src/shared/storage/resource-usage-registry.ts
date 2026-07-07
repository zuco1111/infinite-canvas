import { cleanupUnusedResourceBlobs } from './blob-store';
import {
  collectResourceStorageKeys,
  collectResourceUsage,
  type ResourceUsageCollector,
} from './resource-usage';

const collectors = new Map<string, ResourceUsageCollector>();

export function registerResourceUsageCollector(collector: ResourceUsageCollector) {
  collectors.set(collector.id, collector);
  return () => collectors.delete(collector.id);
}

export async function collectRegisteredResourceUsage(extra?: unknown) {
  const keys = await collectResourceUsage(Array.from(collectors.values()));
  if (extra !== undefined) {
    collectResourceStorageKeys(extra, keys);
  }
  return keys;
}

export async function cleanupUnusedRegisteredResourceBlobs(extra?: unknown) {
  const usedKeys = await collectRegisteredResourceUsage(extra);
  await cleanupUnusedResourceBlobs(usedKeys);
}

export function clearResourceUsageCollectorsForTest() {
  collectors.clear();
}
