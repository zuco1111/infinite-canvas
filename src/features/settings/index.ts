export { settingsFeatureManifest } from './manifest';
export { settingsRepository, type SettingsRepository } from './repositories/settings-repository';
export { AppConfigModal } from './components/app-config-modal';
export { ModelPicker } from './components/model-picker';
export { UserStatusActions } from './components/user-status-actions';
export {
  useAiConfig,
  useAppTheme,
  useCurrentUser,
  useIsAiConfigReady,
  useOpenConfigDialog,
  useSetAppTheme,
  useUpdateAiConfig,
  type UpdateAiConfig,
} from './hooks/use-settings-ports';
export {
  buildApiUrl,
  createModelChannel,
  defaultBaseUrlForApiFormat,
  defaultConfig,
  defaultWebdavSyncConfig,
  encodeChannelModel,
  filterModelsByCapability,
  modelOptionLabel,
  modelOptionName,
  modelOptionsFromChannels,
  normalizeModelOptionValue,
  resolveModelChannel,
  resolveModelRequestConfig,
  selectableModelsByCapability,
  hydrateConfigSettings,
  useEffectiveConfig,
  type AiConfig,
  type ApiCallFormat,
  type ModelCapability,
  type ModelChannel,
  type WebdavSyncConfig,
} from './stores/use-config-store';
export { hydrateThemeSettings, type ThemeName } from './stores/use-theme-store';
export type { LocalUser } from './stores/use-user-store';
