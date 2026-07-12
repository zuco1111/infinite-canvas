# 项目状态

## 当前状态

本仓库是 `/Users/simplemin/Desktop/CodeX/IC/` 旧无限画布网页端项目的全新重构/重建工作区。旧项目中的历史 `AGENTS.md`、项目约束和 git 历史不继承。

当前阶段：**Phase 8 模块化架构与功能复用重构已完成；版本收尾清理已完成**。

后续项目：**设计系统与视觉优化阶段 3 已于 2026-07-12 获用户批准并进入“现有样式对比审计”切片**。阶段 1 的全量库存、追踪规则和当前基线已经确认；阶段 2 当前态 Design Lab 已通过验收。阶段 3 当前把 23 项 Foundations + 17 项 Primitives 完整且唯一地编入 10 个相似性对比组，默认并置展示，同时保留阶段 2 库存顺序视图、稳定锚点、Light/Dark、桌面/移动和来源证据。分组只用于比较，不代表合并或目标关系；DS-O1、DS-O6～DS-O10、DS-O13、DS-O15 仍开放，因此当前不创建目标 Token、不修改生产组件或页面视觉。

用户已于 2026-07-11 补充确认：`/` 首页在 Light/Dark、Web 桌面/移动和 Electron 桌面下的非导航内容不参与本轮有意视觉修改；公共导航仍可按组件审批流程调整。详细冻结边界见 `docs/design-system/HOMEPAGE_VISUAL_FREEZE.md`。

## 已确认目标

- 将既有项目重构为更简单、更清晰、更易维护的架构。
- 解耦功能模块，降低功能之间的直接依赖。
- 支持构建时删除功能模块，并保留后续运行期间开启/禁用功能的架构可能性。
- 收敛设计样式、设计 Token 和可复用设计组件。
- 建立可复用组件，支持后续快速迭代和功能复用。
- 在代码层实现功能热插拔，方便快速接入新功能，也方便删除已有功能。
- 保持既有功能行为和视觉输出不变，除非用户明确批准调整。
- 后续需要支持桌面端分发，目标平台为 Windows x64、macOS Intel 和 macOS Apple Silicon。

## 已确认非目标

- 不进行未经批准的视觉 redesign。
- 不承诺兼容旧项目数据、旧文件格式、旧本地缓存或本仓库当前本地持久化数据。
- 不进行正式签名、公证、自动更新或商店发布配置。
- 不应用或复制旧项目历史 agent 约束。
- 不迁移旧文档站或 Codex app 插件为首轮应用功能。
- 不实现第三方插件市场、动态外部插件加载、插件权限沙箱、插件签名、运行时开关 UI 或已打开页面中的动态卸载能力。

## Phase 状态摘要

- Phase 1 静态只读审计已完成，记录在 `docs/SOURCE_AUDIT_REPORT.md`。
- Phase 1 运行时视觉基线已完成，记录在 `docs/VISUAL_BASELINE.md`。
- Phase 2 目标架构决策已完成，记录在 `docs/TARGET_ARCHITECTURE_DECISIONS.md`。
- Phase 3 项目骨架已完成，记录在 `docs/PHASE_3_SCAFFOLD.md`。
- Phase 4 逐功能迁移已完成，记录在 `docs/PHASE_4_MIGRATION.md`。
- Phase 5 设计 Token 与组件抽取已完成，记录在 `docs/PHASE_5_DESIGN_TOKENS.md`。
- Phase 6 设计样式收敛、上线前清理与提示词数据源本地化已完成，记录在 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。
- Phase 7 桌面端打包配置、三平台构建验证与正式发布待确认项已完成，记录在 `docs/PHASE_7_DESKTOP_PACKAGING.md`。
- Phase 8 模块化架构与功能复用重构已完成，记录在 `docs/PHASE_8_MODULAR_ARCHITECTURE.md`。
- 设计系统与视觉优化重构已完成阶段 0、阶段 1 和阶段 2；阶段 3 现有样式对比审计已于 2026-07-12 启动，目标体系和生产实施尚未获批，记录在 `docs/DESIGN_SYSTEM_REFACTOR_PLAN.md`、`docs/design-system/PHASE_2_DESIGN_LAB.md` 与 `docs/design-system/PHASE_3_CURRENT_STYLE_AUDIT.md`。

## Phase 8 完成状态

Phase 8 已完成以下阶段：

