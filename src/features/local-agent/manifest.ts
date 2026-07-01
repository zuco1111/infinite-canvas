import type { FeatureManifest } from '../../app/feature-registry/feature-manifest';

export const localAgentFeatureManifest = {
  id: 'local-agent',
  title: '本地 Agent',
  commands: [
    { id: 'local-agent.connect', title: '连接本地 Agent', handler: () => undefined },
    { id: 'local-agent.apply-ops', title: '应用本地 Agent 操作', handler: () => undefined },
  ],
  storageDomains: [{ id: 'local-agent', title: '本地 Agent 设置' }],
  dependencies: ['canvas', 'assistant'],
} satisfies FeatureManifest;
