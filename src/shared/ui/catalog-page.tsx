import type { ReactNode, UIEventHandler } from 'react';
import { Card, Tag } from 'antd';

import { cn } from '@/lib/utils';

type CatalogGridTone = 'soft' | 'medium' | 'strong';

const catalogGridToneClass: Record<CatalogGridTone, string> = {
  soft: 'dark:bg-[radial-gradient(rgba(245,245,244,.14)_1px,transparent_1px)]',
  medium: 'dark:bg-[radial-gradient(rgba(245,245,244,.16)_1px,transparent_1px)]',
  strong: 'dark:bg-[radial-gradient(rgba(245,245,244,.18)_1px,transparent_1px)]',
};

type CatalogPageShellProps = {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  gridTone?: CatalogGridTone;
  onScroll?: UIEventHandler<HTMLElement>;
};

export function CatalogPageShell({
  children,
  className,
  mainClassName,
  gridTone = 'medium',
  onScroll,
}: CatalogPageShellProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden bg-background text-foreground',
        className,
      )}
    >
      <main
        className={cn(
          'min-h-0 flex-1 overflow-y-auto bg-background bg-[radial-gradient(var(--border)_1px,transparent_1px)] px-6 py-8 [background-size:16px_16px]',
          catalogGridToneClass[gridTone],
          mainClassName,
        )}
        onScroll={onScroll}
      >
        {children}
      </main>
    </div>
  );
}

export function CatalogPageHeader({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function CatalogFilterGroup({
  label,
  children,
  align = 'start',
}: {
  label: string;
  children: ReactNode;
  align?: 'start' | 'center';
}) {
  return (
    <div
      className={cn(
        'grid gap-2 sm:grid-cols-[56px_minmax(0,1fr)]',
        align === 'center' ? 'sm:items-center' : 'sm:items-start',
      )}
    >
      <div className={cn('text-xs font-medium text-muted-foreground', align === 'start' && 'pt-2')}>
        {label}
      </div>
      {children}
    </div>
  );
}

type CatalogCheckableFilterGroupProps<T extends string> = {
  label: string;
  options: Array<T | { value: T; label: ReactNode }>;
  isChecked: (value: T) => boolean;
  onChange: (value: T) => void;
  align?: 'start' | 'center';
};

export function CatalogCheckableFilterGroup<T extends string>({
  label,
  options,
  isChecked,
  onChange,
  align,
}: CatalogCheckableFilterGroupProps<T>) {
  return (
    <CatalogFilterGroup label={label} align={align}>
      <CatalogCheckableTagList options={options} isChecked={isChecked} onChange={onChange} />
    </CatalogFilterGroup>
  );
}

export function CatalogCheckableTagList<T extends string>({
  options,
  isChecked,
  onChange,
  className,
}: {
  options: Array<T | { value: T; label: ReactNode }>;
  isChecked: (value: T) => boolean;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const labelText = typeof option === 'string' ? option : option.label;
        const checked = isChecked(value);
        return (
          <Tag.CheckableTag
            key={value}
            checked={checked}
            className={cn('app-filter-tag', checked && 'is-active')}
            onChange={() => onChange(value)}
          >
            {labelText}
          </Tag.CheckableTag>
        );
      })}
    </div>
  );
}

export function CatalogTextAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cursor-pointer text-sm font-medium text-foreground underline-offset-4 opacity-75 transition hover:opacity-100 hover:underline focus-visible:outline-none focus-visible:underline"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function CatalogStatusText({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mt-6 max-w-6xl text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

export function CatalogItemCard({
  media,
  body,
  actions,
  onOpen,
  className,
}: {
  media?: ReactNode;
  body: ReactNode;
  actions?: ReactNode;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <Card
      hoverable
      className={cn('overflow-hidden', className)}
      styles={{ body: { padding: 0 } }}
      cover={
        media ? (
          <button type="button" className="block w-full text-left" onClick={onOpen}>
            {media}
          </button>
        ) : undefined
      }
    >
      <button type="button" className="block w-full text-left" onClick={onOpen}>
        <div className="p-4">{body}</div>
      </button>
      {actions ? <div className="flex items-center gap-2 px-4 pb-4">{actions}</div> : null}
    </Card>
  );
}
