import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useEffect } from 'react';

import { AppRoutes } from './routes/AppRoutes';
import { queryClient } from './providers/query-client';
import { ClientRootInit } from '../components/layout/client-root-init';
import { getAntThemeConfig } from '../lib/app-theme';
import { useThemeStore } from '../stores/use-theme-store';
import { ClientRouterProvider } from '../shared/router/client-router';

export function App() {
  const currentTheme = useThemeStore((state) => state.theme);
  const dark = currentTheme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = currentTheme;
  }, [dark, currentTheme]);

  return (
    <ConfigProvider locale={zhCN} theme={getAntThemeConfig(dark)}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <ClientRouterProvider>
            <ClientRootInit>
              <AppRoutes />
            </ClientRootInit>
          </ClientRouterProvider>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
