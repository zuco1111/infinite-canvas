import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type AppSurfaceTone = 'default' | 'muted' | 'warning' | 'danger' | 'success';

const toneClassName: Record<AppSurfaceTone, string> = {
  default: 'border-border bg-card text-foreground',
  muted: 'border-border bg-muted text-foreground',
  warning: 'border-[var(--warning-border)] bg-[var(--warning-background)] text-[var(--warning)]',
  danger:
    'border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--card))] text-[var(--destructive)]',
  success: 'border-[var(--success-border)] bg-[var(--success-background)] text-[var(--success)]',
};

export function AppSurface({
  as: Component = 'div',
  tone = 'default',
  className,
  children,
}: {
  as?: 'div' | 'section';
  tone?: AppSurfaceTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Component className={cn('rounded-lg border p-3', toneClassName[tone], className)}>
      {children}
    </Component>
  );
}

export function AppHelperText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('text-xs leading-5 text-muted-foreground', className)}>{children}</div>;
}

export function AppNotice({
  icon,
  action,
  className,
  children,
}: {
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AppSurface
      tone="warning"
      className={cn(
        'flex w-fit max-w-full flex-wrap items-center gap-1.5 px-2.5 py-1.5 text-xs',
        className,
      )}
    >
      {icon}
      <span className="min-w-0">{children}</span>
      {action}
    </AppSurface>
  );
}
