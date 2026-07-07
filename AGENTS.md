# AGENTS.md

## 项目状态

本仓库是用户既有网页端无限画布项目的全新重构/重建工作区。

旧项目位置：

- `/Users/simplemin/Desktop/CodeX/IC/`

旧项目中的历史 `AGENTS.md` 和项目约束不继承。本仓库只遵守本文件和用户在当前重构项目中确认过的规则。

当前阶段：**Phase 8 模块化架构与功能复用重构已完成；阶段 7 完整验证与收尾已完成**。

## 已确认项目目标

- 将既有项目重构为更简单、更清晰、更易维护的架构。
- 解耦功能模块，降低功能之间的直接依赖。
- 当前阶段需要支持构建时删除功能模块。
- 后续阶段需要保留运行期间开启/禁用功能的架构可能性。
- 收敛设计样式、设计 Token 和可复用设计组件。
- 建立可复用组件，支持后续快速迭代和功能复用。
- 在代码层实现功能热插拔，方便快速接入新功能，也方便删除已有功能。
- Phase 8 允许大规模移动文件、重组目录、重写状态层和 repository，以获得长期更优的模块化结果。
- 初始重构阶段不得改变既有功能，除非用户明确批准。
- 初始重构和等值 Token/组件抽取阶段必须保持现有视觉效果一致。
- Phase 8 模块化重构阶段必须保持功能行为和视觉输出不变。
- 本仓库作为全新项目处理，不需要保留旧项目 git 历史。
- Phase 8 不需要兼容旧项目数据，也不需要兼容本仓库当前本地持久化数据。
- 后续需要支持桌面端分发。
- 桌面端目标平台为 Windows x64、macOS Intel 和 macOS Apple Silicon。

## 当前阶段非目标

- 不进行未经批准的视觉 redesign。
- 不承诺兼容旧项目已有数据、文件格式、本地缓存或历史项目数据。
- 不进行正式签名、公证、自动更新或商店发布配置。
- 不应用或复制旧项目历史 agent 约束。
- 不迁移旧文档站或 Codex app 插件为首轮应用功能。
- Phase 8 不实现第三方插件市场、动态外部插件加载、插件权限沙箱、插件签名或运行时开关 UI。
- Phase 8 不实现已打开页面中的动态卸载能力。

## Phase 状态

