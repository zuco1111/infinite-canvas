import { localForageStorage } from '@/shared/storage/localforage-storage';
import { uploadImage, resolveImageUrl } from '@/shared/storage/image-storage';
import { resolveMediaUrl } from '@/shared/storage/file-storage';
import { collectResourceStorageKeys } from '@/shared/storage/resource-usage';
import { registerResourceUsageCollector } from '@/shared/storage/resource-usage-registry';
import type { Asset } from '../domain/asset';

const ASSETS_KEY = 'infinite-canvas:assets';

type AssetsPayload = {
  version: 1;
  assets: Asset[];
};

export type AssetRepository = {
  list: () => Promise<Asset[]>;
  get: (assetId: string) => Promise<Asset | null>;
  save: (asset: Asset) => Promise<void>;
  remove: (assetId: string) => Promise<void>;
  replace: (assets: Asset[]) => Promise<void>;
  collectResourceKeys: () => Promise<Set<string>>;
  subscribe: (listener: (assets: Asset[]) => void) => () => void;
};

const listeners = new Set<(assets: Asset[]) => void>();

export const assetRepository: AssetRepository = {
  list: readAssets,
  get: async (assetId) => (await readAssets()).find((asset) => asset.id === assetId) ?? null,
  save: async (asset) => {
    const assets = await readAssets();
    const nextAssets = assets.some((item) => item.id === asset.id)
      ? assets.map((item) => (item.id === asset.id ? asset : item))
      : [asset, ...assets];
    await writeAssets(nextAssets);
  },
  remove: async (assetId) => {
    await writeAssets((await readAssets()).filter((asset) => asset.id !== assetId));
  },
  replace: writeAssets,
  collectResourceKeys: async () => collectResourceStorageKeys(await readAssets()),
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

registerResourceUsageCollector({
  id: 'assets',
  collect: assetRepository.collectResourceKeys,
});

async function readAssets() {
  const value = await localForageStorage.getItem(ASSETS_KEY);
  if (!value) return [];
  const payload = JSON.parse(value) as Partial<AssetsPayload>;
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  return Promise.all(assets.map(hydrateAsset));
}

async function writeAssets(assets: Asset[]) {
  const payload: AssetsPayload = { version: 1, assets: assets.map(serializeAsset) };
  await localForageStorage.setItem(ASSETS_KEY, JSON.stringify(payload));
  listeners.forEach((listener) => listener(assets));
}

async function hydrateAsset(asset: Asset): Promise<Asset> {
  if (asset.kind === 'image' && asset.data.storageKey) {
    const dataUrl = await resolveImageUrl(asset.data.storageKey, asset.data.dataUrl);
    return {
      ...asset,
      coverUrl: !asset.coverUrl || asset.coverUrl.startsWith('blob:') ? dataUrl : asset.coverUrl,
      data: { ...asset.data, dataUrl },
    };
  }
  if (asset.kind === 'image' && asset.data.dataUrl.startsWith('data:image/')) {
    const image = await uploadImage(asset.data.dataUrl);
    return {
      ...asset,
      coverUrl: asset.coverUrl.startsWith('data:image/') ? image.url : asset.coverUrl,
      data: {
        ...asset.data,
        dataUrl: image.url,
        storageKey: image.storageKey,
        bytes: image.bytes,
        mimeType: image.mimeType,
      },
    };
  }
  if (asset.kind === 'video' && asset.data.storageKey) {
    const url = await resolveMediaUrl(asset.data.storageKey, asset.data.url);
    return {
      ...asset,
      coverUrl: !asset.coverUrl || asset.coverUrl.startsWith('blob:') ? url : asset.coverUrl,
      data: { ...asset.data, url },
    };
  }
  return asset;
}

function serializeAsset(asset: Asset): Asset {
  if (asset.kind === 'image' && asset.data.storageKey) {
    return {
      ...asset,
      coverUrl: asset.coverUrl.startsWith('blob:') ? '' : asset.coverUrl,
      data: { ...asset.data, dataUrl: '' },
    };
  }
  if (asset.kind === 'video' && asset.data.storageKey) {
    return {
      ...asset,
      coverUrl: asset.coverUrl.startsWith('blob:') ? '' : asset.coverUrl,
      data: { ...asset.data, url: '' },
    };
  }
  return asset;
}
