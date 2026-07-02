'use client';

import {
  audioFormatOptions,
  audioSpeedLabel,
  audioVoiceOptions,
  normalizeAudioFormatValue,
  normalizeAudioSpeedValue,
  normalizeAudioVoiceValue,
} from '@/lib/audio-generation';
import { type CanvasTheme } from '@/lib/canvas-theme';
import {
  SettingGroup,
  SettingsNumberInput,
  SettingsOptionPill,
  SettingsPanelTheme,
} from '@/shared/ui/settings-panel';
import type { AiConfig } from '@/stores/use-config-store';

const speedOptions = ['0.75', '1', '1.25', '1.5'];

type AudioSettingKey = 'audioVoice' | 'audioFormat' | 'audioSpeed' | 'audioInstructions';

type AudioSettingsPanelProps = {
  config: AiConfig;
  onConfigChange: (key: AudioSettingKey, value: string) => void;
  theme: CanvasTheme;
  showTitle?: boolean;
  className?: string;
};

export function AudioSettingsPanel({
  config,
  onConfigChange,
  theme,
  showTitle = true,
  className = 'w-[320px] space-y-4 rounded-2xl px-1 py-0.5',
}: AudioSettingsPanelProps) {
  const voice = normalizeAudioVoiceValue(config.audioVoice);
  const format = normalizeAudioFormatValue(config.audioFormat);
  const speed = normalizeAudioSpeedValue(config.audioSpeed);

  return (
    <SettingsPanelTheme theme={theme}>
      <div
        className={className}
        style={{ color: theme.node.text }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {showTitle ? <div className="text-lg font-semibold">音频设置</div> : null}
        <SettingGroup title="声音" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {audioVoiceOptions.map((item) => (
              <SettingsOptionPill
                key={item.value}
                selected={voice === item.value}
                theme={theme}
                onClick={() => onConfigChange('audioVoice', item.value)}
              >
                {item.label}
              </SettingsOptionPill>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup title="格式" color={theme.node.muted}>
          <div className="grid grid-cols-3 gap-2.5">
            {audioFormatOptions.map((item) => (
              <SettingsOptionPill
                key={item.value}
                selected={format === item.value}
                theme={theme}
                onClick={() => onConfigChange('audioFormat', item.value)}
              >
                {item.label}
              </SettingsOptionPill>
            ))}
          </div>
        </SettingGroup>
        <SettingGroup title="语速" color={theme.node.muted}>
          <div className="grid grid-cols-4 gap-2.5">
            {speedOptions.map((value) => (
              <SettingsOptionPill
                key={value}
                selected={speed === value}
                theme={theme}
                onClick={() => onConfigChange('audioSpeed', value)}
              >
                {audioSpeedLabel(value)}
              </SettingsOptionPill>
            ))}
          </div>
          <SettingsNumberInput
            value={config.audioSpeed || '1'}
            min={0.25}
            max={4}
            step={0.05}
            theme={theme}
            className="w-full"
            onChange={(value) => onConfigChange('audioSpeed', value)}
            onBlur={(value) => onConfigChange('audioSpeed', normalizeAudioSpeedValue(value))}
          />
        </SettingGroup>
        <SettingGroup title="声音指令" color={theme.node.muted}>
          <textarea
            value={config.audioInstructions || ''}
            placeholder="例如：自然、温暖、适合旁白。"
            className="thin-scrollbar h-20 w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm leading-5 outline-none"
            style={{ borderColor: theme.node.stroke, color: theme.node.text }}
            onChange={(event) => onConfigChange('audioInstructions', event.target.value)}
            onMouseDown={(event) => event.stopPropagation()}
          />
        </SettingGroup>
      </div>
    </SettingsPanelTheme>
  );
}
