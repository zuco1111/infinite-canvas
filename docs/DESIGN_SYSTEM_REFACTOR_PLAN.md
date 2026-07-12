# 设计系统与视觉优化重构方案

状态：方案已确认；阶段 0 文档落地已完成；阶段 1 全量库存与当前基线、阶段 2 当前态 Design Lab 均已于 2026-07-11 获用户确认并完成；阶段 3 现有样式对比审计已于 2026-07-12 获用户批准并启动，目标 Token 体系与生产实施仍待逐项决策。

日期：2026-07-11

## 1. 文档定位

本文件是后续设计系统统一、视觉优化、组件收敛和页面迁移工作的长期执行依据，记录：

- 已确认的目标、范围、非目标和执行顺序。
- Design Token 与组件的目标分层。
- 全量盘点、Design Lab、用户评审、试点迁移和全量迁移的方法。
- 每个阶段的入口条件、产出、审批门、验证要求和退出条件。
- 风险、回退策略、文档维护要求和完成定义。

`docs/PHASE_5_DESIGN_TOKENS.md` 与 `docs/PHASE_6_DESIGN_CONVERGENCE.md` 继续作为历史等值抽取和样式收敛记录，不因本轮视觉优化计划而改写。本文件只管理 2026-07-11 之后的新设计系统重构工作。

本文件确认的是分阶段工作方法，不代表用户已经一次性批准任何具体颜色、字体、尺寸、组件外观或页面 redesign。所有目标视觉规格仍需在对应评审门由用户逐项确认。

## 2. 已确认方向

用户已确认以下工作方向：

- 这是一项无法一次完成的长期项目，必须先完整落到文档，再逐阶段推进。
- 第一次盘点应覆盖基础组件、高级组件、领域组件和全部 Token；评审可以分层进行，但不应等基础层完成后才发现高级组件需求。
- 先建立“当前实现”的可检索库存和视觉基线，不在盘点时同步修改生产样式。
- 建立集中展示页面，让用户直接查看实际组件、Token、状态、主题和使用场景。
- 展示页面应区分“当前实现”和“候选目标”，避免修改目标组件后丢失旧实现证据。
- 用户负责决定组件保留、合并、拆分、变体化、废弃或作为领域例外，以及目标样式如何调整。
- 基础 Token 和基础组件获批后，应先在代表页面试点，不等待全部高级组件完成后才首次接入真实页面。
- 高级组件获批后，按 feature 或明确组件族分批迁移，不进行一次性全站替换。
- Canvas 风险最高、领域语义最强，应在普通页面和工作台验证稳定后再进入主要迁移。
- 当前 `/` 首页非导航内容保持现状，不参与本轮有意视觉修改；公共导航仍可按独立审批结果统一。
- 每个阶段都要同步维护文档、验证结果、开放决策和迁移状态。

建议的总流程为：

```text
文档与范围冻结
  → 全量盘点与当前基线
  → 当前态 Design Lab
  → 基础 Token 与基础组件目标规范
  → 代表页面试点
  → 高级组件与领域模式
  → 按 feature 分批迁移
  → 旧实现清理与防回退规则
```

每个用户审批门只授权记录中明确列出的目标项和紧随其后的实施阶段，不自动授权后续阶段、同类未评审项或全站视觉变更。

## 3. 背景与现状

项目已经在历史阶段完成部分设计收敛，但尚未形成完整设计系统：

- `src/shared/tokens/app.ts` 已提供浅色和深色应用语义颜色。
- `src/shared/tokens/canvas.ts` 已提供 Canvas、节点和工具栏的领域颜色。
- `src/app/theme/app-theme.ts` 已将部分应用 Token 映射到 Ant Design theme。
- `src/styles/index.css` 与 `tailwind.config.ts` 已提供部分 CSS 语义变量和 Tailwind 映射。
- `src/shared/ui` 已包含多选、Select、Surface、Catalog、Settings Panel 和 Workbench 等不同层级的共享实现。
- Phase 5/6 已统一部分颜色、筛选 Tag、Catalog Card、Checkbox、设置面板和工作台模式。

初步只读核查同时确认了以下结构性缺口；这些结论用于制定计划，不替代阶段 1 的正式全量库存：

- 应用颜色同时手写在 TypeScript Token 与全局 CSS 变量中，存在多个事实源和后续漂移风险。
- 字体、字号、字重、行高、间距、尺寸、圆角、描边、投影、层级和动效尚未形成完整 Token 体系。
- Ant Design、Radix Select、原生交互元素、Tailwind utility、CSS 覆盖和内联样式同时存在。
- 多处页面通过 Tailwind `!` 规则覆盖第三方控件尺寸或外观，说明组件规格尚未稳定地下沉到 theme、Token 或 canonical variant。
- `src/shared/ui` 同时包含 primitive、pattern 和页面级组合，尚缺少明确 taxonomy。
- Canvas 已有独立主题语义，但状态色、选中强调色、投影、圆角、层级和动效仍存在局部定义。
- 当前 E2E 会采集页面截图，但尚未建立完整的稳定视觉差异断言体系。

因此，本轮工作不是从零创建另一套组件库，也不是简单替换底层 UI 库，而是在现有技术栈和功能边界上建立明确、可审查、可迁移、可持续约束的设计系统。

## 4. 目标

### 4.1 产品与视觉目标

- 统一全产品的视觉语言、交互状态和可复用组件契约。
- 允许用户基于集中展示的真实实现，逐项批准视觉优化。
- 同一语义在不同页面具有一致的颜色、排版、尺寸、间距、边框、投影和状态反馈。
- Light/Dark、桌面/移动以及 Web/Electron 在同一设计契约下工作。
- 保留确有产品或领域意义的差异，不以数值相同作为唯一合并条件。
- 保持用户已明确满意的 `/` 首页非导航视觉；共享设计系统变化不能把首页当作隐式迁移对象。

### 4.2 工程目标

- 建立唯一、可追踪的 Token 事实源及单向消费关系。
- 建立 Foundations、Primitives、Patterns 和 Feature Components 的清晰边界。
- 页面和 feature 优先消费 canonical Token、组件或已记录的领域别名。
- 建立库存、决策、迁移和验证的可追踪关系。
- 用分批迁移、代表页面试点和视觉回归降低大规模改动风险。
- 在迁移稳定后建立防回退规则，避免重新引入无审批的重复组件或硬编码样式。

### 4.3 协作目标

- 每个重要视觉决策都能定位到组件、Token、使用页面、决策状态和批准记录。
- 用户不需要通过阅读源码判断效果，而是在 Design Lab 和代表页面中直接评审。
- 后续任何代理都能从本文件和配套记录中判断当前阶段、可执行范围、阻塞项和下一步。

## 5. 非目标

本计划不自动授权或承诺以下事项：

