# AGENTS.md

## 项目状态

本仓库是用户既有网页端无限画布项目的全新重构/重建工作区。

旧项目位置：

- `/Users/simplemin/Desktop/CodeX/IC/`

旧项目中的历史 `AGENTS.md` 和项目约束不继承。本仓库只遵守本文件和用户在当前重构项目中确认过的规则。

当前阶段：**Phase 7 桌面端未签名本地分发包配置与三平台构建验证已完成；正式签名、公证和发布元数据待确认**。

## 已确认项目目标

- 将既有项目重构为更简单、更清晰、更易维护的架构。
- 解耦功能模块，降低功能之间的直接依赖。
- 当前阶段需要支持构建时删除功能模块。
- 后续阶段需要保留运行期间开启/禁用功能的架构可能性。
- 收敛设计样式、设计 Token 和可复用设计组件。
- 建立可复用组件，支持后续快速迭代和功能复用。
- 初始重构阶段不得改变既有功能，除非用户明确批准。
- 初始重构和等值 Token/组件抽取阶段必须保持现有视觉效果一致。
- 本仓库作为全新项目处理，不需要保留旧项目 git 历史。
- 后续需要支持桌面端分发。
- 桌面端目标平台为 Windows x64、macOS Intel 和 macOS Apple Silicon。

## 当前阶段非目标

- 不进行未经批准的视觉 redesign。
- 不承诺兼容旧项目已有数据、文件格式、本地缓存或历史项目数据。
- 不进行正式签名、公证、自动更新或商店发布配置。
- 不应用或复制旧项目历史 agent 约束。
- 不迁移旧文档站或 Codex app 插件为首轮应用功能。

## Phase 状态

- 静态只读审计结果已记录在 `docs/SOURCE_AUDIT_REPORT.md`。
- 运行时视觉基线已记录在 `docs/VISUAL_BASELINE.md`。
- Phase 2 目标架构决策已记录在 `docs/TARGET_ARCHITECTURE_DECISIONS.md`。
- Phase 3 项目骨架已记录在 `docs/PHASE_3_SCAFFOLD.md`。
- Phase 4 逐功能迁移已记录在 `docs/PHASE_4_MIGRATION.md`。
- Phase 5 设计 Token 与组件抽取已记录在 `docs/PHASE_5_DESIGN_TOKENS.md`。
- Phase 6 设计样式收敛、等值组件/Token 追加收敛、上线前清理与提示词数据源本地化已记录在 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。
- Phase 7 桌面端打包配置、三平台构建验证与正式发布待确认项已记录在 `docs/PHASE_7_DESKTOP_PACKAGING.md`。
- 用户已确认因上线优先，Phase 5 记录中的遗留项暂缓，不作为当前 Phase 6 上线前清理阻塞项。
- 用户已批准并完成 Phase 6 上线前清理，范围覆盖 hook/Fast Refresh warning、bundle size/ineffective dynamic import、旧来源命名、未使用函数、未使用资源、无效分支、过期注释、废弃样式和历史兼容 fallback 清理。
- 用户已批准并完成 Phase 7 桌面端未签名本地分发包配置，范围覆盖 Windows x64、macOS Intel 和 macOS Apple Silicon 构建产物。
- 当前无阻塞本地客户端打包的开放架构决策；正式签名、公证、应用图标、发布者信息和自动更新属于正式发布前待确认项。

## 文档地图

