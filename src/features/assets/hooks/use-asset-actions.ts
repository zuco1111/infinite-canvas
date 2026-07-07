'use client';

import { useAssetStore } from '../stores/use-asset-store';

export function useAddAsset() {
  return useAssetStore((state) => state.addAsset);
}

export function useCleanupAssetResources() {
  return useAssetStore((state) => state.cleanupImages);
}
