import { useState } from 'react';

import { AppVisualProviders } from '@/app/providers/app-visual-providers';
import type { ThemeName } from '@/features/settings';

import { DesignLabApp } from './DesignLabApp';

export function DesignLabRoot() {
  const [theme, setTheme] = useState<ThemeName>('light');

  return (
    <AppVisualProviders theme={theme}>
      <DesignLabApp theme={theme} onThemeChange={setTheme} />
    </AppVisualProviders>
  );
}
