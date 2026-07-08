import { create } from 'zustand';
import { settingsRepository } from '../repositories/settings-repository';

export type ThemeName = 'light' | 'dark';

type ThemeStore = {
  hydrated: boolean;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

let themeHydrationPromise: Promise<void> | null = null;
let themeDirty = false;

export const useThemeStore = create<ThemeStore>()((set) => ({
  hydrated: false,
  theme: 'dark',
  setTheme: (theme) => {
    themeDirty = true;
    set({ theme });
    void settingsRepository.update({ theme });
  },
}));

function hydrateThemeSettings() {
  if (themeHydrationPromise) return themeHydrationPromise;
  themeHydrationPromise = settingsRepository.read().then((settings) => {
    if (themeDirty) {
      void settingsRepository.update({ theme: useThemeStore.getState().theme });
      useThemeStore.setState({ hydrated: true });
      return;
    }
    useThemeStore.setState({
      theme: normalizeTheme(settings.theme),
      hydrated: true,
    });
  });
  return themeHydrationPromise;
}

function normalizeTheme(value: unknown): ThemeName {
  return value === 'light' || value === 'dark' ? value : 'dark';
}

if (typeof window !== 'undefined') {
  void hydrateThemeSettings();
}