- 静态只读审计结果已记录在 `docs/SOURCE_AUDIT_REPORT.md`。
- 运行时视觉基线已记录在 `docs/VISUAL_BASELINE.md`。
- Phase 2 目标架构决策已记录在 `docs/TARGET_ARCHITECTURE_DECISIONS.md`。
- Phase 3 项目骨架已记录在 `docs/PHASE_3_SCAFFOLD.md`。
- Phase 4 逐功能迁移已记录在 `docs/PHASE_4_MIGRATION.md`。
- Phase 5 设计 Token 与组件抽取已记录在 `docs/PHASE_5_DESIGN_TOKENS.md`。
- Phase 6 设计样式收敛、等值组件/Token 追加收敛、上线前清理与提示词数据源本地化已记录在 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。
- Phase 7 桌面端打包配置、三平台构建验证与正式发布待确认项已记录在 `docs/PHASE_7_DESKTOP_PACKAGING.md`。
- Phase 8 模块化架构与功能复用重构方案已记录在 `docs/PHASE_8_MODULAR_ARCHITECTURE.md`。
- 用户已确认因上线优先，Phase 5 记录中的遗留项暂缓，不作为当前 Phase 6 上线前清理阻塞项。
- 用户已批准并完成 Phase 6 上线前清理，范围覆盖 hook/Fast Refresh warning、bundle size/ineffective dynamic import、旧来源命名、未使用函数、未使用资源、无效分支、过期注释、废弃样式和历史兼容 fallback 清理。
- 用户已批准并完成 Phase 7 桌面端本地客户端分发包配置，范围覆盖 Windows x64、macOS Intel 和 macOS Apple Silicon 构建产物。
- 用户已批准 Phase 8 代码层热插拔与模块化重构方向，允许大范围重构、文件移动、边界检查规则引入和状态层/repository 重写。
- 用户已确认 Phase 8 不兼容旧数据和当前本地持久化数据，禁用功能时不删除数据，且功能行为和视觉输出必须保持不变。
- Phase 8 阶段 1 Feature Manifest 接管路由与入口已完成，并已通过类型、lint、单测、构建和 E2E 验证。
- Phase 8 阶段 2 目录归属重组已完成，业务页面、组件、store、领域服务和 API 已从旧 `app/(user)`、`components`、`services`、`stores`、`lib`、`hooks` 和 `constant` 目录迁入 `features/*`、`shared/*` 与 `app/shell` 对应归属，并已通过格式、类型、lint、单测、构建、E2E、Knip 和关键入口截图验证。
- Phase 8 阶段 3 Feature Public API 与边界规则已完成，feature manifest 契约已下沉到 `src/shared/features`，所有顶级 feature 均具备独立 `index.ts` 和 `manifest.ts`，跨 feature 依赖由 `scripts/check-feature-boundaries.cjs` 与 `npm run check:boundaries` 自动拦截，并已通过格式、类型、lint、边界检查、单测、构建、E2E 和 Knip 验证。
- 用户已批准并完成 Phase 8 阶段 4 状态层与 Repository 重构。范围覆盖新的 `resource_blobs` BlobStore、资源引用收集契约、CanvasProjectRepository、AssetRepository、GenerationLogRepository、SettingsRepository、sync repository 化、assets/canvas/generation/settings/local-agent public API 收窄，以及禁止 feature public API 导出 raw store hook 的边界检查规则。
- Phase 8 阶段 4 已通过格式、类型、lint、边界检查、单测、构建、E2E 和 Knip 验证。
- 用户已确认 Phase 8 阶段 5 按结果优先、视觉不变、代码结构调整方式实施：不新增音频工作台页面，不强行抽象为大而全通用页面，允许 `AssetPickerModal` 增加窄 API 支持调用方筛选素材类型。
- Phase 8 阶段 5 可复用功能抽取已完成。范围覆盖 generation shared result/log/reference/task runner/timer 契约、image/video 工作台日志与引用素材逻辑复用、视频轮询 task runner 复用、模型选择行复用、`AssetPickerModal` 窄筛选 API 和相关单元测试。
- Phase 8 阶段 5 已通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 image/video 工作台关键截图验证；截图位于 `test-results/phase-8-stage-5/`。
- 用户已确认 Phase 8 阶段 6 是代码层优化，不新增或删减功能，不修改前台视觉交互样式；可接受重构级别改动，但必须保持功能行为和视觉输出不变。
- Phase 8 阶段 6 Canvas 巨页核心等值拆解已完成。范围覆盖 Canvas 工作区 E2E 回归保护、workspace shell/top bar/overlay/agent dock/connection menu 组件拆分、画布 workspace helper 抽取、session/history/viewport/media/keyboard/image-node-action hooks 抽取，以及 generation/assets/assistant/local-agent 桥接层隔离。
- Phase 8 阶段 6 已将生成执行、生成请求生命周期、素材插入/保存、媒体上传/拖放、图片节点处理、在线助手和本地 Agent 接线从 `canvas-client-page.tsx` 剥离；页面规模已从阶段前约 5035 行收敛到约 1933 行。
- Phase 8 阶段 6 核心拆解已通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 Canvas 工作区关键截图验证；截图位于 `test-results/phase-8-stage-6/canvas-workspace.png`。
- Phase 8 阶段 7 完整验证与收尾已完成。范围覆盖 Canvas selection/drag/connection/基础 node actions 控制层终版整理、feature contribution 禁用矩阵、后台任务 manifest 契约、Stage 7 关键页面 E2E 截图、生产构建和桌面 `file://` hash route 烟测。
- Phase 8 阶段 7 已将 Canvas 高频交互控制从 `canvas-client-page.tsx` 继续剥离到 `useCanvasInteractionController`，将基础节点增删改、复制粘贴、批量图、文本编辑和配置变更等动作剥离到 `useCanvasNodeActions`；页面规模已从阶段 6 后约 1933 行收敛到约 1080 行。
- Phase 8 阶段 7 已通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 `npm run smoke:desktop-hash-routes` 验证；截图位于 `test-results/phase-8-stage-7/`。
- 当前无阻塞 Phase 8 模块化架构与功能复用重构完成的开放架构决策；后续若继续演进，应作为新阶段或独立切片确认。

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
- `docs/PHASE_8_MODULAR_ARCHITECTURE.md`：Phase 8 模块化架构与功能复用重构目标、边界、实施计划和验证策略。
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

