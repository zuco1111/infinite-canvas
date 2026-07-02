import { describe, expect, it } from 'vitest';

import {
  currentLocation,
  hrefToClientHref,
  hrefToNavigationUrl,
  hrefToPath,
  isInternalHref,
  type RouterEnvironment,
} from './client-router-state';

describe('client router path normalization', () => {
  it('keeps normal browser routes as path-based URLs', () => {
    const environment: RouterEnvironment = {
      protocol: 'http:',
      origin: 'http://127.0.0.1:5173',
      href: 'http://127.0.0.1:5173/prompts?tag=photo',
      pathname: '/prompts',
      search: '?tag=photo',
      hash: '',
    };

    expect(currentLocation(environment)).toEqual({
      pathname: '/prompts',
      search: '?tag=photo',
      hash: '',
    });
    expect(isInternalHref('/canvas', environment)).toBe(true);
    expect(hrefToPath('/canvas/abc?mode=new', environment)).toBe('/canvas/abc?mode=new');
    expect(hrefToNavigationUrl('/canvas', environment)).toBe('/canvas');
    expect(hrefToClientHref('/canvas', environment)).toBe('/canvas');
  });

  it('uses hash routes for macOS file URLs', () => {
    const environment: RouterEnvironment = {
      protocol: 'file:',
      origin: 'null',
      href: 'file:///Applications/Infinite%20Canvas.app/Contents/Resources/app.asar/dist/index.html',
      pathname: '/Applications/Infinite Canvas.app/Contents/Resources/app.asar/dist/index.html',
      search: '',
      hash: '',
    };

    expect(currentLocation(environment)).toEqual({ pathname: '/', search: '', hash: '' });
    expect(isInternalHref('/canvas', environment)).toBe(true);
    expect(hrefToNavigationUrl('/canvas', environment)).toBe('#/canvas');
    expect(hrefToClientHref('/prompts?tag=photo', environment)).toBe('#/prompts?tag=photo');
  });

  it('uses hash routes for Windows file URLs instead of drive-root paths', () => {
    const environment: RouterEnvironment = {
      protocol: 'file:',
      origin: 'null',
      href: 'file:///C:/Users/simplemin/AppData/Local/Programs/Infinite%20Canvas/resources/app.asar/dist/index.html#/canvas',
      pathname:
        '/C:/Users/simplemin/AppData/Local/Programs/Infinite Canvas/resources/app.asar/dist/index.html',
      search: '',
      hash: '#/canvas',
    };

    expect(currentLocation(environment)).toEqual({ pathname: '/canvas', search: '', hash: '' });
    expect(hrefToPath('/canvas/project-1?mode=recent', environment)).toBe(
      '/canvas/project-1?mode=recent',
    );
    expect(hrefToNavigationUrl('/canvas/project-1?mode=recent', environment)).toBe(
      '#/canvas/project-1?mode=recent',
    );
    expect(hrefToClientHref('/assets', environment)).toBe('#/assets');
  });

  it('leaves external and hash-only hrefs untouched', () => {
    const environment: RouterEnvironment = {
      protocol: 'file:',
      origin: 'null',
      href: 'file:///C:/App/resources/app.asar/dist/index.html#/canvas',
      pathname: '/C:/App/resources/app.asar/dist/index.html',
      search: '',
      hash: '#/canvas',
    };

    expect(isInternalHref('https://api.zuco.ai/', environment)).toBe(false);
    expect(hrefToClientHref('https://api.zuco.ai/', environment)).toBe('https://api.zuco.ai/');
    expect(isInternalHref('#section', environment)).toBe(false);
    expect(hrefToClientHref('#section', environment)).toBe('#section');
  });
});
