# AGENTS.md

## 文件定位

本文件只记录代理执行规则、目录边界、工程约束、验证要求和项目治理要求。

长期项目状态、产品约束、发布分发规则和阶段记录分别维护在专门文档中：

- `docs/PROJECT_STATUS.md`：当前项目状态、已确认目标、非目标和文档地图。
- `docs/PRODUCT_CONSTRAINTS.md`：长期产品约束、数据源约束和用户可见文案边界。
- `docs/RELEASE_AND_DISTRIBUTION.md`：桌面打包、版本号、GitHub Release 和分发规则。
- `docs/PHASE_8_MODULAR_ARCHITECTURE.md`：模块化架构、feature 边界和 Phase 8 实施记录。
- `docs/VERSION_CLOSING.md`：版本收尾清理记录、验证结果、阻塞项和后续计划。

历史阶段文档用于追溯事实，不自动成为当前工作规则；当前规则以本文件和上述专门文档中的最新约束为准。

## 项目身份

- 本仓库是 `/Users/simplemin/Desktop/CodeX/IC/` 旧无限画布项目的全新重构/重建工作区。
- 旧项目中的历史 `AGENTS.md` 和项目约束不继承。
- 本仓库不需要保留旧项目 git 历史。
- 已确认不兼容旧项目数据、旧文件格式、旧本地缓存或本仓库当前本地持久化数据，除非用户后续重新提出。
- 当前应用名为 `Infinite Canvas`，目标运行形态包含 Web 和 Electron 桌面端。

## 工作规则

- 多步骤任务必须先制定执行计划，识别依赖、风险和成功标准，再执行。
- 始终聚焦用户明确提出的需求，不做无关重构或范围扩张。
- 优先选择简单、稳健、可维护的方案，复用项目已有模式、共享组件、设计 Token、工具函数和数据契约。
- 目标仓库使用 npm，依赖安装和项目脚本默认使用 npm。
- 项目文档默认使用中文。
- 缺失、模糊或冲突的项目文档视为阻塞项。
- 不得在未确认的情况下推断项目规则、业务需求、架构决策、工作流约定或文档结构。
- 只记录用户确认、本地验证或明确标注为开放决策的信息。
- 项目级变更完成前必须同步更新相关文档。
- 如果清理中发现无法确认是否仍需兼容的旧字段、旧入口、旧 storage key、旧 API fallback 或旧数据兜底，必须先向用户确认。

## 目录与边界

- `src/app` 只负责应用壳、provider、路由装配、feature registry 和平台级初始化，不承载业务领域实现。
- `src/features/*` 拥有自己的 manifest、页面、组件、store、domain service、repository、测试和 public API。
- `src/shared/*` 只放真正跨领域、无单一业务归属的基础能力；跨领域类型也应归属 `shared`，不得新增顶层横向业务目录。
- 每个 feature 必须通过 `src/features/<feature-id>/index.ts` 暴露 public API。
- 每个 feature 必须提供 `src/features/<feature-id>/manifest.ts`。
- feature manifest 与 route contribution 等通用契约归属 `src/shared/features`，不得从 feature 反向 import `src/app`。
- feature 之间不得直接 import 对方内部目录；跨 feature 协作只能通过 public API、shared contract、port、repository、command 或事件机制完成。
- feature public API 不得导出 raw store hook；跨 feature 不得 import raw store hook。
- import 边界由 `scripts/check-feature-boundaries.cjs` 检查，并已接入 `npm run check`。

## 模块化约定

- 当前只实现代码层功能热插拔，不实现第三方插件市场、动态外部插件加载、插件权限沙箱、插件签名、运行时开关 UI 或已打开页面中的动态卸载能力。
- 禁用 feature 时不得删除数据；禁用只是不注册该 feature 的路由、命令、面板和后台任务。
- `generation` 保留为顶级 feature，内部拆分 `image`、`video` 和 `audio` 子领域。
- `assets` 负责素材库、素材选择、素材引用和素材 repository。
- `canvas` 不承载素材选择、生成请求、助手协议或本地 Agent 生命周期等跨领域实现，只消费对应 feature 的 public API 或 shared contract。
- store 聚焦 UI/session state，repository/domain service 负责持久化和跨功能数据访问。
- sync 不得直接读取 UI store，应依赖 repository 或 domain service。
- 资源清理必须通过统一资源引用收集契约，不得让 assets store 直接读取 canvas store。
- Blob 存储统一使用 `resource_blobs` namespace；不得重新引入旧 `image_files`、`media_files` 本地缓存兼容。

## UI 与数据约束

- 未经用户批准，不进行视觉 redesign。
- 等值重构必须保持既有功能行为和视觉输出一致。
- 多选场景统一使用 `src/shared/ui/app-multi-select-checkbox.tsx` 的 `AppMultiSelectCheckbox`。
- 页面侧不得为多选场景直接使用 Ant Design `Checkbox`、原生 checkbox 或重复手写 checkbox 样式。
- 空结果或空列表状态不得显示分页器；目录类页面优先使用 `CatalogPagination` 或同等 total guard。
- 应用内路由入口必须通过共享路由层统一处理：文本链接使用 `next/link` shim，按钮式路由入口使用 `RouteButton`，程序化跳转使用 `next/navigation` shim。
- 页面侧引用 `public/` 静态资源必须使用 `src/shared/platform/public-assets.ts` 的 `publicAssetPath()`。
- 产品文案、提示词数据源、生成用量展示等长期约束见 `docs/PRODUCT_CONSTRAINTS.md`。

## 发布与分发约束

- 桌面打包、版本号递增、分发产物清理、GitHub tag 和 Release 附件规则统一见 `docs/RELEASE_AND_DISTRIBUTION.md`。
- `build/`、`dist/`、`dist-electron/`、`release/`、`coverage/`、`playwright-report/` 和 `test-results/` 是生成物或验证产物，不进入版本控制。
- 正式签名、公证、自动更新、商店发布和第三方插件系统尚未获批准，不得声称已完成。

## 验证要求

根据改动风险选择验证，常用基线包括：

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

涉及 UI 的切片应补充关键路径截图或视觉对比；涉及桌面路由或资源加载的切片应补充 `file://` hash route 烟测。
