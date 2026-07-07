import { cn } from '@/shared/ui/cn';

export const workbenchTagClassName =
  'm-0 flex h-6 items-center rounded-md px-1.5 text-xs leading-none';

export const workbenchTagToneClassName = {
  default: `${workbenchTagClassName} border-border bg-muted text-muted-foreground`,
  primary: `${workbenchTagClassName} border-primary bg-primary text-primary-foreground`,
  success: `${workbenchTagClassName} border-[var(--success-border)] bg-[var(--success-background)] text-[var(--success)]`,
  danger: `${workbenchTagClassName} border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--card))] text-[var(--destructive)]`,
  warning: `${workbenchTagClassName} border-[var(--warning-border)] bg-[var(--warning-background)] text-[var(--warning)]`,
} as const;

export const workbenchResultActionButtonClassName =
  'min-w-0 px-1.5 [&_.ant-btn-icon]:shrink-0 [&>span:last-child]:min-w-0 [&>span:last-child]:truncate';

export function workbenchLogCardClassName(active: boolean) {
  return cn(
    'block w-full rounded-lg border p-2 text-left transition',
    active
      ? 'border-primary bg-muted text-foreground'
      : 'border-border bg-card text-foreground hover:bg-muted',
  );
}

export function moveWorkbenchListItem<T>(items: T[], index: number, offset: number) {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
