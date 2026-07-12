# 设计系统阶段 1 全量库存

状态：静态库存和运行时基线已于 2026-07-11 获用户确认；阶段 1 已完成。

盘点日期：2026-07-11

## 1. 文档定位

本文件记录设计系统重构开始前的“当前实现”，不是目标设计规范，也不代表已经批准任何合并、删除、修复或视觉调整。

库存的用途是：

- 证明当前生产 UI、Token、样式来源、领域组件和内容效果已经进入可检索范围。
- 为阶段 2 Design Lab 确定展示项目、状态矩阵和 fixture。
- 为后续用户逐项决定保留、合并、拆分、变体化、领域化、例外或废弃提供证据。
- 在生产视觉修改前冻结风险、重复项和运行时基线。

本阶段没有修改生产组件、Token、CSS、页面视觉或业务逻辑。所有 candidate 只是评审候选，不是实施授权。

## 2. 审计边界与统计口径

### 2.1 纳入范围

- src 下 185 个生产 TS/TSX 文件，其中 70 个生产 TSX；排除 test/spec。
- 70 个生产 TSX 中，Canvas 31 个，其余 app、shared 和其他 feature 39 个。
- src/styles/index.css、tailwind.config.ts、应用与 Canvas Token、Ant Design ThemeConfig。
- Ant Design、Radix、Lucide、Motion、原生交互元素、自定义 Portal。
- className、Tailwind arbitrary value、important override、inline style、Ant styles 属性和 CSS override。
- 全部公开路由：/、/assets、/prompts、/image、/video、/canvas、/canvas/:id。
- Light/Dark、桌面/移动、Web、Chromium file mode 和真实 Electron。

### 2.2 方法

- 使用 TypeScript AST 统计 import、JSX 组件、className、style、图标和局部 ConfigProvider。
- 使用源码字面量扫描颜色、CSS 变量、字体、字号、字重、间距、尺寸、圆角、描边、阴影、层级、透明度、模糊、动效和响应式。
- 使用内存 PostCSS + Tailwind 3.4 编译，把生产 TSX 中的静态 class 与真实 CSS 产物逐项对照。
- 运行当前应用，在全新隔离 BrowserContext 和隔离 Electron profile 中采集确定性截图。
- 静态“调用次数”是源码 JSX 出现次数；循环只计一个调用点，不等同于运行时实例数。
- 动态 className、运行时几何和用户内容值单独分类，不伪造静态值。

### 2.3 覆盖证明

| 项目                   | 结果                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| 生产 TS/TSX            | 185 个                                                                            |
| 生产 TSX               | 70 个                                                                             |
| JSX className          | 1,173 处，其中 29 处完全动态                                                      |
| JSX style              | 203 处：175 个直接对象，28 个变量/函数/断言引用                                   |
| Ant Design styles 属性 | 5 处                                                                              |
| Ant Design 直接导入    | 48 个生产 TS/TSX，其中 45 个 TSX                                                  |
| 原生交互元素           | 32 个 TSX                                                                         |
| Lucide                 | 45 个 TSX；226 个静态实例及 5 个动态 Icon                                         |
| Motion                 | 3 个 TSX                                                                          |
| Radix                  | 1 个直接实现文件，2 个生产消费点                                                  |
| 自定义 createPortal    | Canvas 4 处，另有 Radix 与 Ant Portal                                             |
| 未分类生产 UI 表面     | 0；均映射到下方 Foundation、Primitive、Pattern、Feature、Domain 或 Content Effect |

### 2.4 库存项公共生命周期字段

为避免在每个家族表中重复相同字段，本阶段所有库存项继承以下当前值；某行明确写为 candidate 时只覆盖“评审状态”：

| 字段                | 阶段 1 当前值                                                               |
| ------------------- | --------------------------------------------------------------------------- |
| 评审状态            | 默认 unreviewed；高置信度重复、硬编码与失效实现为 candidate                 |
| 用户目标决策/日期   | 尚无；阶段 1 不批准具体规格                                                 |
| 目标 API/目标视觉值 | 尚无；不得从当前统计自行推断                                                |
| 实施/迁移/退役状态  | not started                                                                 |
| 静态验证            | 源码 AST、字面量扫描、Tailwind 实际编译对照                                 |
| 运行时验证          | 适用项映射到第 3 节路由和 baselines/current/README.md                       |
| 截图锚点            | 使用第 3 节路由表与基线中的环境/文件名；阶段 2 再建立逐项 Design Lab anchor |
| 后续追踪主键        | 本库存稳定 ID；目标尚未批准，当前不得推断新旧映射                           |
| 阻塞规则            | 缺少用户目标决策只阻塞对应实现，不阻塞本轮只读库存                          |

## 3. 路由与运行时表面

| 路由        | 所属表面         | 主要组件与状态                                                                         | 当前基线                                                                                   |
| ----------- | ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| /           | App Shell、Home  | 桌面/移动导航、Hero、提示词 mosaic、主题切换、媒体预览入口；非导航内容已获用户视觉冻结 | Web Desktop/Mobile Light+Dark；file/Electron Desktop Dark；另见 HOMEPAGE_VISUAL_FREEZE.md  |
| /assets     | Assets Catalog   | 搜索、筛选、卡片、空态、分页、新增/编辑 Modal、详情 Drawer、删除确认                   | Web Desktop Light+Dark、Mobile Dark；file/Electron Desktop Dark                            |
| /prompts    | Prompts Catalog  | loading/error/empty/结果、筛选、详情 Modal                                             | Web Desktop/Mobile Light+Dark；另有 Desktop Dark loading/error；file/Electron Desktop Dark |
| /image      | Image Workbench  | 桌面/移动、Settings Drawer、reference、结果/pending/failure、日志、Picker              | Web Desktop/Mobile Light+Dark；file/Electron Desktop Dark                                  |
| /video      | Video Workbench  | Image 同型表面，加多媒体 reference 和原生 media controls                               | Web Desktop Light+Dark、Mobile Dark；file/Electron Desktop Dark                            |
| /canvas     | Canvas Catalog   | hydration/loading/empty/project grid、选择、重命名、导入、新建、批量删除               | Web Desktop Light+Dark、Mobile Dark；file/Electron Desktop Dark                            |
| /canvas/:id | Canvas Workspace | 空画布、五类节点、toolbar、appearance、快捷键、Assistant、全部领域浮层入口             | Web Desktop/Mobile Light+Dark；file/Electron Desktop Dark                                  |

“主要组件与状态”是静态库存范围，不表示每个状态都已有截图；精确截图、复现环境和延期状态见 baselines/current/README.md。没有产品意义的组合不做机械笛卡尔积，例如 Electron 移动视口。

## 4. 当前实现来源总览

| 来源         | 当前覆盖与结论                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Ant Design   | 45 个生产 TSX；Button 117、Modal 21、Drawer 6、Tooltip 17、Dropdown 1。承担大量基础控件和 Portal。 |
| Radix        | 只在 src/shared/ui/select.tsx 实现 Select；由 ModelPicker 与 Assistant 模型选择器消费。            |
| 原生元素     | button 38、input 15、textarea 5、details/summary 各 2；大量 Canvas/Agent 私有控件。                |
| Lucide       | 45 个 TSX；没有统一 Icon facade、尺寸或 stroke 契约。                                              |
| Motion       | DiaTextReveal、在线 Assistant、本地 Agent 三处；与 CSS/WAAPI 动效并存。                            |
| Tailwind     | 主要使用默认尺度；存在大量 arbitrary/important class，并确认部分 class 无 CSS 产物。               |
| CSS          | 全局变量、滚动条、Ant DOM override、内容效果和 Canvas 动画集中在单一 index.css。                   |
| inline style | 203 个 style；Canvas、Assistant、Local Agent 最密集，动态几何与静态视觉规格混合。                  |

