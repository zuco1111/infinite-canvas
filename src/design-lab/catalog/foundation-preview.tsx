import { type Ref, useLayoutEffect, useRef, useState } from 'react';
import { Button, Input, theme as antdTheme } from 'antd';
import { Aperture, Circle, Gauge, ScanSearch, Sparkles, Square } from 'lucide-react';

import { appThemeTokens } from '@/shared/tokens/app';
import { canvasThemeTokens, canvasTokens } from '@/shared/tokens/canvas';
import { Select, SelectTrigger } from '@/shared/ui/select';
import { SettingsPanelTheme } from '@/shared/ui/settings-panel';

import {
  activeTailwindBreakpoint,
  flattenTokenRecord,
  semanticCssVariableNames,
  useInheritedThemeMode,
  useResolvedSemanticCssVariables,
  useViewportWidth,
} from './catalog-runtime';
import styles from './catalog.module.css';

export function FoundationPreview({ inventoryId }: { inventoryId: string }) {
  switch (inventoryId) {
    case 'FND-THEME-PROVIDER':
      return <ThemeProviderPreview />;
    case 'FND-COLOR-APP-TS':
      return <AppTokenPreview />;
    case 'FND-COLOR-CSS':
      return <CssTokenPreview />;
    case 'FND-COLOR-CANVAS':
      return <CanvasTokenPreview />;
    case 'FND-COLOR-CANVAS-LEGACY':
      return <LegacyCanvasTokenPreview />;
    case 'FND-ANT-GLOBAL':
      return <AntGlobalPreview />;
    case 'FND-ANT-TABLE-UNUSED':
      return <UnusedTableTokenPreview />;
    case 'FND-ANT-CANVAS-LOCAL':
      return <CanvasLocalAntPreview />;
    case 'FND-COLOR-HARDCODED':
      return <HardcodedColorPreview />;
    case 'FND-COLOR-UTILITY-RAW':
      return <RawColorUtilityPreview />;
    case 'FND-TYPOGRAPHY':
      return <TypographyPreview />;
    case 'FND-SPACING':
      return <SpacingPreview />;
    case 'FND-SIZE':
      return <SizePreview />;
    case 'FND-RADIUS':
      return <RadiusPreview />;
    case 'FND-BORDER':
      return <BorderPreview />;
    case 'FND-SHADOW':
      return <ShadowPreview />;
    case 'FND-LAYER':
      return <LayerPreview />;
    case 'FND-OPACITY-BLUR':
      return <OpacityBlurPreview />;
    case 'FND-MOTION':
      return <MotionPreview />;
    case 'FND-BREAKPOINT':
      return <BreakpointPreview />;
    case 'FND-ICON-SIZE':
      return <IconSizePreview />;
    case 'FND-TAILWIND-ARBITRARY':
      return <InvalidTailwindPreview />;
    case 'FND-INLINE-STYLE':
      return <InlineStylePreview />;
    default:
      return <p className={styles.note}>No current-state preview is registered.</p>;
  }
}

function ThemeProviderPreview() {
  const { token } = antdTheme.useToken();
  const { mode, values } = useResolvedSemanticCssVariables();
  const colorScheme = useDocumentColorScheme(mode);
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <CurrentFact label="Inherited mode" value={mode} />
        <CurrentFact label="computed color-scheme" value={colorScheme} />
        <CurrentFact label="CSS --background" value={values['--background'] || 'resolving'} />
        <CurrentFact label="Ant colorBgBase" value={String(token.colorBgBase)} />
      </div>
      <p className={styles.note}>
        The catalog does not create a theme provider. It resolves the provider, html class and CSS
        variables inherited from the Design Lab shell.
      </p>
    </div>
  );
}

function AppTokenPreview() {
  const mode = useInheritedThemeMode();
  return (
    <TokenGrid
      items={flattenTokenRecord(appThemeTokens[mode] as unknown as Record<string, unknown>)}
      prefix={`appThemeTokens.${mode}`}
    />
  );
}

function CssTokenPreview() {
  const { mode, values } = useResolvedSemanticCssVariables();
  return (
    <TokenGrid
      items={semanticCssVariableNames.map((name) => ({
        name,
        value: values[name] || 'resolving',
      }))}
      prefix={`computed :root (${mode})`}
    />
  );
}

