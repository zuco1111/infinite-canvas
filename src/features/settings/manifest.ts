import type { FeatureManifest } from '@/shared/features';

export const settingsFeatureManifest = {
  id: 'settings',
  title: '配置与用户偏好',
  settingsPanels: [
    { id: 'model-channels', title: '模型渠道' },
    { id: 'generation-preferences', title: '生成偏好' },
    { id: 'webdav-sync', title: 'WebDAV 同步' },
  ],
  storageDomains: [{ id: 'settings', title: '应用配置' }],
} satisfies FeatureManifest;