- 不一次性重写所有页面或在单个切片中完成全站替换。
- 不在盘点阶段修改现有生产组件、Token 或页面视觉。
- 不预设必须移除 Ant Design、Tailwind 或 Radix；底层库取舍是独立决策。
- 不为了“统一”把所有 App 与 Canvas Token 强制设为相同值。
- 不因为外观相似就把 feature 专属业务组件移动到 `shared`。
- 不把媒体遮罩、裁剪蒙层、图片内容辅助线、装饰渐变等内容效果机械归入全局品牌 Token。
- 不改变生成、存储、同步、画布编辑、助手、本地 Agent 或其他业务行为。
- 不默认修改产品文案、信息架构、页面流程或功能入口；如视觉方案需要同步调整，必须单独记录和确认。
- 不引入第三方插件市场、运行时主题编辑器、运行时 feature 开关 UI 或外部动态设计包。
- 不在没有用户具体批准的情况下声称某项视觉 redesign 已获批准。
- 不对 `/` 首页的 Hero、标题效果、主体操作区、提示词展示区或其他非导航内容进行有意视觉修改；公共导航不在此冻结范围内。
- 不在本计划中扩大桌面签名、公证、自动更新或商店发布范围。

## 6. 设计系统分层

### 6.1 Token 分层

Token 不按“基础页面”和“高级页面”简单拆分，而按语义责任分层。

#### Reference Tokens

表达原始尺度和值域，不直接表达具体业务用途，例如：

- 中性色阶、品牌色阶和功能色阶。
- 字体族、字号、字重、行高和字距尺度。
- spacing、尺寸和控件高度尺度。
- radius、border width、shadow/elevation、opacity 和 blur 尺度。
- z-index 层级、duration、easing、breakpoint 和图标尺寸尺度。

Reference Token 只有在确有复用和命名价值时才建立，不为每个历史像素值创建一个 Token。

#### Semantic Tokens

表达产品语义和状态，不绑定具体组件，例如：

- `surface`、`surface-elevated`、`surface-muted`。
- `text-primary`、`text-secondary`、`text-disabled`、`text-inverse`。
- `border-default`、`border-strong`、`focus-ring`。
- `action-primary`、`action-secondary`、`action-danger`。
- `status-success`、`status-warning`、`status-danger`、`status-info`。

Light/Dark 主题在 Semantic Token 层切换具体值；业务组件不应各自重新定义主题颜色。

#### Component Tokens

表达稳定组件规格，例如：

- Button 的高度、水平 padding、圆角、图标间距和 focus ring。
- Input/Select 的高度、边框、placeholder 和 error 状态。
- Modal/Drawer 的表面、间距、圆角、投影和层级。
- Card、Toolbar、Navigation、Pagination 等组件的稳定局部规格。

只有当规格跨调用方稳定、直接提升维护性时才建立 Component Token，避免把每个局部 class 都 Token 化。

#### Domain Tokens

表达明确领域语义，例如：

- Canvas 背景、网格、节点、选区、连接点、工具栏和小地图。
- Workbench 结果状态、生成记录和媒体引用。
- Assistant/Local Agent 的消息角色、工具调用和连接状态。

Domain Token 可以复用 Reference Token，也可以因交互和内容需要拥有独立语义值。App 与 Canvas 统一的是层级、命名和消费规则，不要求所有语义值相同。

#### Content Effects 与允许例外

以下值需要先分类，不应自动升为全局 Token：

- 媒体缩略图可读性遮罩。
- 图片裁剪、蒙版和选区辅助线。
- 节点类型识别色和内容本身携带的颜色。
- 品牌插画、装饰渐变和一次性营销视觉。
- 根据运行时几何、媒体内容或用户选择动态计算的内联值。

允许例外必须记录用途、作用域和不能复用通用 Token 的原因。

### 6.2 目标消费关系

目标是建立单向关系，而不是继续在 TypeScript、CSS、Tailwind 和第三方 theme 中重复维护同一事实：

```text
Canonical Token Source
  ├─ CSS Variables ─→ Tailwind semantic utilities
  ├─ Ant Design ThemeConfig
  ├─ Shared component variants
  └─ Canvas/Workbench/Assistant domain aliases
```

Canonical Token Source 的最终实现形式尚未确定。它可以是 TypeScript manifest、生成后的 CSS，或其他具有类型和构建校验的单一来源；阶段 3B 候选目标实现开始前必须关闭该决策。阶段 3A 只读现状审计不创建 canonical source，因此不受此项阻塞。

### 6.3 组件分层

#### Foundations

颜色、排版、间距、尺寸、圆角、描边、投影、透明度、模糊、层级、图标、断点和动效。

#### Primitives

Button、IconButton、Link、Input、Textarea、NumberInput、Select、Checkbox、Radio、Switch、Segmented、Slider、Tag/Badge、Tooltip、Separator 和 Spinner 等基础交互单元。

#### Patterns

Field/FormRow、Search/Filter、Surface、Card/List Item、Empty/Error/Loading、Pagination、Dialog、Drawer、Popover、Menu、Tabs、Toolbar/Dock 和 Navigation 等稳定组合模式。

#### Feature Components

Asset Picker、Generation Settings、Workbench、Canvas Node、Canvas Toolbar、Assistant Chat、Local Agent Panel 等包含明确领域语义的组件。

Feature Component 默认留在所属 feature。只有当多个 feature 以相同语义、行为、状态模型和稳定 API 复用时，才允许将其稳定部分提升到 `shared`。

## 7. 组件决策规则

组件不能只按“看起来像不像”决定合并。

| 情况                                             | 默认处理                                             |
| ------------------------------------------------ | ---------------------------------------------------- |
| 语义、行为、状态和无障碍契约相同，仅样式略有差异 | 合并为一个 canonical 组件                            |
| 仅尺寸、密度、色调或强调程度不同                 | 使用 `size`、`density`、`tone`、`variant` 等受控变体 |
| 外观相同，但语义、键盘行为或状态模型不同         | 保留独立组件，共享底层 primitive 或 Token            |
| 只在单一 feature 出现且包含业务语义              | 保留在 feature 内                                    |
| 多个 feature 复制了同一稳定交互模式              | 抽取 shared pattern，feature 保留领域 wrapper        |
| 依赖 Canvas 坐标、缩放、拖拽或媒体编辑行为       | 使用 Canvas 领域组件和 Domain Token                  |
| 纯运行时几何或内容效果                           | 记录为动态值或允许例外，不强制 Token 化              |

禁止为了减少文件数量创建拥有大量布尔开关的“大而全组件”。当不同变体已经具有不同语义或交互契约时，应拆分为清晰的组件 API。

## 8. 库存与决策记录

### 8.1 库存范围

第一次正式盘点必须一次覆盖：

- 全部 Token 和 CSS 变量。
- Tailwind 配置、标准 utility 和 arbitrary value。
- Ant Design ThemeConfig、组件级 ConfigProvider 和 CSS 覆盖。
- Radix、原生元素、自定义组件、内联样式和动态样式。
- Foundations、Primitives、Patterns 和 Feature Components。
- Light/Dark、桌面/移动、Web/Electron。
- 默认、hover、active、focus、disabled、loading、selected、indeterminate、error 和 empty 状态。
- Portal、浮层、滚动、响应式、长文本、键盘和 reduced-motion 行为。

### 8.2 每个库存项的最小字段

每个库存项至少记录：

- 稳定 ID、名称、层级和类别。
- 当前实现来源：Ant Design、Radix、原生、自定义、Tailwind、CSS 或 inline style。
- 源文件、调用位置、影响 feature、影响路由和使用次数。
- 当前视觉值、关联 Token、主题和响应式差异。
- 支持的交互状态、键盘行为和无障碍语义。
- 当前实现截图或可在 Design Lab 中定位的锚点。
- 重复项、相似项、依赖项和已知例外。
- 候选处理：保留、合并、拆分、变体化、领域化、废弃、允许例外或待确认。
- 用户决策、决策日期、迁移状态和验证状态。

