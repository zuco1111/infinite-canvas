import type { PlatformPort } from './platform-port';

export function createElectronPlatform(bridge: InfiniteCanvasPlatformBridge): PlatformPort {
  return {
    runtime: bridge.runtime,
    getAppVersion: bridge.getAppVersion,
    openExternal: bridge.openExternal,
    getLocalAgentStatus: bridge.getLocalAgentStatus,
    startLocalAgent: bridge.startLocalAgent,
    stopLocalAgent: bridge.stopLocalAgent,
  };
}
