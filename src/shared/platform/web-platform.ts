import type { PlatformPort } from './platform-port';

export const webPlatform: PlatformPort = {
  runtime: 'web',
  getAppVersion: async () => __APP_VERSION__,
  openExternal: async (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  },
  getLocalAgentStatus: async () => ({
    available: false,
    running: false,
    url: 'http://127.0.0.1:17371',
    token: '',
  }),
  startLocalAgent: async () => ({
    available: false,
    running: false,
    url: 'http://127.0.0.1:17371',
    token: '',
    error: 'Local Agent can only be started by the desktop adapter.',
  }),
  stopLocalAgent: async () => ({
    available: false,
    running: false,
    url: 'http://127.0.0.1:17371',
    token: '',
  }),
};