### 8.3 状态生命周期

库存和决策项统一使用以下状态：

```text
unreviewed
  → candidate
  → approved | blocked
  → implemented
  → migrated
  → verified
  → retired（仅旧实现）
```

- `approved` 只表示用户批准了该项明确记录的目标规格，不代表批准同类别其他项目。
- `blocked` 必须记录缺失信息或冲突，不能通过代理自行猜测关闭。
- `retired` 只能在所有调用方迁移完成、验证通过且旧实现没有有效引用后使用。

### 8.4 配套记录

后续阶段开始时，应在 `docs/design-system/` 下逐步建立：

- `INVENTORY.md`：库存范围、统计、来源和分类结果。
- `TRACEABILITY.md`：旧设计项、目标设计项、生产调用点和迁移批次之间的双向追踪关系。
- `DECISIONS.md`：用户逐项批准的 Token、组件和例外。
- `MIGRATION_STATUS.md`：迁移批次、调用方、验证结果和遗留项。

大规模机器生成的数据可以使用适合检索和校验的结构化文件，但上述 Markdown 文档必须提供人类可读的结论、索引和状态，不得只留下脚本输出。

### 8.5 新旧设计项双向追踪规则

`INVENTORY.md` 中的稳定 ID 是旧实现的身份，不以容易漂移的源码行号作为主键。后续每个获批的目标 Token、组件、Pattern、领域 wrapper 或例外都必须获得新的稳定 ID，并在 `TRACEABILITY.md` 中维护以下三层关系：

1. **设计项映射**：旧库存 ID → 目标 ID；同时由目标 ID 反向列出全部旧库存 ID。
2. **调用点台账**：旧实现的 feature、文件、符号/组件和定位信息 → 目标 ID、目标 API/variant 或批准例外。
3. **迁移批次**：每个调用点属于哪个批次、当前状态、验证证据和回退单位。

映射关系必须明确标记为 `retain`、`merge`、`split`、`variant`、`domain-wrapper`、`exception` 或 `retire`。不得只写“替换为新组件”，也不得根据视觉相似度临时选择目标。

当源码移动导致行号变化时，以旧库存 ID、文件、所属符号/组件和调用特征重新定位；历史记录保留原定位信息，不能无痕覆盖。每次迁移必须满足：

```text
旧调用总数 = 已迁移调用数 + 剩余调用数 + 已批准例外数
```

一个旧调用点不能同时计入两个目标；一个目标设计项必须能反向解释其合并了哪些旧项。目标尚未批准时保持 `pending`，不得由代理推断映射。

## 9. Design Lab 要求

### 9.1 定位

Design Lab 是开发和评审工具，不是产品功能。它应尽量运行在真实 App Provider、主题、CSS、字体和第三方组件上下文中，避免展示环境与实际页面不一致。

阶段 2 已确认 Design Lab 使用共享真实 App Provider 的独立 Vite entry，并完全排除在正式 Web/Electron 构建、产品导航和生产 bundle 之外。后续如需改变接入或分发形式，必须重新获得用户批准。

### 9.2 双视图

Design Lab 必须明确区分：

- 当前实现：冻结现有视觉和行为，用于盘点、比较和追溯。
- 候选目标：展示待评审或已批准的新 Token、组件和模式。

当前实现不能通过重新手写一份近似 CSS 伪造；应尽量渲染真实组件或使用受控 fixture 复现真实状态。候选目标必须消费计划中的 canonical Token 和组件，不得再复制一份展示专用值。

### 9.3 展示维度

每个项目根据适用性展示：

- Light/Dark。
- 全部尺寸、密度、色调和变体。
- 默认、hover、active、focus-visible、disabled、loading、selected、indeterminate、error。
- 图标、纯文本、长中文、长英文、空值和溢出。
- 桌面宽度、移动宽度和必要的容器查询状态。
- 键盘操作、焦点顺序、语义标签和系统真实 `prefers-reduced-motion`；评审用动画冻结工具必须单独标识，不得冒充系统偏好。
- Token 名称、实际解析值、来源、使用次数和影响页面。
- 当前状态、候选处理和用户决策。

### 9.4 Fixture 规则

- 不调用真实生成接口、同步服务、在线助手或本地 Agent。
- 不依赖用户本地持久化数据才能渲染。
- 不从 feature raw store 读取状态。
- 使用最小、确定、可重复的 fixture。
- Modal、Drawer、Popover、Tooltip、Dropdown 等 Portal 组件必须覆盖真实打开和叠层状态。
- 动态时间、随机 ID、网络图片和异步状态需要稳定化或在视觉测试中明确遮罩。

## 10. 分阶段实施计划

| 阶段                       | 当前状态 | 核心产出                               | 用户审批门                           |
| -------------------------- | -------- | -------------------------------------- | ------------------------------------ |
| 0. 文档与范围冻结          | 已完成   | 长期方案、授权边界、文档入口           | 确认方案完整并允许后续逐阶段申请执行 |
| 1. 全量库存与当前基线      | 已完成   | 全量库存、使用关系、当前截图、风险清单 | 已于 2026-07-11 确认盘点覆盖和分类   |
| 2. 当前态 Design Lab       | 已完成   | 可检索的当前实现、状态和主题展示       | 确认展示足以支持决策                 |
| 3. Foundations 与 Token    | 进行中   | 3A 现状对比；后续候选 Token 与单向映射 | 先确认审计分组，再逐组批准 Token     |
| 4. Primitives 与低风险试点 | 未开始   | 基础组件及 Catalog 试点                | 批准组件规格并验收试点               |
| 5. Patterns 与工作台试点   | 未开始   | 高级组件及 Workbench 试点              | 批准高级模式并验收试点               |
| 6. 按 feature 分批迁移     | 未开始   | 各 feature 的受控迁移和批次验证        | 每批单独验收                         |
| 7. 清理、守门与新基线      | 未开始   | 旧体系清理、检查规则、目标基线         | 最终验收                             |

### 阶段 0：文档与范围冻结

状态：已完成。

目标：

- 将已确认方案写入长期文档。
- 明确这次认可的是工作流程，不是具体视觉规格的一次性授权。
- 在项目状态、产品约束、开放决策和文档地图中建立入口。

产出：

- 本文件。
- `AGENTS.md`、`README.md`、`docs/PROJECT_STATUS.md`、`docs/PRODUCT_CONSTRAINTS.md`、`docs/OPEN_DECISIONS.md`、`docs/REFACTORING_PLAN.md` 和 `docs/IMPLEMENTATION_PLAN.md` 的同步记录。

退出条件：

- 文档之间不存在范围、授权或状态冲突。
- 后续代理能够明确判断下一步只能进入阶段 1，而不能直接开始视觉替换。

### 阶段 1：全量库存与当前基线

状态：已于 2026-07-11 获用户确认并完成。开始、收口与确认日期：2026-07-11。

入口条件：

- 用户明确批准开始阶段 1。
- 本文件仍与当前项目结构一致；如已发生结构变化，先更新计划。
- 已关闭开放决策表中最晚关闭阶段为“阶段 1”的项目。

