# 实施切片计划

状态：Phase 8 模块化架构与功能复用重构已完成；阶段 7 完整验证与收尾已完成。

日期：2026-07-07

依据：

- `docs/SOURCE_AUDIT_REPORT.md`
- `docs/VISUAL_BASELINE.md`
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`
- `docs/OPEN_DECISIONS.md`

## 当前结论

Phase 2 目标架构决策已关闭。用户已明确批准进入 Phase 3，Phase 3 项目骨架已完成。用户已明确批准按本文件顺序连续推进整个 Phase 4，Phase 4 已完成。用户已明确批准进入 Phase 5，Phase 5 设计 Token 与组件抽取已完成。用户已明确批准 Phase 6 中的设计样式收敛切片，该切片已完成。用户随后明确要求本阶段不是视觉重构，而是在既有视觉基础上选择 canonical 规格替换相同或相似元素，以实现风格统一和组件/Token 收敛；该追加切片已完成。用户已确认因上线优先，Phase 5 记录中的遗留项暂缓，不作为当前阻塞，并批准进入 Phase 6 上线前清理；该清理切片已完成。用户已批准进入 Phase 7，桌面端本地客户端分发包配置与三平台构建验证已完成。用户已批准进入 Phase 8，范围为代码层功能热插拔、模块化架构、状态层/repository 重构和可复用能力抽取；Phase 8 阶段 0 文档方案制定、阶段 1 Feature Manifest 接管路由与入口、阶段 2 目录归属重组、阶段 3 Feature Public API 与边界规则、阶段 4 状态层与 Repository 重构、阶段 5 可复用功能抽取、阶段 6 Canvas 巨页核心等值拆解和阶段 7 完整验证与收尾均已完成。

## Phase 3：项目骨架

目标：

- 创建 React + TypeScript + Vite 应用骨架。
- 创建 Electron 主进程、preload 和桌面启动骨架。
- 建立 Web 与桌面共享的 app shell。
- 建立功能 manifest、注册表和平台 adapter 的最小结构。
- 建立类型检查、格式化、lint、单元测试、端到端测试和清理工具基础。
- 不迁移旧功能，不实现业务行为。

状态：已完成。

建议切片：

1. 初始化包管理、TypeScript、Vite、React 和基础目录。
2. 接入 Tailwind CSS、Ant Design、Prettier、ESLint。
3. 接入 Vitest、Testing Library、Playwright 和 Knip。
4. 建立 `src/app`、`src/features`、`src/shared` 和 `electron` 目录。
5. 建立 feature manifest、feature registry、command contract 和 platform adapter 占位。
6. 建立 Web 入口和 Electron 入口，并验证二者加载同一 app shell。
7. 建立文档中定义的最小构建、检查和测试命令。

验收标准：

- Web 入口可以启动。
- Electron 入口可以启动。
- 同一 app shell 在 Web 和 Electron 中渲染。
- 类型检查、lint、格式化检查、单元测试和端到端测试命令可执行。
- 没有迁移旧项目功能或改变产品行为。

结果记录：

- Phase 3 骨架说明见 `docs/PHASE_3_SCAFFOLD.md`。
- 已验证 `npm run check`、`npm run build`、`npm run test:e2e`、`npm run knip` 和 `npm audit`。

## Phase 4：逐功能迁移

迁移原则：

- 每个切片保持行为和视觉等效。
- 每个切片必须声明模块边界、状态依赖、资源依赖、验证方法和视觉基线。
- 每个切片都应支持构建时包含或排除。
- 不在等效迁移阶段修复旧项目问题；只记录后续修复项。

状态：已完成。结果记录见 `docs/PHASE_4_MIGRATION.md`。

建议顺序：

1. 应用壳与导航：复现主导航、主题入口、配置入口和页面路由。
2. 共享 Token 与基础 UI：等值抽取应用级和画布级 Token，建立按钮、弹窗、抽屉、分段控件、空状态等基础封装。
3. 持久化接口：建立 `ProjectRepository`、`AssetRepository`、`BlobStore`、`SettingsRepository`、`SyncRepository`。
4. 画布文档模型：迁移项目、节点、连线、视口、背景设置的数据模型。
5. 画布渲染核心：迁移网格背景、DOM 节点、SVG 连线、缩放和平移。
6. 画布命令系统：迁移新增、更新、移动、删除、连接、选择、undo/redo。
7. 节点类型：迁移文本、图片、视频、音频、生成配置节点。
8. 工具栏与小地图：迁移底部工具栏、画布外观面板、小地图和快捷键弹窗。
9. 资源与素材库：迁移媒体 Blob、素材库、资源引用和上传入口。
10. 提示词库：迁移提示词列表、详情、选择弹窗和提示词引用。
11. AI 配置与生成 adapter：迁移模型渠道、文本/图片/视频/音频生成请求接口和前端配置。
12. 生图工作台与视频创作台：迁移画布外工作台页面和历史记录。
13. WebDAV：迁移同步配置、domain manifest 和资源同步策略。
14. 在线助手与 `canvas-ops`：迁移在线助手 UI、工具调用和确认流程。
15. 本地 Agent：迁移本地 Agent 协议、Web 连接模式和 Electron 内置启动模式。
16. 导入导出：实现新归档格式，并保留等效导入导出能力。
17. 桌面打包：验证 Windows x64、macOS Intel 和 macOS Apple Silicon 的打包路径。
18. 等效验收与清理：按基线截图和行为清单检查，清除旧命名、废弃样式、未使用代码和资源。

## Phase 8：模块化架构与功能复用重构

目标：

- 在代码层实现功能热插拔，方便快速接入新功能，也方便删除已有功能。
- 将 app 层收敛为应用壳、provider、路由装配、feature registry 和平台级初始化。
- 将业务实现迁入 `features/*`，每个 feature 拥有自己的 manifest、页面、组件、store、domain service、repository、测试和 public API。
- 将 `shared/*` 收敛为真正跨领域、无单一业务归属的基础能力。
- 建立 feature public API 和 import boundary 规则，防止跨 feature 直接读取内部实现。
- 重写状态层和 repository，让 store 聚焦 UI/session state，让持久化和跨功能数据访问进入 repository/domain service。
- 抽取生成工作台、素材选择、媒体引用、generation task runner、settings/model channel 和 blob/media storage adapter 等可复用能力。
- 保持功能行为和视觉输出不变。

状态：阶段 7 完整验证与收尾已完成，Phase 8 模块化架构与功能复用重构已达到当前确认目标。结果记录见 `docs/PHASE_8_MODULAR_ARCHITECTURE.md`。

非目标：

- 不实现第三方插件市场、动态外部插件加载、插件权限沙箱、插件签名或运行时开关 UI。
- 不实现已打开页面中的动态卸载能力。
- 不进行视觉 redesign。
- 不承诺兼容旧项目数据或本仓库当前本地持久化数据。

建议顺序：

1. 文档与目标冻结：完成 Phase 8 文档、规则和决策同步。
2. Feature Manifest 接管路由与入口：manifest 贡献 route loader，AppRoutes 从 registry 装配启用页面。
3. 目录归属重组：已完成。业务实现已从 app 页面目录和旧横向目录迁入对应 feature、shared 与 app shell。
4. Feature Public API 与边界规则：已完成。建立 `src/features/<feature-id>/index.ts`、独立 `manifest.ts`、`src/shared/features` 契约层和 `npm run check:boundaries` import boundary 检查。
5. 状态层与 Repository 重构：已完成。重写 canvas、assets、settings、generation logs 的持久化边界；统一 BlobStore 与资源引用收集；sync 改为依赖 repository/domain service；feature public API 禁止导出 raw store hook。
6. 可复用功能抽取：已完成。抽取 generation workbench、asset picker、media reference、task runner 和 model field 等稳定重复能力，并保持视觉结构不变。
7. Canvas 巨页拆解：核心等值拆解已完成。已抽取 workspace 组件、helper、session/history/viewport/media/keyboard/image-node-action hooks 和 generation/assets/assistant/local-agent bridges。
8. 完整验证与收尾：已完成。Canvas selection/drag/connection/基础 node actions 控制层已收敛到长期 hook；feature contribution 禁用矩阵、后台任务 manifest 契约、Stage 7 E2E 截图和桌面 hash route 烟测已补齐。

验收标准：

- 禁用 feature 后，不注册其路由、命令、面板和后台任务。
- 禁用 feature 不删除数据。
- feature 之间只能通过 public API、shared contract、port、repository、command 或事件机制协作。
- `app` 不承载业务领域实现。
- 主要数据域可以独立测试。
- 功能行为无有意变化。
- 视觉输出无有意变化。

## 下一步

Phase 5 结果记录见 `docs/PHASE_5_DESIGN_TOKENS.md`。
Phase 6 设计样式收敛、等值组件/Token 追加收敛和上线前清理结果记录见 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。
Phase 7 桌面端打包结果记录见 `docs/PHASE_7_DESKTOP_PACKAGING.md`。
Phase 8 模块化架构与功能复用重构方案见 `docs/PHASE_8_MODULAR_ARCHITECTURE.md`。

当前 Phase 8 阶段 7 完整验证与收尾已完成，Phase 8 模块化架构与功能复用重构已达到当前确认目标。后续如继续演进，应作为新阶段或独立切片确认；仍不得在未批准情况下引入功能行为变更、视觉 redesign、第三方插件系统、运行时开关 UI、正式签名/公证、自动更新或商店发布配置。