## 5. Foundations 与 Token 库存

### 5.1 主库存

| ID                      | 分类                        | 当前来源                               | 当前规模与消费                                                                                                    | 状态       |
| ----------------------- | --------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| FND-THEME-PROVIDER      | Theme Provider              | src/app/App.tsx、src/main.tsx          | 根 ConfigProvider + html.dark/colorScheme；覆盖全部路由                                                           | unreviewed |
| FND-COLOR-APP-TS        | App Semantic Color          | src/shared/tokens/app.ts               | Light/Dark 各 24 项；只直接驱动 Ant ThemeConfig                                                                   | unreviewed |
| FND-COLOR-CSS           | CSS Semantic Color          | src/styles/index.css                   | 26 个变量：25 个颜色变量及 --radius；驱动 Tailwind/CSS                                                            | unreviewed |
| FND-COLOR-CANVAS        | Canvas Domain Color         | src/shared/tokens/canvas.ts            | Light/Dark 各 20 项；25 个生产文件消费；19/20 有引用                                                              | unreviewed |
| FND-COLOR-CANVAS-LEGACY | Canvas legacy alias         | src/shared/tokens/canvas.ts            | 9 个仅指向 Dark 的扁平 alias；无生产消费者                                                                        | candidate  |
| FND-ANT-GLOBAL          | Ant ThemeConfig             | src/app/theme/app-theme.ts             | 28 个全局 override；7 个组件共 30 个字段                                                                          | unreviewed |
| FND-ANT-TABLE-UNUSED    | 未使用 Ant Table 主题       | app tokens + app-theme.ts              | tableSelected* Light/Dark 4 个值、Table 2 个 override；生产 UI 无 Table 消费                                      | candidate  |
| FND-ANT-CANVAS-LOCAL    | 局部 Ant ThemeConfig        | src/shared/ui/settings-panel.tsx       | 6 个全局颜色字段、3 个 Button 字段；嵌套 Provider                                                                 | unreviewed |
| FND-COLOR-HARDCODED     | Token/CSS 外裸色            | 生产源码                               | 65 个唯一 hex/rgb/rgba、102 次；Canvas 61、Assistant 28、Shared 8、Local Agent 5                                  | candidate  |
| FND-COLOR-UTILITY-RAW   | 裸色 Tailwind utility       | TS/TSX class                           | 扩展扫描 56 种、127 次；含 black/white/red/#2f80ff 与内容效果色                                                   | candidate  |
| FND-TYPOGRAPHY          | 字体与排版                  | CSS、Tailwind、Ant、inline             | 75 种 utility、614 次；四条字体路径；无 typography Token                                                          | unreviewed |
| FND-SPACING             | 间距                        | Tailwind 默认 spacing                  | 扩展扫描 179 种 utility、835 次；未扩展项目尺度                                                                   | unreviewed |
| FND-SIZE                | 尺寸                        | Tailwind、Ant、props、inline           | 扩展扫描 193 种 utility、837 次                                                                                   | unreviewed |
| FND-RADIUS              | 圆角                        | CSS variable、Tailwind、Ant、arbitrary | 22 种 class、195 次                                                                                               | unreviewed |
| FND-BORDER              | 描边/focus                  | Tailwind、Ant、CSS override            | 44 种 utility、225 次；部分 focus/error class 无产物                                                              | unreviewed |
| FND-SHADOW              | 投影/elevation              | Tailwind、CSS、inline、Ant             | 14 种 shadow class、约 39 次，另有多组字面量                                                                      | unreviewed |
| FND-LAYER               | z-index                     | Tailwind、inline、Ant/Radix 默认       | 显式 0/1/10/20/30/40/50/70/80/90/100/120/1200；Ant zIndexPopupBase 1000，Select/Tooltip/Image 派生 1050/1070/1080 | unreviewed |
| FND-OPACITY-BLUR        | 透明度/模糊                 | Tailwind、inline                       | 32 种 utility、108 次；blur base/sm/md/xl                                                                         | unreviewed |
| FND-MOTION              | duration/easing/keyframe    | Tailwind、CSS、Motion、WAAPI           | 15 种 utility、54 次；另有 100–500ms、1.5s、7s 等规则                                                             | unreviewed |
| FND-BREAKPOINT          | 响应式                      | Tailwind、container、JS geometry       | 43 种 responsive utility、67 次；另有 440px container                                                             | unreviewed |
| FND-ICON-SIZE           | 图标                        | Lucide                                 | 12/14/16/18/20/24/28/32/44px 意图；无契约                                                                         | unreviewed |
| FND-TAILWIND-ARBITRARY  | arbitrary/important         | TS/TSX class                           | 扩展扫描 arbitrary 173 种/275 次；important 54 种/156 次                                                          | candidate  |
| FND-INLINE-STYLE        | inline visual/dynamic style | TSX                                    | 203 个 style + 5 个 Ant styles                                                                                    | candidate  |

### 5.2 逐值与调用位置清单

以下机器清单是阶段 1 项级明细的事实源；每项包含 value、source occurrence count 和 source:line。扩展扫描覆盖 JSX className、名称以 ClassName 结尾的变量/属性，以及 cn/clsx/twMerge 参数，因此数量高于早期仅 JSX 的聚合扫描：

| 清单                       | 内容                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| CURRENT_COLORS.json        | App/Canvas/CSS Token、65 个裸色、56 种裸色 utility、2 个动态 CSS property |
| CURRENT_CLASSES.json       | 173 种 arbitrary、54 种 important 及全部调用位置                          |
| CURRENT_LAYOUT_VALUES.json | 179 种 spacing、193 种 size、43 种 responsive utility                     |
| CURRENT_VISUAL_VALUES.json | Typography、radius、border、shadow、layer、opacity/blur、motion           |

生成器为 scripts/audit-design-system-current-values.cjs；四个文件均锁定 source revision 与 production input tree hash，并可用 --section <name> --check <file> 验证。组件家族的调用方映射见第 15 节；生命周期、决策、迁移和截图字段继承第 2.4 节。

### 5.3 当前主题事实源

```text
useThemeStore: light | dark（默认 dark）
  ├─ App.tsx → html.dark
  │    └─ index.css 手写 Light/Dark CSS variables
  ├─ getAntThemeConfig()
  │    └─ appThemeTokens → Ant --ant-* variables
  └─ canvasThemes[theme]
       └─ Canvas、Assistant、Local Agent inline style
```

当前至少同时维护 App TypeScript Token、CSS variables、Ant ThemeConfig/派生变量、Canvas TypeScript Domain Token 四套视觉值来源；Tailwind 默认排版、间距、阴影、透明度、动效和断点又是额外事实源。

App Token 与 CSS 的值大体一致，但完全依赖手工同步：

- background/foreground/card/popover/border/input/ring/primary/warning/success 存在人工映射。
- mutedSurface 同时映射 muted、secondary、accent。
- danger 只映射 destructive，CSS 没有 dangerSurface/dangerBorder 对应项。
- subtleSurface、primaryHover 和 Table selection 没有直接 CSS 对应。
- CSS 的多种 foreground 没有独立 App Token key。
- 11 个颜色字面量同时重复在 App TS、Canvas TS 与全局 CSS。
- Ant ThemeConfig 没有映射 colorSuccess/colorSuccessBg/colorSuccessBorder，success 状态仍可能使用 Ant 默认绿色体系。