工作内容：

1. 静态扫描全部 UI 库 import、共享组件、原生控件、Token、CSS 变量、Tailwind arbitrary value、CSS 覆盖和 inline style。
2. 建立组件与页面/feature/route 的调用关系。
3. 识别隐藏分支、Portal、交互状态和响应式差异。
4. 运行当前应用，覆盖主要路由、弹窗、抽屉、工具栏、空/加载/错误状态和 Canvas 关键状态。
5. 在任何视觉修改前，按适用组合重新采集当前仓库的 Web/Electron、Light/Dark、桌面/移动基线；不要求没有产品意义的环境笛卡尔积，例如 Electron 移动视口。
6. 将每项分类为 Foundations、Primitives、Patterns、Feature Components、Domain Token、Content Effect 或未分类。

产出：

- docs/design-system/INVENTORY.md：完整库存、统计、使用关系、重复/例外/高风险和 Design Lab fixture 清单。
- docs/design-system/CURRENT_COLORS.json、CURRENT_CLASSES.json、CURRENT_LAYOUT_VALUES.json、CURRENT_VISUAL_VALUES.json：逐值、次数和源码位置的机器可读明细。
- scripts/audit-design-system-current-values.cjs：可按 colors/classes/layout/visual 分区重新扫描，并以 --check 验证明细仍与生产源码一致的只读审计器。
- docs/design-system/baselines/current/：59 张当前页面与关键组件基线，包含 Web、Chromium file mode 和真实 Electron。
- docs/design-system/baselines/current/capture-metadata.json：逐文件尺寸、SHA-256、Git revision 和运行环境。
- scripts/capture-design-system-current-baseline.mjs：带防误覆盖、隔离 profile 和网络阻断的复现脚本。
- 阶段 2 前必须由用户关闭的 DS-O2、DS-O3、DS-O4、DS-O14。

禁止事项：

- 不修改生产 Token、组件外观或页面视觉。
- 不在盘点时顺手合并或删除组件。
- 不把静态扫描结果直接当作最终设计决策。

用户审批门：

- 用户确认库存覆盖范围、分类方式和高风险项。

退出条件：

- 每个生产 UI 表面都能定位到库存项或明确的允许例外。
- 未分类项为零，或每个未分类项都有记录完整的阻塞原因。
- 当前基线可重复生成，并覆盖主要主题和视口。

### 阶段 2：当前态 Design Lab

状态：已于 2026-07-11 通过用户验收并完成。阶段 2 实施授权与验收日期：2026-07-11。

入口条件：

- 阶段 1 已通过用户审批。
- Design Lab 接入形式和是否进入生产构建已经确认。
- 已关闭开放决策表中最晚关闭阶段为“阶段 2”的项目。

工作内容：

1. 建立真实 provider 和主题上下文中的评审入口。
2. 本阶段只完成 Foundations/Primitives 当前态展示；Patterns/Feature Components 已在阶段 1 进入库存，但其当前态展示和评审明确留到阶段 5。
3. 建立主题、视口和交互状态控制；提供明确标为评审工具的 `motionFreeze`，并与系统真实 `prefers-reduced-motion` 分离展示和验证。
4. 显示来源、使用位置、实际解析值、影响范围和决策状态。
5. 对需要上下文的 Foundation/Primitive 使用确定 fixture；阶段 1 识别出的复杂 feature fixture 需求只记录方案，留到阶段 5 实现，不复制业务 store 或服务。

产出：

- 可访问的当前态 Design Lab。
- 与库存 ID 对应的展示锚点。
- Design Lab 的截图和基础交互测试。

当前实现结果：

- 独立 `design-lab.html` 控制入口与同源 `design-lab-preview.html` iframe 预览入口已经完成；正式构建不包含两者。
- 23 个 Foundations、17 个 Primitives 共 40 个稳定库存 ID 已全部进入搜索、筛选、稳定锚点和当前态展示，无未映射项。
- 目录筛选栏直接复用真实 Ant `Input`、`Select` 与 `Button` 及生产主题配置，不再使用原生 `select` 加展示专用近似 CSS。
- Foundations/Primitives 忠实度已逐项复核：当前态来自真实组件、实际 Token/computed value 或明确 source-linked fixture；`PRM-C05` 已补真实 W/H `SettingsDimensionInput` 与 `SettingsNumberInput`，`PRM-C06` 已补生产 Ant tags 模式并保留 Ant/Radix 各自真实箭头和基础 Portal 行为。
- 完整 `SettingsPanel`、质量快捷 pills、比例卡片、`ModelPicker`、Modal 及其他 Pattern/Feature Component 组合仍明确留到阶段 5，本阶段没有复制或提前实现。
- Light/Dark、真实 `1440×900` / `390×844` iframe viewport、独立 `motionFreeze` 评审工具、系统真实 `prefers-reduced-motion`、代表交互和失效 Tailwind computed result 已覆盖。
- 40 个库存 ID 已建立每项 Light/Dark 共 80 张逐项视觉基线；另保留 4 张整体/筛选场景，并补充 `PRM-C06` Ant tags/Radix Portal 打开、移动当前态和 `PRM-C12` Tooltip 移动打开 4 张针对性快照。
- 当前 Design Lab 测试矩阵为 47 个 Playwright 测试；screenshot diff、基础交互、axe 自动扫描、正式 bundle 排除和现有 Web/Electron 回归验证已纳入阶段收口。
- 详细架构、覆盖、验证、截图和当前问题见 `docs/design-system/PHASE_2_DESIGN_LAB.md`。

用户审批门：

- 用户确认当前态展示足以支持基础 Token 和基础组件决策。

退出条件：

- Foundations 和 Primitives 的当前实现、状态和主题可完整比较。
- 展示值来自真实 Token/组件或可追踪 fixture，不存在无法解释的展示专用样式。

### 阶段 3：Foundations 与 Token 目标体系

状态：进行中；当前仅执行 3A 现有样式对比审计。

2026-07-12 启动边界：

- 用户明确要求阶段 3 先审计现有样式，并把相似内容放在一起，便于直接比较和判断。
- Design Lab 默认以 10 个对比组并置 40 个 Foundations/Primitives 当前库存项，同时保留阶段 2 稳定库存顺序视图。
- 对比组只表示审计邻近关系，不产生目标 ID，也不推断 retain、merge、split、variant、domain-wrapper、exception 或 retire。
- DS-O1、DS-O6～DS-O10、DS-O13、DS-O15 仍开放，因此 3B 候选 Token 事实源、目标值和生产映射继续受阻；这些决策不阻塞 3A 只读审计。

3A 只读审计入口条件：

- 阶段 2 已通过用户审批。

3B 候选目标入口条件：

- Canonical Token Source、App/Canvas 共享层级和目标可访问性标准已经确认。
- 已关闭开放决策表中最晚关闭阶段为“阶段 3”的项目；目标视觉值在本阶段审批门逐项关闭。

工作内容：

