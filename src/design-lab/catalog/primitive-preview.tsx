import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Progress,
  Segmented,
  Select as AntSelect,
  Slider,
  Spin,
  Switch,
  Tag,
  Tooltip,
} from 'antd';
import { Copy, ImagePlus, LoaderCircle, Menu, Plus, Search, Settings } from 'lucide-react';

import { AgentModeSwitch } from '@/features/assistant';
import { canvasThemes } from '@/shared/tokens/canvas-theme';
import { AppMultiSelectCheckbox } from '@/shared/ui/app-multi-select-checkbox';
import { CatalogTextAction } from '@/shared/ui/catalog-page';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/shared/ui/select';
import {
  SettingsDimensionInput,
  SettingsNumberInput,
  SettingsPanelTheme,
} from '@/shared/ui/settings-panel';

import { useInheritedThemeMode } from './catalog-runtime';
import styles from './catalog.module.css';

export function PrimitivePreview({ inventoryId }: { inventoryId: string }) {
  switch (inventoryId) {
    case 'PRM-C01':
      return <ButtonPreview />;
    case 'PRM-C02':
      return <LinkPreview />;
    case 'PRM-C03':
      return <InputPreview />;
    case 'PRM-C04':
      return <TextareaPreview />;
    case 'PRM-C05':
      return <NumberInputPreview />;
    case 'PRM-C06':
      return <SelectPreview />;
    case 'PRM-C07':
      return <CheckboxPreview />;
    case 'PRM-C08':
      return <SwitchPreview />;
    case 'PRM-C09':
      return <SegmentedPreview />;
    case 'PRM-C10':
      return <SliderPreview />;
    case 'PRM-C11':
      return <TagPreview />;
    case 'PRM-C12':
      return <TooltipPreview />;
    case 'PRM-C13':
      return <DisclosurePreview />;
    case 'PRM-C14':
      return <ProgressPreview />;
    case 'PRM-C15':
      return <RadioAbsencePreview />;
    case 'PRM-C16':
      return <SeparatorPreview />;
    case 'PRM-C17':
      return <FileInputPreview />;
    default:
      return <p className={styles.note}>No current-state preview is registered.</p>;
  }
}

function ButtonPreview() {
  const theme = useCanvasReviewTheme();
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Button size="small">Small</Button>
        <Button>Default</Button>
        <Button size="large">Large</Button>
        <Button type="primary">Primary</Button>
        <Button danger>Danger</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button aria-label="Add item" icon={<Plus size={16} />} />
      </div>
      <div className={styles.sampleRow}>
        <Button style={{ maxWidth: 240 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            超长按钮文案 long-button-label-with-overflow
          </span>
        </Button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full transition hover:bg-black/5 dark:hover:bg-white/10"
          style={{ color: theme.node.text }}
          aria-label="打开画布菜单"
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          className="max-w-[280px] truncate border-b border-dashed border-transparent text-left text-lg font-semibold tracking-normal transition hover:border-current"
          title="双击修改画布名称"
        >
          可双击编辑的画布标题
        </button>
      </div>
      <SourcePath path="src/features/canvas/components/workspace/canvas-top-bar.tsx" />
      <p className={styles.note}>
        RouteButton directly composes the real Ant Button, so it has no independent visual skin.
      </p>
    </div>
  );
}

function LinkPreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <a
          className="flex h-16 shrink-0 items-center gap-2 text-sm font-semibold leading-none tracking-tight text-foreground transition hover:opacity-75"
          href="#production-brand-link-fixture"
          onClick={(event) => event.preventDefault()}
        >
          <span className="text-base font-medium">无限画布</span>
        </a>
        <a
          className="relative flex h-16 max-w-48 shrink-0 items-center gap-2 text-sm leading-6 text-muted-foreground transition after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-transparent hover:text-foreground"
          href="#production-nav-link-fixture"
          onClick={(event) => event.preventDefault()}
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">超长内部导航链接文案 long-internal-link-label</span>
        </a>
      </div>
      <SourcePath path="src/app/shell/components/app-top-nav.tsx" />
      <p className={styles.note}>
        The production next/link shim resolves to these anchors and adds shared client-router
        behavior. This fixture prevents navigation while retaining the production class strings.
      </p>
    </div>
  );
}