function CanvasTokenPreview() {
  const mode = useInheritedThemeMode();
  return (
    <TokenGrid
      items={flattenTokenRecord(canvasThemeTokens[mode] as unknown as Record<string, unknown>)}
      prefix={`canvasThemeTokens.${mode}`}
    />
  );
}

function LegacyCanvasTokenPreview() {
  return (
    <div className={styles.sampleColumn}>
      <p className={styles.note}>
        These aliases are pinned to <span className={styles.noteStrong}>dark</span> and have no
        production consumers.
      </p>
      <TokenGrid
        items={flattenTokenRecord(canvasTokens as unknown as Record<string, unknown>)}
        prefix="canvasTokens"
      />
    </div>
  );
}

function AntGlobalPreview() {
  const { token } = antdTheme.useToken();
  const items = [
    ['colorBgBase', token.colorBgBase],
    ['colorBgContainer', token.colorBgContainer],
    ['colorBgElevated', token.colorBgElevated],
    ['colorText', token.colorText],
    ['colorTextSecondary', token.colorTextSecondary],
    ['colorPrimary', token.colorPrimary],
    ['colorError', token.colorError],
    ['colorWarning', token.colorWarning],
    ['colorSuccess', token.colorSuccess],
    ['colorBorder', token.colorBorder],
    ['borderRadius', token.borderRadius],
    ['controlHeight', token.controlHeight],
    ['controlHeightSM', token.controlHeightSM],
    ['controlHeightLG', token.controlHeightLG],
    ['zIndexPopupBase', token.zIndexPopupBase],
  ].map(([name, value]) => ({ name: String(name), value: String(value) }));
  return (
    <div className={styles.sampleColumn}>
      <TokenGrid items={items} prefix="theme.useToken()" />
      <div className={styles.sampleRow}>
        <Button size="small">Small 28</Button>
        <Button>Default 32</Button>
        <Button size="large">Large 40</Button>
        <Button type="primary">Primary</Button>
        <Button danger>Danger</Button>
      </div>
    </div>
  );
}

function UnusedTableTokenPreview() {
  const mode = useInheritedThemeMode();
  const colors = appThemeTokens[mode];
  return (
    <div className={styles.sampleColumn}>
      <TokenGrid
        items={[
          { name: 'tableSelectedBg', value: colors.tableSelectedBg },
          { name: 'tableSelectedHoverBg', value: colors.tableSelectedHoverBg },
        ]}
        prefix={`appThemeTokens.${mode}`}
      />
      <p className={styles.note}>
        Inventory result: ThemeConfig still maps both values, while the production UI has no Ant
        Table consumer. No table is fabricated here.
      </p>
    </div>
  );
}

function CanvasLocalAntPreview() {
  const mode = useInheritedThemeMode();
  const canvasTheme = canvasThemeTokens[mode];
  return (
    <SettingsPanelTheme theme={canvasTheme}>
      <div className={styles.sampleColumn}>
        <div className={styles.sampleRow}>
          <Button>Local default</Button>
          <Button disabled>Local disabled</Button>
          <Button type="primary">Local primary</Button>
        </div>
        <p className={styles.note} style={{ color: canvasTheme.node.muted }}>
          Real SettingsPanelTheme nested ConfigProvider using the inherited {mode} Canvas branch.
        </p>
      </div>
    </SettingsPanelTheme>
  );
}

function HardcodedColorPreview() {
  return (
    <TokenGrid
      prefix="representative inventory literals"
      items={[
        { name: 'canvas selection/reference', value: '#2f80ff' },
        { name: 'canvas danger', value: '#ef4444' },
        { name: 'canvas danger light', value: '#f87171' },
        { name: 'minimap image', value: '#10b981' },
        { name: 'minimap video', value: '#f97316' },
        { name: 'minimap audio', value: '#a855f7' },
        { name: 'minimap config', value: '#60a5fa' },
      ]}
    />
  );
}

function RawColorUtilityPreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <UtilityColorSample className="bg-black" label="bg-black" />
        <UtilityColorSample className="bg-white" label="bg-white" />
        <UtilityColorSample className="bg-black/55" label="bg-black/55" />
        <UtilityColorSample className="bg-[#2f80ff]" label="bg-[#2f80ff]" />
      </div>
      <p className={styles.note}>
        These four classes are present in CURRENT_COLORS.json and execute the current Tailwind
        output. Their presence is inventory evidence, not approval to promote them to semantic
        tokens.
      </p>
    </div>
  );
}

