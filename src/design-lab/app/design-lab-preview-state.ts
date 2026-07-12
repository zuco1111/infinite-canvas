import type { ThemeName } from '@/features/settings';

export type DesignLabPreviewState = {
  theme: ThemeName;
  motionFreeze: boolean;
};

type DesignLabPreviewMessage = DesignLabPreviewState & {
  channel: 'infinite-canvas-design-lab';
  type: 'set-preview-state';
};

export function createDesignLabPreviewUrl(state: DesignLabPreviewState) {
  const searchParams = new URLSearchParams({
    theme: state.theme,
    motionFreeze: state.motionFreeze ? 'true' : 'false',
  });
  return `./design-lab-preview.html?${searchParams}`;
}

export function readDesignLabPreviewState(search: string): DesignLabPreviewState {
  const searchParams = new URLSearchParams(search);
  const motionFreeze = searchParams.get('motionFreeze');
  return {
    theme: searchParams.get('theme') === 'dark' ? 'dark' : 'light',
    motionFreeze:
      motionFreeze === 'true' ||
      (motionFreeze === null && searchParams.get('reducedMotion') === 'reduce'),
  };
}

export function createDesignLabPreviewMessage(
  state: DesignLabPreviewState,
): DesignLabPreviewMessage {
  return {
    channel: 'infinite-canvas-design-lab',
    type: 'set-preview-state',
    ...state,
  };
}

export function isDesignLabPreviewMessage(value: unknown): value is DesignLabPreviewMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<DesignLabPreviewMessage>;
  return (
    message.channel === 'infinite-canvas-design-lab' &&
    message.type === 'set-preview-state' &&
    (message.theme === 'light' || message.theme === 'dark') &&
    typeof message.motionFreeze === 'boolean'
  );
}
