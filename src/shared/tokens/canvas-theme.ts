import { canvasThemeTokens } from '@/shared/tokens/canvas';

export type CanvasColorTheme = 'light' | 'dark';
export type CanvasBackgroundMode = 'dots' | 'lines' | 'blank';

export const canvasThemes = canvasThemeTokens;

export type CanvasTheme = (typeof canvasThemes)[CanvasColorTheme];
