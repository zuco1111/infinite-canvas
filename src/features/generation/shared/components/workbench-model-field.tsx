'use client';

import { ModelPicker, type AiConfig, type ModelCapability } from '@/features/settings';

export function GenerationWorkbenchModelField({
  config,
  model,
  capability,
  onChange,
  openConfigDialog,
}: {
  config: AiConfig;
  model: string;
  capability: ModelCapability;
  onChange: (value: string) => void;
  openConfigDialog: (shouldPromptContinue?: boolean) => void;
}) {
  return (
    <label className="col-span-2 block min-w-0 sm:col-span-1">
      <span className="mb-1.5 block text-sm font-semibold sm:mb-2 sm:text-base">模型</span>
      <ModelPicker
        config={config}
        value={model}
        onChange={onChange}
        capability={capability}
        fullWidth
        onMissingConfig={() => openConfigDialog(false)}
      />
    </label>
  );
}
