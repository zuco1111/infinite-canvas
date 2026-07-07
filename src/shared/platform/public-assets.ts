export function publicAssetPath(assetPath: string) {
  const normalizedPath = assetPath.replace(/^\/+/, '');

  if (window.location.protocol === 'file:') {
    return new URL(normalizedPath, filePublicAssetBaseUrl()).toString();
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl && baseUrl !== './') {
    return `${baseUrl.replace(/\/?$/, '/')}${normalizedPath}`;
  }
  return `/${normalizedPath}`;
}

let cachedFilePublicAssetBaseUrl: string | null = null;

function filePublicAssetBaseUrl() {
  if (cachedFilePublicAssetBaseUrl) return cachedFilePublicAssetBaseUrl;

  const moduleScript = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
  if (moduleScript?.src) {
    cachedFilePublicAssetBaseUrl = new URL('../', moduleScript.src).toString();
    return cachedFilePublicAssetBaseUrl;
  }

  cachedFilePublicAssetBaseUrl = new URL('./', window.location.href).toString();
  return cachedFilePublicAssetBaseUrl;
}
