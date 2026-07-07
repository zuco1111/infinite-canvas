'use client';

import { useConfigStore, type AiConfig } from '../stores/use-config-store';
import { useThemeStore } from '../stores/use-theme-store';
import { useUserStore } from '../stores/use-user-store';

export function useAiConfig() {
  return useConfigStore((state) => state.config);
}

export function useUpdateAiConfig() {
  return useConfigStore((state) => state.updateConfig);
}

export function useIsAiConfigReady() {
  return useConfigStore((state) => state.isAiConfigReady);
}

export function useOpenConfigDialog() {
  return useConfigStore((state) => state.openConfigDialog);
}

export function useAppTheme() {
  return useThemeStore((state) => state.theme);
}

export function useSetAppTheme() {
  return useThemeStore((state) => state.setTheme);
}

export function useCurrentUser() {
  return useUserStore((state) => state.user);
}

export type UpdateAiConfig = <K extends keyof AiConfig>(key: K, value: AiConfig[K]) => void;