### 5.4 Typography

- 全局栈声明 Inter、ui-sans-serif、system-ui、-apple-system、BlinkMacSystemFont、Segoe UI、sans-serif。
- 仓库没有 @font-face、Inter 文件或字体依赖；跨平台会回退不同系统字体。
- Ant ThemeConfig 没有 fontFamily，实际字体栈与全局 body 不完全同源。
- 另有 font-mono 5 次、font-serif 2 次，合计至少四条字体路径。
- 字号包含 8、10、11、12、13、14、15、16、18、20、24、30、36、48、72、96px。
- 字重 400/500/600/700；行高包含 1、16/20/24/28/32px 和 100%。
- tracking 包含 tight/normal/wide、0.18em、0.2em。
- Canvas 用户文本字号 10–32px、步长 2、默认 14，line-height 为 fontSize × 1.65；这是用户内容/Domain 值，不应机械并入 UI 字号。

### 5.5 Spacing、尺寸与形状

- Tailwind spacing index：0、0.5、1、1.5、2、2.5、3、3.5、4、5、6、7、8、9、10、11、12、14、16、20、px、auto。
- 典型控件高度同时存在 24/28/32/36/40/48/56/64px；Ant SM/Default/LG 为 28/32/40px。
- Button size=small 有 55 个调用点，同时大量调用方使用 important class 重写高度、宽度和 padding。
- Drawer 固定宽 280px；Workbench 移动 Drawer 高 82vh；Ant size=large 当前解析宽度为 736px。
- Modal 显式宽度包括 760/780/820/860/980/1040px 和 auto；另有 9 个无 width 调用，使用 Ant 默认 520px。
- --radius 为 8px；Tailwind 映射约为 4/6/8/12/14.4/17.6/20.8px。
- 另有 1/3/5/18/24px、inherit、full；17.6px 与 18px 是明确近重复。

### 5.6 Shadow、Layer、Opacity

- Tailwind 默认 shadow 与 7 个 arbitrary shadow 并存；Ant 还有 boxShadowSecondary。
- Canvas Dock、Top Bar、Settings Portal、Node、Crop、快捷键分别拥有独立 shadow。
- layer 从 0 到 1200；App Header、Canvas 节点/工具、Context/Mention/Create Menu、Radix、自制 Portal、Ant Portal 没有统一契约。
- opacity 出现 0、10、15、30、35、40、45、50、55、60、65、70、75、80、85、90、95、100。
- backdrop blur 使用 base/sm/md/xl。

### 5.7 Motion 与响应式

- Tailwind duration 100/150/200/300/500ms，另有 35 处裸 transition。
- CSS 包含 7s Aurora、180ms scrollbar、150ms filter tag、260/340ms Canvas batch。
- Motion panel 为 500ms；DiaTextReveal 默认 1.5s，宽度过渡 400ms；主题 View Transition 400ms。
- Theme Toggler 还动态写入 --magicui-theme-toggle-vt-duration 与 --magicui-theme-vt-clip-from 两个 CSS custom property；203 个 style 统计不包含这类 CSSOM 写入。
- 只有 DiaTextReveal 明确读取 reduced motion；其他 CSS、Motion、Canvas、主题切换没有统一降级。
- Tailwind 使用默认 sm/md/lg/xl/2xl；Composer 另有 440px container；Canvas/Portal 还使用 window.innerWidth、ResizeObserver 和运行时几何。

## 6. Primitive 库存

| ID      | Primitive             | 当前来源与静态调用                                 | 路由/范围                                         | 当前状态与候选                                                           |
| ------- | --------------------- | -------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| PRM-C01 | Button/IconButton     | Ant 117、native 38、RouteButton 3                  | 全路由                                            | 多套尺寸、focus、danger/loading 与 accessible name；高优先级统一契约候选 |
| PRM-C02 | Link                  | anchor wrapper、next/link shim                     | Top/Mobile Nav、内部路由                          | 基本键盘语义完整                                                         |
| PRM-C03 | Input/Search/Password | Ant Input 16、Search 1、Password 3；native text 1  | Catalog、Config、Agent、Canvas                    | focus/error/disabled 不一致                                              |
| PRM-C04 | Textarea              | Ant 6、native 5                                    | Workbench、Config、Agent、Canvas                  | native 版本分别手写状态                                                  |
| PRM-C05 | NumberInput           | Ant InputNumber 1；native number 3                 | Settings、Canvas dialogs                          | 多套 NumberInput；label/aria 不一致                                      |
| PRM-C06 | Select                | Ant 7；Radix wrapper 消费 2                        | Assets/Config/ModelPicker/Assistant               | 明确重复来源；z-index 与状态 CSS 不一致                                  |
| PRM-C07 | Checkbox              | AppMultiSelectCheckbox 4                           | Canvas Catalog/Workspace、Image/Video             | boolean；无 indeterminate/error                                          |
| PRM-C08 | Switch                | Ant 5                                              | Generation、Assistant、Canvas                     | 领域 wrapper 可保留语义                                                  |
| PRM-C09 | Segmented             | Ant 8；native AgentModeSwitch                      | Canvas、Assistant、Local Agent                    | native 版本缺 radio/aria-pressed 契约                                    |
| PRM-C10 | Slider                | Ant 2 + native range 2                             | Canvas media/toolbar/zoom                         | 多个前置文本不是可访问 label                                             |
| PRM-C11 | Tag/Badge             | Ant Tag 24、CheckableTag 1；多种自制 pill          | 全产品                                            | 缺 canonical Badge/status pill                                           |
| PRM-C12 | Tooltip               | Ant 17                                             | Assistant、Canvas、Workbench、Prompts             | 不应替代 icon button accessible name                                     |
| PRM-C13 | Disclosure            | native details/summary 2 套                        | Agent Tool Card                                   | 原生键盘语义可保留                                                       |
| PRM-C14 | Spinner/Progress      | Ant Spin 3、Progress 1、animate-spin、working text | Catalog、Config、Workbench、Canvas、Agent         | 无统一 loading/progress contract                                         |
| PRM-C15 | Radio                 | 未发现                                             | —                                                 | 当前缺项，不等于必须新增                                                 |
| PRM-C16 | Separator             | 无 canonical；Canvas 私有 Divider                  | Canvas                                            | 优先评审 Token，再判断是否组件化                                         |
| PRM-C17 | FileInput/Upload      | native input type=file 8                           | Assets 3、Assistant 1、Canvas 2、Image 1、Video 1 | 全部隐藏后由 Button 触发；accept、多文件、focus/error/上传状态未形成契约 |

## 7. Shared Pattern 库存

src/shared/ui 当前导出 43 个 UI 组件，另有 2 个共享路由组件，共 45 个；其中混合了 Primitive、通用 Pattern、Workbench Pattern 和 Canvas 风格实现。下表调用数使用“外部消费点”口径，排除同一共享文件内的内部组合；例如 AppNotice 内部的 AppSurface、CatalogCheckableFilterGroup 内部的 TagList 不重复计入。