function InputPreview() {
  const theme = useCanvasReviewTheme();
  const [title, setTitle] = useState('超长画布标题 long-canvas-title-for-overflow');
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleGrid}>
        <Input aria-label="Default Ant input" placeholder="Default input" />
        <Input.Search aria-label="Ant search input" placeholder="Search" enterButton />
        <Input.Password aria-label="Ant password input" value="current-password" readOnly />
        <Input aria-label="Ant error input" status="error" value="Error state" readOnly />
        <Input aria-label="Disabled Ant input" value="Disabled" disabled readOnly />
      </div>
      <div className="max-w-[280px]">
        <input
          aria-label="画布标题"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="max-w-[280px] bg-transparent p-0 text-left text-lg font-semibold tracking-normal outline-none"
          style={{ color: theme.node.text }}
        />
      </div>
      <SourcePath path="src/features/canvas/components/workspace/canvas-top-bar.tsx" />
    </div>
  );
}

function TextareaPreview() {
  const theme = useCanvasReviewTheme();
  const [agentPrompt, setAgentPrompt] = useState(
    'Agent composer 当前多行内容。\nSecond deterministic line.',
  );
  const [audioInstructions, setAudioInstructions] = useState('自然、温暖、适合旁白。');
  const [canvasText, setCanvasText] = useState('画布文本节点的原生编辑态。');
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleGrid}>
        <Input.TextArea
          aria-label="Ant textarea current state"
          rows={4}
          defaultValue={'Ant TextArea 当前多行内容。\nSecond deterministic line.'}
        />
        <Input.TextArea
          aria-label="Ant textarea error state"
          rows={4}
          status="error"
          value="Error state"
          readOnly
        />
      </div>
      <div className="max-w-xl">
        <textarea
          aria-label="Agent composer native textarea"
          value={agentPrompt}
          onChange={(event) => setAgentPrompt(event.target.value)}
          className="thin-scrollbar max-h-32 min-h-20 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm leading-5 outline-none placeholder:opacity-45"
          style={{ color: theme.node.text }}
          placeholder="询问 Agent"
        />
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx" />
      <p className={styles.note}>
        Only the production textarea class and state are isolated here; the full Agent composer
        pattern remains deferred to Phase 5.
      </p>
      <SettingsPanelTheme theme={theme}>
        <textarea
          value={audioInstructions}
          placeholder="例如：自然、温暖、适合旁白。"
          className="thin-scrollbar h-20 w-full max-w-xl resize-none rounded-xl border bg-transparent px-3 py-2 text-sm leading-5 outline-none"
          style={{ borderColor: theme.node.stroke, color: theme.node.text }}
          onChange={(event) => setAudioInstructions(event.target.value)}
          onMouseDown={(event) => event.stopPropagation()}
        />
      </SettingsPanelTheme>
      <SourcePath path="src/features/generation/audio/components/audio-settings-panel.tsx" />
      <div
        className="h-32 max-w-xl overflow-hidden rounded-xl border pt-8"
        style={{ background: theme.node.panel, borderColor: theme.node.stroke }}
      >
        <textarea
          aria-label="画布文本节点编辑器"
          className="thin-scrollbar m-0 block h-full w-full resize-none appearance-none overflow-y-auto whitespace-pre-wrap break-words border-none bg-transparent pl-4 pr-14 pt-0 pb-4 font-mono outline-none select-text"
          style={{
            boxSizing: 'border-box',
            color: theme.node.text,
            fontSize: '14px',
            lineHeight: '23px',
          }}
          value={canvasText}
          onChange={(event) => setCanvasText(event.target.value)}
        />
      </div>
      <SourcePath path="src/features/canvas/components/canvas-node.tsx" />
    </div>
  );
}

function NumberInputPreview() {
  const theme = useCanvasReviewTheme();
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [count, setCount] = useState('1');
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <InputNumber aria-label="Ant number input" min={1} max={100} defaultValue={24} />
        <InputNumber aria-label="Ant number input error" status="error" value={120} readOnly />
        <InputNumber aria-label="Disabled Ant number input" value={32} disabled readOnly />
      </div>
      <SettingsPanelTheme theme={theme}>
        <div className="grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-2.5">
          <SettingsDimensionInput
            prefix="W"
            value={width}
            disabled={false}
            theme={theme}
            alignToStep
            commitOnBlur
            onChange={(value) => value != null && setWidth(value)}
          />
          <span className="text-lg opacity-45">↔</span>
          <SettingsDimensionInput
            prefix="H"
            value={height}
            disabled={false}
            theme={theme}
            alignToStep
            commitOnBlur
            onChange={(value) => value != null && setHeight(value)}
          />
        </div>
        <label className="mt-2.5 grid max-w-64 gap-1.5 text-xs" style={{ color: theme.node.muted }}>
          <span>生成张数</span>
          <SettingsNumberInput
            value={count}
            min={1}
            max={15}
            theme={theme}
            className="w-full"
            onChange={setCount}
          />
        </label>
      </SettingsPanelTheme>
      <SourcePath path="src/shared/ui/settings-panel.tsx" />
    </div>
  );
}

