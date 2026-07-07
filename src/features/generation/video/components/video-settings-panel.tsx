'use client';

import { Switch } from 'antd';

import {
  boolConfig,
  isSeedanceFastModel,
  isSeedanceVideoConfig,
  normalizeSeedanceDuration,
  normalizeSeedanceRatio,
  normalizeSeedanceResolution,
  seedanceDurationOptions,
  seedancePixelLabel,
  seedanceRatioOptions,
  seedanceResolutionOptions,
} from '../domain/seedance-video';
import { type CanvasTheme } from '@/shared/tokens/canvas-theme';
import {
  SettingGroup,
  SettingsDimensionInput,
  SettingsNumberInput,
  SettingsOptionPill,
  SettingsPanelTheme,
  SettingsPreviewTile,
  SettingsSizePreview,
} from '@/shared/ui/settings-panel';
import { modelOptionName, type AiConfig } from '@/features/settings';
import {
  normalizeVideoResolutionValue,
  normalizeVideoSizeValue,
  videoResolutionOptions as resolutionOptions,
  videoSecondOptions as secondOptions,
  videoSizeOptions as sizeOptions,
} from './video-settings-options';

type VideoSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (
    key: 'vquality' | 'size' | 'videoSeconds' | 'videoGenerateAudio' | 'videoWatermark',
    value: string,
  ) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
};