| ID      | Family / 成员                                                         | 定义                                                        | 静态调用与范围                                                                         |
| ------- | --------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| PAT-C01 | AppSurface、AppHelperText、AppNotice                                  | shared/ui/app-surface.tsx                                   | 5/5/1；App Config                                                                      |
| PAT-C02 | Catalog Shell/Header/Filter/TagList/TextAction/Status/Pagination/Card | shared/ui/catalog-page.tsx                                  | Assets、Prompts、Picker；2/2/5/1/3/1/2/2                                               |
| PAT-C03 | Workbench 18 个组件                                                   | shared/ui/workbench-page.tsx                                | Image/Video；shell、sidebar、editor/results、reference、media、pending/error/empty/log |
| PAT-C04 | Settings controls                                                     | shared/ui/settings-panel.tsx                                | Image/Video/Audio；SettingGroup 15、OptionPill 9、Number/Dimension 各 4                |
| PAT-C05 | Radix Select wrapper                                                  | shared/ui/select.tsx                                        | ModelPicker、Assistant model picker                                                    |
| PAT-C06 | Theme transition                                                      | shared/ui/animated-theme-toggler.tsx                        | UserStatusActions、Canvas Toolbar                                                      |
| PAT-C07 | Content reveal                                                        | shared/ui/dia-text-reveal.tsx                               | Canvas Assistant empty state                                                           |
| PAT-C08 | Form/Field                                                            | Ant Form 6、Form.Item 26；native label 8                    | Assets、Config、Canvas settings                                                        |
| PAT-C09 | Dialog                                                                | Ant Modal 21                                                | 全部 feature                                                                           |
| PAT-C10 | Drawer                                                                | Ant Drawer 6                                                | Mobile Nav、Assets、Image/Video                                                        |
| PAT-C11 | Menu/Popover                                                          | Ant Dropdown、Radix Portal、自制 Canvas menu/popover        | 主要 Canvas Workspace                                                                  |
| PAT-C12 | Empty/Error/Loading                                                   | Ant Empty 5、Spin 3、Workbench/Agent 私有状态               | Catalog、Picker、Workbench、Agent                                                      |
| PAT-C13 | Agent Chat family                                                     | Message、Tool、Pending、Working、Composer、Tabs、ModeSwitch | Assistant 与 Local Agent 共享                                                          |
| PAT-C14 | Navigation                                                            | UserLayout、AppTopNav、MobileNavDrawer                      | 全路由；Canvas detail 隐藏主 Header；不受首页主体冻结限制，仍可独立评审                |
| PAT-C15 | Toast/Message                                                         | AntdApp context、App.useApp                                 | 加载、复制、生成、同步、Canvas 操作                                                    |
| PAT-C16 | Destructive Confirm                                                   | 多个独立 Modal                                              | Assets、Workbench、Assistant、Canvas                                                   |

## 8. Feature Component 库存

### 8.1 App 与非 Canvas feature

| ID           | Feature / 路由     | 当前组件家族                                                                             | 实现来源                                                    |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| FC-APP-01    | App Shell / 全路由 | UserLayout、AppTopNav、MobileNavDrawer、UserStatusActions、AppConfigModal、RouteFallback | Ant + native + custom                                       |
| FC-HOME-01   | /                  | HomePage、Highlighter、prompt mosaic、Image PreviewGroup；非导航视觉已冻结               | Ant Image/Tag + RouteButton + native；EX-HOME-VISUAL-FREEZE |
| FC-ASSET-01  | /assets            | AssetsPage、AssetCard、AssetDrawer、新增/编辑/删除 Modal                                 | Catalog + Ant                                               |
| FC-ASSET-02  | Image/Video/Canvas | AssetPickerModal、PickerCard、MyAssetsTab                                                | Ant Modal/Input/Empty + custom                              |
| FC-PROMPT-01 | /prompts           | PromptsPage、PromptCard、PromptDetailDialog                                              | Catalog + Ant                                               |
| FC-PROMPT-02 | Workbench/Canvas   | PromptSelectDialog、CanvasPromptLibrary                                                  | Modal + search/filter/loading                               |
| FC-SET-01    | 全路由             | AppConfigModal、WebdavProgressGrid                                                       | Modal/Tabs/Form/Progress/AppSurface                         |
| FC-SET-02    | 多 feature         | ModelPicker、ModelLabel、ModelIcon                                                       | Radix Select + settings domain                              |
| FC-SET-03    | Shell/Canvas       | UserStatusActions                                                                        | native IconButton + theme transition                        |
| FC-GEN-01    | /image             | ImagePage、GenerationSettings、Result/Pending/Failed、Log                                | Workbench + ImageSettings + Ant                             |
| FC-GEN-02    | /video             | Video Workbench、三类 reference、Result/Pending/Failed、Log                              | Workbench + VideoSettings + native media                    |
| FC-GEN-03    | 多上下文           | Image/Video/Seedance/Audio SettingsPanel                                                 | Shared settings + Ant Switch                                |
| FC-GEN-04    | /image、/video     | GenerationWorkbenchLogPanel、GenerationWorkbenchModelField                               | generation shared pattern                                   |
| FC-AST-01    | /canvas/:id        | CanvasAssistantPanel、History、Setup/Log、References、ModelPicker                        | Agent UI + Ant + Radix + Motion                             |
| FC-LOCAL-01  | /canvas/:id        | CanvasLocalAgentPanel、Connect/History/Log                                               | Agent UI + Ant + Motion                                     |

### 8.2 Canvas 文件级库存

| ID        | 家族              | 文件 / 组件                                                                                                                                                     |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FC-CAN-01 | Pages/Shell       | pages/canvas-library-page.tsx、pages/canvas-client-page.tsx、workspace/canvas-top-bar.tsx、canvas-agent-dock.tsx、canvas-overlays.tsx、canvas-refresh-shell.tsx |
| FC-CAN-02 | Viewport/Core     | infinite-canvas.tsx、canvas-connections.tsx、canvas-mini-map.tsx、canvas-node.tsx                                                                               |
| FC-CAN-03 | Toolbar/Menu      | canvas-toolbar.tsx、canvas-zoom-controls.tsx、canvas-context-menu.tsx、workspace/connection-create-menu.tsx、canvas-node-hover-toolbar.tsx                      |
| FC-CAN-04 | Image Toolbar     | canvas-image-toolbar-tools.tsx、canvas-image-toolbar-settings-modal.tsx                                                                                         |
| FC-CAN-05 | Composer/Input    | canvas-config-composer.tsx、canvas-resource-mention-textarea.tsx、canvas-node-prompt-panel.tsx、canvas-config-node-panel.tsx                                    |
| FC-CAN-06 | Settings Popovers | canvas-image-settings-popover.tsx、canvas-video-settings-popover.tsx、canvas-audio-settings-popover.tsx                                                         |
| FC-CAN-07 | Media dialogs     | canvas-node-angle-dialog.tsx、canvas-node-crop-dialog.tsx、canvas-node-mask-edit-dialog.tsx、canvas-node-split-dialog.tsx、canvas-node-upscale-dialog.tsx       |
| FC-CAN-08 | Project/Delete    | canvas-project-card.tsx、canvas-delete-projects-dialog.tsx                                                                                                      |

Canvas 内部还包含 Node 的 Loading/Error/Text/Image/Video/Audio/Batch、ResizeHandle、ConnectionHandle；ToolbarButton/Action、MenuButton、ConnectionCreateOption；MentionMenu/ResourcePreview；AngleSlider、CropMask、NumberField、SplitGrid 等 feature-local primitive/pattern。

## 9. 高置信度重复与边界候选

