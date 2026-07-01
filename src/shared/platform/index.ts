import { createElectronPlatform } from './electron-platform';
import type { PlatformPort } from './platform-port';
import { webPlatform } from './web-platform';

export function resolvePlatformPort(): PlatformPort {
  if (window.infiniteCanvasPlatform) {
    return createElectronPlatform(window.infiniteCanvasPlatform);
  }

  return webPlatform;
}

export type { PlatformPort, PlatformRuntime } from './platform-port';
