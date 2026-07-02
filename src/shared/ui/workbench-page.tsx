import type { ReactNode, WheelEventHandler } from 'react';
import { Button, Empty, Tag, Typography } from 'antd';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type MediaAspect = 'square' | 'video';

const aspectClassName: Record<MediaAspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
};

export function WorkbenchPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}

export function WorkbenchMainGrid({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[300px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[320px_minmax(0,1fr)]">
      {children}
    </main>
  );
}

export function WorkbenchSidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="thin-scrollbar hidden min-h-0 overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-sm lg:block">
      {children}
    </aside>
  );
}

export function WorkbenchContentGrid({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-3 lg:min-h-0 lg:overflow-hidden xl:grid-cols-[420px_minmax(0,1fr)]">
      {children}
    </section>
  );
}

export function WorkbenchEditorPanel({ children }: { children: ReactNode }) {
  return (
    <div className="thin-scrollbar flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm lg:min-h-0 lg:overflow-y-auto">
      {children}
    </div>
  );
}

export function WorkbenchResultsPanel({
  title,
  runningLabel,
  children,
}: {
  title: string;
  runningLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="thin-scrollbar rounded-lg border border-border bg-card p-4 shadow-sm lg:min-h-0 lg:overflow-y-auto lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {runningLabel ? <Tag className="m-0 px-2 py-1">{runningLabel}</Tag> : null}
      </div>
      {children}
    </div>
  );
}

export function WorkbenchHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {actions ? <div className="flex shrink-0 gap-2 lg:hidden">{actions}</div> : null}
    </div>
  );
}

export function WorkbenchFieldHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-base font-semibold">{title}</span>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function WorkbenchReferenceStrip({
  children,
  className,
  onWheel,
}: {
  children: ReactNode;
  className?: string;
  onWheel?: WheelEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className={cn(
        'hover-scrollbar hover-scrollbar-hint flex min-h-24 w-full min-w-0 max-w-full gap-2 overflow-x-scroll overflow-y-hidden rounded-lg border border-dashed border-border p-2 pb-3 overscroll-x-contain',
        className,
      )}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}

export function WorkbenchReferenceEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-full items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function WorkbenchReferenceOrderButtons({
  index,
  total,
  onMove,
}: {
  index: number;
  total: number;
  onMove: (offset: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="absolute inset-x-1 bottom-1 flex justify-between">
      <Button
        size="small"
        className="!h-6 !w-6 !min-w-6 !rounded-full !bg-white/85 !p-0 !shadow-sm"
        icon={<ArrowLeft className="size-3" />}
        disabled={index <= 0}
        onClick={() => onMove(-1)}
      />
      <Button
        size="small"
        className="!h-6 !w-6 !min-w-6 !rounded-full !bg-white/85 !p-0 !shadow-sm"
        icon={<ArrowRight className="size-3" />}
        disabled={index >= total - 1}
        onClick={() => onMove(1)}
      />
    </div>
  );
}

export function WorkbenchMobileSummary({
  summary,
  icon,
  onClick,
}: {
  summary: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2 text-sm sm:hidden">
      <span className="truncate text-muted-foreground">{summary}</span>
      <Button size="small" type="text" icon={icon} onClick={onClick}>
        调整
      </Button>
    </div>
  );
}

export function WorkbenchEmptyState({
  icon: Icon,
  description,
}: {
  icon: LucideIcon;
  description: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border text-center lg:min-h-[560px]">
      <Icon className="mb-4 size-11 text-muted-foreground" />
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    </div>
  );
}

export function WorkbenchMediaCard({
  children,
  meta,
  actions,
  footerClassName,
}: {
  children: ReactNode;
  meta: ReactNode;
  actions: ReactNode;
  footerClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {children}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border px-3 py-2.5',
          footerClassName,
        )}
      >
        <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {meta}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function WorkbenchPendingCard({
  aspect = 'square',
  patterned = false,
}: {
  aspect?: MediaAspect;
  patterned?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-dashed border-border bg-muted',
        aspectClassName[aspect],
      )}
    >
      {patterned ? (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle, color-mix(in srgb, var(--muted-foreground) 38%, transparent) 1.4px, transparent 1.6px)',
            backgroundSize: '16px 16px',
          }}
        />
      ) : null}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-6 animate-spin" />
        <span>生成中</span>
      </div>
    </div>
  );
}

export function WorkbenchFailedCard({
  aspect = 'square',
  error,
  onRetry,
}: {
  aspect?: MediaAspect;
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--destructive)] bg-[color-mix(in_srgb,var(--destructive)_8%,var(--card))]">
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 p-5 text-center',
          aspectClassName[aspect],
        )}
      >
        <div className="text-sm font-medium text-[var(--destructive)]">生成失败</div>
        <Typography.Paragraph
          ellipsis={{ rows: 4 }}
          className="!mb-0 !text-xs !text-[var(--destructive)]"
        >
          {error}
        </Typography.Paragraph>
      </div>
      <div className="flex justify-end border-t border-[var(--destructive)] p-3">
        <Button size="small" danger onClick={onRetry}>
          重试
        </Button>
      </div>
    </div>
  );
}

export function WorkbenchLogHeader({ count, children }: { count: number; children: ReactNode }) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">生成记录</h2>
        <Tag className="m-0">{count}</Tag>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">{children}</div>
    </>
  );
}

export function WorkbenchLogEmpty() {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
      暂无生成记录
    </div>
  );
}