function SelectPreview() {
  const [antValue, setAntValue] = useState('image');
  const [tagValues, setTagValues] = useState(['gpt-image-2']);
  const [radixValue, setRadixValue] = useState('gpt-image-2');
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <AntSelect
          aria-label="Ant current select"
          value={antValue}
          style={{ width: 180 }}
          onChange={setAntValue}
          options={[
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
            { value: 'audio', label: 'Audio' },
          ]}
        />
        <AntSelect
          aria-label="Ant error select"
          status="error"
          value="invalid"
          style={{ width: 180 }}
          options={[{ value: 'invalid', label: 'Error state' }]}
        />
        <AntSelect
          aria-label="Disabled Ant select"
          value="disabled"
          disabled
          style={{ width: 180 }}
          options={[{ value: 'disabled', label: 'Disabled' }]}
        />
        <AntSelect
          aria-label="Ant tags model options"
          mode="tags"
          showSearch
          allowClear
          maxTagCount="responsive"
          value={tagValues}
          style={{ width: 280 }}
          placeholder="输入模型名"
          onChange={setTagValues}
          options={[
            { value: 'gpt-image-2', label: 'gpt-image-2（默认渠道）' },
            { value: 'gpt-5.5', label: 'gpt-5.5（默认渠道）' },
          ]}
        />
        <Select value={radixValue} onValueChange={setRadixValue}>
          <SelectTrigger aria-label="Shared Radix current select" style={{ minWidth: 190 }}>
            <span>{radixValue}</span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={4}>
            <SelectItem value="gpt-image-2">gpt-image-2</SelectItem>
            <SelectItem value="gpt-5">gpt-5</SelectItem>
            <SelectItem value="disabled-option" disabled>
              Disabled option
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SourcePath path="src/features/settings/components/app-config-modal.tsx; src/shared/ui/select.tsx" />
      <table className={styles.intentTable}>
        <thead>
          <tr>
            <th>Radix source intent</th>
            <th>Current Tailwind 3 result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.code}>data-open:animate-in / data-closed:animate-out</td>
            <td>No generated rule; current open/close animation intent is absent.</td>
          </tr>
          <tr>
            <td className={styles.code}>origin-(--radix-select-content-transform-origin)</td>
            <td>No generated rule; transform-origin remains browser/library resolved.</td>
          </tr>
          <tr>
            <td className={styles.code}>aria-invalid:ring-destructive/20</td>
            <td>No generated semantic opacity rule; invalid styling is incomplete.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CheckboxPreview() {
  const [checked, setChecked] = useState(true);
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <AppMultiSelectCheckbox checked={false} onCheckedChange={() => undefined}>
          Unchecked
        </AppMultiSelectCheckbox>
        <AppMultiSelectCheckbox checked={checked} onCheckedChange={setChecked}>
          Checked
        </AppMultiSelectCheckbox>
        <AppMultiSelectCheckbox checked disabled onCheckedChange={() => undefined}>
          Disabled
        </AppMultiSelectCheckbox>
        <IndeterminateNativeCheckbox />
      </div>
      <p className={styles.note}>
        AppMultiSelectCheckbox currently exposes boolean checked only; indeterminate and error are
        recorded gaps. The indeterminate control is a native semantic reference, not a target style.
      </p>
    </div>
  );
}

function IndeterminateNativeCheckbox() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = true;
  }, []);
  return (
    <label className={styles.sampleRow}>
      <input ref={ref} type="checkbox" aria-label="Native indeterminate reference" />
      <span className={styles.note}>Native indeterminate reference</span>
    </label>
  );
}

function SwitchPreview() {
  const [checked, setChecked] = useState(true);
  return (
    <div className={styles.sampleRow}>
      <Switch aria-label="Unchecked switch" checked={false} />
      <Switch aria-label="Interactive checked switch" checked={checked} onChange={setChecked} />
      <Switch aria-label="Loading switch" checked loading />
      <Switch aria-label="Disabled switch" checked disabled />
      <Switch aria-label="Small switch" size="small" checked />
    </div>
  );
}

