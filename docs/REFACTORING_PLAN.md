# 重构计划

## 目标

将既有无限画布项目重构为可维护、模块化、可扩展的系统。Phase 0–8 和历史等值切片保持当前功能和视觉输出一致；后续设计系统与视觉优化只能对用户逐项批准的范围产生有意视觉变化。

## 已确认约束

- 目标仓库是全新项目。
- 源项目位置为 `/Users/simplemin/Desktop/CodeX/IC/`。
- 不需要保留源项目 git 历史。
- 不继承源项目历史 agent 约束。
- 初始重构阶段不得改变既有功能。
- 初始重构和等值 Token/组件抽取阶段必须保持既有视觉效果一致。
- 当前阶段的功能模块化需要支持构建时删除功能。
- 后续需要保留运行期间开启/禁用功能的架构可能性。
- 后续需要支持桌面端分发。
- 桌面目标平台为 Windows x64、macOS Intel 和 macOS Apple Silicon。
- 不需要兼容旧项目已有数据、文件格式、本地缓存或历史项目数据。
- Phase 8 不需要兼容本仓库当前本地持久化数据。
- Phase 8 只实现代码层功能热插拔，不实现第三方插件系统、动态外部插件加载、运行时开关 UI 或已打开页面中的动态卸载能力。
- Phase 8 必须保持功能行为和视觉输出不变。
- 旧项目如存在问题，先记录为后续修复项，不在等效重构阶段自动修复。
- Phase 3 已获用户明确批准并完成。
- Phase 4 已获用户明确批准并完成。
- Phase 5 已获用户明确批准并完成。
- Phase 6 设计样式收敛切片已获用户明确批准并完成。
- 用户已确认因上线优先，Phase 5 记录中的遗留项暂缓，不作为当前阻塞。
- Phase 6 上线前清理已获用户明确批准并完成，范围覆盖 hook/Fast Refresh warning、bundle size/ineffective dynamic import、旧来源命名和未使用/废弃内容清理。
- Phase 7 桌面端本地客户端分发包配置与三平台构建验证已获用户明确批准并完成。
- Phase 8 模块化架构与功能复用重构已获用户明确批准，阶段 0 文档方案制定、阶段 1 Feature Manifest 接管路由与入口、阶段 2 目录归属重组、阶段 3 Feature Public API 与边界规则、阶段 4 状态层与 Repository 重构、阶段 5 可复用功能抽取、阶段 6 Canvas 巨页核心等值拆解和阶段 7 完整验证与收尾已完成。
- 后续设计系统与视觉优化重构已获用户批准先完成完整方案文档，再按审批门逐阶段实施；阶段 1 全量库存、当前基线和追踪规则以及阶段 2 当前态 Design Lab 均已于 2026-07-11 获用户确认并完成。阶段 3 现有样式对比审计已于 2026-07-12 获用户批准并启动；当前仍未授权任何具体目标视觉规格或页面迁移。
- 用户已明确排除 `/` 首页非导航内容的有意视觉修改；公共导航仍可按设计系统审批流程调整。后续范围和验证以 `docs/design-system/HOMEPAGE_VISUAL_FREEZE.md` 为准。

## 推荐阶段

### Phase 0：文档基础

状态：已完成。

目标：

- 建立新的项目级工作规则。
- 创建文档索引和规划文档。
- 识别阻塞实施的开放决策。

验收标准：

- `AGENTS.md` 存在，并且只包含已确认的项目规则。
- 重构阶段已经记录。
- 源项目审计协议已经记录。
- 阻塞实施的开放决策已经被跟踪。

### Phase 1：只读源项目审计

状态：已完成。

目标：

- 建立当前功能全貌。
- 识别当前路由、页面、工具、面板、命令、快捷键、状态流、持久化行为、资源和样式来源。
- 识别耦合点和迁移风险。
- 识别当前构建、运行时和依赖约束。
- 在迁移前记录视觉和行为基线。

