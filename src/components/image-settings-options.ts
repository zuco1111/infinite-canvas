export const imageQualityOptions = [
  { value: 'auto', label: '自动' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export const imageAspectOptions = [
  { value: '1:1', label: '1:1', width: 1024, height: 1024, icon: 'square' },
  { value: '3:2', label: '3:2', width: 1536, height: 1024, icon: 'landscape' },
  { value: '2:3', label: '2:3', width: 1024, height: 1536, icon: 'portrait' },
  { value: '4:3', label: '4:3', width: 1360, height: 1024, icon: 'landscape' },
  { value: '3:4', label: '3:4', width: 1024, height: 1360, icon: 'portrait' },
  { value: '16:9', label: '16:9', width: 1824, height: 1024, icon: 'landscape' },
  { value: '9:16', label: '9:16', width: 1024, height: 1824, icon: 'portrait' },
  {
    value: '1:1-2k',
    label: '1:1(2k)',
    size: '2048x2048',
    width: 2048,
    height: 2048,
    icon: 'square',
  },
  {
    value: '16:9-2k',
    label: '16:9(2k)',
    size: '2048x1152',
    width: 2048,
    height: 1152,
    icon: 'landscape',
  },
  {
    value: '9:16-2k',
    label: '9:16(2k)',
    size: '1152x2048',
    width: 1152,
    height: 2048,
    icon: 'portrait',
  },
  {
    value: '16:9-4k',
    label: '16:9(4k)',
    size: '3840x2160',
    width: 3840,
    height: 2160,
    icon: 'landscape',
  },
  {
    value: '9:16-4k',
    label: '9:16(4k)',
    size: '2160x3840',
    width: 2160,
    height: 3840,
    icon: 'portrait',
  },
  { value: 'auto', label: 'auto', width: 0, height: 0, icon: 'auto' },
];

export function imageQualityLabel(value: string) {
  return (
    ({ auto: '自动', high: '高', medium: '中', low: '低' } as Record<string, string>)[value] ||
    value
  );
}

export function imageSizeLabel(size: string) {
  return (
    imageAspectOptions.find((item) => (item.size || item.value) === size || item.value === size)
      ?.label || size
  );
}