function UtilityColorSample({ className, label }: { className: string; label: string }) {
  return (
    <div className={styles.scaleItem}>
      <span className={`${styles.swatch} ${className}`} aria-hidden="true" />
      <span className={styles.scaleLabel}>{label}</span>
    </div>
  );
}

function TypographyPreview() {
  const inheritedSampleRef = useRef<HTMLSpanElement>(null);
  const [inheritedFontFamily, setInheritedFontFamily] = useState('measuring');

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setInheritedFontFamily(
        inheritedSampleRef.current
          ? getComputedStyle(inheritedSampleRef.current).fontFamily
          : 'n/a',
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.sampleColumn}>
      <CurrentFact label="computed inherited font-family" value={inheritedFontFamily} />
      <div className={styles.sampleGrid}>
        <TypeSample
          sampleRef={inheritedSampleRef}
          className="text-sm font-normal"
          label="inherited / 14 / 400"
        />
        <TypeSample className="text-base font-medium" label="inherited / 16 / 500" />
        <TypeSample className="text-2xl font-semibold" label="inherited / 24 / 600" />
        <TypeSample className="font-mono text-sm" label="mono / 14 / 400" />
        <TypeSample className="font-serif text-sm font-bold" label="serif / 14 / 700" />
      </div>
      <div className={styles.longText} title="超长中文与 long-unbroken-english-identifier">
        超长中文内容用于确认当前截断行为 long-unbroken-english-identifier-without-breaks
      </div>
      <p className={styles.note}>
        Inter is declared but not packaged; the resolved font depends on the current platform.
      </p>
    </div>
  );
}

function TypeSample({
  className,
  label,
  sampleRef,
}: {
  className: string;
  label: string;
  sampleRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <div className={styles.typeSample}>
      <span className={styles.typeLabel}>{label}</span>
      <span ref={sampleRef} className={className}>
        Infinite Canvas 视觉样本 Aa 0123
      </span>
    </div>
  );
}

function SpacingPreview() {
  const values = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80];
  return (
    <div className={styles.spacingScale}>
      {values.map((value) => (
        <div key={value} className={styles.scaleItem}>
          <span className={styles.spacingBar} style={{ height: Math.max(2, value) }} />
          <span className={styles.scaleLabel}>{value}px</span>
        </div>
      ))}
    </div>
  );
}

function SizePreview() {
  const values = [24, 28, 32, 36, 40, 48, 56, 64];
  return (
    <div className={styles.sizeScale}>
      {values.map((value) => (
        <div key={value} className={styles.scaleItem}>
          <span className={styles.sizeBar} style={{ height: value }} />
          <span className={styles.scaleLabel}>{value}px</span>
        </div>
      ))}
    </div>
  );
}

function RadiusPreview() {
  const fullRadiusRef = useRef<HTMLSpanElement>(null);
  const [fullRadius, setFullRadius] = useState('measuring');
  const values = [1, 3, 4, 5, 6, 8, 12, 14.4, 17.6, 18, 20.8, 24];

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setFullRadius(
        fullRadiusRef.current ? getComputedStyle(fullRadiusRef.current).borderRadius : 'n/a',
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.radiusScale}>
      {values.map((value) => (
        <div key={value} className={styles.scaleItem}>
          <span className={styles.radiusBox} style={{ borderRadius: value }} />
          <span className={styles.scaleLabel}>{value}px</span>
        </div>
      ))}
      <div className={styles.scaleItem}>
        <span ref={fullRadiusRef} className={`${styles.radiusBox} rounded-full`} />
        <span className={styles.scaleLabel}>rounded-full / computed {fullRadius}</span>
      </div>
    </div>
  );
}

function BorderPreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Input aria-label="Default Ant Input border" value="Default" readOnly />
        <Input
          aria-label="Error Ant Input border"
          aria-invalid="true"
          status="error"
          value="Error"
          readOnly
        />
        <Input aria-label="Disabled Ant Input border" value="Disabled" disabled readOnly />
      </div>
      <p className={styles.note}>
        Real Ant Input default, error and disabled states used in
        src/features/settings/components/app-config-modal.tsx. Use Tab to inspect the
        src/app/theme/app-theme.ts focus border; missing Tailwind error/focus output remains a
        separate measured probe under FND-TAILWIND-ARBITRARY.
      </p>
    </div>
  );
}

function ShadowPreview() {
  return (
    <div className={styles.sampleRow}>
      <div className={`${styles.shadowSample} shadow-sm`}>shadow-sm</div>
      <div className={`${styles.shadowSample} shadow-md`}>shadow-md</div>
      <div className={`${styles.shadowSample} shadow-xl`}>shadow-xl</div>
      <div
        className={styles.shadowSample}
        style={{ boxShadow: '0 12px 28px rgba(28, 25, 23, 0.08)' }}
      >
        Home literal
      </div>
    </div>
  );
}

function LayerPreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.layerStage} aria-label="Current z-index sample stack">
        <div className={styles.layerItem} style={{ left: 16, top: 132, zIndex: 50 }}>
          Radix default z50
        </div>
        <div className={styles.layerItem} style={{ left: 86, top: 78, zIndex: 1000 }}>
          Ant popup base 1000
        </div>
        <div className={styles.layerItem} style={{ left: 156, top: 24, zIndex: 1200 }}>
          Canvas portal 1200
        </div>
      </div>
      <p className={styles.note}>
        Spatial offsets are fixture-only; the labels are current values.
      </p>
    </div>
  );
}

function OpacityBlurPreview() {
  const values = [10, 30, 50, 70, 90, 100];
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.opacityScale}>
        {values.map((value) => (
          <div key={value} className={styles.scaleItem}>
            <span
              className={styles.radiusBox}
              style={{ borderRadius: 6, background: 'var(--primary)', opacity: value / 100 }}
            />
            <span className={styles.scaleLabel}>{value}%</span>
          </div>
        ))}
      </div>
      <div className={styles.blurStage}>
        <div className={styles.blurBackdrop}>backdrop-filter: blur(12px)</div>
      </div>
    </div>
  );
}

function MotionPreview() {
  const { systemReducedMotion, reviewMotionFreeze } = useMotionContextState();
  const tailwindDurations = [100, 150, 200, 300, 500];
  return (
    <div className={styles.sampleColumn}>
      <p className={styles.note}>
        <span className={styles.noteStrong}>Production Tailwind duration utilities</span>
      </p>
      <div className={styles.sampleRow}>
        {tailwindDurations.map((value) => (
          <CurrentFact key={value} label={`duration-${value}`} value={`${value}ms`} />
        ))}
      </div>
      <p className={styles.note}>
        <span className={styles.noteStrong}>Production local rules</span>
      </p>
      <div className={styles.sampleRow}>
        <CurrentFact label="Canvas node inline transition" value="200ms" />
        <CurrentFact label="Theme toggler default" value="400ms" />
        <CurrentFact label="DiaTextReveal default" value="1.5s" />
        <CurrentFact label="ai-title-aurora" value="7s" />
      </div>
      <div className={styles.sampleRow}>
        <CurrentFact
          label="System prefers-reduced-motion"
          value={systemReducedMotion ? 'reduce' : 'no-preference'}
        />
        <CurrentFact
          label="Design Lab review freeze"
          value={reviewMotionFreeze ? 'enabled' : 'disabled'}
        />
      </div>
      <p className={styles.note}>
        The review freeze is a Design Lab screenshot control; it is not a production motion rule and
        does not change the system media-query result. No fabricated animated fixture is presented
        as current production behavior.
      </p>
    </div>
  );
}

function BreakpointPreview() {
  const width = useViewportWidth();
  const active = activeTailwindBreakpoint(width);
  const points = [
    ['base', '<640'],
    ['sm', '640'],
    ['md', '768'],
    ['lg', '1024'],
    ['xl', '1280'],
    ['2xl', '1536'],
  ];
  return (
    <div className={styles.sampleColumn}>
      <p className={styles.note}>
        Current viewport: <span className={styles.noteStrong}>{Math.round(width)}px</span>; active
        default range: <span className={styles.noteStrong}>{active}</span>
      </p>
      <div className={styles.breakpointGrid}>
        {points.map(([name, value]) => (
          <div key={name} className={styles.breakpointItem} data-active={name === active}>
            {name} / {value}px
          </div>
        ))}
        <div className={styles.breakpointItem}>container / 440px</div>
      </div>
    </div>
  );
}

