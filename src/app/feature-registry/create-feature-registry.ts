import type { FeatureManifest, RouteContribution } from './feature-manifest';

export type FeatureRegistry = {
  listAll: () => FeatureManifest[];
  listEnabled: () => FeatureManifest[];
  listRoutes: () => RouteContribution[];
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
    get: (featureId) => manifestsById.get(featureId),
  };
}