1. 在 Design Lab 中建立 Reference、Semantic、Component 和 Domain Token 候选方案。
2. 覆盖颜色、排版、间距、尺寸、圆角、描边、投影、透明度、模糊、层级、图标和动效。
3. 显示 Light/Dark 的实际值、用途、对比度和受影响组件。
4. 为 CSS Variables、Tailwind、Ant Design ThemeConfig 和领域别名建立单向映射。
5. 区分品牌/语义 Token、领域 Token、内容效果和动态几何例外。
6. 在用户批准前保持当前实现与候选目标并存，不迁移生产页面。
7. 目标 Token 在试点完成前必须使用明确的目标命名空间、作用域或 adapter，不能通过直接覆盖当前全局值让未批准页面同步变化。
8. 为每个已批准 Token 目标 ID 建立旧 Token/裸值/消费位置的双向追踪；合并和拆分必须逐项列出来源。

用户审批门：

- 用户逐组批准 Token 名称、语义、Light/Dark 值和例外。

退出条件：

- 目标命名空间和候选 Token 体系的事实源与派生关系唯一、可检查；当前生产体系仍按迁移计划保留到其消费者归零。
- 候选 Token 可以覆盖已盘点的 Foundations，不能覆盖的项目均有批准的领域或内容例外。
- 候选目标不需要在多个目标事实源手工同步同一值；全仓旧事实源的删除和最终唯一化属于阶段 7 完成条件。

### 阶段 4：Primitives 与低风险页面试点

状态：未开始。

入口条件：

- 阶段 3 已通过用户审批。
- Primitive 的底层实现策略已经确认；不要求所有组件使用同一底层库，但必须提供一致的应用级契约。
- 已关闭开放决策表中最晚关闭阶段为“阶段 4”的项目。

工作内容：

1. 在 Design Lab 中建立 Button、IconButton、Input、Textarea、Select、Checkbox、Radio、Switch、Segmented、Slider、Tag、Tooltip 等候选组件。
2. 覆盖尺寸、变体、交互状态、键盘行为、语义和错误状态。
3. 依据组件决策规则确定合并、拆分、变体化或领域化。
4. 用户批准后实现 canonical primitive facade 和受控 variants。
5. 先在提示词库和素材库等低风险 Catalog 页面只迁移已批准的 Foundations/Primitives，观察其与现有卡片、筛选、搜索、分页、空状态和移动布局的组合效果；不得借试点提前决定阶段 5 的 Pattern 目标外观。
6. 在实现和试点前登记旧 Primitive → 新 Primitive/variant/domain wrapper 的关系及全部试点调用点。

用户审批门：

- 第一次审批：逐组批准 Primitive 规格和 API。
- 第二次审批：确认低风险试点页面的真实效果和交互。

退出条件：

- 已批准的 Primitive 在 Design Lab 和试点页面中表现一致。
- Light/Dark、桌面/移动、键盘、禁用、加载和错误状态通过验证。
- 试点没有引入有意的业务行为变化。

### 阶段 5：Patterns、高级组件与工作台试点

状态：未开始。

入口条件：

- 阶段 4 已通过两次用户审批。
- Foundations 和 Primitives 已证明可以支持真实页面组合。

工作内容：

1. 根据阶段 1 库存，在 Design Lab 中补齐 Patterns/Feature Components 的当前态展示、真实组合上下文和状态矩阵。
2. 用户确认当前态覆盖后，再建立 Field、Search/Filter、Surface、Card/List Item、Empty/Error/Loading 和 Pagination 候选目标。
3. 建立 Modal、Drawer、Popover、Menu、Tabs、Toolbar、Dock 和 Navigation 候选目标。
4. 验证 Portal、焦点管理、滚动锁定、叠层、逃逸键、点击外部和移动端行为。
5. 识别重复高级模式，例如图片/视频/音频设置 Popover 的稳定外壳与定位行为。
6. feature 保留领域 wrapper，只抽取跨 feature 稳定模式。
7. 先在 image/video workbench 及相关设置面板中试点。
8. 对 Canvas 只做必要的兼容性证明，不在本阶段进行主要 Canvas 迁移。
9. 在实现和试点前登记旧 Pattern/Feature Component → 新 Pattern/领域 wrapper 的关系及全部试点调用点。

用户审批门：

- 第一次审批：确认 Patterns/Feature Components 当前态展示覆盖完整。
- 第二次审批：逐组批准 Pattern 和高级组件目标规范。
- 第三次审批：确认工作台试点和复杂浮层行为。

退出条件：

- Patterns/Feature Components 的当前态、真实组合上下文和状态矩阵已经展示并获用户确认。
- 高级组件基于已批准 Foundations 和 Primitives 构建。
- 没有通过大量页面级覆盖才能达到目标效果。
- Portal、焦点、滚动、叠层和响应式行为通过验证。

### 阶段 6：按 feature 分批迁移

状态：未开始。

入口条件：

- 阶段 5 已通过三次用户审批。
- 库存、决策和迁移记录可以追踪每个调用方。
- 已关闭开放决策表中最晚关闭阶段为“阶段 6”的项目。

默认迁移顺序：

1. `prompts` 与 `assets` Catalog 表面。
2. `generation` image/video 页面和 audio settings 表面。
3. `settings`、App Shell 与公共导航；`/` 首页只允许迁移公共导航，`FC-HOME-01` 与 `FX-HOME-AURORA` 保持冻结。
4. `assistant` 与 `local-agent`。
5. `canvas` 库页面、普通浮层和工具栏。
6. Canvas 节点、连接、选择、媒体编辑和其他高风险交互。
7. 仍有 UI 表面的其他 feature 和跨平台入口。

每个迁移切片必须：

1. 声明组件/Token 范围、影响 feature、影响路由和明确非目标。
2. 从 `TRACEABILITY.md` 读取已批准映射，不得凭组件名称或外观相似度临时替换。
3. 只迁移已批准规范；遇到未批准状态立即记录并暂停该项。
4. 保持业务行为、数据契约和 feature 边界不变。
5. 更新库存、追踪关系、决策、迁移状态和相关项目文档。
6. 对账本批次的已迁移、剩余和例外调用数，禁止遗漏或重复归属。
7. 如涉及全局 Token 或首页消费的共享组件，证明 `/` 首页非导航区域在全部适用主题、视口和运行形态下保持视觉等值；必要时登记受控 variant、scoped alias 或批准例外。
8. 运行与风险相称的代码、交互、视觉和桌面验证。
9. 由用户查看代表截图或运行页面后确认再进入下一批。

迁移期间允许短期存在新旧实现，但必须记录所有临时 adapter、别名和调用方；不得把临时兼容层当作长期完成状态。

用户审批门：

- 每个 feature 或明确组件族迁移后单独验收。

退出条件：

- 所有生产 UI 调用方都已迁移到 canonical 组件、Token、领域别名或批准例外。
- 所有旧设计项和调用点都能正向定位目标，也能从目标反查来源；不存在 `pending`、重复归属或数量不守恒。
- Canvas 的功能、交互、缩放、拖拽、连接、选择和媒体编辑没有非预期回归。
- `/` 首页非导航内容没有有意或连带视觉变化；公共导航变化具有独立批准和验证证据。
- Web 与 Electron 共享 UI 表面保持一致。

### 阶段 7：清理、守门与新基线

状态：未开始。

入口条件：

- 阶段 6 全部迁移批次已通过用户审批。
- 不再存在未追踪的新旧混用。

工作内容：

