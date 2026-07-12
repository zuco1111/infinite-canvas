export type DesignLabCatalogLayer = 'Foundation' | 'Primitive';

export type DesignLabCatalogStatus = 'unreviewed' | 'candidate';

export type DesignLabCatalogEntry = {
  id: string;
  name: string;
  layer: DesignLabCatalogLayer;
  category: string;
  source: string;
  sourceTags: string[];
  usage: string;
  resolved: string;
  status: DesignLabCatalogStatus;
  decision: string;
};

const noTargetDecision = '尚未批准目标规格；本页只展示当前实现。';

export const designLabCatalogEntries: DesignLabCatalogEntry[] = [
  {
    id: 'FND-THEME-PROVIDER',
    name: 'Theme Provider',
    layer: 'Foundation',
    category: 'Theme',
    source:
      'src/app/providers/app-visual-providers.tsx, src/app/providers/app-providers.tsx, src/design-lab/app/DesignLabRoot.tsx',
    sourceTags: ['Ant Design', 'CSS', 'Provider'],
    usage:
      'AppVisualProviders supplies ConfigProvider, html.dark and colorScheme; AppProviders and DesignLabRoot compose the same visual provider.',
    resolved:
      'Reads inherited mode, computed color-scheme, CSS --background and Ant colorBgBase; no preview-only provider is created.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-COLOR-APP-TS',
    name: 'App Semantic Color',
    layer: 'Foundation',
    category: 'Color',
    source: 'src/shared/tokens/app.ts',
    sourceTags: ['TypeScript Token'],
    usage: '24 light and 24 dark values; directly feeds Ant ThemeConfig.',
    resolved: 'Current inherited theme resolves one appThemeTokens branch.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-COLOR-CSS',
    name: 'CSS Semantic Color',
    layer: 'Foundation',
    category: 'Color',
    source: 'src/styles/index.css',
    sourceTags: ['CSS', 'CSS Variable', 'Tailwind'],
    usage: '25 color variables plus --radius; consumed by Tailwind and global CSS.',
    resolved: 'Computed from documentElement in the inherited Light/Dark context.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-COLOR-CANVAS',
    name: 'Canvas Domain Color',
    layer: 'Foundation',
    category: 'Color',
    source: 'src/shared/tokens/canvas.ts',
    sourceTags: ['TypeScript Token', 'Canvas'],
    usage: '20 values per theme; 25 production files consume 19 of 20 values.',
    resolved: 'Current inherited theme resolves one canvasThemeTokens branch.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-COLOR-CANVAS-LEGACY',
    name: 'Canvas Legacy Alias',
    layer: 'Foundation',
    category: 'Color',
    source: 'src/shared/tokens/canvas.ts',
    sourceTags: ['TypeScript Token', 'Canvas', 'Legacy'],
    usage: '9 flat aliases pinned to Dark; no current production consumers.',
    resolved: 'Always resolves to the Dark Canvas values regardless of inherited theme.',
    status: 'candidate',
    decision: '候选清理项；尚未批准保留或退役。',
  },
  {
    id: 'FND-ANT-GLOBAL',
    name: 'Ant ThemeConfig',
    layer: 'Foundation',
    category: 'Third-party theme',
    source: 'src/app/theme/app-theme.ts',
    sourceTags: ['Ant Design', 'TypeScript Token'],
    usage: '28 global overrides and 30 component fields across 7 components.',
    resolved: 'Read from the active inherited Ant theme with theme.useToken().',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-ANT-TABLE-UNUSED',
    name: 'Unused Ant Table Theme',
    layer: 'Foundation',
    category: 'Third-party theme',
    source: 'src/shared/tokens/app.ts, src/app/theme/app-theme.ts',
    sourceTags: ['Ant Design', 'TypeScript Token', 'Unused'],
    usage: '4 light/dark selection values and 2 Table overrides; no Table consumer.',
    resolved: 'Values remain present in ThemeConfig even though no production Table renders.',
    status: 'candidate',
    decision: '候选清理项；尚未批准保留或退役。',
  },
  {
    id: 'FND-ANT-CANVAS-LOCAL',
    name: 'Local Canvas Ant Theme',
    layer: 'Foundation',
    category: 'Third-party theme',
    source: 'src/shared/ui/settings-panel.tsx',
    sourceTags: ['Ant Design', 'Canvas', 'Provider'],
    usage: 'Nested ConfigProvider with 6 global color fields and 3 Button fields.',
    resolved: 'Rendered through the real SettingsPanelTheme in the inherited Canvas theme.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-COLOR-HARDCODED',
    name: 'Hard-coded Colors',
    layer: 'Foundation',
    category: 'Color',
    source: 'Production TS/TSX literals indexed by docs/design-system/CURRENT_COLORS.json',
    sourceTags: ['Inline', 'Canvas', 'Hard-coded'],
    usage:
      '65 unique hex/rgb/rgba values, 102 source occurrences: Canvas 61, Assistant 28, Shared 8 and Local Agent 5.',
    resolved:
      'Shows seven exact production literals from Canvas selection/danger and minimap type colors; no invented rgba samples or normalization.',
    status: 'candidate',
    decision: '候选收敛项；每个值仍需按语义和调用点单独决策。',
  },
  {
    id: 'FND-COLOR-UTILITY-RAW',
    name: 'Raw Color Utilities',
    layer: 'Foundation',
    category: 'Color',
    source: 'Production Tailwind class strings indexed by docs/design-system/CURRENT_COLORS.json',
    sourceTags: ['Tailwind', 'Hard-coded'],
    usage: '56 utility forms, 127 source occurrences.',
    resolved:
      'Executes four inventoried classes (bg-black, bg-white, bg-black/55 and bg-[#2f80ff]) through current Tailwind 3 output; no substitute color styling is applied.',
    status: 'candidate',
    decision: '候选收敛项；内容效果和领域颜色不得机械合并。',
  },
  {
    id: 'FND-TYPOGRAPHY',
    name: 'Typography',
    layer: 'Foundation',
    category: 'Typography',
    source: 'src/styles/index.css and production Tailwind, Ant Design and inline call sites',
    sourceTags: ['CSS', 'Tailwind', 'Ant Design', 'Inline'],
    usage: '75 utility forms, 614 occurrences and at least 4 font paths.',
    resolved:
      'Measures the inherited font-family and renders current inherited, mono and serif Tailwind paths plus overflow behavior; declared Inter is not packaged.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-SPACING',
    name: 'Spacing',
    layer: 'Foundation',
    category: 'Layout',
    source: 'Tailwind default spacing scale',
    sourceTags: ['Tailwind'],
    usage: '179 utility forms, 835 occurrences; no project-specific scale extension.',
    resolved: 'Current 0/0.5/1/1.5/.../20/px scale samples.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-SIZE',
    name: 'Size',
    layer: 'Foundation',
    category: 'Layout',
    source: 'Tailwind, Ant props and inline styles',
    sourceTags: ['Tailwind', 'Ant Design', 'Inline'],
    usage: '193 utility forms, 837 occurrences.',
    resolved: 'Representative current 24-64px control heights and Ant 28/32/40px sizes.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-RADIUS',
    name: 'Radius',
    layer: 'Foundation',
    category: 'Shape',
    source: 'src/styles/index.css and production Tailwind, Ant Design and arbitrary radius values',
    sourceTags: ['CSS Variable', 'Tailwind', 'Ant Design'],
    usage: '22 class forms, 195 occurrences.',
    resolved:
      'Shows representative inventoried literal radii and a real rounded-full Tailwind probe with its computed result; this is evidence, not a target scale.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-BORDER',
    name: 'Border and Focus',
    layer: 'Foundation',
    category: 'Shape',
    source:
      'src/app/theme/app-theme.ts, src/features/settings/components/app-config-modal.tsx and production Tailwind/CSS border call sites',
    sourceTags: ['Tailwind', 'Ant Design', 'CSS'],
    usage: '44 utility forms, 225 occurrences; some focus/error classes emit no CSS.',
    resolved:
      'Renders real Ant Input default, error, disabled and theme focus behavior; missing Tailwind focus/error output is measured separately under FND-TAILWIND-ARBITRARY.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-SHADOW',
    name: 'Shadow and Elevation',
    layer: 'Foundation',
    category: 'Elevation',
    source: 'Tailwind, CSS, inline styles and Ant Design',
    sourceTags: ['Tailwind', 'CSS', 'Inline', 'Ant Design'],
    usage: '14 shadow class forms, about 39 occurrences, plus literal shadows.',
    resolved: 'Current Tailwind and selected deterministic literal shadows.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-LAYER',
    name: 'Layer and z-index',
    layer: 'Foundation',
    category: 'Elevation',
    source: 'Tailwind, inline styles, Ant Design and Radix',
    sourceTags: ['Tailwind', 'Inline', 'Ant Design', 'Radix'],
    usage: 'Explicit 0-1200; Ant popup base 1000 with derived 1050/1070/1080.',
    resolved: 'Current layer values shown as a deterministic stack, not a target contract.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-OPACITY-BLUR',
    name: 'Opacity and Blur',
    layer: 'Foundation',
    category: 'Effect',
    source: 'Tailwind and inline styles',
    sourceTags: ['Tailwind', 'Inline'],
    usage: '32 utility forms, 108 occurrences; backdrop blur base/sm/md/xl.',
    resolved: 'Representative current opacity and backdrop-filter values.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-MOTION',
    name: 'Motion',
    layer: 'Foundation',
    category: 'Motion',
    source:
      'Production Tailwind/CSS call sites, canvas-node.tsx, animated-theme-toggler.tsx, dia-text-reveal.tsx and src/styles/index.css',
    sourceTags: ['Tailwind', 'CSS', 'Motion', 'Inline'],
    usage: '15 utility forms, 54 occurrences, plus 100ms-7s local rules.',
    resolved:
      'Lists production duration evidence, reports the real system prefers-reduced-motion query and keeps the Design Lab motion-freeze control explicitly separate; no fabricated animation fixture is shown.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-BREAKPOINT',
    name: 'Responsive Breakpoints',
    layer: 'Foundation',
    category: 'Responsive',
    source: 'Tailwind defaults, container queries and runtime geometry',
    sourceTags: ['Tailwind', 'CSS', 'Inline'],
    usage: '43 responsive utility forms, 67 occurrences; local 440px container query.',
    resolved: 'Current viewport width and active default Tailwind breakpoint.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-ICON-SIZE',
    name: 'Icon Size',
    layer: 'Foundation',
    category: 'Iconography',
    source: 'Production Lucide React call sites and Tailwind icon size classes',
    sourceTags: ['Lucide', 'Inline'],
    usage: '12/14/16/18/20/24/28/32/44px intent; no shared contract.',
    resolved:
      'Renders explicit Lucide sizes found in inventory and measures the source-linked size-4.5 probe, exposing 18px intent versus current 24px output.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'FND-TAILWIND-ARBITRARY',
    name: 'Arbitrary and Important Utilities',
    layer: 'Foundation',
    category: 'Utility',
    source: 'Production Tailwind class strings',
    sourceTags: ['Tailwind', 'Hard-coded'],
    usage: '173 arbitrary forms/275 occurrences; 54 important forms/156 occurrences.',
    resolved: 'Source intent is shown beside current computed output for known missing CSS.',
    status: 'candidate',
    decision: '候选收敛项；失效 class 只记录现状，本阶段不修复。',
  },
  {
    id: 'FND-INLINE-STYLE',
    name: 'Inline Visual and Dynamic Style',
    layer: 'Foundation',
    category: 'Utility',
    source:
      'Production TSX style/Ant styles props; canvas-refresh-shell.tsx, canvas-top-bar.tsx and canvas-node.tsx',
    sourceTags: ['Inline', 'Ant Design', 'Canvas'],
    usage: '203 style props plus 5 Ant styles props.',
    resolved:
      'Copies exact static declarations from CanvasRefreshShell and CanvasTopBar, and records CanvasNode runtime geometry expressions without inventing coordinates.',
    status: 'candidate',
    decision: '候选收敛项；动态几何和用户内容值保留为明确例外。',
  },
  {
    id: 'PRM-C01',
    name: 'Button / IconButton',
    layer: 'Primitive',
    category: 'Action',
    source:
      'Ant Design Button, src/features/canvas/components/workspace/canvas-top-bar.tsx native actions and RouteButton',
    sourceTags: ['Ant Design', 'Native', 'Router'],
    usage: 'Ant 117, native 38, RouteButton 3; all routes.',
    resolved:
      'Renders real Ant size/state variants and exact source-linked Canvas top-bar menu/title actions; RouteButton is documented as Ant composition, not a separate visual pattern.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C02',
    name: 'Link',
    layer: 'Primitive',
    category: 'Navigation',
    source:
      'src/app/shell/components/app-top-nav.tsx anchor classes and src/shared/router/next-link.tsx',
    sourceTags: ['Native', 'Router'],
    usage: 'Top navigation, mobile navigation and internal route entries.',
    resolved:
      'Copies two production top-nav anchor class strings into navigation-blocked fixtures; router behavior and complete navigation patterns are not reproduced.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C03',
    name: 'Input / Search / Password',
    layer: 'Primitive',
    category: 'Form',
    source:
      'Ant Design Input/Search/Password and src/features/canvas/components/workspace/canvas-top-bar.tsx native title input',
    sourceTags: ['Ant Design', 'Native'],
    usage: 'Ant Input 16, Search 1, Password 3, native text 1.',
    resolved:
      'Renders real Ant default, Search, Password, error and disabled states plus the exact source-linked Canvas title input.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C04',
    name: 'Textarea',
    layer: 'Primitive',
    category: 'Form',
    source:
      'Ant Design Input.TextArea and native textarea declarations from Assistant, Audio Settings and CanvasNode',
    sourceTags: ['Ant Design', 'Native'],
    usage: 'Ant 6 and native 5 across Workbench, Config, Agent and Canvas.',
    resolved:
      'Renders real Ant states and exact source-linked native textarea class/style fixtures; the full Agent composer, settings panel and CanvasNode compositions remain out of scope.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C05',
    name: 'NumberInput',
    layer: 'Primitive',
    category: 'Form',
    source:
      'Ant Design InputNumber and src/shared/ui/settings-panel.tsx SettingsDimensionInput/SettingsNumberInput',
    sourceTags: ['Ant Design', 'Native'],
    usage:
      'Ant InputNumber 1 and native number 3; shared W/H dimension and settings number controls are the current Generation implementations.',
    resolved:
      'Renders real Ant states and real shared W/H dimension and generation-count primitives inside SettingsPanelTheme; no complete SettingsPanel pattern is reproduced.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C06',
    name: 'Select',
    layer: 'Primitive',
    category: 'Form',
    source:
      'src/features/settings/components/app-config-modal.tsx Ant Select and src/shared/ui/select.tsx Radix wrapper',
    sourceTags: ['Ant Design', 'Radix', 'Tailwind'],
    usage:
      'Ant 7, including production multi-value tags mode; Radix wrapper has 2 production consumers.',
    resolved:
      'Renders real Ant default, error, disabled and production-used tags states plus the real shared Radix primitive, preserving current arrow/portal behavior; complete ModelPicker and settings patterns are not reproduced.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C07',
    name: 'Checkbox',
    layer: 'Primitive',
    category: 'Form',
    source: 'AppMultiSelectCheckbox',
    sourceTags: ['Native', 'Tailwind', 'Shared UI'],
    usage: '4 production call sites in Canvas Catalog/Workspace and Image/Video.',
    resolved: 'Real unchecked, checked and disabled shared component states.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C08',
    name: 'Switch',
    layer: 'Primitive',
    category: 'Form',
    source: 'Ant Design Switch',
    sourceTags: ['Ant Design'],
    usage: '5 production call sites in Generation, Assistant and Canvas.',
    resolved: 'Real checked, unchecked, loading and disabled Ant states.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C09',
    name: 'Segmented',
    layer: 'Primitive',
    category: 'Selection',
    source:
      'Ant Design Segmented and src/features/assistant/components/canvas-agent-chat-ui.tsx AgentModeSwitch',
    sourceTags: ['Ant Design', 'Native'],
    usage: 'Ant 8 plus one native agent mode control family.',
    resolved:
      'Renders real Ant states and the real exported AgentModeSwitch; records its missing radio/aria-pressed contract without reproducing complete Assistant or Local Agent panels.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C10',
    name: 'Slider',
    layer: 'Primitive',
    category: 'Form',
    source:
      'Ant Design Slider, src/features/canvas/components/canvas-zoom-controls.tsx and canvas-image-toolbar-settings-modal.tsx native ranges',
    sourceTags: ['Ant Design', 'Native'],
    usage: 'Ant 2 and native range 2 in Canvas media/toolbar/zoom.',
    resolved:
      'Renders real Ant states and exact source-linked Canvas zoom/toolbar range fixtures without reproducing complete toolbar/modal patterns; axe records the current 2 unnamed Ant sliders.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C11',
    name: 'Tag / Badge',
    layer: 'Primitive',
    category: 'Status',
    source: 'Ant Design Tag/CheckableTag and custom status pills in canvas-agent-chat-ui.tsx',
    sourceTags: ['Ant Design', 'Native', 'Tailwind'],
    usage: 'Tag 24, CheckableTag 1 and multiple custom pill families.',
    resolved:
      'Renders real Ant variants and exact source-linked waiting-confirmation pill declarations; no canonical Badge or complete Agent card is claimed.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C12',
    name: 'Tooltip',
    layer: 'Primitive',
    category: 'Overlay',
    source: 'Ant Design Tooltip and production Canvas icon-button trigger contracts',
    sourceTags: ['Ant Design'],
    usage: '17 production call sites across Assistant, Canvas, Workbench and Prompts.',
    resolved:
      'Renders real inherited Ant portals over deterministic icon-button fixtures, including the Canvas zoom-control button class/style contract; surrounding control compositions are not reproduced.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C13',
    name: 'Disclosure',
    layer: 'Primitive',
    category: 'Disclosure',
    source:
      'Native details/summary declarations from src/features/assistant/components/canvas-agent-chat-ui.tsx',
    sourceTags: ['Native'],
    usage: '2 production implementations in Agent Tool cards.',
    resolved:
      'Copies the production details/summary outer class/style contract into deterministic closed/open fixtures; complete Agent tool-card compositions remain out of scope.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C14',
    name: 'Spinner / Progress',
    layer: 'Primitive',
    category: 'Feedback',
    source:
      'Ant Design Spin/Progress plus animate-spin and working-text call sites in Assistant and Workbench',
    sourceTags: ['Ant Design', 'Tailwind', 'Native'],
    usage: 'Spin 3, Progress 1 and local loading/working indicators.',
    resolved:
      'Renders real Ant primitives plus source-linked 16/24px animate-spin and static working-text evidence; complete feedback compositions are not reproduced, and axe records 3 unnamed Ant progressbars.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C15',
    name: 'Radio',
    layer: 'Primitive',
    category: 'Selection',
    source: 'No production implementation found',
    sourceTags: ['Absent'],
    usage: 'No production call site; absence does not require adding a component.',
    resolved: 'Catalog records the confirmed absence and does not invent a target control.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C16',
    name: 'Separator',
    layer: 'Primitive',
    category: 'Structure',
    source:
      'src/features/canvas/components/canvas-toolbar.tsx private Divider; no canonical primitive',
    sourceTags: ['Canvas', 'Native'],
    usage: 'Private Canvas separators only.',
    resolved:
      'Copies the production vertical divider class and current Canvas theme toolbar.border value; no canonical Separator or surrounding toolbar pattern is claimed.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
  {
    id: 'PRM-C17',
    name: 'FileInput / Upload',
    layer: 'Primitive',
    category: 'Form',
    source:
      'Hidden native input[type=file] and triggers in canvas-agent-chat-ui.tsx and assets-page.tsx',
    sourceTags: ['Native', 'Ant Design'],
    usage: '8 production call sites: Assets 3, Assistant 1, Canvas 2, Image 1, Video 1.',
    resolved:
      'Uses real hidden input semantics, the Assistant Ant upload-trigger contract and real CatalogTextAction; the fixture only opens a local picker and performs no upload, network request or persistence.',
    status: 'unreviewed',
    decision: noTargetDecision,
  },
];

export const designLabCatalogSources = Array.from(
  new Set(designLabCatalogEntries.flatMap((entry) => entry.sourceTags)),
).sort((left, right) => left.localeCompare(right));

export function designLabAnchorForInventoryId(id: string) {
  return `design-lab-${id.toLowerCase()}`;
}
