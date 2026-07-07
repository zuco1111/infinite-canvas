import type {
  BackgroundTaskContribution,
  FeatureManifest,
  NodeTypeContribution,
  RouteContribution,
  SettingsContribution,
  StorageDomainContribution,
  ToolbarContribution,
} from '@/shared/features';
import type { CommandContribution } from '@/shared/commands/command-contract';

export type FeatureRegistry = {
  listAll: () => FeatureManifest[];
  listEnabled: () => FeatureManifest[];
  listRoutes: () => RouteContribution[];
  listToolbarItems: () => ToolbarContribution[];
  listNodeTypes: () => NodeTypeContribution[];
  listCommands: () => CommandContribution[];
  listStorageDomains: () => StorageDomainContribution[];
  listSettingsPanels: () => SettingsContribution[];
  listBackgroundTasks: () => BackgroundTaskContribution[];
  get: (featureId: string) => FeatureManifest | undefined;
};

export function createFeatureRegistry(
  manifests: readonly FeatureManifest[],
  enabledFeatureIds: readonly string[],
): FeatureRegistry {
  const allManifests = [...manifests];
  const manifestsById = new Map(allManifests.map((manifest) => [manifest.id, manifest]));
  const enabledSet = new Set(enabledFeatureIds);

  for (const enabledFeatureId of enabledFeatureIds) {
    if (!manifestsById.has(enabledFeatureId)) {
      throw new Error(`Enabled feature is not registered: ${enabledFeatureId}`);
    }
  }

  const enabledManifests = allManifests.filter((manifest) => enabledSet.has(manifest.id));

  for (const manifest of enabledManifests) {
    for (const dependencyId of manifest.dependencies ?? []) {
      if (!enabledSet.has(dependencyId)) {
        throw new Error(`Feature "${manifest.id}" requires disabled dependency "${dependencyId}"`);
      }
    }
  }

  return {
    listAll: () => [...allManifests],
    listEnabled: () => [...enabledManifests],
    listRoutes: () => enabledManifests.flatMap((manifest) => manifest.routes ?? []),
    listToolbarItems: () => enabledManifests.flatMap((manifest) => manifest.toolbarItems ?? []),
    listNodeTypes: () => enabledManifests.flatMap((manifest) => manifest.nodeTypes ?? []),
    listCommands: () => enabledManifests.flatMap((manifest) => manifest.commands ?? []),
    listStorageDomains: () => enabledManifests.flatMap((manifest) => manifest.storageDomains ?? []),
    listSettingsPanels: () => enabledManifests.flatMap((manifest) => manifest.settingsPanels ?? []),
    listBackgroundTasks: () =>
      enabledManifests.flatMap((manifest) => manifest.backgroundTasks ?? []),
    get: (featureId) => manifestsById.get(featureId),
  };
}
