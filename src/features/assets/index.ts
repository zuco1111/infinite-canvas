export { assetsFeatureManifest } from './manifest';
export { AssetPickerModal, type InsertAssetPayload } from './components/asset-picker-modal';
export { useAddAsset, useCleanupAssetResources } from './hooks/use-asset-actions';
export { hydrateAssets } from './stores/use-asset-store';
export { assetRepository, type AssetRepository } from './repositories/asset-repository';
export type { Asset, AssetKind } from './domain/asset';
export { exportAssets, readAssetPackage } from './domain/asset-transfer';
