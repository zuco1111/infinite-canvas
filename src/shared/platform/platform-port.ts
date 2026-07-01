export type PlatformRuntime = 'web' | 'electron';

export type LocalAgentStatus = {
  available: boolean;
  running: boolean;
  url: string;
  token: string;
  pid?: number;
  error?: string;
};

export type PlatformPort = {
  runtime: PlatformRuntime;
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  getLocalAgentStatus: () => Promise<LocalAgentStatus>;
  startLocalAgent: () => Promise<LocalAgentStatus>;
  stopLocalAgent: () => Promise<LocalAgentStatus>;
};