function SegmentedPreview() {
  const [value, setValue] = useState<string | number>('select');
  const [agentMode, setAgentMode] = useState<'online' | 'local'>('online');
  const theme = useCanvasReviewTheme();
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Segmented
          aria-label="Ant current segmented"
          value={value}
          onChange={setValue}
          options={[
            { label: 'Select', value: 'select' },
            { label: 'Hand', value: 'hand' },
            { label: 'Connect', value: 'connect' },
          ]}
        />
        <Segmented
          aria-label="Disabled Ant segmented"
          value="disabled"
          disabled
          options={['Disabled', 'Other']}
        />
      </div>
      <div className={styles.fitContentFixture}>
        <AgentModeSwitch value={agentMode} theme={theme} onChange={setAgentMode} />
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx" />
      <p className={styles.note}>
        The real AgentModeSwitch currently renders “网站 / 本机” native buttons and does not expose
        a radio or aria-pressed contract.
      </p>
    </div>
  );
}

function SliderPreview() {
  const [antValue, setAntValue] = useState(42);
  const [zoomValue, setZoomValue] = useState(100);
  const [scrollValue, setScrollValue] = useState(32);
  const theme = useCanvasReviewTheme();
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleGrid}>
        <label className={styles.sampleColumn}>
          <span className={styles.note}>Ant Slider: {antValue}</span>
          <div style={{ width: 'min(100%, 320px)' }}>
            <Slider min={0} max={100} value={antValue} onChange={setAntValue} />
          </div>
        </label>
        <label className={styles.sampleColumn}>
          <span className={styles.note}>Disabled Ant Slider</span>
          <div style={{ width: 'min(100%, 320px)' }}>
            <Slider value={50} disabled />
          </div>
        </label>
      </div>
      <label className={styles.sampleColumn}>
        <span className={styles.note}>Canvas zoom range: {zoomValue}%</span>
        <input
          type="range"
          min="5"
          max="500"
          step="1"
          value={zoomValue}
          className="w-24"
          style={{ accentColor: theme.node.activeStroke }}
          onChange={(event) => setZoomValue(Number(event.target.value))}
          aria-label="放大/缩小画布"
        />
      </label>
      <SourcePath path="src/features/canvas/components/canvas-zoom-controls.tsx" />
      <label className={styles.sampleColumn}>
        <span className={styles.note}>Canvas toolbar preview scrollbar: {scrollValue}</span>
        <span className="relative block h-10 max-w-xl">
          <input
            type="range"
            min={0}
            max={100}
            value={scrollValue}
            className="absolute bottom-4 left-10 right-10 h-2.5 cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-[var(--preview-scrollbar-thumb-width)] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#8d9498] [&::-moz-range-track]:h-2.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[#bdc4c8] [&::-webkit-slider-runnable-track]:h-2.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[#bdc4c8] [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-[var(--preview-scrollbar-thumb-width)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8d9498]"
            style={{ '--preview-scrollbar-thumb-width': '72px' } as CSSProperties}
            onInput={(event) => setScrollValue(Number(event.currentTarget.value))}
            onChange={(event) => setScrollValue(Number(event.target.value))}
          />
        </span>
      </label>
      <SourcePath path="src/features/canvas/components/canvas-image-toolbar-settings-modal.tsx" />
    </div>
  );
}

function TagPreview() {
  const [checked, setChecked] = useState(true);
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Tag>Default</Tag>
        <Tag color="success">Success</Tag>
        <Tag color="error">Error</Tag>
        <Tag closable>Closable</Tag>
        <Tag.CheckableTag checked={checked} onChange={setChecked}>
          Checkable
        </Tag.CheckableTag>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium"
          style={{
            borderColor: 'rgba(217,119,6,.22)',
            color: '#d97706',
            background: 'rgba(217,119,6,.04)',
          }}
        >
          等待确认
        </span>
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx" />
      <div className={styles.longText}>
        Tag overflow fixture: extremely-long-status-label-without-break-opportunity
      </div>
    </div>
  );
}

function TooltipPreview() {
  const theme = useCanvasReviewTheme();
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Tooltip title="复制当前值">
          <Button aria-label="Copy current value" icon={<Copy size={16} />} />
        </Tooltip>
        <Tooltip title="打开设置" placement="right">
          <Button
            type="text"
            className="!h-8 !w-8 !min-w-8 !p-0"
            style={{ color: theme.toolbar.item }}
            icon={<Settings className="size-4" />}
            aria-label="打开设置"
          />
        </Tooltip>
      </div>
      <SourcePath path="src/features/canvas/components/canvas-zoom-controls.tsx" />
      <p className={styles.note}>
        Hover or focus either icon button. The accessible name is carried by the button, not the
        Tooltip alone.
      </p>
    </div>
  );
}

function DisclosurePreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleGrid}>
        <AgentDisclosureState defaultOpen={false} />
        <AgentDisclosureState defaultOpen />
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx" />
      <p className={styles.note}>
        This fixture isolates the production details/summary surface; complete Agent tool-card
        compositions remain deferred to Phase 5.
      </p>
    </div>
  );
}

function AgentDisclosureState({ defaultOpen }: { defaultOpen: boolean }) {
  const theme = useCanvasReviewTheme();
  return (
    <details
      open={defaultOpen}
      className="min-w-0 flex-1 rounded-xl border px-4 py-3.5 text-left"
      style={{ borderColor: theme.node.stroke, background: 'transparent', color: theme.node.text }}
    >
      <summary className="cursor-pointer list-none">
        <span className="flex items-center justify-between gap-3 text-sm font-semibold leading-5">
          {defaultOpen ? '已展开的确定工具调用详情' : '已收起的确定工具调用详情'}
          <span className="text-xs font-normal" style={{ color: theme.node.muted }}>
            详情
          </span>
        </span>
      </summary>
      <pre
        className="thin-scrollbar mt-3 max-h-64 overflow-auto rounded-lg border p-3 text-[11px] leading-4"
        style={{
          borderColor: theme.node.stroke,
          background: theme.toolbar.panel,
          color: theme.node.muted,
        }}
      >
        {JSON.stringify({ name: 'canvas_apply_ops', status: 'pending' }, null, 2)}
      </pre>
    </details>
  );
}

function ProgressPreview() {
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <Spin size="small" />
        <Spin />
        <Spin size="large" />
        <LoaderCircle className="size-4 animate-spin" aria-label="16px Tailwind loader" />
        <LoaderCircle className="size-6 animate-spin" aria-label="24px Tailwind loader" />
        <span className={styles.note}>Working...</span>
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx; src/shared/ui/workbench-page.tsx" />
      <div style={{ width: 'min(100%, 520px)' }}>
        <Progress percent={68} />
        <Progress percent={100} status="success" />
        <Progress percent={42} status="exception" />
      </div>
    </div>
  );
}

function RadioAbsencePreview() {
  return (
    <p className={styles.note}>
      Confirmed current state: no production Radio implementation or call site was found. The
      catalog intentionally does not render a fabricated radio style.
    </p>
  );
}

function SeparatorPreview() {
  const theme = useCanvasReviewTheme();
  return (
    <div className={styles.sampleColumn}>
      <div className={styles.sampleRow}>
        <span>Canvas-private section A</span>
        <div
          className="mx-1 h-6 w-px"
          style={{ background: theme.toolbar.border }}
          role="separator"
          aria-orientation="vertical"
        />
        <span>Canvas-private section B</span>
      </div>
      <SourcePath path="src/features/canvas/components/canvas-toolbar.tsx" />
      <p className={styles.note}>
        The current Canvas-private Divider is vertical; no canonical separator component exists.
      </p>
    </div>
  );
}

function FileInputPreview() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('No local file selected');
  return (
    <div className={styles.sampleColumn}>
      <input
        ref={imageInputRef}
        hidden
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => setFileName(event.target.files?.[0]?.name || 'No local file selected')}
      />
      <input
        ref={archiveInputRef}
        className="hidden"
        type="file"
        accept="application/zip,.zip"
        onChange={(event) => setFileName(event.target.files?.[0]?.name || 'No local file selected')}
      />
      <div className={styles.sampleRow}>
        <Tooltip title="上传图片">
          <Button
            type="text"
            shape="circle"
            className="!h-9 !w-9 !min-w-9"
            icon={<ImagePlus className="size-4" />}
            onClick={() => imageInputRef.current?.click()}
            aria-label="上传图片"
          />
        </Tooltip>
        <CatalogTextAction onClick={() => archiveInputRef.current?.click()}>
          导入素材
        </CatalogTextAction>
        <Button icon={<Search size={16} />} disabled>
          Uploading disabled
        </Button>
      </div>
      <SourcePath path="src/features/assistant/components/canvas-agent-chat-ui.tsx; src/features/assets/pages/assets-page.tsx" />
      <p className={styles.note}>{fileName}</p>
      <p className={styles.note}>
        The fixture only opens the local file picker. It performs no upload, network request or
        persistence.
      </p>
    </div>
  );
}

function useCanvasReviewTheme() {
  return canvasThemes[useInheritedThemeMode()];
}

function SourcePath({ path }: { path: string }) {
  return (
    <p className={styles.note}>
      Source: <code className={styles.code}>{path}</code>
    </p>
  );
}