验收标准：

- `docs/SOURCE_AUDIT_REPORT.md` 已完成。
- `docs/VISUAL_BASELINE.md` 已完成。
- 既有功能已列出，并记录依赖、输入输出和 UI 表面。
- 当前视觉来源和设计常量已编目。
- 候选模块边界已记录。
- 技术栈决策所需信息已具备。

### Phase 2：目标架构决策

状态：已完成。

目标：

- 在创建脚手架前定义目标应用架构。
- 选择前端技术栈和桌面打包策略。
- 定义功能注册和构建时包含/排除机制。
- 定义设计 Token 和共享组件组织方式。
- 定义行为等效和视觉一致性的验证策略。

验收标准：

- 目标架构经用户批准。
- 必要开放决策已关闭。
- 实施计划被拆分为低风险迁移切片。

### Phase 3：项目骨架

状态：已完成。

目标：

- 创建目标项目结构。
- 设置构建工具、lint、格式化、测试基础设施和文档约定。
- 只添加支持后续迁移所需的最小应用占位面。

验收标准：

- 项目可以构建。
- 目录结构符合已批准架构。
- 没有引入行为层面的功能变更。

结果：

- React + TypeScript + Vite 骨架已创建。
- Electron 主进程和 preload 骨架已创建。
- Web 与 Electron 共享 app shell 已创建。
- feature manifest、registry、command contract、platform adapter 和核心 port 占位已创建。
- TypeScript、ESLint、Prettier、Vitest、Playwright、Knip 和 npm audit 验证基础已创建。
- 详见 `docs/PHASE_3_SCAFFOLD.md`。

### Phase 4：逐功能迁移

状态：已完成。

目标：

- 以小而可验证的切片迁移功能。
- 将每个功能转化为拥有清晰契约的模块。
- 每个迁移功能都保持行为和视觉一致。

验收标准：

- 每个迁移功能都可以在构建时包含或排除。
- 每个功能声明自己的 UI 表面、命令、状态访问、资源和依赖。
- 功能等效验证通过。

结果：

- 首轮应用功能已迁移到 Vite + React + Electron 目标仓库。
- Electron build 已包含本地 Agent bundle。
- 验证结果和遗留项见 `docs/PHASE_4_MIGRATION.md`。

### Phase 5：设计 Token 和组件抽取

状态：已完成。

目标：

- 将既有视觉值等值抽取为集中 Token。
- 抽取可复用 UI 组件。
- 抽取过程中保持视觉输出一致。

验收标准：

- 重复样式值在适当位置被 Token 表达。
- 共享 UI 模式由可复用组件表达。
- 视觉一致性仍然成立。

结果：

- Ant Design 主题值和画布主题值已收敛到 `src/shared/tokens`。
- 素材库和提示词库的页面骨架、标题、筛选标签和状态文本已抽取为共享 UI。
- 图像、视频和音频设置面板的分组、选项按钮、尺寸输入、数字输入和尺寸预览已抽取为共享 UI。
- 验证结果和遗留项见 `docs/PHASE_5_DESIGN_TOKENS.md`。

### Phase 6：清理与收敛

状态：上线前清理已完成。

目标：

- 移除源项目残留和未使用内容。
- 移除未使用函数、资源、无效分支、过期注释、废弃样式和历史兼容 fallback。
- 围绕已批准项目模式收敛代码。
- 已完成设计样式、应用级 Token 和工作台/配置表面组件收敛切片。

验收标准：

- 未使用代码和资源已经审计并移除。
- 命名反映新项目。
- 文档反映最终架构和工作流。

已完成切片：

- 设计样式收敛结果见 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。
- 上线前清理结果见 `docs/PHASE_6_DESIGN_CONVERGENCE.md`。

已完成的上线前清理切片：

- hook warning 和 Fast Refresh warning 收敛。
- bundle size 和 ineffective dynamic import 收敛。
- 旧来源命名、未使用函数、未使用资源、无效分支、过期注释、废弃样式和历史兼容 fallback 清理。

