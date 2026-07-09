import type { AxiosRequestConfig } from 'axios';

const ELECTRON_PROXY_PROTOCOL = 'infinite-canvas:';

export function axiosAdapterForUrl(url: string): Pick<AxiosRequestConfig, 'adapter'> {
  return isElectronProxyUrl(url) ? { adapter: 'fetch' } : {};
}

export function isElectronProxyUrl(url: string) {
  try {
    return new URL(url).protocol === ELECTRON_PROXY_PROTOCOL;
  } catch {
    return false;
  }
}