- `README.md`：项目入口和当前状态说明。
- `docs/REFACTORING_PLAN.md`：分阶段重构计划和验收标准。
- `docs/SOURCE_AUDIT_PROTOCOL.md`：旧项目只读审计规则。
- `docs/SOURCE_AUDIT_REPORT.md`：Phase 1 旧项目静态只读审计报告。
- `docs/VISUAL_BASELINE.md`：Phase 1 运行时视觉基线索引和采集说明。
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`：Phase 2 已确认目标架构决策。
- `docs/PHASE_3_SCAFFOLD.md`：Phase 3 项目骨架、脚本和验证结果。
- `docs/PHASE_4_MIGRATION.md`：Phase 4 逐功能迁移范围、验证结果和遗留项。
- `docs/PHASE_5_DESIGN_TOKENS.md`：Phase 5 设计 Token 与组件抽取范围、验证结果和遗留项。
- `docs/PHASE_6_DESIGN_CONVERGENCE.md`：Phase 6 设计样式收敛、上线前清理范围、验证结果和遗留项。
- `docs/PHASE_7_DESKTOP_PACKAGING.md`：Phase 7 桌面端打包配置、验证结果和正式发布待确认项。
- `docs/IMPLEMENTATION_PLAN.md`：Phase 3 与后续迁移切片计划。
- `docs/OPEN_DECISIONS.md`：实施前必须关闭或持续跟踪的开放决策。

## 工作规则

- 多步骤任务必须先制定执行计划。
- 始终聚焦用户明确提出的需求。
- 优先选择简单、稳健、可维护的方案。
- 目标仓库使用 npm 作为包管理器，依赖安装和项目脚本默认使用 npm。
- 文档阶段不得执行代码层工作。
- 缺失、模糊或冲突的项目文档视为阻塞项。
- 不得在未确认的情况下推断项目规则、业务需求、架构决策、工作流约定或文档结构。
- 只记录用户确认、本地验证或明确标注为开放决策的信息。
- 项目级变更完成前必须同步更新相关文档。
- 项目文档默认使用中文。

## 设计组件约定

- 网站内用于条目多选或多项配置选择的 checkbox 统一使用 `src/shared/ui/app-multi-select-checkbox.tsx` 的 `AppMultiSelectCheckbox`，canonical 规格为 16px 方形、5px 圆角，并消费应用语义 Token。
- 除共享组件内部可保留原生 `type="checkbox"` 输入外，页面侧不得为多选场景直接使用 Ant Design `Checkbox`、原生 checkbox 或重复手写 checkbox 样式。

## 数据源约定

- 提示词库运行时数据库使用本地静态数据 `public/data/local-prompts.json`。
- 不得在未确认的情况下重新引入运行时外部提示词数据库抓取；外部来源数据如需更新，应先离线验证可访问性，移除 404 来源后再写入本地提示词数据文件。

## 桌面打包约定

- 桌面端打包使用 Electron Builder，配置入口为 `electron-builder.config.cjs`。
- 正式应用名为 `Infinite Canvas`，appId / bundle identifier 为 `com.zuco.infinitecanvas`，桌面图标来源为 `public/zuco-brand.png` 生成的 `build-resources/icon.icns`、`build-resources/icon.ico` 和 `build-resources/icon.png`。
- 桌面包输出目录为 `release/`，中间资源目录为 `build/desktop-codex/`，二者不得提交。
- 任何会生成桌面分发产物的默认打包入口都必须自动递增应用版本号；无特殊说明时执行 patch 递增，例如 `0.1.0` 的下一次正式打包版本为 `0.1.1`。
- 桌面版本号递增由 `scripts/bump-desktop-version.cjs` 统一执行，并同步更新 `package.json` 和 `package-lock.json`；可通过 `DESKTOP_VERSION_BUMP=minor|major` 指定递增级别，或通过 `DESKTOP_VERSION=x.y.z` 指定版本。
- 只有在用户明确说明不更新版本号时，才允许使用 `SKIP_VERSION_BUMP=1` 或 `DESKTOP_VERSION_BUMP=none` 跳过自动递增。
- macOS 与 Windows 需要作为同一批版本同时出包时，必须使用 `npm run dist:desktop:all`，确保只递增一次版本号后生成多平台产物；不得连续单独执行 `dist:desktop:mac` 和 `dist:desktop:win` 造成同一批产物版本不一致。
- `npm run dist:desktop:dir` 仅用于本地目录包烟测，不视为正式分发出包，默认不递增版本号。
- 打包前必须通过 `scripts/prepare-desktop-codex.cjs` 准备 Codex CLI 资源；npm 打包脚本已自动串联该步骤。
- 桌面端 renderer 通过 `file://` 加载生产产物，Vite 生产构建必须保持相对资源 base；页面侧引用 `public/` 静态资源时应使用 `src/lib/public-assets.ts` 的 `publicAssetPath()`，不得直接写根路径 `/...`。
- 桌面端 `file://` 环境必须使用 hash 路由（例如 `index.html#/canvas`），不得依赖 `history.pushState('/canvas')` 形式的根路径导航；Windows 会将 `/canvas` 解析为盘符根路径并导致入口点击无响应。
- 应用内路由入口必须通过共享路由层统一处理：普通文本链接使用 `next/link` shim，Ant Design 按钮式路由入口使用 `src/shared/router/route-button.tsx` 的 `RouteButton`，程序化跳转使用 `next/navigation` shim；不得在页面侧直接给 Ant Design `Button` 写 `href` 或给原生 `a` 写根路径 `href="/..."`，ESLint 已自动拦截这些写法。
- 当前桌面产物为未签名本地分发包，且暂不启用自动更新；不得在未确认正式证书、发布者和真机验收前声称已完成正式发布配置。

## 重构约束

- 在用户批准变更前，既有功能必须保持等效。
- 在用户批准视觉调整前，既有视觉输出必须保持一致。
- 设计 Token 和可复用组件初期只能做等值抽取，不得借机调整视觉。
- 功能解耦初期必须支持构建时包含/排除功能模块。
- 早期架构不得阻断后续运行时功能开关能力。
- 旧项目如存在已知或审计中发现的问题，先记录为后续修复项；除非用户明确批准，不在行为等效重构阶段修复。
- 不需要兼容旧项目已有数据、文件格式、本地缓存或历史项目数据，除非用户后续重新提出。
- 重构完成前必须进行清理：移除旧来源命名、未使用函数、未使用资源、无效分支、过期注释、废弃样式和历史兼容 fallback。

## 实施门槛

进入后续正式发布配置前必须满足：

- 源项目审计已完成。
- 目标架构已记录成文档。
- `docs/OPEN_DECISIONS.md` 中阻塞实施的开放决策已关闭。
- Phase 3 项目骨架已完成并验证。
- Phase 4 逐功能迁移已完成并验证。
- Phase 5 设计 Token 与组件抽取已完成并验证。
- Phase 6 设计样式收敛与等值组件/Token 追加收敛切片已完成并验证。
- Phase 7 桌面端未签名本地分发包配置已完成并验证。
- 用户明确批准具体阶段范围；正式签名、公证、自动更新和商店发布尚未获批准。

## 验证预期

后续进入实现阶段后，每个迁移功能都应根据风险定义验证步骤，包括：

- 行为等效检查。
- 视觉一致性检查。
- 构建检查。
- 未使用代码和资源检查。
- 文档一致性检查。
