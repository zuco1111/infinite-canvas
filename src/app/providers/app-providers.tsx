import type { ReactNode } from 'react';

import { useAppTheme } from '@/features/settings';
import { ClientRouterProvider } from '@/shared/router/client-router';

import { ClientRootInit } from '../shell/components/client-root-init';
import { AppVisualProviders } from './app-visual-providers';

export function AppProviders({ children }: { children: ReactNode }) {
  const theme = useAppTheme();

  return (
    <AppVisualProviders theme={theme}>
      <ClientRouterProvider>
        <ClientRootInit>{children}</ClientRootInit>
      </ClientRouterProvider>
    </AppVisualProviders>
  );
}
