import { createFeatureRegistry } from './create-feature-registry';
import { enabledFeatureIds } from './features.config';
import type { FeatureManifest } from '@/shared/features';
import { assetsFeatureManifest } from '../../features/assets';
import { assistantFeatureManifest } from '../../features/assistant';
import { canvasFeatureManifest } from '../../features/canvas';
import { generationFeatureManifest } from '../../features/generation';
import { localAgentFeatureManifest } from '../../features/local-agent';
import { promptsFeatureManifest } from '../../features/prompts';
import { settingsFeatureManifest } from '../../features/settings';
import { syncFeatureManifest } from '../../features/sync';

export const availableFeatureManifests: FeatureManifest[] = [
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
export type { FeatureManifest, RouteContribution } from '@/shared/features';
export { createFeatureRegistry };
