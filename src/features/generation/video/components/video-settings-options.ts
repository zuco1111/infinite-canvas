import { normalizeSeedanceRatio, seedanceRatioOptions } from '../domain/seedance-video';

export const videoResolutionOptions = [
  { value: '720', label: '720p' },
  { value: '480', label: '480p' },
];

export const videoSizeOptions = [
  { value: '1280x720', label: '横屏', width: 1280, height: 720 },
  { value: '720x1280', label: '竖屏', width: 720, height: 1280 },
  { value: '1024x1024', label: '方形', width: 1024, height: 1024 },
  { value: '1792x1024', label: '宽屏', width: 1792, height: 1024 },
  { value: '1024x1792', label: '长图', width: 1024, height: 1792 },
  { value: 'auto', label: 'auto', width: 0, height: 0 },
];

export const videoSecondOptions = [6, 10, 12, 16, 20];

export function videoResolutionLabel(value: string) {
  return `${normalizeVideoResolutionValue(value)}p`;
}

export function videoSizeLabel(value: string) {
  const ratio = normalizeSeedanceRatio(value);
  if (value === 'adaptive' || value === 'auto') return '自适应';
  if (ratio === value)
    return seedanceRatioOptions.find((item) => item.value === ratio)?.label || ratio;
  const size = normalizeVideoSizeValue(value);
  return videoSizeOptions.find((item) => item.value === size)?.label || size;
}

export function videoSecondsLabel(value: string) {
  if (String(value).trim() === '-1') return '智能';
  return `${value || '6'}s`;
}

export function normalizeVideoSizeValue(value: string) {
  if (value === 'auto') return 'auto';
  if (/^\d+x\d+$/.test(value || '')) return value;
  return ['9:16', '2:3', '3:4'].includes(value) ? '720x1280' : '1280x720';
}

export function normalizeVideoResolutionValue(value: string) {
  if (value === '480p' || value === 'low') return '480';
  if (value === '720p' || value === 'auto' || value === 'high' || value === 'medium') return '720';
  return value.replace(/p$/i, '') || '720';
}
