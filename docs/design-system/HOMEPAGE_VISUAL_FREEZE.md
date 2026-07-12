# 首页视觉冻结规则

状态：用户已于 2026-07-11 确认，立即生效。

## 1. 决策

用户明确满意当前 `/` 首页。本轮设计系统与视觉优化不得对首页非导航内容产生有意视觉修改。

该规则适用于所有有产品意义的组合：

- Light / Dark。
- Web 桌面 / Web 移动。
- Electron 桌面。Electron 没有产品意义上的移动视口，因此不制造 Electron Mobile 组合。

## 2. 冻结范围

以下内容以当前渲染效果为准，不参与本轮 redesign：

- `FC-HOME-01`：`HomePage`、Hero、标题、说明文案、操作区、提示词展示区和图片预览入口。
- `FX-HOME-AURORA`：`ai-title-aurora`、Highlighter 及首页专属内容效果。
- 首页主体的布局、间距、排版、颜色、背景点阵、边框、圆角、动效、响应式关系和内容层级。
- 首页主体中对共享 Token、Button、Link、Tag、Image 等实现的消费结果。

“共享组件或 Token 后续统一”不能自动覆盖本规则。如果 canonical Token 或组件会改变首页主体的实际输出，必须为首页调用点登记 `retain`、受控 variant、scoped alias 或 `EX-HOME-VISUAL-FREEZE` 例外，使首页保持当前效果；不得复制一套无法追踪的散落样式。

## 3. 允许修改的导航范围

公共导航仍属于本轮设计系统范围，可以在对应阶段经用户批准后修改：

- `PAT-C14` Navigation。
- `FC-APP-01` 中的 `AppTopNav`、`MobileNavDrawer` 及导航区域。
- 导航区域内用于全局状态和设置入口的公共操作。

导航允许修改不代表已经批准任何具体新样式；仍需经过 Design Lab、目标规格、追踪关系和迁移批次审批。首页主体与导航的边界以 `UserLayout → AppTopNav + HomePage` 的代码组合为准。

## 4. 不属于导航例外的内容

- 首页 Hero 和标题效果。
- “开始使用”“打开画布”等首页主体操作区的当前视觉。
- 提示词展示区、卡片排布、媒体遮罩和预览入口。
- 首页主体在 Light/Dark、桌面/移动、Web/Electron 下的适配效果。

这些内容即使使用共享 Primitive，也只允许内部等值重构，不允许因全局迁移产生有意视觉变化。

## 5. 参考证据

用户提供的明确参考图：

- `references/homepage-current-electron-desktop-dark-2026-07-11.png`
- 尺寸：2560 × 1600，包含 Electron 窗口框架。
- SHA-256：`53d06a2c334d2bad74045ef5ec3274619d16a3496ba19dc9da97d17ee4e4bc2a`

冻结的改前基线还包含：

- `baselines/current/web/desktop-dark/01-home.png`
- `baselines/current/web/desktop-light/01-home.png`
- `baselines/current/web/mobile-dark/01-home.png`
- `baselines/current/web/mobile-light/01-home.png`
- `baselines/current/electron-file/desktop-dark/01-home.png`
- `baselines/current/electron/desktop-dark/01-home.png`

当前缺少 Electron Light 的独立首页截图。它必须在任何可能影响首页渲染的阶段 3 生产改动前补为附加保护参考；不得重写已经冻结的 `baselines/current/`。

## 6. 后续迁移守门

任何涉及 App Token、全局 CSS、Ant Theme、Typography、Button、Link、Tag、Image、Surface、Motion 或响应式规则的目标方案，都必须检查 `/` 首页非导航区域：

1. 在 `TRACEABILITY.md` 中标记受影响的首页调用点。
2. 说明为何不会改变首页，或采用何种受控兼容方案保持等值。
3. 对适用主题、视口和运行形态执行截图对比。
4. 导航变化单独裁定，不能用导航获批结果顺带修改首页主体。

首页主体出现未经单独批准的视觉差异时，对应迁移批次不得通过。
