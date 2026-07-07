/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROXY_PATH?: string;
  readonly VITE_RESOURCE_PROXY_PATH?: string;
}

type InfiniteCanvasPlatformBridge = {
  runtime: 'electron';
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  getLocalAgentStatus: () => Promise<{
    available: boolean;
    running: boolean;
    url: string;
    token: string;
    pid?: number;
    error?: string;
  }>;
  startLocalAgent: () => Promise<{
    available: boolean;
    running: boolean;
    url: string;
    token: string;
    pid?: number;
    error?: string;
  }>;
  stopLocalAgent: () => Promise<{
    available: boolean;
    running: boolean;
    url: string;
    token: string;
    pid?: number;
    error?: string;
  }>;
};

interface Window {
  infiniteCanvasPlatform?: InfiniteCanvasPlatformBridge;
}
