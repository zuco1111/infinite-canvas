export const appTokens = {
  colorBackground: '#101418',
  colorPanel: '#181d23',
  colorPanelSubtle: '#20262d',
  colorBorder: '#2b333d',
  colorText: '#edf2f7',
  colorMuted: '#9aa6b2',
  colorAccent: '#4ea1ff',
  colorSuccess: '#35c58d',
  colorWarning: '#f2b84b',
  colorDanger: '#f56c6c',
} as const;

export type AppTokenName = keyof typeof appTokens;