| 优先级 | 候选                                                               | 当前建议，仅供评审                                                    |
| ------ | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 高     | Image/Video/Audio 三个 Canvas Settings Popover                     | 共享 Portal、定位、outside-click、surface、尺寸、层级；保留内容 panel |
| 高     | Image/Video Workbench 重复结构                                     | 继续共享 shell/reference/result/log；保留媒体领域差异                 |
| 高     | Assistant/Local Agent panel、History、Log                          | 抽取 Agent panel shell/list/log；不合并连接与会话业务                 |
| 高     | Ant Select 与 Radix Select                                         | 阶段 4 决定 canonical Select；保留 tags/multi-select 特殊能力         |
| 高     | native/Ant IconButton                                              | 统一尺寸、name、focus、danger/loading 契约                            |
| 高     | destructive confirmation Modal                                     | 建立 ConfirmDialog Pattern                                            |
| 中     | CatalogItemCard、PickerCard、CanvasProjectCard、WorkbenchMediaCard | 共享 Card/Media Card foundations；保留业务 wrapper                    |
| 中     | Canvas Toolbar 与 Zoom dock                                        | 共享 Canvas dock surface Token/Pattern                                |
| 中     | ToolbarButton、ToolbarAction、PreviewToolbarItem、MenuButton       | 共享 feature-local action primitive；避免大而全布尔组件               |
| 中     | Angle/Split/Upscale/Mask/Crop                                      | 共享 image-operation shell/preview/field/footer；编辑器保持独立       |
| 中     | 两套 Canvas mention menu/preview                                   | 共享定位、surface、option、preview；输入模型不整体合并                |
| 中     | Spinner/Empty/Error/Status pill                                    | 建立通用状态 Pattern，保留 Workbench/Agent domain variant             |

以下差异不能仅因视觉相似而强行合并：

- App 与 Canvas 语义 Token 必须保留分层；可共享 Reference 或部分 Semantic，但不要求同值。
- contentEditable token composer 与纯文本 mention textarea 的输入模型不同。
- Crop/Mask/Resize/Connection 等依赖 Canvas 坐标和 pointer state，应保留领域组件。
- 媒体内容遮罩、裁剪线、用户文本字号和运行时几何不应机械提升为全局 Token。

## 10. Domain Token、Content Effect 与动态例外

### 10.1 Domain Token 候选

| ID                      | 当前值/语义                                                 | 来源与范围                         | 基线锚点                                     | 状态      |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------- | -------------------------------------------- | --------- |
| DOM-COLOR-CANVAS-ACCENT | selection/reference #2f80ff                                 | Canvas Node 与 reference 交互      | desktop-dark/12-canvas-node-types            | candidate |
| DOM-STATUS-AGENT        | info/success/warning/error 前景、soft background、border    | Assistant/Local Agent Tool/Log     | desktop-dark/15-canvas-assistant             | candidate |
| DOM-COLOR-MINIMAP       | image #10b981、video #f97316、audio #a855f7、config #60a5fa | canvas-mini-map.tsx                | Canvas Workspace 基线                        | candidate |
| DOM-COLOR-CANVAS-DANGER | #ef4444/#f87171                                             | Canvas delete/danger action        | Canvas Workspace/Toolbar                     | candidate |
| DOM-SHADOW-CANVAS       | dock、toolbar、node selection 多套 shadow                   | Canvas Shell/Node/Toolbar          | Canvas Workspace、Appearance                 | candidate |
| DOM-CMP-GEN-PORTAL      | width 356、radius 18、padding 18、z1200、独立 shadow        | Image/Video/Audio Settings Popover | 阶段 5 fixture；当前调用入口已映射 FC-CAN-06 | candidate |

### 10.2 Content Effect 候选

| ID                   | 当前效果                                   | 来源与范围                     | 基线锚点               | 状态                    |
| -------------------- | ------------------------------------------ | ------------------------------ | ---------------------- | ----------------------- |
| FX-HOME-AURORA       | ai-title-aurora、highlighter               | HomePage、index.css            | 01-home                | protected；保持当前效果 |
| FX-ASSISTANT-REVEAL  | DiaTextReveal 五色渐变、Assistant 品牌渐变 | dia-text-reveal、Assistant     | 15-canvas-assistant    | unreviewed              |
| FX-MEDIA-READABILITY | black/white overlay 与内容渐变             | Catalog/Workbench/Canvas media | Workbench、Canvas Node | unreviewed              |
| FX-CANVAS-CROP       | 黑色 crop mask、白色辅助线                 | Canvas Crop Dialog             | 阶段 5 fixture         | unreviewed              |
| FX-CANVAS-MASK       | Mask 绘制色与预览 overlay                  | Canvas Mask Dialog             | 阶段 5 fixture         | unreviewed              |
| FX-KBD               | 拟物渐变、inset shadow                     | Canvas Shortcuts/Kbd           | 14-canvas-shortcuts    | unreviewed              |

### 10.3 应保留为动态几何或用户内容

| ID                    | 例外                                                     | 来源/用途                 | 处理                                 |
| --------------------- | -------------------------------------------------------- | ------------------------- | ------------------------------------ |
| EX-GEO-NODE-VIEWPORT  | node/viewport translate、scale、width、height            | InfiniteCanvas/CanvasNode | 运行时几何，不 Token 化              |
| EX-GEO-GRID-SELECTION | grid size/position、selection box、mini-map viewport     | Canvas viewport/Minimap   | 运行时几何                           |
| EX-GEO-OVERLAY        | Context/Mention/Connection menu 与 Portal viewport clamp | Canvas menu/popover       | 位置动态；surface 规格仍进入 Pattern |
| EX-GEO-MEDIA-EDIT     | Crop/Split/Resize handle 与 connection path              | Canvas media/connection   | 领域交互几何                         |
| EX-MOTION-RUNTIME     | batch animation 起点 CSS variable、动态 scrollbar thumb  | Canvas batch/preview      | 运行时计算                           |
| EX-RADIX-RUNTIME      | available height、trigger size、transform origin         | Radix Select              | 第三方运行时变量                     |

### 10.4 用户批准的视觉冻结例外

| ID                    | 保护范围                                                     | 允许变化                                   | 处理                                                                                                               |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| EX-HOME-VISUAL-FREEZE | `/` 首页非导航内容；Light/Dark、Web 桌面/移动、Electron 桌面 | PAT-C14/FC-APP-01 公共导航可按单独审批修改 | FC-HOME-01、FX-HOME-AURORA 及首页主体中的共享 Token/Primitive 消费结果保持视觉等值；详见 HOMEPAGE_VISUAL_FREEZE.md |
| EX-USER-CANVAS-TEXT   | 用户编辑字号 10–32px 与动态 line-height                      | Canvas Text Node                           | 用户内容值                                                                                                         |

## 11. 状态、主题、响应式与 Portal 矩阵