export function VideoSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
}: VideoSettingsPanelProps) {
  if (isSeedanceVideoConfig(config)) {
    return (
      <SeedanceVideoSettingsPanel
        config={config}
        onConfigChange={onConfigChange}
        theme={theme}
        showTitle={showTitle}
        className={className}
      />
    );
  }

  const seconds = config.videoSeconds || '6';
  const size = normalizeVideoSizeValue(config.size);
  const dimensions = readSizeDimensions(size);
  const resolution = normalizeVideoResolutionValue(config.vquality);
  const updateDimension = (key: 'width' | 'height', value: number | null) => {
    const next = Math.max(1, Math.floor(value || dimensions[key] || 720));
    onConfigChange(
      'size',
      `${key === 'width' ? next : dimensions.width}x${key === 'height' ? next : dimensions.height}`,
    );
  };

  return (
    <SettingsPanelTheme theme={theme}>
      <div
        className={className}
        style={{ color: theme.node.text }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showTitle ? <div className="text-lg font-semibold">视频设置</div> : null}
        <SettingGroup title="清晰度" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {resolutionOptions.map((item) => (
              <SettingsOptionPill
                key={item.value}
                selected={resolution === item.value}
                theme={theme}
                onClick={() => onConfigChange('vquality', item.value)}
              >
                {item.label}
              </SettingsOptionPill>
            ))}
            <ResolutionInput
              value={resolution}
              theme={theme}
              onChange={(value) => onConfigChange('vquality', value)}
            />
          </div>
        </SettingGroup>
        <SettingGroup title="尺寸" color={theme.node.muted}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
            <SettingsDimensionInput
              prefix="W"
              value={dimensions.width}
              disabled={size === 'auto'}
              theme={theme}
              onChange={(value) => updateDimension('width', value)}
            />
            <span className="text-lg opacity-45">↔</span>
            <SettingsDimensionInput
              prefix="H"
              value={dimensions.height}
              disabled={size === 'auto'}
              theme={theme}
              onChange={(value) => updateDimension('height', value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {sizeOptions.map((item) => (
              <SettingsPreviewTile
                key={item.value}
                selected={size === item.value}
                theme={theme}
                heightClassName="h-[78px]"
                className="gap-1"
                onClick={() => onConfigChange('size', item.value)}
              >
                <SettingsSizePreview
                  width={item.width}
                  height={item.height}
                  color={theme.node.text}
                />
                <span>{item.label}</span>
                {item.value === 'auto' ? null : (
                  <span className="text-[11px] leading-none opacity-55">{item.value}</span>
                )}
              </SettingsPreviewTile>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup title="秒数" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {secondOptions.map((value) => (
              <SettingsOptionPill
                key={value}
                selected={seconds === String(value)}
                theme={theme}
                onClick={() => onConfigChange('videoSeconds', String(value))}
              >
                {value}s
              </SettingsOptionPill>
            ))}
            <SettingsNumberInput
              value={seconds}
              min={1}
              max={20}
              theme={theme}
              onChange={(value) => onConfigChange('videoSeconds', value)}
            />
          </div>
        </SettingGroup>
      </div>
    </SettingsPanelTheme>
  );
}

function SeedanceVideoSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle,
  className,
}: VideoSettingsPanelProps) {
  const model = modelOptionName(config.model || config.videoModel);
  const resolution = normalizeSeedanceResolution(config.vquality, model);
  const ratio = normalizeSeedanceRatio(config.size);
  const duration = normalizeSeedanceDuration(config.videoSeconds);
  const generateAudio = boolConfig(config.videoGenerateAudio, true);
  const watermark = boolConfig(config.videoWatermark, false);

  return (
    <SettingsPanelTheme theme={theme}>
      <div
        className={className}
        style={{ color: theme.node.text }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showTitle ? <div className="text-lg font-semibold">视频设置</div> : null}
        <SettingGroup title="分辨率" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {seedanceResolutionOptions.map((item) => {
              const disabled = item.value === '1080p' && isSeedanceFastModel(model);
              return (
                <SettingsOptionPill
                  key={item.value}
                  selected={resolution === item.value}
                  disabled={disabled}
                  theme={theme}
                  onClick={() => onConfigChange('vquality', item.value)}
                >
                  {item.label}
                </SettingsOptionPill>
              );
            })}
          </div>
          {isSeedanceFastModel(model) ? (
            <div className="text-[11px] leading-4 opacity-55">
              fast 模型不支持 1080p，会自动使用 720p。
            </div>
          ) : null}
        </SettingGroup>
        <SettingGroup title="比例" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {seedanceRatioOptions.map((item) => (
              <SettingsPreviewTile
                key={item.value}
                selected={ratio === item.value}
                theme={theme}
                heightClassName="h-[68px]"
                className="gap-1 px-1"
                onClick={() => onConfigChange('size', item.value)}
              >
                <SettingsSizePreview
                  width={ratioPreview(item.value).width}
                  height={ratioPreview(item.value).height}
                  color={theme.node.text}
                />
                <span>{item.label}</span>
                <span className="text-[10px] leading-none opacity-55">
                  {item.value === 'adaptive'
                    ? 'adaptive'
                    : seedancePixelLabel(resolution, item.value)}
                </span>
              </SettingsPreviewTile>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup title="时长" color={theme.node.muted}>
          <div className="grid grid-cols-4 gap-2.5">
            {seedanceDurationOptions.map((value) => (
              <SettingsOptionPill
                key={value}
                selected={duration === value}
                theme={theme}
                onClick={() => onConfigChange('videoSeconds', String(value))}
              >
                {value === -1 ? '智能' : `${value}s`}
              </SettingsOptionPill>
            ))}
          </div>
          <SettingsNumberInput
            value={String(duration)}
            min={-1}
            max={15}
            theme={theme}
            onChange={(value) => onConfigChange('videoSeconds', value)}
          />
        </SettingGroup>
        <SettingGroup title="输出" color={theme.node.muted}>
          <div
            className="grid gap-2 rounded-xl border p-2.5"
            style={{ borderColor: theme.node.stroke }}
          >
            <SwitchRow
              label="生成声音"
              checked={generateAudio}
              theme={theme}
              onChange={(checked) => onConfigChange('videoGenerateAudio', String(checked))}
            />
            <SwitchRow
              label="添加水印"
              checked={watermark}
              theme={theme}
              onChange={(checked) => onConfigChange('videoWatermark', String(checked))}
            />
          </div>
        </SettingGroup>
      </div>
    </SettingsPanelTheme>
  );
}

function ResolutionInput({
  value,
  theme,
  onChange,
}: {
  value: string;
  theme: CanvasTheme;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="flex h-9 overflow-hidden rounded-full border text-sm"
      style={{ borderColor: theme.node.stroke, color: theme.node.text }}
    >
      <input
        type="number"
        min={1}
        className="min-w-0 flex-1 bg-transparent px-3 text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onMouseDown={(event) => event.stopPropagation()}
      />
      <span className="grid w-7 place-items-center pr-1" style={{ color: theme.node.muted }}>
        p
      </span>
    </label>
  );
}

function ratioPreview(ratio: string) {
  if (ratio === '9:16') return { width: 9, height: 16 };
  if (ratio === '1:1') return { width: 1, height: 1 };
  if (ratio === '4:3') return { width: 4, height: 3 };
  if (ratio === '3:4') return { width: 3, height: 4 };
  if (ratio === '21:9') return { width: 21, height: 9 };
  if (ratio === 'adaptive') return { width: 0, height: 0 };
  return { width: 16, height: 9 };
}

function SwitchRow({
  label,
  checked,
  theme,
  onChange,
}: {
  label: string;
  checked: boolean;
  theme: CanvasTheme;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex h-8 items-center justify-between gap-3">
      <span className="text-sm" style={{ color: theme.node.text }}>
        {label}
      </span>
      <span onMouseDown={(event) => event.stopPropagation()}>
        <Switch size="small" checked={checked} onChange={onChange} />
      </span>
    </div>
  );
}

function readSizeDimensions(size: string) {
  if (size === 'auto') return { width: 0, height: 0 };
  const match = size.match(/^(\d+)x(\d+)$/);
  return { width: Number(match?.[1]) || 1280, height: Number(match?.[2]) || 720 };
}
