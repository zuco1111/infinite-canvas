'use client';

import { type ReactNode } from 'react';
import { ConfigProvider } from 'antd';

import { type CanvasTheme } from '@/lib/canvas-theme';
import { cn } from '@/lib/utils';

export function SettingsPanelTheme({
  theme,
  children,
}: {
  theme: CanvasTheme;
  children: ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: theme.toolbar.panel,
          colorBgElevated: theme.toolbar.panel,
          colorBorder: theme.node.stroke,
          colorPrimary: theme.node.activeStroke,
          colorText: theme.node.text,
          colorTextLightSolid: theme.node.panel,
        },
        components: {
          Button: {
            defaultBg: theme.toolbar.panel,
            defaultBorderColor: theme.node.stroke,
            defaultColor: theme.node.text,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function SettingGroup({
  title,
  color,
  actions,
  children,
}: {
  title: string;
  color: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className={cn(actions && 'flex items-center justify-between gap-3')}>
        <SettingTitle color={color}>{title}</SettingTitle>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function SettingTitle({ children, color }: { children: string; color: string }) {
  return (
    <div className="text-xs font-medium" style={{ color }}>
      {children}
    </div>
  );
}

export function SettingsOptionPill({
  selected,
  disabled = false,
  theme,
  onClick,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  theme: CanvasTheme;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="h-9 cursor-pointer rounded-full border px-2 text-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-35"
      style={{
        background: 'transparent',
        borderColor: selected ? theme.node.text : theme.node.stroke,
        color: theme.node.text,
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SettingsPreviewTile({
  selected,
  theme,
  heightClassName,
  className,
  onClick,
  children,
}: {
  selected: boolean;
  theme: CanvasTheme;
  heightClassName: string;
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border bg-transparent text-sm transition hover:opacity-80',
        heightClassName,
        className,
      )}
      style={{
        borderColor: selected ? theme.node.text : theme.node.stroke,
        color: theme.node.text,
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function SettingsDimensionInput({
  prefix,
  value,
  disabled,
  theme,
  alignToStep = false,
  commitOnBlur = false,
  onChange,
}: {
  prefix: string;
  value: number;
  disabled: boolean;
  theme: CanvasTheme;
  alignToStep?: boolean;
  commitOnBlur?: boolean;
  onChange: (value: number | null) => void;
}) {
  const commit = (input: HTMLInputElement) => {
    const next = alignDimension(
      Math.max(1, Math.floor(Number(input.value) || value || 1024)),
      alignToStep,
    );
    input.value = String(next);
    onChange(next);
  };

  return (
    <label
      className="flex h-9 overflow-hidden rounded-xl text-sm"
      style={{ background: theme.node.fill, color: theme.node.text, opacity: disabled ? 0.55 : 1 }}
    >
      <span className="grid w-9 place-items-center" style={{ color: theme.node.muted }}>
        {prefix}
      </span>
      <input
        key={commitOnBlur ? `${prefix}-${value}` : undefined}
        type="number"
        min={1}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent px-2 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        {...(commitOnBlur
          ? {
              defaultValue: value || '',
              onBlur: (event) => commit(event.currentTarget),
              onKeyDown: (event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
              },
            }
          : {
              value: value || '',
              onChange: (event) => onChange(Number(event.target.value) || null),
            })}
        onMouseDown={(event) => event.stopPropagation()}
      />
    </label>
  );
}

export function SettingsNumberInput({
  value,
  min,
  max,
  step,
  theme,
  className,
  onChange,
  onBlur,
}: {
  value: string | number;
  min: number;
  max: number;
  step?: number;
  theme: CanvasTheme;
  className?: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      className={cn(
        'h-9 rounded-full border bg-transparent px-3 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className,
      )}
      style={{
        borderColor: theme.node.stroke,
        color: theme.node.text,
        WebkitTextFillColor: theme.node.text,
      }}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onBlur?.(event.target.value)}
      onMouseDown={(event) => event.stopPropagation()}
    />
  );
}

export function SettingsSizePreview({
  width,
  height,
  color,
  className,
}: {
  width: number;
  height: number;
  color: string;
  className?: string;
}) {
  if (!width || !height) return null;
  const longSide = Math.max(width, height);
  const previewWidth = Math.max(10, Math.round((width / longSide) * 26));
  const previewHeight = Math.max(10, Math.round((height / longSide) * 26));
  return (
    <span
      className={cn('rounded-[3px] border-2', className)}
      style={{ width: previewWidth, height: previewHeight, borderColor: color }}
    />
  );
}

function alignDimension(value: number, enabled: boolean) {
  return enabled ? Math.ceil(value / 16) * 16 : value;
}
