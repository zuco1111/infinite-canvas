# Infinite Canvas Refactor

本仓库是既有网页端无限画布项目的全新重构/重建工作区。

当前阶段：**Phase 8 模块化架构与功能复用重构已完成；阶段 7 完整验证与收尾已完成**。

目前已迁移首轮应用功能，包括主画布、素材库、提示词库、生图工作台、视频创作台、配置、WebDAV、在线助手、本地 Agent 连接与 Electron agent bundle，并已完成等值设计 Token、共享 UI 组件抽取、首轮应用层设计样式收敛、等值组件/Token 追加收敛、提示词数据源本地化、桌面端打包配置和 Phase 8 模块化架构与功能复用重构。Phase 8 在保持功能行为和视觉输出不变的前提下，已完成代码层功能热插拔、feature 边界收敛、状态层/repository 重构、可复用能力抽取、Canvas 控制层整理和完整验证收尾。

## 源项目

已静态审计的旧项目位于：

- `/Users/simplemin/Desktop/CodeX/IC/`

旧项目中的历史项目约束和 `AGENTS.md` 不继承到本仓库。

Phase 1 审计结果见：

- `docs/SOURCE_AUDIT_REPORT.md`
- `docs/VISUAL_BASELINE.md`

## 文档

- `AGENTS.md`：本仓库的项目级工作规则。
- `docs/REFACTORING_PLAN.md`：分阶段重构路线。
- `docs/SOURCE_AUDIT_PROTOCOL.md`：旧项目只读审计流程。
- `docs/SOURCE_AUDIT_REPORT.md`：旧项目 Phase 1 审计报告。
- `docs/VISUAL_BASELINE.md`：Phase 1 运行时视觉基线。
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`：Phase 2 已确认目标架构决策。
- `docs/PHASE_3_SCAFFOLD.md`：Phase 3 项目骨架、脚本和验证结果。
- `docs/PHASE_4_MIGRATION.md`：Phase 4 逐功能迁移范围、验证结果和遗留项。
- `docs/PHASE_5_DESIGN_TOKENS.md`：Phase 5 设计 Token 与组件抽取范围、验证结果和遗留项。
- `docs/PHASE_6_DESIGN_CONVERGENCE.md`：Phase 6 设计样式收敛、上线前清理范围、验证结果和遗留项。
- `docs/PHASE_7_DESKTOP_PACKAGING.md`：Phase 7 桌面端打包配置、验证结果和正式发布待确认项。
- `docs/PHASE_8_MODULAR_ARCHITECTURE.md`：Phase 8 模块化架构与功能复用重构目标、边界、实施计划和验证策略。
- `docs/IMPLEMENTATION_PLAN.md`：Phase 3 与后续迁移切片计划。
- `docs/OPEN_DECISIONS.md`：实施前需要关闭或持续跟踪的开放决策。

## 开发命令

目标仓库使用 npm：

```bash
npm install
npm run dev
npm run dev:desktop
npm run check
npm run check:boundaries
npm run build
npm run smoke:desktop-hash-routes
npm run dist:desktop:dir
npm run dist:desktop:mac
npm run dist:desktop:win
npm run test:e2e
npm run knip
```

## 当前边界

Phase 8 模块化架构与功能复用重构已获用户批准并完成，阶段 1 Feature Manifest 接管路由与入口、阶段 2 目录归属重组、阶段 3 Feature Public API 与边界规则、阶段 4 状态层与 Repository 重构、阶段 5 可复用功能抽取、阶段 6 Canvas 巨页核心等值拆解和阶段 7 完整验证与收尾均已完成。Phase 8 只实现代码层功能热插拔和模块边界重构，不实现第三方插件系统、运行时开关 UI、动态外部插件加载、正式签名/公证、自动更新或商店发布配置。

Phase 8 允许大规模移动文件、重组目录、重写状态层和 repository；不需要兼容旧项目数据，也不需要兼容本仓库当前本地持久化数据。禁用功能时不删除数据，只是不注册对应路由、命令、面板和后台任务。功能行为和视觉输出必须保持不变。

阶段 4 已完成 repository 优先方案：Blob 存储统一到新的 `resource_blobs` namespace；Canvas 暂保留当前 `CanvasProject` shape；Settings 暂不做桌面密钥安全存储/IPC 改造；资源删除必须经过全域引用收集判断；sync 不再读取 UI store。

阶段 5 已完成 generation workbench 可复用能力抽取：image/video 工作台复用 result/log/reference/task runner/timer/model field 等稳定能力，`AssetPickerModal` 增加窄筛选 API，并保持现有视觉样式和用户可见行为不变。

阶段 6 已完成 Canvas 巨页核心等值拆解：新增 `/canvas/:id` 关键路径 E2E，拆出 workspace 组件、画布 helper、session/history/viewport/media/keyboard/image-node-action hooks，以及 generation/assets/assistant/local-agent 桥接层；本阶段只做代码层优化，不新增或删减功能，不修改前台视觉交互样式。

阶段 7 已完成完整验证与收尾：Canvas selection/drag/connection/基础 node actions 控制层已收敛到 `useCanvasInteractionController` 与 `useCanvasNodeActions`，feature registry 已覆盖 route、toolbar、node type、command、storage domain、settings panel 和 background task contribution 查询，真实 feature 禁用矩阵已有单测保护，关键 Web 页面和 Canvas 工作区截图位于 `test-results/phase-8-stage-7/`，桌面 `file://` hash route 烟测入口为 `npm run smoke:desktop-hash-routes`。

阶段 2 后，业务实现主要位于 `src/features/*`；`src/app` 仅保留应用入口、provider、路由装配、feature registry、shell 和平台级主题装配；跨领域基础能力位于 `src/shared/*`。

阶段 4 后，每个顶级 feature 均通过 `src/features/<feature-id>/index.ts` 暴露 public API，并提供独立 `manifest.ts`。feature manifest 与 route contribution 等通用契约位于 `src/shared/features`。跨 feature 内部目录、feature 反向依赖 app、shared 依赖 app/feature、feature public API 导出 raw store hook、跨 feature import raw store hook 等越界行为由 `npm run check:boundaries` 自动拦截，该检查已接入 `npm run check`。跨 feature 协作应使用 repository/domain service、shared contract、port、command、事件机制或更窄的 public hook。

提示词库运行时读取本地静态数据 `public/data/local-prompts.json`，不再抓取外部提示词数据库。
