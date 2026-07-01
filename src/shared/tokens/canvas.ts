export const canvasTokens = {
  background: '#111820',
  gridMajor: 'rgba(255, 255, 255, 0.11)',
  gridMinor: 'rgba(255, 255, 255, 0.05)',
  nodeBackground: '#1b222b',
  nodeBorder: '#34404d',
  nodeSelectedBorder: '#4ea1ff',
  connectionStroke: '#7fa7cc',
  selectionFill: 'rgba(78, 161, 255, 0.12)',
  selectionStroke: '#4ea1ff',
} as const;

export type CanvasTokenName = keyof typeof canvasTokens;
