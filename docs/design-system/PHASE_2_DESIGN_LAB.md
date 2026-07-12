# 设计系统阶段 2：当前态 Design Lab

状态：已于 2026-07-11 通过用户验收并完成；阶段 3 现有样式对比审计已于 2026-07-12 获用户批准并启动。

实施日期：2026-07-11

## 1. 阶段边界

本阶段只建立 Foundations 与 Primitives 的当前态开发评审工具，不创建目标 Token、目标组件或候选视觉，不修改生产页面视觉，也不建立任何目标替换关系。

Patterns 与 Feature Components 已在阶段 1 进入库存，但其完整当前态展示留到阶段 5。Design Lab 不调用真实 AI、WebDAV、在线 Assistant、本地 Agent 或其他业务服务，不读取 feature raw store，不依赖用户 profile。

用户于阶段 2 审批前补充确认：首页非导航内容不参与本轮有意视觉修改，公共导航仍可评审。Design Lab 中的 Foundations/Primitives 继续作为全产品当前事实展示，但后续目标若会改变首页主体，首页调用点必须按 `EX-HOME-VISUAL-FREEZE` 保持等值。详见 `HOMEPAGE_VISUAL_FREEZE.md`。

## 2. 已关闭的前置决策

- DS-O2：使用共享真实 App Provider 的独立 Vite entry。
- DS-O3：完全排除在正式 Web/Electron 构建、产品导航和生产 bundle 之外。
- DS-O4：继续使用项目原生 React/Vite Design Lab，本轮不引入 Storybook。
- DS-O14：使用 Playwright screenshot diff、基础交互测试和 `@axe-core/playwright` 自动扫描；阶段 2 只记录当前问题，不声明 WCAG 合规，全局阈值与目标等级留待 DS-O13。
- “可检索”验收口径：提供真实搜索与筛选 UI，支持按库存 ID、名称、层级、来源和状态定位，并提供稳定锚点。

用户于 2026-07-11 确认以上推荐方案并批准实施阶段 2。

## 3. 入口与运行架构

```text
开发评审入口
design-lab.html
  → src/design-lab/main.tsx
  → DesignLabRoot
  → AppVisualProviders
  → DesignLabApp 控制栏
  → 同源 iframe
       → design-lab-preview.html
       → src/design-lab/preview-main.tsx
       → DesignLabPreviewRoot
       → AppVisualProviders
       → DesignLabCatalog

正式产品入口
index.html
  → src/main.tsx
  → App
  → AppProviders
  → ClientRouterProvider + ClientRootInit + AppRoutes
```

`AppVisualProviders` 复用生产应用真实的 Ant Design `ConfigProvider`、`AntdApp`、React Query Provider、主题 Token 和 `html.dark/colorScheme` 行为。Design Lab 不运行 `ClientRouterProvider`、`ClientRootInit` 或产品后台初始化。

目录筛选工具直接复用该上下文中的 Ant `Input`、`Select` 与 `Button`。2026-07-11 用户复核发现早期原生 `select` 加专用 CSS 的实现会让浏览器自行渲染箭头，与生产 Ant Select 不一致；该近似实现已经删除，筛选栏现在与生产组件共享同一 DOM、箭头、Token 和交互状态。

外层控制栏与 iframe 通过同源、严格校验的 `postMessage` 协议同步 Light/Dark 和 `motionFreeze`。`motionFreeze` 只是“冻结动态预览（评审工具）”，通过 Design Lab 专用 class 暂停动画与过渡，不伪装或改写系统真实的 `prefers-reduced-motion`；后者由浏览器 media preference 独立提供并单独测试。iframe 的 CSS 宽高分别为 `1440×900`、`390×844` 或自适应，因此 Tailwind media query 和 `window.innerWidth` 使用真实子文档 viewport，而不是只缩窄外层容器。

## 4. 正式构建隔离