1. 删除旧 Token、重复 CSS 变量、废弃组件、临时 adapter、无效别名和不再需要的覆盖。
2. 审计未使用代码、导出、样式、依赖和 fixture。
3. 建立检查规则，阻止重新引入未批准的裸色值、任意 shadow、非动态几何 inline style 和重复基础控件。
4. 为合理的原生文件输入、range、Canvas 几何和内容效果建立最小 allowlist。
5. 将批准后的 Design Lab 和真实页面截图建立为新的目标视觉基线。
6. 完成全量代码、视觉、交互、无障碍和桌面验证。
7. 收尾所有文档并归档历史基线。

用户审批门：

- 用户确认最终页面、目标基线、例外清单和遗留项。

退出条件：

- 旧实现没有有效调用方。
- 新旧双向追踪表与实际代码一致；每个已退役旧项的消费者归零，每个目标项均保留来源关系。
- 防回退规则已接入项目检查流程且不依赖大范围忽略。
- 全量验证通过，文档与实际代码一致。
- 正式完成定义中的全部条件满足。

## 11. 验证策略

### 11.1 代码验证

根据切片风险选择并记录：

- `npm run format:check`
- `npm run lint`
- `npm run check:boundaries`
- `npm run typecheck`
- `npm run test`
- `npm run knip`
- `npx knip --include exports`
- `npm run build`
- `npm run test:e2e`
- `npm run smoke:desktop-hash-routes`

文档阶段至少执行 Markdown 人工审阅、链接/路径核对和 `git diff --check`。仅修改文档时，不为制造通过记录而运行与改动无关的完整构建。

### 11.2 视觉验证

至少覆盖：

- Light/Dark。
- `1440×900` 桌面基准。
- `390×844` 移动关键路径。
- 组件状态矩阵和主要 Portal 打开状态。
- 真实页面代表截图。
- 长中文、长英文、空值、溢出和媒体加载失败。

Phase 1 的旧项目基线继续作为历史证据。本轮视觉优化开始前必须采集当前仓库的新“改前基线”；某组目标规范获批并迁移完成后，再建立对应“批准后基线”。不能用批准后的 redesign 与旧基线像素相同作为成功条件，只能用旧基线发现非目标区域的意外回归。

稳定场景应逐步从只调用 `page.screenshot()` 提升为 Playwright `toHaveScreenshot()` 或同等视觉差异断言。阈值、动态区域遮罩和平台差异必须有记录，不能通过过宽阈值隐藏问题。

### 11.3 交互与无障碍验证

根据组件适用性覆盖：

- Tab/Shift+Tab 焦点顺序和 focus-visible。
- Enter、Space、Escape、方向键和快捷键。
- Disabled、loading、error、selected 和 indeterminate 语义。
- Modal/Drawer/Popover 的焦点进入、返回、滚动锁定和关闭行为。
- 触控目标、移动端滚动和响应式布局。
- 200% 缩放、长文本和内容溢出。
- reduced-motion 下的必要降级。
- 文字、状态、边框和焦点的对比度报告。
- 主题选择的持久化、刷新/重启恢复，以及切换过程中的闪烁和过渡降级。
- Canvas 关键缩放倍率下的命中区域、拖拽、连接、渲染稳定性和必要性能抽查。

目标 WCAG 等级和支持浏览器范围尚未确认；在确认前不得声称达到特定合规等级。

### 11.4 桌面验证

涉及全局样式、路由、字体、静态资源、Portal 或响应式 shell 的切片，应验证 Electron `file://` hash route。涉及平台特有差异时，还应按 `docs/RELEASE_AND_DISTRIBUTION.md` 的目标平台要求选择必要验证。

## 12. 风险与缓解措施

| 风险                  | 表现                                           | 缓解措施                                                         |
| --------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Token 多事实源        | TS、CSS、Tailwind、Ant Theme 同值漂移          | 阶段 3 先确定 canonical source 和单向派生                        |
| 基础层脱离组合场景    | 高级组件阶段反复推翻字体、间距、层级           | 第一次全量盘点；基础层后立即进行代表页面试点                     |
| 一次性迁移            | 问题集中到最后，难定位和回退                   | 按组件族和 feature 切片，每批独立验收                            |
| 过度抽象              | 大量布尔 props、共享组件承载业务语义           | 使用组件决策规则，feature 保留领域 wrapper                       |
| Canvas 被错误扁平化   | 普通页面规格破坏缩放、拖拽和节点可读性         | 保留 Domain Token，Canvas 最后迁移                               |
| 第三方组件行为回归    | Select、Modal、Drawer 的键盘或 Portal 行为改变 | 先统一应用级契约，再决定底层实现，补交互测试                     |
| 新旧视觉长期混用      | 页面看起来不一致，临时 adapter 永久存在        | 迁移状态表记录调用方和删除期限，阶段 7 统一清理                  |
| Design Lab 与产品漂移 | 展示页正确、真实页面错误                       | 使用真实 providers、真实 Token 和 actual component；安排页面试点 |
| 视觉测试不稳定        | 动态内容导致频繁误报                           | 使用确定 fixture、遮罩明确动态区域、冻结时间和随机值             |
| Light/Dark 或移动遗漏 | 单一截图通过但其他环境回归                     | 每个审批门使用固定主题/视口矩阵                                  |
| 无障碍被视觉优化覆盖  | 焦点、对比度或键盘行为退化                     | 将状态和键盘验证列为组件退出条件                                 |
| 文档与实现脱节        | 后续代理重复判断或误解授权                     | 每个切片同步库存、决策、迁移和项目状态文档                       |

## 13. 回退与变更控制

- 每个实现切片保持范围单一、可独立验证和可独立回退。
- 未批准的候选样式只能存在于 Design Lab，不得进入生产调用路径。
- 迁移生产页面时，优先通过 canonical component API 或短期 adapter 控制切换范围，不进行无法审查的全仓机械替换。
- 临时 adapter、Token alias 和 allowlist 必须记录创建原因、调用方和删除阶段。
- 不为本轮重构默认引入永久运行时旧/新主题开关；如确有灰度需求，必须另行确认产品和持久化行为。
- 某批迁移失败时，回退该批实现和相关目标基线，不回退已独立验收的其他批次。
- 回退不得删除用户数据、修改数据格式或改变禁用 feature 时的数据保留语义。

## 14. 文档维护

### 14.1 当前权威关系

- 本文件：新设计系统与视觉优化的范围、阶段、门槛和完成定义。
- `AGENTS.md`：项目级执行规则、目录边界和验证要求。
- `docs/PRODUCT_CONSTRAINTS.md`：视觉授权边界和长期产品约束。
- `docs/OPEN_DECISIONS.md`：已确认决策和仍需用户确认的事项。
- `docs/PROJECT_STATUS.md`：当前阶段和整体项目状态。
- Phase 5/6 文档：历史等值抽取和样式收敛事实。

如本文件与 `AGENTS.md`、产品约束或用户最新明确指示冲突，应先停止实施并同步文档，不得自行选择其中一份继续。

### 14.2 每个阶段必须更新的内容

- 当前阶段状态和日期。
- 本阶段实际范围、非目标和用户审批记录。
- 新增或关闭的开放决策。
- 库存、决策和迁移状态。
- 运行的验证、结果、截图位置和已知差异。
- 新增 canonical 组件、Token、领域别名和允许例外。
- 临时 adapter、alias、allowlist 和预计删除阶段。
- 下一阶段入口条件是否满足。