function IconSizePreview() {
  const toolbarIconRef = useRef<SVGSVGElement>(null);
  const [toolbarIconSize, setToolbarIconSize] = useState('measuring');
  const values = [12, 14, 16, 20, 24, 28, 32, 44];
  const icons = [ScanSearch, Circle, Square, Aperture, Gauge, Sparkles];

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const rect = toolbarIconRef.current?.getBoundingClientRect();
      setToolbarIconSize(rect ? `${Math.round(rect.width)} x ${Math.round(rect.height)}px` : 'n/a');
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.iconScale}>
      {values.map((value, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div key={value} className={styles.iconItem}>
            <Icon size={value} aria-hidden="true" />
            <span className={styles.scaleLabel}>{value}px</span>
          </div>
        );
      })}
      <div className={styles.iconItem}>
        <ScanSearch ref={toolbarIconRef} className="size-4.5" aria-hidden="true" />
        <span className={styles.scaleLabel}>size-4.5 intent 18px / computed {toolbarIconSize}</span>
      </div>
    </div>
  );
}

function InvalidTailwindPreview() {
  const mode = useInheritedThemeMode();
  const sizeRef = useRef<HTMLSpanElement>(null);
  const backgroundRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLButtonElement>(null);
  const invalidProbeRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState({
    size: 'measuring',
    background: 'measuring',
    ring: 'measuring',
    invalidRing: 'measuring',
  });

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const sizeRect = sizeRef.current?.getBoundingClientRect();
      const backgroundStyle = backgroundRef.current
        ? getComputedStyle(backgroundRef.current)
        : null;
      const ringStyle = ringRef.current ? getComputedStyle(ringRef.current) : null;
      const invalidTrigger = invalidProbeRef.current?.querySelector<HTMLElement>(
        '[data-slot="select-trigger"]',
      );
      const invalidStyle = invalidTrigger ? getComputedStyle(invalidTrigger) : null;
      setSnapshot({
        size: sizeRect ? `${Math.round(sizeRect.width)} x ${Math.round(sizeRect.height)}px` : 'n/a',
        background: backgroundStyle?.backgroundColor || 'n/a',
        ring: ringStyle?.boxShadow || 'none',
        invalidRing: invalidStyle?.boxShadow || 'none',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  return (
    <div className={styles.sampleColumn}>
      <table className={styles.intentTable}>
        <thead>
          <tr>
            <th>Source class</th>
            <th>Source intent</th>
            <th>Current computed result</th>
            <th>Probe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.code}>size-4.5</td>
            <td>18 x 18px icon</td>
            <td>{snapshot.size}; no Tailwind 3 rule was emitted.</td>
            <td>
              <span ref={sizeRef} className={`${styles.probeIcon} size-4.5`}>
                <ScanSearch size={24} aria-hidden="true" />
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.code}>bg-[#2f80ff]/16</td>
            <td>#2f80ff at 16% opacity</td>
            <td>background-color: {snapshot.background}</td>
            <td>
              <span ref={backgroundRef} className={`${styles.colorProbe} bg-[#2f80ff]/16`}>
                BG
              </span>
            </td>
          </tr>
          <tr>
            <td className={styles.code}>ring-[#2f80ff]/24</td>
            <td>Blue ring at 24% opacity</td>
            <td>box-shadow: {snapshot.ring}</td>
            <td>
              <button
                ref={ringRef}
                type="button"
                className={`${styles.ringProbe} ring-2 ring-[#2f80ff]/24`}
              >
                Ring
              </button>
            </td>
          </tr>
          <tr>
            <td className={styles.code}>aria-invalid:ring-destructive/20</td>
            <td>Error ring when aria-invalid=true</td>
            <td>box-shadow: {snapshot.invalidRing}</td>
            <td>
              <div ref={invalidProbeRef}>
                <Select value="invalid-probe">
                  <SelectTrigger
                    aria-label="Invalid shared SelectTrigger probe"
                    aria-invalid="true"
                  >
                    <span>Invalid</span>
                  </SelectTrigger>
                </Select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.note}>
        The aria-invalid probe renders the real SelectTrigger from src/shared/ui/select.tsx; all
        probes preserve source intent and actual output without repairing classes or adding
        replacement CSS.
      </p>
    </div>
  );
}

function InlineStylePreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <div
          className={`${styles.inlineFixture} border border-border`}
          style={{
            backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          Exact source: CanvasRefreshShell backgroundImage and 28px backgroundSize.
        </div>
        <div
          className={`${styles.inlineFixture} rounded-md border shadow-[inset_0_-1px_0_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]`}
          style={{
            background: 'linear-gradient(#fff, rgba(245,245,244,.92))',
            borderColor: 'rgba(120,113,108,.28)',
            color: 'rgb(68,64,60)',
          }}
        >
          Exact source: CanvasTopBar Shortcut key visual literals.
        </div>
      </div>
      <div className={styles.sampleRow}>
        <CurrentFact
          label="CanvasNode transform source"
          value={'translate(${data.position.x}px, ${data.position.y}px)'}
        />
        <CurrentFact label="CanvasNode width source" value="data.width" />
        <CurrentFact label="CanvasNode height source" value="data.height" />
      </div>
      <p className={styles.note}>
        Static fixtures copy exact production declarations from
        src/features/canvas/components/workspace/canvas-refresh-shell.tsx and canvas-top-bar.tsx.
        Runtime geometry from canvas-node.tsx is recorded as its source expression rather than an
        invented Design Lab value.
      </p>
    </div>
  );
}

function useDocumentColorScheme(mode: string) {
  const [colorScheme, setColorScheme] = useState('measuring');

  useLayoutEffect(() => {
    const read = () => {
      setColorScheme(getComputedStyle(document.documentElement).colorScheme || 'normal');
    };
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    const frame = requestAnimationFrame(read);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode]);

  return colorScheme;
}

function useMotionContextState() {
  const [state, setState] = useState(() => readMotionContextState());

  useLayoutEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const previewRoot = document.querySelector<HTMLElement>('[data-design-lab-motion-freeze]');
    const read = () => setState(readMotionContextState());
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-design-lab-motion-freeze'],
    });
    if (previewRoot) {
      observer.observe(previewRoot, {
        attributes: true,
        attributeFilter: ['data-design-lab-motion-freeze'],
      });
    }
    media.addEventListener('change', read);
    const frame = requestAnimationFrame(read);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener('change', read);
      observer.disconnect();
    };
  }, []);

  return state;
}

