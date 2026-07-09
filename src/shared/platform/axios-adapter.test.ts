import { describe, expect, it } from 'vitest';

import { axiosAdapterForUrl, isElectronProxyUrl } from './axios-adapter';

describe('axiosAdapterForUrl', () => {
  it('uses the fetch adapter for Electron proxy URLs', () => {
    const url = 'infinite-canvas://ai-proxy?target=https%3A%2F%2Fapi.example.com%2Fv1%2Fmodels';

    expect(isElectronProxyUrl(url)).toBe(true);
    expect(axiosAdapterForUrl(url)).toEqual({ adapter: 'fetch' });
  });

  it('keeps default adapters for regular and local proxy URLs', () => {
    expect(isElectronProxyUrl('https://api.example.com/v1/models')).toBe(false);
    expect(isElectronProxyUrl('/__ai-proxy?target=https%3A%2F%2Fapi.example.com')).toBe(false);
    expect(isElectronProxyUrl('not a url')).toBe(false);

    expect(axiosAdapterForUrl('https://api.example.com/v1/models')).toEqual({});
    expect(axiosAdapterForUrl('/__ai-proxy?target=https%3A%2F%2Fapi.example.com')).toEqual({});
    expect(axiosAdapterForUrl('not a url')).toEqual({});
  });
});