## Phase 8 模块化架构约定

- Phase 8 只实现代码层功能热插拔，不实现第三方外部插件系统。
- `src/app` 只负责应用壳、provider、路由装配、feature registry 和平台级初始化，不承载业务领域实现。
- `src/features/*` 拥有自己的 manifest、页面、组件、store、domain service、repository、测试和 public API。
- `src/shared/*` 只放真正跨领域、无单一业务归属的基础能力。
- 每个 feature 必须通过 `src/features/<feature-id>/index.ts` 暴露 public API。
- 每个 feature 必须提供 `src/features/<feature-id>/manifest.ts`；feature manifest 与 route contribution 等通用契约归属 `src/shared/features`，不得从 feature 反向 import `src/app`。
- feature 之间不得直接 import 对方内部目录；跨 feature 协作只能通过 public API、shared contract、port、repository、command 或事件机制完成。
- import 边界由 `scripts/check-feature-boundaries.cjs` 检查，并已接入 `npm run check`；新增跨层依赖必须先通过该检查。
- 阶段 3 后仍保留的 store 型 public exports 属于阶段 4 前的过渡契约，只允许通过 feature public API 使用；后续应由 repository/domain service 或更窄的 port 替代。
- 禁用 feature 时不得删除数据；禁用只是不注册该 feature 的路由、命令、面板和后台任务。
- `generation` 保留为顶级 feature，内部拆分 `image`、`video` 和 `audio` 子领域。
- `assets` 负责素材库、素材选择、素材引用和素材 repository；带素材领域语义的选择器和引用能力应归属 `assets` public API。
- `canvas` 不承载素材选择、生成请求、助手协议或本地 Agent 生命周期等跨领域实现，只消费对应 feature 的 public API 或 shared contract。
- Phase 8 状态层可重写；store 聚焦 UI/session state，repository/domain service 负责持久化和跨功能数据访问。
- sync 不得直接读取 UI store，应依赖 repository 或 domain service。
- 资源清理必须通过统一资源引用收集契约，不得让 assets store 直接读取 canvas store。
- Phase 8 阶段 4 Blob 存储统一使用新的 `resource_blobs` namespace；不迁移或兼容旧 `image_files`、`media_files` 本地缓存。
- Phase 8 阶段 4 Canvas repository 继续保存当前 `CanvasProject` 运行时结构，canonical `CanvasDocument` 收敛留给后续画布核心拆解或专门数据模型切片。
- Phase 8 阶段 4 Settings repository 仅抽离浏览器端持久化边界；桌面密钥安全存储、Electron IPC 和密钥迁移不在本阶段实现。
- Phase 8 阶段 4 资源删除必须通过全域引用收集判断，只有未被 canvas、assets、generation logs 或调用方额外上下文引用的 Blob 才可删除。
- Phase 8 阶段 5 可复用功能抽取必须保持现有视觉样式和用户可见行为不变；优先抽取 generation workbench、媒体引用、素材插入和 task runner 的稳定逻辑，避免形成新的大而全耦合中心。
- Phase 8 阶段 5 不新增 `/audio` 页面；音频生成能力只保留为未来可接入的契约方向。
- Phase 8 阶段 6 Canvas 巨页拆解只做代码层等值优化，不新增或删减功能，不修改前台视觉交互样式；页面拆分、hooks、bridges 和 helper 抽取必须保持 JSX 输出、用户可见行为和生成流程等效。
- Phase 8 阶段 7 后，`canvas-client-page.tsx` 只保留 Canvas workspace 装配、页面状态组合和渲染接线；selection、drag、connection 和基础 node actions 控制层分别归属 `useCanvasInteractionController` 与 `useCanvasNodeActions`，生成执行和跨领域接线不得重新回流到页面巨页。