- `npm run dev:design-lab` 显式设置 `DESIGN_LAB=1`，Tailwind 才扫描 `design-lab.html`、`design-lab-preview.html` 和 `src/design-lab/*`。
- `npm run dev`、`npm run dev:web` 与 `npm run build:renderer` 显式设置 `DESIGN_LAB=0`；正式 Tailwind 内容扫描不包含 `src/design-lab/*`。
- 正式 Vite build 仍只以 `index.html` 为入口，不包含两个 Design Lab HTML entry。
- `scripts/check-design-lab-build-exclusion.cjs` 检查正式 `dist/` 中不存在 Design Lab HTML、源码路径或稳定 marker，并已接入 `build:renderer`。
- `scripts/check-feature-boundaries.cjs` 阻止生产 `src` 代码 import `src/design-lab/*`，同时要求 Design Lab 只能通过 feature public API 访问 feature。
- 两个 Design Lab HTML 使用 CSP 阻止外部网络资源；preview 只允许被同源页面嵌入。

## 5. 当前态覆盖

| 层级        | 数量 | 当前态内容                                                                                                                                                                                    |
| ----------- | ---: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations |   23 | Provider、App/CSS/Canvas/Ant 颜色来源、排版、间距、尺寸、圆角、描边、投影、层级、透明度/模糊、动效、断点、图标尺寸、arbitrary/important 与 inline style                                       |
| Primitives  |   17 | Button/IconButton、Link、Input、Textarea、NumberInput、Select、Checkbox、Switch、Segmented、Slider、Tag/Badge、Tooltip、Disclosure、Spinner/Progress、Radio 缺项、Separator、FileInput/Upload |
| 合计        |   40 | 阶段 1 的全部 Foundations/Primitives 稳定 ID，无未映射项                                                                                                                                      |

机器可检索事实源为 `src/design-lab/catalog/catalog-data.ts`。每个项目展示：

- 稳定库存 ID、层级、分类和当前状态。
- 当前来源、生产使用范围、实际解析方式和决策状态。
- 真实当前 Token、CSS variable、Ant/Radix/native/shared component，或明确标注的确定 fixture。
- Light/Dark、适用尺寸和代表状态；包括 disabled、loading、error、selected、indeterminate 缺口、长文本和 overflow。
- 已确认失效 Tailwind class 的“源码意图 / 当前 computed result”对照，不添加修复 CSS。
- 评审工具自身的搜索、下拉与重置交互使用真实 Ant 组件，不把工具专用近似样式混入“当前实现”证据。
- `PRM-C05` 直接渲染生产共享的 `SettingsDimensionInput`（W/H）和 `SettingsNumberInput`；`PRM-C06` 直接渲染生产使用的 Ant `mode="tags"` 多值模式及共享 Radix Select，因此保留两套真实箭头、状态和 Portal 行为。
- 完整 `SettingsPanel`、质量快捷 pills、比例卡片、`ModelPicker`、Modal 及其业务组合仍属于阶段 5；阶段 2 不复制这些 Pattern/Feature Component，也不把它们误报为 Primitive 缺项。

稳定锚点规则为：

```text
库存 ID：PRM-C06
锚点：#design-lab-prm-c06

通用规则：#design-lab-<inventory-id-lowercase>
```

E2E 使用完整 40-ID 数组验证唯一性、顺序、搜索、层级/来源筛选和锚点跳转。

## 6. 生产库存维护说明

阶段 1 冻结时有 185 个生产 TS/TSX、70 个生产 TSX。阶段 2 为复用真实 Provider，将原 `App.tsx` 中的 Provider 组合等值提取到：

- `src/app/providers/app-visual-providers.tsx`
- `src/app/providers/app-providers.tsx`

当前生产源码因此为 187 个 TS/TSX、72 个 TSX，但没有新增产品 UI 表面；两个新文件都归属原稳定库存 ID `FND-THEME-PROVIDER`。阶段 1 的 70 文件覆盖结论继续作为当时快照保留，不改写历史计数。

