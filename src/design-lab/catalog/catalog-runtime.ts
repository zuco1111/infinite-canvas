import { useEffect, useState } from 'react';

export type InheritedThemeMode = 'light' | 'dark';

export const semanticCssVariableNames = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--border',
  '--input',
  '--ring',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--warning',
  '--warning-background',
  '--warning-border',
  '--success',
  '--success-background',
  '--success-border',
  '--radius',
] as const;

function currentThemeMode(): InheritedThemeMode {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useInheritedThemeMode() {
  const [mode, setMode] = useState<InheritedThemeMode>(currentThemeMode);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setMode(currentThemeMode());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, []);

  return mode;
}

export function useResolvedSemanticCssVariables() {
  const mode = useInheritedThemeMode();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const computed = getComputedStyle(document.documentElement);
    setValues(
      Object.fromEntries(
        semanticCssVariableNames.map((name) => [name, computed.getPropertyValue(name).trim()]),
      ),
    );
  }, [mode]);

  return { mode, values };
}

export function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.visualViewport?.width || window.innerWidth,
  );

  useEffect(() => {
    const sync = () => setWidth(window.visualViewport?.width || window.innerWidth);
    sync();
    window.addEventListener('resize', sync);
    window.visualViewport?.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.visualViewport?.removeEventListener('resize', sync);
    };
  }, []);

  return width;
}

export function activeTailwindBreakpoint(width: number) {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'base';
}

export function flattenTokenRecord(
  record: Record<string, unknown>,
  prefix = '',
): Array<{ name: string; value: string }> {
  return Object.entries(record).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenTokenRecord(value as Record<string, unknown>, name);
    }
    return [{ name, value: String(value) }];
  });
}