### 14.3 历史记录

- 不改写 Phase 5/6 的历史授权和验证结果。
- 当前态基线、候选目标和批准后基线必须使用不同目录或清晰元数据区分。
- 被废弃的 Token 或组件应在迁移记录中保留原因和替代项，不从历史决策记录中无痕删除。

## 15. 已确认决策与开放决策

### 15.1 已确认

- 先完整文档化，再逐阶段实施。
- 第一次盘点覆盖全部层级，评审按基础层和高级层分开进行。
- 当前态库存和基线先于视觉修改。
- Design Lab 区分当前实现和候选目标。
- 具体视觉规格由用户逐项批准。
- Foundations/Primitives 后先做低风险真实页面试点。
- Patterns/高级组件后再做工作台等复杂页面试点。
- 最终按 feature 分批迁移，Canvas 后置。
- 不进行一次性全站替换。
- 文档维护、验证和用户审批是每个阶段完成条件的一部分。
- Design Lab 使用共享真实 App Provider 的独立 Vite entry，不注册为产品 route 或 feature。
- Design Lab 完全排除在正式 Web/Electron 构建、产品导航和生产 bundle 之外，只提供独立开发与测试入口。
- 本轮继续使用项目原生 React/Vite Design Lab，不引入 Storybook；如后续需要变更工具路线，必须重新确认。
- Design Lab 使用 Playwright screenshot diff、基础交互测试和 `@axe-core/playwright` 自动扫描。阶段 2 的现有问题只记录为当前态证据，不修改生产视觉、不声明 WCAG 合规；全局阈值和合规目标留待 DS-O13。
- “可检索”要求提供真实搜索与筛选 UI，至少支持按库存 ID、名称、层级、来源和状态定位，并支持稳定锚点跳转。
- `/` 首页在 Light/Dark、Web 桌面/移动和 Electron 桌面下冻结非导航视觉；`PAT-C14`/`FC-APP-01` 公共导航仍可按正常审批流程修改。详细边界见 `docs/design-system/HOMEPAGE_VISUAL_FREEZE.md`。

### 15.2 决策清单与最晚关闭阶段

本表是设计系统阶段决策的唯一详细清单，同时保留开放和已关闭项目的稳定 ID。`docs/OPEN_DECISIONS.md` 只记录本决策组的整体状态和指向本表，避免两份项目清单发生漂移。

“最晚关闭阶段”表示进入该阶段相关工作前必须完成并记录决策；未关闭时只阻塞表中列出的工作，不自动阻塞无关的只读审计。

| ID     | 状态   | 开放决策                                                                                                                                                                         | 最晚关闭阶段      | 阻塞范围                                                                     |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| DS-O1  | 开放   | 除已冻结的 `/` 首页非导航内容外，在其余产品表面中，有意视觉变化覆盖全部还是只优先调整不一致和高频表面；未获视觉调整批准的表面保持视觉等值，但仍需映射到 canonical 方案或批准例外 | 阶段 3            | 目标视觉变化范围、Token/组件优先级；首页冻结规则已确认，但不关闭其余范围决策 |
| DS-O2  | 已确认 | Design Lab 使用共享真实 App Provider 的独立 Vite entry，不注册为产品 route 或 feature                                                                                            | 阶段 2            | 已关闭；用户于 2026-07-11 确认                                               |
| DS-O3  | 已确认 | Design Lab 完全排除在正式 Web/Electron 构建、产品导航和生产 bundle 之外，使用独立开发与测试命令                                                                                  | 阶段 2            | 已关闭；用户于 2026-07-11 确认                                               |
| DS-O4  | 已确认 | 本轮继续使用项目原生 React/Vite Design Lab，不引入 Storybook；后续如需改变工具路线重新确认                                                                                       | 阶段 2            | 已关闭；用户于 2026-07-11 确认                                               |
| DS-O5  | 已确认 | 改前基线提交到 `docs/design-system/baselines/current/`；批准后基线提交到 `docs/design-system/baselines/approved/<batch-id>/`；临时测试输出继续使用被忽略的 `test-results/`       | 阶段 1            | 已关闭；用户于 2026-07-11 确认                                               |
| DS-O6  | 开放   | Canonical Token Source 使用 TypeScript manifest、生成 CSS 或其他形式                                                                                                             | 阶段 3            | Token 类型、生成、单向映射和构建校验                                         |
| DS-O7  | 开放   | App 与 Canvas 共享到 Reference、部分 Semantic 还是更多层级                                                                                                                       | 阶段 3            | App/Canvas Token 架构和领域别名                                              |
| DS-O8  | 开放   | 主题维持 Light/Dark，还是增加 system/high-contrast 等模式                                                                                                                        | 阶段 3            | 主题模型、Token 矩阵、持久化和验证范围                                       |
| DS-O9  | 开放   | 目标字体、授权和 Web/Electron 打包方式                                                                                                                                           | 阶段 3            | Typography Token、跨平台排版和静态资源                                       |
| DS-O10 | 开放   | 品牌色、字号、密度、间距、圆角、投影和动效的目标尺度                                                                                                                             | 阶段 3 用户审批门 | Foundations 目标值和后续组件规格                                             |
| DS-O11 | 开放   | 图标系统、标准尺寸和允许的例外                                                                                                                                                   | 阶段 4            | Primitive API、对齐和触控尺寸                                                |
| DS-O12 | 开放   | 是否保留 Ant Design、Tailwind、Radix 的组合，以及允许直接消费的控件                                                                                                              | 阶段 4            | Primitive 底层实现、facade 和边界规则                                        |
| DS-O13 | 开放   | 目标 WCAG 等级、浏览器范围、200% 缩放覆盖和视觉回归阈值                                                                                                                          | 阶段 3            | Token/组件验收标准和视觉测试配置                                             |
| DS-O14 | 已确认 | 使用 Playwright screenshot diff、基础交互测试和 `@axe-core/playwright` 自动扫描；阶段 2 记录当前问题但不声明合规，全局阈值留待 DS-O13                                            | 阶段 2            | 已关闭；用户于 2026-07-11 确认                                               |
| DS-O15 | 开放   | 临时 Token alias、组件 adapter 和 allowlist 的最长保留周期                                                                                                                       | 阶段 3            | 并行迁移、回退和阶段 7 清理标准                                              |
| DS-O16 | 开放   | 默认 feature 迁移顺序是否需要调整                                                                                                                                                | 阶段 6            | 批次依赖、优先级和用户验收顺序                                               |
| DS-O17 | 开放   | 最终迁移对应的版本号和发布节奏                                                                                                                                                   | 首次发布前        | 打包、版本和发布；不阻塞设计系统本地实施                                     |

关闭任一项目时，必须在本表更新状态或将结果写入 15.1 已确认决策，并在 `docs/OPEN_DECISIONS.md` 更新决策组整体状态。

## 16. 完成定义

只有同时满足以下条件，本轮设计系统与视觉优化重构才可标记完成：