`scripts/audit-design-system-current-values.cjs` 已明确排除 `src/design-lab/*`，四份生产当前样式清单重新校验通过。冻结的 `docs/design-system/baselines/current/` 没有重写。

## 7. 验证与证据

已通过：

- `npm run format:check`
- `npm run lint`
- `npm run check:boundaries`
- `npm run typecheck`
- `npm run test`：15 个文件、42 个测试通过。
- `npm run test:design-lab`：47 个 Playwright 测试通过。
- `npm run build:renderer`：正式构建完成，Design Lab 排除检查通过。
- `npm run test:e2e`：4 个现有产品 E2E 通过。
- `npm run smoke:desktop-hash-routes`：6 条 `file://` hash route 通过。
- `npm run knip`
- `npx knip --include exports`
- `npm run check:design-system-current`

Design Lab Playwright 覆盖：

- 40 个稳定 ID 的完整性、唯一性和顺序。
- ID/名称/来源/状态搜索，层级/来源/状态筛选和锚点跳转。
- 筛选栏 Ant Select 根节点、真实箭头、下拉选项交互和筛选结果。
- Light/Dark 同步。
- iframe `window.innerWidth=1440/390` 的真实 viewport。
- `motionFreeze` 评审冻结状态同步，并明确验证其不改变系统真实 `prefers-reduced-motion`。
- 浏览器 `prefers-reduced-motion: reduce` 的真实 media preference 单独模拟与断言。
- Switch 与 Radix Select 代表交互。
- 外部网络请求为零。
- 40 个库存 ID 各自的 Light/Dark 当前实现截图，共 80 张逐项 `toHaveScreenshot()` diff。
- 4 张整体/筛选场景截图，以及 `PRM-C06` Ant tags Portal 打开、Radix Portal 打开、移动当前态与 `PRM-C12` Tooltip 移动打开 4 张针对性截图。
- axe 自动扫描和当前问题记录。

## 8. 截图

Playwright 当前态逐项截图位于 `tests/design-lab/design-lab-inventory-visual.spec.ts-snapshots/`：

- 40 个库存 ID 各一张 Light 与一张 Dark 当前实现截图，共 80 张。

整体、筛选与交互场景截图位于 `tests/design-lab/design-lab.spec.ts-snapshots/`：

- `design-lab-desktop-light-chromium-darwin.png`
- `design-lab-desktop-dark-chromium-darwin.png`
- `design-lab-desktop-primitives-dark-chromium-darwin.png`
- `design-lab-mobile-select-dark-chromium-darwin.png`
- `design-lab-c06-ant-tags-open-light-chromium-darwin.png`
- `design-lab-c06-radix-open-light-chromium-darwin.png`
- `design-lab-c06-mobile-current-light-chromium-darwin.png`
- `design-lab-c12-tooltip-open-mobile-light-chromium-darwin.png`

上述 80 张逐项基线与 8 张整体/场景快照都是阶段 2 当前态测试证据，不是批准后的目标视觉基线，因此不写入 `baselines/approved/`。

用户指出筛选器和 Primitive 忠实度问题后，当前态示例已按真实组件、实际 Token/computed value 或可追溯 source-linked fixture 修复，以上快照于 2026-07-11 重新生成并通过无更新模式的 screenshot diff；冻结的 `docs/design-system/baselines/current/` 没有改写。

## 9. 当前问题与限制

已关闭的阶段内忠实度问题：目录筛选栏早期使用原生 `select` 与展示专用 CSS，箭头及控件状态会随浏览器原生渲染而偏离生产 Ant Select；部分 Foundation/Primitive 示例也曾使用不可充分追溯的近似皮肤或缺少生产变体。筛选栏现已替换为真实 Ant 组件；23 个 Foundations 与 17 个 Primitives 的当前态示例也已逐项复核，改为真实组件、实际 Token/computed value 或明确 source-linked fixture。W/H 与设置数字输入、Ant tags 多值模式、Ant/Radix Select 各自真实箭头和基础 Portal 已补齐，并通过逐项 Light/Dark、移动与打开态截图复验。这些修正只影响开发评审工具，不修改生产组件、Token 或页面视觉。

