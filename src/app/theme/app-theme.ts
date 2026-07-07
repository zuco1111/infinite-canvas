import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

import { appThemeTokens } from '@/shared/tokens/app';

export function getAntThemeConfig(dark: boolean): ThemeConfig {
  const color = dark ? appThemeTokens.dark : appThemeTokens.light;

  return {
    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    cssVar: { key: dark ? 'infinite-canvas-dark' : 'infinite-canvas-light' },
    token: {
      colorBgBase: color.background,
      colorBgContainer: color.card,
      colorBgElevated: color.popover,
      colorBorder: color.border,
      colorBorderSecondary: color.border,
      colorError: color.danger,
      colorErrorBg: color.dangerSurface,
      colorErrorBorder: color.dangerBorder,
      colorFillSecondary: color.mutedSurface,
      colorFillTertiary: color.subtleSurface,
      colorText: color.foreground,
      colorTextSecondary: color.muted,
      colorTextTertiary: color.muted,
      colorPrimary: color.primary,
      colorInfo: color.primary,
      colorLink: color.primary,
      colorLinkHover: color.primaryHover,
      colorLinkActive: color.primary,
      colorTextLightSolid: color.primaryText,
      colorWarning: color.warning,
      colorWarningBg: color.warningSurface,
      colorWarningBorder: color.warningBorder,
      borderRadius: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 28,
    },
    components: {
      Button: {
        defaultBg: color.card,
        defaultBorderColor: color.border,
        defaultColor: color.foreground,
        defaultHoverBg: color.mutedSurface,
        defaultHoverBorderColor: color.ring,
        defaultHoverColor: color.foreground,
        primaryShadow: 'none',
      },
      Drawer: {
        colorBgElevated: color.card,
      },
      Input: {
        activeBorderColor: color.ring,
        hoverBorderColor: color.ring,
      },
      Menu: {
        itemActiveBg: color.mutedSurface,
        itemHoverBg: color.mutedSurface,
        itemSelectedBg: color.mutedSurface,
        itemSelectedColor: color.foreground,
        darkItemHoverBg: appThemeTokens.dark.mutedSurface,
        darkItemSelectedBg: appThemeTokens.dark.mutedSurface,
        darkItemSelectedColor: appThemeTokens.dark.foreground,
      },
      Modal: {
        contentBg: color.card,
        headerBg: color.card,
      },
      Select: {
        optionActiveBg: color.mutedSurface,
        optionSelectedBg: color.subtleSurface,
        optionSelectedColor: color.foreground,
      },
      Table: {
        rowSelectedBg: color.tableSelectedBg,
        rowSelectedHoverBg: color.tableSelectedHoverBg,
      },
    },
  };
}