## 设计组件约定

- 网站内用于条目多选或多项配置选择的 checkbox 统一使用 `src/shared/ui/app-multi-select-checkbox.tsx` 的 `AppMultiSelectCheckbox`，canonical 规格为 16px 方形、5px 圆角，并消费应用语义 Token。
- 除共享组件内部可保留原生 `type="checkbox"` 输入外，页面侧不得为多选场景直接使用 Ant Design `Checkbox`、原生 checkbox 或重复手写 checkbox 样式。

## 数据源约定

- 提示词库运行时数据库使用本地静态数据 `public/data/local-prompts.json`。
- 不得在未确认的情况下重新引入运行时外部提示词数据库抓取；外部来源数据如需更新，应先离线验证可访问性，移除 404 来源后再写入本地提示词数据文件。

## 生成用量展示约定

- 当前业务不包含生成用量计量体系；生成入口、模型配置和错误文案不得展示用量扣减、余额、购买套餐或闪电用量标识，除非用户后续明确批准。

## 桌面打包约定

- 桌面端打包使用 Electron Builder，配置入口为 `electron-builder.config.cjs`。
- 正式应用名为 `Infinite Canvas`，appId / bundle identifier 为 `com.zuco.infinitecanvas`，桌面图标来源为 `public/zuco-brand.png` 生成的 `build-resources/icon.icns`、`build-resources/icon.ico` 和 `build-resources/icon.png`。
- 桌面包输出目录为 `release/`，中间资源目录为 `build/desktop-codex/`，二者不得提交。
- 任何会生成桌面分发产物的默认打包入口都必须自动递增应用版本号；无特殊说明时执行 patch 递增，例如 `0.1.0` 的下一次正式打包版本为 `0.1.1`。
- 桌面版本号递增由 `scripts/bump-desktop-version.cjs` 统一执行，并同步更新 `package.json` 和 `package-lock.json`；可通过 `DESKTOP_VERSION_BUMP=minor|major` 指定递增级别，或通过 `DESKTOP_VERSION=x.y.z` 指定版本。
- 只有在用户明确说明不更新版本号时，才允许使用 `SKIP_VERSION_BUMP=1` 或 `DESKTOP_VERSION_BUMP=none` 跳过自动递增。
- macOS 与 Windows 需要作为同一批版本同时出包时，必须使用 `npm run dist:desktop:all`，确保只递增一次版本号后生成多平台产物；不得连续单独执行 `dist:desktop:mac` 和 `dist:desktop:win` 造成同一批产物版本不一致。
- `npm run dist:desktop:dir` 仅用于本地目录包烟测，不视为正式分发出包，默认不递增版本号。
- 每次正式桌面分发打包前必须删除 `release/` 中旧版本的 `Infinite Canvas-*` 分发包，只保留当前 `package.json` 版本对应的包；该清理由 `scripts/clean-old-desktop-packages.cjs` 统一执行，并已串入正式打包脚本。
- 打包前必须通过 `scripts/prepare-desktop-codex.cjs` 准备 Codex CLI 资源；npm 打包脚本已自动串联该步骤。
- 桌面端 renderer 通过 `file://` 加载生产产物，Vite 生产构建必须保持相对资源 base；页面侧引用 `public/` 静态资源时应使用 `src/shared/platform/public-assets.ts` 的 `publicAssetPath()`，不得直接写根路径 `/...`。
- 桌面端 `file://` 环境必须使用 hash 路由（例如 `index.html#/canvas`），不得依赖 `history.pushState('/canvas')` 形式的根路径导航；Windows 会将 `/canvas` 解析为盘符根路径并导致入口点击无响应。
- 本地 Web/preview 下远端 AI 请求和远程图片资源读取必须走 Vite 本地代理；桌面 `file://` 下必须走 Electron 主进程注册的 `infinite-canvas://ai-proxy` 与 `infinite-canvas://resource-proxy`；正式 Web 部署如需规避 CORS，必须提供同源代理并通过 `VITE_AI_PROXY_PATH` / `VITE_RESOURCE_PROXY_PATH` 配置，不得默认把用户 API Key 转发到未知第三方代理。
- 应用内路由入口必须通过共享路由层统一处理：普通文本链接使用 `next/link` shim，Ant Design 按钮式路由入口使用 `src/shared/router/route-button.tsx` 的 `RouteButton`，程序化跳转使用 `next/navigation` shim；不得在页面侧直接给 Ant Design `Button` 写 `href` 或给原生 `a` 写根路径 `href="/..."`，ESLint 已自动拦截这些写法。
- 当前桌面产物为本地客户端分发包，且暂不启用自动更新；不得在未确认正式证书、发布者和真机验收前声称已完成正式发布配置。

