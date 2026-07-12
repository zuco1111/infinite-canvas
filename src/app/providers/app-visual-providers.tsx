import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import type { ThemeName } from '@/features/settings';

import { getAntThemeConfig } from '../theme/app-theme';
import { queryClient } from './query-client';

type AppVisualProvidersProps = {
  children: ReactNode;
  theme: ThemeName;
};

/** Shared visual and data-provider context without product initialization. */
export function AppVisualProviders({ children, theme }: AppVisualProvidersProps) {
  const dark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = theme;
  }, [dark, theme]);

  return (
    <ConfigProvider locale={zhCN} theme={getAntThemeConfig(dark)}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