| 家族                     | 状态覆盖                                                                    | 主题来源                                       | 响应式                                      | Portal/层级                            | 当前结论                                                  |
| ------------------------ | --------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| Ant Primitive            | default/hover/focus/disabled/loading/error 由 Ant 提供，调用方经常 override | 根 ConfigProvider；Settings 有嵌套 Provider    | 主要由调用方 Tailwind 控制                  | Ant 默认 Portal                        | success、尺寸和 override 未与 App Token 完全同源          |
| Radix Select             | open/closed/highlighted/disabled/invalid 源码有意图，但多项 class 无产物    | CSS variables + Tailwind                       | trigger/content 使用 Radix runtime variable | 默认 z50，调用方可到 z1200             | 必须在 Design Lab 展示“意图与实际计算值”                  |
| Native App/Agent         | 各文件手写 hover/focus/disabled；覆盖不均                                   | CSS variables、Tailwind、硬编码                | Catalog/Workbench 较完整，长文本仍需测      | 通常非 Portal                          | accessible name、focus 和 pressed/selected 语义需逐项核查 |
| Shared Catalog           | loading/error/empty/result/filter/pagination                                | App CSS/Ant                                    | 桌面/移动断点                               | Detail/Create/Delete 使用 Ant Portal   | Pattern 已共享，状态外观仍未形成完整 Token                |
| Shared Workbench         | empty/pending/failed/result/log/reference                                   | App CSS/Ant                                    | Desktop grid + Mobile Drawer                | Picker/Confirm/Drawer 使用 Ant Portal  | Image/Video 仍有领域重复和嵌套交互风险                    |
| Assistant/Local Agent    | empty/working/message/tool/history/log/connect                              | Canvas Theme + Ant + 硬编码状态色              | 固定 panel 与滚动容器                       | Motion panel、Radix/Ant overlay        | reduced-motion、Tabs 键盘、状态色需要统一                 |
| Canvas Node/Toolbar      | selected/related/loading/error/empty/editing/batch/active/disabled          | canvasThemes + hardcoded domain/content values | 运行时几何为主                              | z10–120 与 Ant Tooltip/Modal           | pointer-only 与 hover-only 风险最高                       |
| Canvas 自制 Menu/Popover | open/closed/outside pointer；Escape/focus restore 不一致                    | Canvas Theme + 静态 shadow                     | viewport clamp、固定宽度                    | body Portal z1200 或 canvas 内 z80–120 | 需要统一 overlay contract，但不可在阶段 1 修复            |
| Theme 切换               | Light/Dark、View Transition                                                 | CSS variables + Ant + Canvas                   | Web desktop/mobile；Electron desktop        | 主题切换本身非 Portal                  | 只有两主题；system/high-contrast 仍是开放决策             |

长中文、长英文、200% zoom、完整 focus 顺序、所有 hover-only 替代和全部 Canvas 编辑 Dialog 的运行时矩阵留给确定 fixture；它们已经进入库存，不通过调用真实服务制造。

## 12. 已确认的当前风险

### 12.1 构建后无 CSS 的 Tailwind 类

对 JSX className 中可静态提取的 781 个 class token 与 Tailwind 3.4 实际产物逐项比对，并单独复核 workbench-style.ts 与 buttonClassName 等辅助 class 字符串后，确认至少 32 种真实视觉 utility、44 次源码使用没有生成 CSS；32/44 是已编译确认的下限：

