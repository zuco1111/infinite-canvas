import { Switch } from 'antd';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import type { ThemeName } from '@/features/settings';

import {
  createDesignLabPreviewMessage,
  createDesignLabPreviewUrl,
} from './design-lab-preview-state';

type ViewportName = 'fluid' | 'desktop' | 'mobile';

type DesignLabAppProps = {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
};

type ViewportOption = {
  label: string;
  description: string;
  frameClassName: string;
};

const viewportOptions: Record<ViewportName, ViewportOption> = {
  fluid: {
    label: '自适应',
    description: '跟随浏览器视口',
    frameClassName: 'h-full min-h-[640px] w-full min-w-0',
  },
  desktop: {
    label: '桌面',
    description: '1440 × 900',
    frameClassName: 'h-[900px] w-[1440px]',
  },
  mobile: {
    label: '移动',
    description: '390 × 844',
    frameClassName: 'h-[844px] w-[390px]',
  },
};

export function DesignLabApp({ theme, onThemeChange }: DesignLabAppProps) {
  const [viewport, setViewport] = useState<ViewportName>('fluid');
  const [motionFreeze, setMotionFreeze] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const [previewUrl] = useState(() => createDesignLabPreviewUrl({ theme, motionFreeze }));
  const viewportOption = viewportOptions[viewport];
  const previewFrameClassName = [
    'mx-auto block shrink-0 border-0 bg-background shadow-sm',
    viewportOption.frameClassName,
  ].join(' ');

  const syncPreviewState = useCallback(() => {
    previewFrameRef.current?.contentWindow?.postMessage(
      createDesignLabPreviewMessage({ theme, motionFreeze }),
      window.location.origin,
    );
  }, [motionFreeze, theme]);

  useEffect(() => {
    syncPreviewState();
  }, [syncPreviewState]);

  useEffect(() => {
    document.documentElement.classList.toggle('design-lab-motion-freeze', motionFreeze);
    return () => document.documentElement.classList.remove('design-lab-motion-freeze');
  }, [motionFreeze]);

  return (
    <div
      className="flex h-dvh min-w-0 flex-col overflow-hidden bg-background text-foreground"
      data-testid="design-lab-root"
    >
      <header
        aria-label="Design Lab 控制栏"
        className="z-10 shrink-0 border-b border-border bg-card px-4 py-3 shadow-sm lg:px-6"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">Design Lab</h1>
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-foreground">
                阶段三 · 只读审计
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              相似的现有样式并置比较；不创建目标规格，不修改生产视觉
            </p>
          </div>

          <div
            aria-label="评审环境控制"
            className="flex flex-wrap items-end gap-3"
            data-testid="design-lab-controls"
            role="group"
          >
            <ControlGroup label="主题">
              <ChoiceButton
                active={theme === 'light'}
                label="浅色"
                onClick={() => onThemeChange('light')}
                testId="design-lab-theme-light"
              />
              <ChoiceButton
                active={theme === 'dark'}
                label="深色"
                onClick={() => onThemeChange('dark')}
                testId="design-lab-theme-dark"
              />
            </ControlGroup>

            <ControlGroup label="预览视口">
              {(Object.keys(viewportOptions) as ViewportName[]).map((name) => (
                <ChoiceButton
                  active={viewport === name}
                  key={name}
                  label={viewportOptions[name].label}
                  onClick={() => setViewport(name)}
                  testId={`design-lab-viewport-${name}`}
                  title={viewportOptions[name].description}
                />
              ))}
            </ControlGroup>

            <label className="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm">
              <Switch
                aria-label="冻结动态预览（评审工具）"
                checked={motionFreeze}
                data-testid="design-lab-motion-freeze"
                onChange={setMotionFreeze}
                size="small"
              />
              冻结动态预览（评审工具）
            </label>
          </div>
        </div>
      </header>

      <main
        className="min-h-0 flex-1 overflow-auto bg-muted p-3 sm:p-5"
        data-design-lab-motion-freeze={motionFreeze ? 'true' : 'false'}
        data-design-lab-theme={theme}
        data-design-lab-viewport={viewport}
        data-testid="design-lab-preview"
      >
        <iframe
          aria-label={`${viewportOption.label}预览区，${viewportOption.description}`}
          className={previewFrameClassName}
          data-testid="design-lab-preview-frame"
          onLoad={syncPreviewState}
          ref={previewFrameRef}
          src={previewUrl}
          title="Design Lab 当前实现预览"
        />
      </main>
    </div>
  );
}

function ControlGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-label={label} className="grid gap-1" role="group">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="inline-flex h-8 rounded-md border border-border bg-background p-0.5">
        {children}
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
  testId,
  title,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  testId: string;
  title?: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        'rounded px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
      data-testid={testId}
      onClick={onClick}
      title={title}
      type="button"
    >
      {label}
    </button>
  );
}