### Phase 7：桌面端打包

状态：本地客户端分发包配置与三平台构建验证已完成。

目标：

- 使用已批准的桌面策略支持 Windows x64、macOS Intel 和 macOS Apple Silicon。
- 将平台差异隔离在核心应用逻辑之外。

验收标准：

- 可以产出目标桌面平台构建。
- Web 和桌面入口在可行范围内共享同一核心模块。
- 平台差异已记录。

结果记录：

- 桌面端打包配置、产物、验证结果和正式发布待确认项见 `docs/PHASE_7_DESKTOP_PACKAGING.md`。

### Phase 8：模块化架构与功能复用重构

状态：阶段 7 完整验证与收尾已完成，Phase 8 模块化架构与功能复用重构已达到当前确认目标。

目标：

- 在代码层实现功能热插拔，方便快速接入新功能，也方便删除已有功能。
- 将 `app` 收敛为应用壳、provider、路由装配、feature registry 和平台级初始化。
- 将业务实现迁入 `features/*`，每个 feature 拥有自己的 manifest、页面、组件、store、domain service、repository、测试和 public API。
- 将 `shared/*` 收敛为真正跨领域、无单一业务归属的基础能力。
- 建立 feature public API 和 import boundary 规则，防止跨 feature 直接读取内部实现。
- 重写状态层和 repository，使 store 聚焦 UI/session state，使持久化和跨功能数据访问进入 repository/domain service。
- 抽取 generation workbench、素材选择、媒体引用、generation task runner、settings/model channel 和 blob/media storage adapter 等可复用能力。
- 保持功能行为和视觉输出不变。

非目标：

- 不实现第三方插件市场、动态外部插件加载、插件权限沙箱、插件签名或运行时开关 UI。
- 不实现已打开页面中的动态卸载能力。
- 不进行视觉 redesign。
- 不承诺兼容旧项目数据或本仓库当前本地持久化数据。

验收标准：

- 禁用 feature 后，不注册其路由、命令、面板和后台任务。
- 禁用 feature 不删除数据。
- feature 之间只能通过 public API、shared contract、port、repository、command 或事件机制协作。
- `app` 不承载业务领域实现。
- 主要数据域可以独立测试。
- 功能行为无有意变化。
- 视觉输出无有意变化。

结果记录：

- Phase 8 目标、架构边界、实施计划和验证策略见 `docs/PHASE_8_MODULAR_ARCHITECTURE.md`。
- 阶段 5 已完成 generation workbench、媒体引用、素材选择窄 API、task runner 和 model field 等稳定复用能力抽取，并通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 image/video 工作台截图验证。
- 阶段 6 已完成 Canvas 巨页核心等值拆解，覆盖 workspace 组件、画布 helper、session/history/viewport/media/keyboard/image-node-action hooks、generation/assets/assistant/local-agent bridges 和 `/canvas/:id` 关键路径 E2E，并通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 Canvas 工作区截图验证。
- 阶段 7 已完成 Canvas 控制层终版整理、真实 feature contribution 禁用矩阵、后台任务 manifest 契约、Stage 7 关键页面截图、桌面 `file://` hash route 烟测和文档收尾，并通过 `npm run check`、`npm run build`、`npm run knip`、`npm run test:e2e` 和 `npm run smoke:desktop-hash-routes` 验证。

## 实施护栏

除非用户明确批准，否则不得扩大到功能行为变更、进一步视觉 redesign、旧数据兼容承诺、第三方插件系统、运行时开关 UI、正式签名/公证、自动更新或商店发布配置。

后续设计系统与视觉优化的范围、阶段、审批门、验证和完成定义统一见 `docs/DESIGN_SYSTEM_REFACTOR_PLAN.md`。该计划作为独立后续项目维护，不改写 Phase 5/6 的历史完成状态。