- 全部生产 UI、Token 和内容效果已经进入库存或批准例外。
- Reference、Semantic、Component 和 Domain Token 的事实源与消费关系清晰且可检查。
- 用户已经批准所有进入生产的目标 Token、组件和页面视觉。
- Foundations、Primitives、Patterns 和 Feature Components 的边界与实际代码一致。
- 所有生产调用方已经迁移到 canonical 组件、领域 wrapper 或批准例外。
- 旧 Token、重复变量、废弃组件、临时 adapter 和无效覆盖已经清理。
- 防回退规则已接入项目检查流程，合理例外有最小 allowlist 和原因。
- Light/Dark、桌面/移动、Web/Electron 和关键交互验证完成。
- Canvas 高风险交互没有非预期功能回归。
- 当前态历史基线和批准后的新目标基线均可追溯。
- `AGENTS.md`、项目状态、产品约束、开放决策、库存、决策和迁移文档全部与代码一致。
- 没有被错误标记为完成的阻塞项、未审批项或未验证调用方。

## 17. 记录模板

### 17.1 Token 决策记录

```text
ID：
层级：Reference | Semantic | Component | Domain | Content Effect
当前名称和值：
定义位置与消费位置：
Light/Dark 与平台差异：
重复、别名或冲突：
候选名称和值：
处理：保留 | 合并 | 拆分 | 领域化 | 例外 | 废弃 | 待确认
影响组件与页面：
用户决策、日期和理由：
实施阶段与迁移批次：
验证证据：
```

### 17.2 组件决策记录

```text
ID：
分类：Primitive | Pattern | Feature Component
当前实现、底层库和源码位置：
调用 feature、页面和次数：
当前 variants、sizes 和状态：
主题、响应式、键盘和无障碍行为：
依赖 Token 与硬编码：
候选处理及理由：
目标 API、variants 和领域边界：
允许例外：
用户决策、日期和截图：
实施阶段、迁移批次和回退单位：
验证证据：
```

### 17.3 迁移批次记录

```text
批次 ID：
范围与明确非目标：
已批准 Token/组件决策：
影响 feature、路由和调用方：
临时 adapter、alias 或 allowlist：
改前基线：
执行验证与结果：
已知差异、风险和遗留项：
用户验收、日期和证据：
旧实现剩余消费者：
回退方式：
下一批入口条件：
```

### 17.4 新旧追踪记录

```text
关系 ID：
旧库存 ID：
旧实现、feature、文件与所属符号：
旧调用特征与当前调用数：
目标 ID：
目标类型：Token | Primitive | Pattern | Feature Component | Domain Wrapper | Exception
关系：retain | merge | split | variant | domain-wrapper | exception | retire
目标 API、variant 或语义 Token：
用户决策与日期：
迁移批次：
状态：pending | approved | implemented | migrated | verified | retired
已迁移 / 剩余 / 例外调用数：
验证证据：
反向来源索引：
```

### 17.5 例外记录

```text
例外 ID：
值或组件：
作用域和用途：
不能使用 canonical 方案的原因：
是否为动态几何、内容效果或领域语义：
允许的调用方：
审批人和日期：
复核或删除条件：
验证要求：
```

## 18. 下一步

阶段 1 的库存覆盖、分层、风险、59 张改前基线和新旧双向追踪规则已由用户于 2026-07-11 确认。该确认不批准任何目标视觉规格、组件合并或生产替换。

阶段 2 的独立、开发专用当前态 Design Lab 已完成实现、忠实度修复与验证，并于 2026-07-11 通过用户验收，详细结果见 `docs/design-system/PHASE_2_DESIGN_LAB.md`。用户已于 2026-07-12 批准开始阶段 3；当前执行 3A 现有样式对比审计，详细记录见 `docs/design-system/PHASE_3_CURRENT_STYLE_AUDIT.md`。在阶段 3 开放决策逐项关闭前，仍不得创建获批目标 Token、修改生产组件或实施生产视觉变化。

阶段 2 不创建目标视觉规格，不迁移或修改生产组件、Token 和页面视觉。本阶段审批即使通过，也不自动关闭阶段 3 的开放决策或批准任何目标值。

## 19. 变更记录

- 2026-07-11：创建本计划；用户确认先完整文档化，再按“全量盘点、分层评审、基础系统、代表页面试点、高级组件、按 feature 迁移、清理守门”的顺序逐步实施。
- 2026-07-11：用户批准进入阶段 1，并确认 DS-O5 基线长期存放方案；阶段 1 状态更新为进行中。
- 2026-07-11：阶段 1 静态库存与运行时基线收口；记录 70 个生产 TSX、全部公开路由、Token/CSS/组件来源、逐值机器清单、重复与风险，采集 59 张 Web/file/真实 Electron 基线；状态更新为待用户确认。
- 2026-07-11：根据用户补充要求建立新旧设计项双向追踪规则；后续替换必须通过稳定 ID、调用点和迁移批次对账，不得按外观相似度临时替换。
- 2026-07-11：用户确认阶段 1 可以按当前产出继续；库存覆盖、分层、风险、59 张改前基线和新旧双向追踪规则获得确认，阶段 1 完成。该确认不授权具体目标视觉规格或生产替换。
- 2026-07-11：用户确认当前 `/` 首页非导航内容在 Light/Dark、Web 桌面/移动和 Electron 桌面下均不做有意视觉修改；公共导航仍可修改。新增长期参考图、追踪例外和迁移守门规则。
- 2026-07-11：用户确认按推荐方案关闭 DS-O2、DS-O3、DS-O4、DS-O14，并批准开始阶段 2；Design Lab 采用独立 Vite entry、排除正式构建、继续使用原生 React/Vite 工具链，并加入 Playwright screenshot diff、基础交互和 axe 自动扫描。
- 2026-07-11：阶段 2 当前态 Design Lab 首轮实现完成；40 个 Foundations/Primitives 稳定 ID、搜索筛选、锚点、主题和真实桌面/移动 iframe viewport 已覆盖，状态更新为待用户确认。
- 2026-07-11：用户复核发现目录筛选栏原生 `select` 的箭头与生产 Ant Select 不一致；筛选交互已全部改为真实 Ant 组件，补充组件真实性与下拉交互断言。
- 2026-07-11：用户继续指出 W/H/设置数字输入、快捷选择和 Select 箭头差异。阶段 2 忠实度复核已补真实 `SettingsDimensionInput`、`SettingsNumberInput`、生产 Ant tags 模式及 Ant/Radix 基础 Portal，并将完整 `SettingsPanel`、质量快捷 pills、比例卡、`ModelPicker`、Modal 等组合明确保留到阶段 5。
- 2026-07-11：`motionFreeze` 已明确为评审冻结工具，并与系统真实 `prefers-reduced-motion` 分离；40 个库存 ID 已建立每项 Light/Dark 共 80 张逐项视觉基线，另有 8 张整体/筛选/Portal/移动场景快照，Design Lab 测试矩阵扩展为 47 个 Playwright 测试。阶段 2 忠实度修复期间未修改生产视觉或冻结改前基线。
- 2026-07-11：用户明确确认阶段 2 验收通过，阶段 2 完成；用户同时要求阶段 3 等待后续同意后再开始。该确认不关闭阶段 3 的开放决策，也不批准目标 Token、目标组件或生产视觉实施。
- 2026-07-12：用户明确批准开始阶段 3，并要求先对现有样式进行审计、把相似内容放在一起以便比较判断。阶段 3 先启动 3A 只读对比审计；目标 Token、目标值、目标关系和生产视觉仍须后续逐项批准。
