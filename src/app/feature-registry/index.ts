import { createFeatureRegistry } from './create-feature-registry';
import { enabledFeatureIds } from './features.config';
import type { FeatureManifest } from './feature-manifest';
import { assetsFeatureManifest } from '../../features/assets/manifest';
import { assistantFeatureManifest } from '../../features/assistant/manifest';
import { canvasFeatureManifest } from '../../features/canvas';
import { generationFeatureManifest } from '../../features/generation/manifest';
import { localAgentFeatureManifest } from '../../features/local-agent/manifest';
import { promptsFeatureManifest } from '../../features/prompts/manifest';
import { settingsFeatureManifest } from '../../features/settings/manifest';
import { syncFeatureManifest } from '../../features/sync/manifest';

const availableFeatureManifests: FeatureManifest[] = [
  settingsFeatureManifest,
  canvasFeatureManifest,
  generationFeatureManifest,
  assetsFeatureManifest,
  promptsFeatureManifest,
  assistantFeatureManifest,
  localAgentFeatureManifest,
  syncFeatureManifest,
];

export const featureRegistry = createFeatureRegistry(availableFeatureManifests, enabledFeatureIds);

export type { FeatureRegistry } from './create-feature-registry';
export type { FeatureManifest } from './feature-manifest';
export { createFeatureRegistry };