## GitHub 推送约定

- 推送项目到 GitHub 时，源码提交推送到 `main`，版本节点必须创建并推送 `vX.Y.Z` tag，tag 版本必须与 `package.json` 和 `package-lock.json` 一致。
- 客户端桌面分发产物不得提交到 git；应从 `release/` 目录上传到对应版本的 GitHub Release 作为附件。
- 当用户要求“推送 GitHub”且当前版本存在匹配的桌面分发产物时，默认同时创建或更新对应 GitHub Release，但只上传当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe` 三类客户端安装包；不得上传 `.zip`、blockmap、latest 元数据或其他辅助产物，除非用户明确要求。
- 上传 GitHub Release 前必须确认附件文件名版本与当前 tag 一致，且附件范围严格限定为当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe`；若 `release/` 中缺少这些必需产物，先按桌面打包约定生成或向用户说明无法上传。

## 重构约束

- 在用户批准变更前，既有功能必须保持等效。
- 在用户批准视觉调整前，既有视觉输出必须保持一致。
- 设计 Token 和可复用组件初期只能做等值抽取，不得借机调整视觉。
- 功能解耦初期必须支持构建时包含/排除功能模块。
- 早期架构不得阻断后续运行时功能开关能力。
- Phase 8 代码实现必须遵守 `docs/PHASE_8_MODULAR_ARCHITECTURE.md` 记录的模块边界、public API、数据策略和验证策略。
- 旧项目如存在已知或审计中发现的问题，先记录为后续修复项；除非用户明确批准，不在行为等效重构阶段修复。
- 不需要兼容旧项目已有数据、文件格式、本地缓存或历史项目数据，除非用户后续重新提出。
- Phase 8 已确认不需要兼容本仓库当前本地持久化数据。
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
- Phase 7 桌面端本地客户端分发包配置已完成并验证。
- Phase 8 阶段 0 文档方案制定已完成。
- Phase 8 阶段 1 Feature Manifest 接管路由与入口已完成并验证。
- Phase 8 阶段 2 目录归属重组已完成并验证。
- Phase 8 阶段 3 Feature Public API 与边界规则已完成并验证。
- Phase 8 阶段 4 状态层与 Repository 重构已完成并验证。
- Phase 8 阶段 5 可复用功能抽取已完成并验证。
- Phase 8 阶段 6 Canvas 巨页核心等值拆解已完成并验证。
- Phase 8 阶段 7 完整验证与收尾已完成并验证，Phase 8 模块化架构与功能复用重构已达到当前确认目标。
- 用户明确批准具体阶段范围；正式签名、公证、自动更新、商店发布和第三方插件系统尚未获批准。

## 验证预期

后续进入实现阶段后，每个迁移功能都应根据风险定义验证步骤，包括：

- 行为等效检查。
- 视觉一致性检查。
- 构建检查。
- 未使用代码和资源检查。
- 文档一致性检查。
- feature import boundary 检查。
- feature 启用/禁用矩阵检查。
- 涉及 UI 的切片应补充关键路径截图或视觉对比。
- 涉及桌面路由或资源加载的切片应补充 `file://` hash route 烟测。