- 阶段 1 Feature Manifest 接管路由与入口。
- 阶段 2 目录归属重组。
- 阶段 3 Feature Public API 与边界规则。
- 阶段 4 状态层与 Repository 重构。
- 阶段 5 可复用功能抽取。
- 阶段 6 Canvas 巨页核心等值拆解。
- 阶段 7 完整验证与收尾。

Phase 8 当前达到已确认目标：代码层功能热插拔、feature 边界收敛、状态层/repository 重构、可复用能力抽取、Canvas 控制层整理和完整验证收尾均已完成。

## 文档地图

- `README.md`：项目入口和常用命令。
- `AGENTS.md`：代理执行规则、目录边界、工程约束和验证要求。
- `docs/PRODUCT_CONSTRAINTS.md`：长期产品约束、数据源约束和用户可见文案边界。
- `docs/RELEASE_AND_DISTRIBUTION.md`：桌面打包、版本号、GitHub Release 和分发规则。
- `docs/VERSION_CLOSING.md`：版本收尾清理记录、验证结果、阻塞项和后续计划。
- `docs/REFACTORING_PLAN.md`：分阶段重构计划和验收标准。
- `docs/SOURCE_AUDIT_PROTOCOL.md`：旧项目只读审计规则。
- `docs/SOURCE_AUDIT_REPORT.md`：Phase 1 旧项目静态只读审计报告。
- `docs/VISUAL_BASELINE.md`：Phase 1 运行时视觉基线。
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`：Phase 2 已确认目标架构决策。
- `docs/PHASE_3_SCAFFOLD.md`：Phase 3 项目骨架、脚本和验证结果。
- `docs/PHASE_4_MIGRATION.md`：Phase 4 逐功能迁移范围、验证结果和遗留项。
- `docs/PHASE_5_DESIGN_TOKENS.md`：Phase 5 设计 Token 与组件抽取范围、验证结果和遗留项。
- `docs/PHASE_6_DESIGN_CONVERGENCE.md`：Phase 6 设计样式收敛、上线前清理范围、验证结果和遗留项。
- `docs/PHASE_7_DESKTOP_PACKAGING.md`：Phase 7 桌面端打包配置、验证结果和正式发布待确认项。
- `docs/PHASE_8_MODULAR_ARCHITECTURE.md`：Phase 8 模块化架构与功能复用重构目标、边界、实施计划和验证策略。
- `docs/DESIGN_SYSTEM_REFACTOR_PLAN.md`：新设计系统与视觉优化的范围、分层、审批门、迁移顺序、验证策略和完成定义。
- `docs/design-system/INVENTORY.md`：阶段 1 全量组件、Token、样式、重复候选、例外和风险库存。
- `docs/design-system/TRACEABILITY.md`：旧设计项到目标设计项、生产调用点和迁移批次的双向追踪与守门规则。
- `docs/design-system/PHASE_2_DESIGN_LAB.md`：阶段 2 Design Lab 架构、40 项覆盖、80 张逐项 Light/Dark 基线、场景快照、构建隔离、验证、当前问题和审批门。
- `docs/design-system/PHASE_3_CURRENT_STYLE_AUDIT.md`：阶段 3 当前样式对比审计边界、10 个相似项分组、验证和待判断项。
- `docs/design-system/HOMEPAGE_VISUAL_FREEZE.md`：首页非导航视觉冻结范围、参考证据和迁移验证要求。
- `docs/design-system/baselines/current/README.md`：59 张改前视觉基线、采集协议、环境元数据和已知限制。
- `docs/IMPLEMENTATION_PLAN.md`：Phase 3 与后续迁移切片计划。
- `docs/OPEN_DECISIONS.md`：需要关闭或持续跟踪的开放决策。

## 开放项

当前无阻塞 Phase 8 模块化架构与功能复用重构完成的开放架构决策。

设计系统与视觉优化仍有多项开放决策。它们只阻塞各自对应的基线、Design Lab、Token 架构或生产迁移工作；开始某阶段前必须关闭标记为该阶段的项目，详见 `docs/OPEN_DECISIONS.md` 与 `docs/DESIGN_SYSTEM_REFACTOR_PLAN.md`。

正式桌面发布仍需确认 macOS Developer ID 证书、Team ID、notarization 账号、Windows 代码签名证书以及 Windows x64 真机验收结果。应用作者、版权主体、用户可见署名和目标 Windows 发布者名称已确认统一使用 `Zuco`。
