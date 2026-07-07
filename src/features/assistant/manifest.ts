import type { FeatureManifest } from '@/shared/features';

export const assistantFeatureManifest = {
  id: 'assistant',
  title: '在线助手',
  commands: [{ id: 'assistant.open', title: '打开在线助手', handler: () => undefined }],
  storageDomains: [{ id: 'assistant-sessions', title: '助手会话' }],
  dependencies: ['canvas', 'generation', 'settings'],
} satisfies FeatureManifest;
