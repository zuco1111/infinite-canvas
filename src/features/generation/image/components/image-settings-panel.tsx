'use client';

import { useState } from 'react';
import { Switch } from 'antd';

import { type CanvasTheme } from '@/shared/tokens/canvas-theme';
import {
  SettingGroup,
  SettingsDimensionInput,
  SettingsNumberInput,
  SettingsOptionPill,
  SettingsPanelTheme,
  SettingsPreviewTile,
} from '@/shared/ui/settings-panel';
import type { AiConfig } from '@/features/settings';
import {
  imageAspectOptions as aspectOptions,
  imageQualityOptions as qualityOptions,
} from './image-settings-options';

const DIMENSION_STEP = 16;

type ImageSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (key: 'quality' | 'size' | 'count', value: string) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
  maxCount?: number;
  quickCount?: number;
};

export function ImageSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
  maxCount = 15,
  quickCount = 10,
}: ImageSettingsPanelProps) {
  const [snapDimensionToStep, setSnapDimensionToStep] = useState(true);
  const quality = config.quality || 'auto';
  const count = Math.max(1, Math.min(maxCount, Math.floor(Math.abs(Number(config.count)) || 1)));
  const activeSize = config.size || 'auto';
  const selectedAspect = aspectOptions.find(
    (item) => (item.size || item.value) === activeSize || item.value === activeSize,
  );
  const dimensions = readSizeDimensions(activeSize, selectedAspect || aspectOptions[0]);
  const selectAspect = (value: string) => {
    const option = aspectOptions.find((item) => item.value === value);
    onConfigChange('size', option?.size || option?.value || 'auto');
  };
  const updateDimension = (key: 'width' | 'height', value: number | null) => {
    const next = Math.max(1, Math.floor(value || dimensions[key] || 1024));
    const width = key === 'width' ? next : dimensions.width;
    const height = key === 'height' ? next : dimensions.height;
    onConfigChange(
      'size',
      `${alignDimension(width, snapDimensionToStep)}x${alignDimension(height, snapDimensionToStep)}`,
    );
  };

  return (
    <SettingsPanelTheme theme={theme}>
      <div
        className={className}
        style={{ color: theme.node.text }}
        onMouseDown={(event) => {
          event.stopPropagation();
          if (event.target instanceof HTMLInputElement) return;
          if (
            document.activeElement instanceof HTMLInputElement &&
            event.currentTarget.contains(document.activeElement)
          )
            document.activeElement.blur();
        }}
      >
        {showTitle ? <div className="text-lg font-semibold">图像设置</div> : null}
        <SettingGroup title="质量" color={theme.node.muted}>
          <div className="grid grid-cols-4 gap-2.5">
            {qualityOptions.map((item) => (
              <SettingsOptionPill
                key={item.value}
                selected={quality === item.value}
                theme={theme}
                onClick={() => onConfigChange('quality', item.value)}
              >
                {item.label}
              </SettingsOptionPill>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup
          title="尺寸"
          color={theme.node.muted}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: theme.node.muted }}>
                16倍数对齐
              </span>
              <span
                title="输入完成后自动向上补成 16 的倍数"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <Switch
                  size="small"
                  checked={snapDimensionToStep}
                  onChange={setSnapDimensionToStep}
                />
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
            <SettingsDimensionInput
              prefix="W"
              value={dimensions.width}
              disabled={activeSize === 'auto'}
              theme={theme}
              alignToStep={snapDimensionToStep}
              commitOnBlur
              onChange={(value) => updateDimension('width', value)}
            />
            <span className="text-lg opacity-45">↔</span>
            <SettingsDimensionInput
              prefix="H"
              value={dimensions.height}
              disabled={activeSize === 'auto'}
              theme={theme}
              alignToStep={snapDimensionToStep}
              commitOnBlur
              onChange={(value) => updateDimension('height', value)}
            />
          </div>
        </SettingGroup>
        <SettingGroup title="宽高比" color={theme.node.muted}>
          <div className="grid grid-cols-4 gap-2.5">
            {aspectOptions.map((item) => (
              <SettingsPreviewTile
                key={item.value}
                selected={selectedAspect?.value === item.value}
                theme={theme}
                heightClassName="h-[72px]"
                className="gap-1.5"
                onClick={() => selectAspect(item.value)}
              >
                <AspectIcon
                  type={item.icon}
                  width={item.width}
                  height={item.height}
                  color={theme.node.text}
                />
                <span>{item.label}</span>
              </SettingsPreviewTile>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup title="生成张数" color={theme.node.muted}>
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: quickCount }, (_, index) => index + 1).map((value) => (
              <SettingsOptionPill
                key={value}
                selected={count === value}
                theme={theme}
                onClick={() => onConfigChange('count', String(value))}
              >
                {value} 张
              </SettingsOptionPill>
            ))}
            <SettingsNumberInput
              value={count || ''}
              min={1}
              max={maxCount}
              theme={theme}
              className="col-span-2"
              onChange={(value) => onConfigChange('count', String(Number(value) || 1))}
            />
          </div>
        </SettingGroup>
      </div>
    </SettingsPanelTheme>
  );
}

function AspectIcon({
  type,
  width,
  height,
  color,
}: {
  type: string;
  width: number;
  height: number;
  color: string;
}) {
  if (type === 'auto') return null;
  const ratio = width / Math.max(1, height);
  const boxWidth = ratio >= 1 ? 24 : Math.max(10, 24 * ratio);
  const boxHeight = ratio >= 1 ? Math.max(10, 24 / ratio) : 24;
  return (
    <span className="grid h-7 w-9 place-items-center">
      <span
        className="border-2"
        style={{ width: boxWidth, height: boxHeight, borderColor: color }}
      />
    </span>
  );
}

function readSizeDimensions(size: string, fallback: { width: number; height: number }) {
  const match = size?.match(/^(\d+)x(\d+)$/);
  return {
    width: match ? Number(match[1]) : fallback.width,
    height: match ? Number(match[2]) : fallback.height,
  };
}

function alignDimension(value: number, enabled: boolean) {
  return enabled ? Math.ceil(value / DIMENSION_STEP) * DIMENSION_STEP : value;
}