function readMotionContextState() {
  if (typeof window === 'undefined') {
    return { systemReducedMotion: false, reviewMotionFreeze: false };
  }
  const documentRoot = document.documentElement;
  const previewRoot = document.querySelector<HTMLElement>('[data-design-lab-motion-freeze]');
  return {
    systemReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reviewMotionFreeze:
      documentRoot.classList.contains('design-lab-motion-freeze') ||
      documentRoot.dataset.designLabMotionFreeze === 'true' ||
      previewRoot?.dataset.designLabMotionFreeze === 'true',
  };
}

function CurrentFact({ label, value }: { label: string; value: string }) {
  return (
    <span className={styles.customPill} title={`${label}: ${value}`}>
      {label}: {value}
    </span>
  );
}

function TokenGrid({
  items,
  prefix,
}: {
  items: Array<{ name: string; value: string }>;
  prefix: string;
}) {
  return (
    <div className={styles.sampleColumn}>
      <p className={styles.note}>
        <span className={styles.noteStrong}>{prefix}</span> / {items.length} current values
      </p>
      <div className={styles.tokenGrid}>
        {items.map((item) => (
          <div key={item.name} className={styles.tokenItem}>
            <span
              className={styles.swatch}
              style={{ background: isColorValue(item.value) ? item.value : 'var(--muted)' }}
              aria-hidden="true"
            />
            <span className={styles.tokenText} title={`${item.name}: ${item.value}`}>
              <span className={styles.tokenName}>{item.name}</span>
              <span className={styles.tokenValue}>{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isColorValue(value: string) {
  return /^(#|rgb|hsl|var\(|transparent|color-mix)/i.test(value);
}
