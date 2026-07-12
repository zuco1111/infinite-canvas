import { useEffect, useState } from 'react';

import { AppVisualProviders } from '@/app/providers/app-visual-providers';

import { DesignLabCatalog } from '../catalog';
import {
  isDesignLabPreviewMessage,
  readDesignLabPreviewState,
  type DesignLabPreviewState,
} from './design-lab-preview-state';

export function DesignLabPreviewRoot() {
  const [previewState, setPreviewState] = useState<DesignLabPreviewState>(() =>
    readDesignLabPreviewState(window.location.search),
  );

  useEffect(() => {
    const receivePreviewState = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        !isDesignLabPreviewMessage(event.data)
      ) {
        return;
      }
      setPreviewState({
        theme: event.data.theme,
        motionFreeze: event.data.motionFreeze,
      });
    };

    window.addEventListener('message', receivePreviewState);
    return () => window.removeEventListener('message', receivePreviewState);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'design-lab-motion-freeze',
      previewState.motionFreeze,
    );
    return () => document.documentElement.classList.remove('design-lab-motion-freeze');
  }, [previewState.motionFreeze]);

  return (
    <AppVisualProviders theme={previewState.theme}>
      <div
        className="h-dvh overflow-hidden bg-background text-foreground"
        data-design-lab-motion-freeze={previewState.motionFreeze ? 'true' : 'false'}
        data-design-lab-theme={previewState.theme}
        data-testid="design-lab-preview-root"
      >
        <DesignLabCatalog />
      </div>
    </AppVisualProviders>
  );
}