- shared/ui/select.tsx 使用多项 Tailwind v4 或动画插件语法，但项目实际安装 Tailwind 3.4.19（package.json 范围为 ^3.4.17）且 plugins 为空。
- tailwind.config.ts 的语义色直接使用 var(--token)，没有 alpha-value，导致 background/ring 的 /opacity 语法无产物。
- aria-invalid、data-highlighted、data-placeholder 等状态 class 部分无产物。
- size-4.5 在 Canvas Toolbar 出现 13 次但无产物，Lucide 可能回落到默认 24px。
- bg-[#2f80ff]/16、ring-[#2f80ff]/24、hover:bg-current/20 等 opacity 无定义。

node-element、canvas-config-mode 是无 CSS 的 DOM marker，不计入失效视觉类。

### 12.2 组件、状态与可访问性风险

| 优先级 | 风险                         | 当前证据                                                             |
| ------ | ---------------------------- | -------------------------------------------------------------------- |
| 高     | Token 多事实源               | App TS、CSS variables、Ant、Canvas TS/inline 并行                    |
| 高     | focus/error 样式缺失         | Select/Checkbox 的 semantic opacity 与 aria class 无 CSS             |
| 高     | 字体跨平台漂移               | 声明 Inter 但无本地资产；Ant 使用另一系统栈                          |
| 高     | Overlay layer 无契约         | z50–1200 与 Ant/Radix/custom Portal 并存                             |
| 高     | Canvas pointer-only          | node drag/resize/connect、SVG、Minimap、Crop、Mask 无键盘替代        |
| 高     | 自制 menu/popover 契约不完整 | Escape、focus/restore、collision、role 不统一                        |
| 中     | 嵌套交互元素                 | Workbench LogCard button 内包含 Checkbox label/input                 |
| 中     | 自制 Tabs 不完整             | 有 tab role，但无方向键、roving tabindex、aria-controls              |
| 中     | Option Pill 语义缺失         | SettingsOptionPill/PreviewTile 无 aria-pressed 或 radio              |
| 中     | hover-only 操作              | Workbench reference、Canvas batch/hover toolbar                      |
| 中     | fixed width 响应式风险       | 760–1040px Modal、356px Portal、Canvas 固定 dock/menu                |
| 中     | Ant success 不同源           | ThemeConfig 未映射 success 系列                                      |
| 中     | reduced-motion 不完整        | 只有 DiaTextReveal 显式处理                                          |
| 中     | 大量 Ant override            | 生产静态 important 156 次；CSS 另有 14 个 important                  |
| 中     | 裸色与 inline style 密集     | Token/CSS 外 102 次裸色；203 个 style                                |
| 中     | 失效旧 CSS selector          | Canvas Settings 已是 div Portal，部分 ant-popover-inner 规则不再命中 |
| 低     | 未使用 Token/alias           | canvasTokens 9 项、canvas node.label                                 |
| 低     | 非法 CSS 值                  | DiaTextReveal verticalAlign: text-center                             |

以上都是“当前实现事实”，本阶段不修复。

## 13. Design Lab 展示与 fixture 清单

阶段 2 只实现 Foundations/Primitives 当前态；Patterns/Feature Components 已进入库存，但其完整组合展示留到阶段 5。

### 13.1 阶段 2 必须展示

- 全部颜色来源及 Light/Dark 解析值、重复映射和裸色样本。
- Typography、spacing、size、radius、border、shadow、layer、opacity、blur、motion、breakpoint、icon size。
- Button/IconButton、Link、Input、Textarea、NumberInput、FileInput/Upload、Select、Checkbox、Switch、Segmented、Slider、Tag/Badge、Tooltip、Disclosure、Spinner/Progress、Separator。
- 每个适用 primitive 的 default/hover/active/focus-visible/disabled/loading/selected/indeterminate/error。
- 长中文、长英文、图标+文本、纯图标、空值、overflow、桌面/移动、Light/Dark、系统真实 `prefers-reduced-motion`；评审用 `motionFreeze` 与系统偏好分离。
- 失效 Tailwind class 的“源码意图 / 实际计算结果”对照，避免 Design Lab 伪造出当前不存在的样式。

### 13.2 阶段 5 fixture 需求

- Catalog：loading/error/empty/results/pagination、create/edit/detail/delete。
- Workbench：reference、pending/success/failure、log、mobile Drawer、Picker。
- Agent：message/tool/pending/working/history/log/connect、长内容和附件。
- Canvas：五类 Node、loading/error/empty/selected/batch、connection、toolbar/menu/popover、全部 media dialog。
- Portal：完整 Ant Modal/Drawer/Tooltip/Dropdown、Radix Select、自制 Portal 及其周边 Pattern/Feature Component 的真实打开和叠层矩阵；阶段 2 已覆盖 `PRM-C06` Ant tags/Radix Select 与 `PRM-C12` Tooltip 的基础打开态，不替代本阶段的完整组合矩阵。
- Generation/Settings：完整 `SettingsPanel`、质量快捷 pills、比例卡片、`ModelPicker`、Modal 及业务状态；阶段 2 只展示其中可独立归属 Primitive 的 W/H、设置数字输入和 Select 基础形态。

fixture 必须确定、隔离，不调用真实 AI、WebDAV、在线 Assistant 或本地 Agent，不依赖用户 profile。

## 14. 阶段 1 结论与审批状态

- 70 个生产 TSX、全部公开路由和全部样式来源已经映射到稳定库存家族或明确例外，未分类项为零。
- Foundations、Primitives、Patterns、Feature Components、Domain Token、Content Effect 和动态几何已经分层记录。
- 四份逐值机器清单已通过只读生成器反向校验，能够从每个聚合值定位到生产源码调用位置。
- 本库存中的稳定 ID 是 `TRACEABILITY.md` 后续映射的旧实现主键；目标设计项产生后必须建立双向关系和调用点台账。
- `EX-HOME-VISUAL-FREEZE` 已冻结 `/` 首页非导航内容；公共导航仍在正常评审和迁移范围内。
- 重复项只标为 candidate，没有实施合并、删除或修复。
- 当前视觉基线和复现协议见 baselines/current/README.md。
- 阶段 1 的覆盖范围、分类方式、高风险项、当前基线和追踪规则已由用户于 2026-07-11 确认。

阶段 2 前置决策已由用户于 2026-07-11 按推荐方案关闭：

- DS-O2：使用共享真实 App Provider 的独立 Vite entry。
- DS-O3：完全排除在正式 Web/Electron 构建、产品导航和生产 bundle 之外。
- DS-O4：继续项目原生 React/Vite Design Lab，不引入 Storybook。
- DS-O14：使用 Playwright screenshot diff、基础交互测试和 `@axe-core/playwright` 自动扫描；阶段 2 只记录当前问题，全局阈值与合规目标留待 DS-O13。

### 14.1 阶段 2 当前态 Design Lab 维护状态

- 阶段 2 已将本库存全部 23 个 Foundations 与 17 个 Primitives 稳定 ID 登记到 `src/design-lab/catalog/catalog-data.ts`，合计 40 项，无未映射项。
- 每项稳定锚点使用 `#design-lab-<inventory-id-lowercase>`；例如 `PRM-C06` 对应 `#design-lab-prm-c06`。
- 搜索覆盖 ID、名称、层级、分类、来源、状态、当前使用、解析说明和决策；筛选覆盖层级、来源与状态。
- 用户复核发现筛选工具栏的原生 `select` 箭头与生产组件漂移后，搜索、层级、来源、状态和重置控件已改为真实 Ant `Input`、`Select`、`Button`；Design Lab 不再为这组控件维护近似生产外观的专用 CSS。
- Foundations/Primitives 忠实度已逐项复核，当前态展示只使用真实组件、实际 Token/computed value 或明确 source-linked fixture，不再以无法追溯的手写近似皮肤代表生产现状。
- `PRM-C05` 已直接展示生产共享 `SettingsDimensionInput` 的 W/H 形态与 `SettingsNumberInput`；`PRM-C06` 已展示生产使用的 Ant `mode="tags"` 多值模式及共享 Radix Select，保留两者各自真实箭头、状态和基础 Portal 行为。
- 完整 `SettingsPanel`、质量快捷 pills、比例卡片、`ModelPicker`、Modal 和其他 Pattern/Feature Component 组合仍留阶段 5；阶段 2 没有复制业务 store、服务或完整组合。
- Design Lab 的 `motionFreeze` 仅是“冻结动态预览（评审工具）”，与浏览器真实 `prefers-reduced-motion` media preference 分离；两者已有独立状态和测试断言。
- 40 个库存 ID 各有 Light/Dark 当前实现截图，共 80 张逐项视觉基线；另有 4 张整体/筛选截图，以及 `PRM-C06` Ant tags Portal、Radix Portal、移动当前态与 `PRM-C12` Tooltip 移动打开共 4 张针对性截图。当前测试矩阵为 47 个 Playwright 测试。
- Provider 等值提取新增 `src/app/providers/app-visual-providers.tsx` 与 `src/app/providers/app-providers.tsx`，两者继续归属 `FND-THEME-PROVIDER`。当前生产源码为 187 个 TS/TSX、72 个 TSX；阶段 1 的 185/70 计数作为冻结快照保留。
- 生产样式审计器排除 `src/design-lab/*` 后，四份当前样式机器清单继续通过 `--check`；冻结改前基线没有重写。
- axe 当前态记录将 `PRM-C10` 的两个无可访问名称 Ant Slider 和 `PRM-C14` 的三个无可访问名称 Ant Progress 标为现有问题；阶段 2 不修改生产组件。
- 以上忠实度修复已于 2026-07-11 通过用户验收，阶段 2 完成；阶段 2 期间未修改生产组件、Token 或页面视觉。用户于 2026-07-12 批准阶段 3 先执行现有样式对比审计，40 个库存 ID 现已完整且唯一地进入 10 个只读对比组；分组不构成目标映射。详细架构分别见 `docs/design-system/PHASE_2_DESIGN_LAB.md` 与 `docs/design-system/PHASE_3_CURRENT_STYLE_AUDIT.md`。

## 15. 生产 TSX 来源覆盖附录

下表逐一映射本次纳入的 70 个生产 TSX。test/spec 不在生产库存中。

|   # | Source file                                                            | 库存映射                        | 主要表面                    |
| --: | ---------------------------------------------------------------------- | ------------------------------- | --------------------------- |
|   1 | src/app/App.tsx                                                        | FND-THEME-PROVIDER、FC-APP-01   | 全路由 Provider             |
|   2 | src/app/routes/AppRoutes.tsx                                           | FC-APP-01                       | Route 与 fallback           |
|   3 | src/app/shell/HomePage.tsx                                             | FC-HOME-01                      | /                           |
|   4 | src/app/shell/UserLayout.tsx                                           | PAT-C14、FC-APP-01              | 全路由 shell                |
|   5 | src/app/shell/components/app-top-nav.tsx                               | PAT-C14、FC-APP-01              | Desktop Navigation          |
|   6 | src/app/shell/components/client-root-init.tsx                          | FC-APP-01                       | Client init                 |
|   7 | src/app/shell/components/mobile-nav-drawer.tsx                         | PAT-C10、PAT-C14                | Mobile Navigation           |
|   8 | src/features/assets/components/asset-picker-modal.tsx                  | FC-ASSET-02、PAT-C09            | Workbench/Canvas picker     |
|   9 | src/features/assets/pages/assets-page.tsx                              | FC-ASSET-01、PAT-C02            | /assets                     |
|  10 | src/features/assistant/components/canvas-agent-chat-ui.tsx             | PAT-C13、FC-AST-01、FC-LOCAL-01 | Agent shared UI             |
|  11 | src/features/assistant/components/canvas-assistant-panel.tsx           | FC-AST-01                       | /canvas/:id                 |
|  12 | src/features/canvas/components/canvas-audio-settings-popover.tsx       | FC-CAN-06、PAT-C11              | /canvas/:id                 |
|  13 | src/features/canvas/components/canvas-config-composer.tsx              | FC-CAN-05                       | /canvas/:id                 |
|  14 | src/features/canvas/components/canvas-config-node-panel.tsx            | FC-CAN-05                       | /canvas/:id                 |
|  15 | src/features/canvas/components/canvas-connections.tsx                  | FC-CAN-02                       | /canvas/:id                 |
|  16 | src/features/canvas/components/canvas-context-menu.tsx                 | FC-CAN-03、PAT-C11              | /canvas/:id                 |
|  17 | src/features/canvas/components/canvas-delete-projects-dialog.tsx       | FC-CAN-08、PAT-C16              | /canvas                     |
|  18 | src/features/canvas/components/canvas-image-settings-popover.tsx       | FC-CAN-06、PAT-C11              | /canvas/:id                 |
|  19 | src/features/canvas/components/canvas-image-toolbar-settings-modal.tsx | FC-CAN-04、PAT-C09              | /canvas/:id                 |
|  20 | src/features/canvas/components/canvas-image-toolbar-tools.tsx          | FC-CAN-04                       | /canvas/:id action registry |
|  21 | src/features/canvas/components/canvas-mini-map.tsx                     | FC-CAN-02                       | /canvas/:id                 |
|  22 | src/features/canvas/components/canvas-node-angle-dialog.tsx            | FC-CAN-07、PAT-C09              | /canvas/:id                 |
|  23 | src/features/canvas/components/canvas-node-crop-dialog.tsx             | FC-CAN-07、PAT-C09              | /canvas/:id                 |
|  24 | src/features/canvas/components/canvas-node-hover-toolbar.tsx           | FC-CAN-03                       | /canvas/:id                 |
|  25 | src/features/canvas/components/canvas-node-mask-edit-dialog.tsx        | FC-CAN-07、PAT-C09              | /canvas/:id                 |
|  26 | src/features/canvas/components/canvas-node-prompt-panel.tsx            | FC-CAN-05                       | /canvas/:id                 |
|  27 | src/features/canvas/components/canvas-node-split-dialog.tsx            | FC-CAN-07、PAT-C09              | /canvas/:id                 |
|  28 | src/features/canvas/components/canvas-node-upscale-dialog.tsx          | FC-CAN-07、PAT-C09              | /canvas/:id                 |
|  29 | src/features/canvas/components/canvas-node.tsx                         | FC-CAN-02                       | /canvas/:id                 |
|  30 | src/features/canvas/components/canvas-project-card.tsx                 | FC-CAN-08                       | /canvas                     |
|  31 | src/features/canvas/components/canvas-resource-mention-textarea.tsx    | FC-CAN-05                       | /canvas/:id                 |
|  32 | src/features/canvas/components/canvas-toolbar.tsx                      | FC-CAN-03                       | /canvas/:id                 |
|  33 | src/features/canvas/components/canvas-video-settings-popover.tsx       | FC-CAN-06、PAT-C11              | /canvas/:id                 |
|  34 | src/features/canvas/components/canvas-zoom-controls.tsx                | FC-CAN-03                       | /canvas/:id                 |
|  35 | src/features/canvas/components/infinite-canvas.tsx                     | FC-CAN-02                       | /canvas/:id                 |
|  36 | src/features/canvas/components/workspace/canvas-agent-dock.tsx         | FC-CAN-01、PAT-C13              | /canvas/:id                 |
|  37 | src/features/canvas/components/workspace/canvas-overlays.tsx           | FC-CAN-01、PAT-C09              | /canvas/:id                 |
|  38 | src/features/canvas/components/workspace/canvas-refresh-shell.tsx      | FC-CAN-01                       | /canvas/:id loading shell   |
|  39 | src/features/canvas/components/workspace/canvas-top-bar.tsx            | FC-CAN-01、PAT-C11              | /canvas/:id                 |
|  40 | src/features/canvas/components/workspace/connection-create-menu.tsx    | FC-CAN-03、PAT-C11              | /canvas/:id                 |
|  41 | src/features/canvas/pages/canvas-client-page.tsx                       | FC-CAN-01                       | /canvas/:id                 |
|  42 | src/features/canvas/pages/canvas-library-page.tsx                      | FC-CAN-01                       | /canvas                     |
|  43 | src/features/generation/audio/components/audio-settings-panel.tsx      | FC-GEN-03、PAT-C04              | Canvas/Generation settings  |
|  44 | src/features/generation/image/components/image-settings-panel.tsx      | FC-GEN-03、PAT-C04              | /image、Canvas              |
|  45 | src/features/generation/image/pages/image-workbench-page.tsx           | FC-GEN-01、PAT-C03              | /image                      |
|  46 | src/features/generation/shared/components/workbench-log-panel.tsx      | FC-GEN-04、PAT-C03              | /image、/video              |
|  47 | src/features/generation/shared/components/workbench-model-field.tsx    | FC-GEN-04、PRM-C06              | /image、/video              |
|  48 | src/features/generation/video/components/video-settings-panel.tsx      | FC-GEN-03、PAT-C04              | /video、Canvas              |
|  49 | src/features/generation/video/pages/video-workbench-page.tsx           | FC-GEN-02、PAT-C03              | /video                      |
|  50 | src/features/local-agent/components/canvas-local-agent-panel.tsx       | FC-LOCAL-01、PAT-C13            | /canvas/:id                 |
|  51 | src/features/prompts/components/canvas-prompt-library.tsx              | FC-PROMPT-02                    | Canvas                      |
|  52 | src/features/prompts/components/prompt-card.tsx                        | FC-PROMPT-01、PAT-C02           | /prompts                    |
|  53 | src/features/prompts/components/prompt-detail-dialog.tsx               | FC-PROMPT-01、PAT-C09           | /prompts                    |
|  54 | src/features/prompts/components/prompt-select-dialog.tsx               | FC-PROMPT-02、PAT-C09           | Workbench/Canvas            |
|  55 | src/features/prompts/pages/prompts-page.tsx                            | FC-PROMPT-01、PAT-C02           | /prompts                    |
|  56 | src/features/settings/components/app-config-modal.tsx                  | FC-SET-01、PAT-C08、PAT-C09     | 全路由 Config               |
|  57 | src/features/settings/components/model-picker.tsx                      | FC-SET-02、PRM-C06              | 多 feature                  |
|  58 | src/features/settings/components/user-status-actions.tsx               | FC-SET-03、PAT-C06              | Shell/Canvas                |
|  59 | src/main.tsx                                                           | FND-THEME-PROVIDER、FC-APP-01   | App mount                   |
|  60 | src/shared/router/client-router.tsx                                    | PRM-C02、FC-APP-01              | 全路由                      |
|  61 | src/shared/router/next-link.tsx                                        | PRM-C02                         | 内部 Link                   |
|  62 | src/shared/router/route-button.tsx                                     | PRM-C01、PRM-C02                | Button route entry          |
|  63 | src/shared/ui/animated-theme-toggler.tsx                               | PAT-C06、FND-MOTION             | Theme transition            |
|  64 | src/shared/ui/app-multi-select-checkbox.tsx                            | PRM-C07                         | 多选表面                    |
|  65 | src/shared/ui/app-surface.tsx                                          | PAT-C01                         | App Config                  |
|  66 | src/shared/ui/catalog-page.tsx                                         | PAT-C02                         | Catalog family              |
|  67 | src/shared/ui/dia-text-reveal.tsx                                      | PAT-C07、FND-MOTION             | Assistant content effect    |
|  68 | src/shared/ui/select.tsx                                               | PRM-C06、PAT-C05                | Radix Select                |
|  69 | src/shared/ui/settings-panel.tsx                                       | FND-ANT-CANVAS-LOCAL、PAT-C04   | Generation settings         |
|  70 | src/shared/ui/workbench-page.tsx                                       | PAT-C03                         | Image/Video Workbench       |
