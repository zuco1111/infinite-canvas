'use client';

import { create } from 'zustand';

import { nanoid } from 'nanoid';
import { cleanupUnusedRegisteredResourceBlobs } from '@/shared/storage/resource-usage-registry';
import type { Asset } from '../domain/asset';
import { assetRepository } from '../repositories/asset-repository';

type AssetStore = {
  hydrated: boolean;
  assets: Asset[];
  hydrate: () => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAsset: (id: string, patch: Partial<Omit<Asset, 'id' | 'createdAt'>>) => void;
  removeAsset: (id: string) => void;
  replaceAssets: (assets: Asset[]) => void;
  cleanupImages: (extra?: unknown) => void;
};

let hydrationPromise: Promise<void> | null = null;

export const useAssetStore = create<AssetStore>()((set, get) => ({
  hydrated: false,
  assets: [],
  hydrate: async () => {
    await hydrateAssets();
  },
  addAsset: (asset) => {
    const now = new Date().toISOString();
    const id = nanoid();
    const assets = [{ ...asset, id, createdAt: now, updatedAt: now } as Asset, ...get().assets];
    setAndPersistAssets(assets);
    return id;
  },
  updateAsset: (id, patch) =>
    setAndPersistAssets(
      get().assets.map((asset) =>
        asset.id === id
          ? ({ ...asset, ...patch, updatedAt: new Date().toISOString() } as Asset)
          : asset,
      ),
    ),
  removeAsset: (id) => {
    const assets = get().assets.filter((asset) => asset.id !== id);
    setAndPersistAssets(assets, { cleanupAfterSave: true });
  },
  replaceAssets: (assets) => setAndPersistAssets(assets),
  cleanupImages: (extra) => {
    window.setTimeout(() => {
      void cleanupUnusedRegisteredResourceBlobs({ assets: get().assets, extra });
    }, 0);
  },
}));

export function hydrateAssets() {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = assetRepository.list().then((assets) => {
    useAssetStore.setState({ assets, hydrated: true });
  });
  return hydrationPromise;
}

function setAndPersistAssets(assets: Asset[], options: { cleanupAfterSave?: boolean } = {}) {
  useAssetStore.setState({ assets });
  void assetRepository.replace(assets).then(() => {
    if (options.cleanupAfterSave) {
      return cleanupUnusedRegisteredResourceBlobs({ assets });
    }
    return undefined;
  });
}

if (typeof window !== 'undefined') {
  assetRepository.subscribe((assets) => {
    useAssetStore.setState({ assets, hydrated: true });
  });
  void hydrateAssets();
}