axe 扫描清除了 Design Lab 工具自身新引入的问题后，保留两组当前实现证据：

- `PRM-C10`：两个 Ant Slider 当前没有可访问名称，规则为 `aria-input-field-name`，影响等级 `serious`。
- `PRM-C14`：三个 Ant Progress 当前没有可访问名称，规则为 `aria-progressbar-name`，影响等级 `serious`。

以上结果是当前态记录，不在阶段 2 修改生产组件。目标 WCAG 等级、浏览器范围和正式视觉差异阈值仍由 DS-O13 阻塞，当前不得声明合规。

Playwright screenshot 基线当前按 Chromium + Darwin 保存；跨平台阈值和平台矩阵留待 DS-O13。阶段 2 已覆盖 Select 与 Tooltip 作为 Primitive 的必要打开态；完整 `SettingsPanel`、质量快捷 pills、比例卡片、`ModelPicker`、Modal、其他 Patterns/Feature Components、复杂组合 Portal 和业务状态 fixture 仍留到阶段 5。

## 10. 用户验收结果

用户于 2026-07-11 明确确认阶段 2 验收通过，以下结论已获确认：

- Foundations/Primitives 当前实现、主题、状态、来源和影响范围已足够支持阶段 3 的 Token 决策。
- 搜索、筛选、稳定锚点和真实桌面/移动 viewport 足以完成后续逐项评审。
- 当前问题和延期范围记录完整。

该确认只关闭阶段 2，不批准任何目标视觉规格、组件合并、Token 值或生产替换。用户同时明确要求阶段 3 等待后续同意后再开始；阶段 3 的开放决策和目标视觉值仍须另行逐项确认。

## 11. 阶段内补充决策

- 2026-07-11：用户确认 `/` 首页在 Light/Dark、Web 桌面/移动和 Electron 桌面下的非导航内容均不做有意视觉修改；公共导航作为共享组件仍可修改。
- 2026-07-11：用户指出目录筛选栏箭头与生产样式不一致；阶段 2 的当前态工具不得用原生控件加近似 CSS 代表生产控件，已改为复用真实 Ant 组件。该反馈是阶段内忠实度修正，不构成阶段 2 验收或 canonical Select 决策。
- 2026-07-11：用户继续指出 W/H 输入、设置数字输入、快捷选择与两类 Select 箭头存在当前态覆盖疑问。逐项复核后，阶段 2 补齐 `SettingsDimensionInput`、`SettingsNumberInput`、生产 Ant tags 模式及 Ant/Radix 基础 Portal；完整 `SettingsPanel`、质量快捷 pills、比例卡、`ModelPicker` 与 Modal 明确保留到阶段 5。
- 2026-07-11：Design Lab 动效开关重命名并收敛为 `motionFreeze` 评审工具；系统真实 `prefers-reduced-motion` 由浏览器独立提供和测试，两者不得互相冒充。
- 2026-07-11：40 个库存 ID 已建立每项 Light/Dark 共 80 张逐项视觉基线，并补充 Select/Tooltip Portal 与移动场景。上述忠实度修复完成后未修改生产视觉。
- 2026-07-11：用户明确确认阶段 2 验收通过，阶段 2 完成；用户同时要求阶段 3 等待后续同意后再开始。本次验收不批准任何目标 Token、目标组件或生产视觉实施。
- 本决策不改变阶段 2 的 40 项当前态覆盖，也不要求 Design Lab 伪造首页候选样式。
- 阶段 3 及以后涉及全局 Token/Primitive 时，必须把首页非导航回归列为守门验证。
