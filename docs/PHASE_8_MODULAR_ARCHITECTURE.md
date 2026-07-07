# Phase 8 模块化架构与功能复用重构

状态：阶段 7 完整验证与收尾已完成，Phase 8 模块化架构与功能复用重构已达到当前确认目标。

日期：2026-07-07

依据：

- `AGENTS.md`
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`
- `docs/PHASE_4_MIGRATION.md`
- `docs/PHASE_5_DESIGN_TOKENS.md`
- `docs/PHASE_6_DESIGN_CONVERGENCE.md`
- `docs/PHASE_7_DESKTOP_PACKAGING.md`
- 用户关于代码层热插拔、功能复用、可接受大范围重构和测试完整性的确认。

## 用户确认的目标

- 在代码层实现功能热插拔，方便快速接入新功能，也方便删除已有功能。
- 当前阶段不做第三方插件市场、动态外部插件加载或运行时插件系统。
- 当前阶段聚焦代码层模块化，不要求实现运行时开关 UI。
- 功能行为保持不变。
- 视觉输出保持不变。
- 允许大规模移动文件、重组目录、重写状态层和 repository，只要最终结果足够好。
- 不需要兼容旧项目数据，也不需要兼容本仓库当前本地持久化数据。
- 禁用功能时不删除已有数据；禁用只是不注册路由、命令、面板和后台任务。
- 允许引入新的边界检查工具或 ESLint 规则，防止后续重新耦合。
- 验证应尽可能完整，覆盖类型、lint、单测、关键端到端路径和涉及 UI 的视觉验证。
- Phase 8 阶段 4 按 repository 优先方案实施：Blob 存储统一到新的 `resource_blobs` namespace；Canvas 阶段 4 保留当前 `CanvasProject` 运行时 shape；Settings 阶段 4 只抽离 repository，不实现桌面密钥安全存储/IPC 改造；资源删除语义修正为仅当 Blob 未被任何数据域引用时才删除。
- Phase 8 阶段 5 按“结果优先、视觉不变、代码结构调整”的方式实施：优先抽取 generation workbench、素材选择、媒体引用和 task runner 的稳定复用能力，不新增音频工作台页面，不强行抽象为大而全通用页面，不改变现有视觉样式或用户可见行为。
- Phase 8 阶段 6 按“重构级别、结果优先、行为和视觉等效”的方式实施：拆解 Canvas 巨页、建立可维护的画布 workspace 装配结构、隔离 generation/assets/assistant/local-agent 桥接层，并补充 `/canvas/:id` 关键路径回归保护；本阶段不把 canonical `CanvasDocument` 全量内核重写并入范围。
- Phase 8 阶段 7 按“终版收口、结果优先、长期可维护”的方式实施：继续整理阶段 6 后保留在页面内的 selection、drag、connection 和基础 node actions 控制层，补齐真实 feature contribution 禁用矩阵、后台任务 manifest 契约、关键页面截图、桌面 `file://` hash route 烟测和文档收尾。

## 非目标

- 不实现外部第三方插件系统。
- 不实现插件权限、安全沙箱、插件签名或插件市场分发。
- 不实现已打开页面中的动态卸载能力。
- 不实现正式桌面签名、公证、自动更新或商店发布配置。
- 不进行视觉 redesign。
- 不借重构修复未获批准的产品行为问题。
- 不承诺兼容旧项目或当前本地缓存数据格式。

## 目标架构

目标分层：

```text
src/
  app/
    routes/
    shell/
    feature-registry/
    providers/
  features/
    canvas/
      index.ts
      manifest.ts
      pages/
      components/
      domain/
      stores/
      repositories/
      tests/
    generation/
      index.ts
      manifest.ts
      image/
      video/
      audio/
      shared/
    assets/
    prompts/
    assistant/
    local-agent/
    sync/
    settings/
  shared/
    ui/
    tokens/
    router/
    features/
    commands/
    storage/
    ai/
    platform/
    testing/
```

职责边界：

- `app` 只负责应用壳、provider、路由装配、feature registry 和平台级初始化。
- `features/*` 拥有自己的 manifest、页面、组件、store、domain service、repository、测试和 public API。
- `shared/*` 只放真正跨领域、无单一业务归属的基础能力；feature manifest、route contribution 等跨 feature 注册契约归属 `src/shared/features`。
- feature 之间不得直接 import 对方内部目录。
- 跨 feature 协作只能通过 public API、shared contract、port、repository、command 或事件机制完成。

## 顶级 feature 决策

保留以下顶级 feature：

- `canvas`
- `generation`
- `assets`
- `prompts`
- `assistant`
- `local-agent`
- `sync`
- `settings`

`generation` 继续作为顶级 feature，内部拆成 `image`、`video` 和 `audio` 子领域。这样可以复用生成工作台流程，同时避免把高度相关的生成能力过早拆成多个顶级 feature。

`assets` 是独立 feature，负责素材库、素材选择、素材引用和素材 repository。`AssetPickerModal` 等带有素材领域语义的能力应归属 `assets`，并通过 `features/assets/index.ts` 暴露。

`canvas` 不承载素材选择、生成请求、助手协议或本地 Agent 生命周期等跨领域实现。画布只消费对应 feature 的 public API 或 shared contract。

## Feature Manifest 目标

Phase 8 后，feature manifest 不应只是静态说明，而应真正贡献可注册能力：

- routes
- route loaders
- commands
- toolbar items
- node types
- settings panels
- storage domains
- background tasks
- dependencies

禁用 feature 后：

- 不注册该 feature 的 route。
- 不注册该 feature 的 command。
- 不注册该 feature 的 settings panel。
- 不注册该 feature 的 background task。
- 不删除该 feature 过去写入的数据。

## Public API 规则

每个 feature 必须有单一 public entry：

```text
src/features/<feature-id>/index.ts
```

每个 feature 必须有独立 manifest：

```text
src/features/<feature-id>/manifest.ts
```

`index.ts` 可以导出 manifest 供 app registry 装配；页面级 route component 仍只能通过 manifest 中的 dynamic `loadComponent` 暴露，避免抵消路由分块。

Phase 8 阶段 3 后，边界规则由 `scripts/check-feature-boundaries.cjs` 自动检查，并通过 `npm run check:boundaries` 与 `npm run check` 执行。

允许：

- `features/canvas` import `features/assets` 的 public API。
- `features/generation` import `shared/ai`、`shared/storage`、`features/assets` public API。
- `app` import feature manifest 或 public route contribution。
- feature manifest import `src/shared/features` 中的通用契约。

不允许：

- `features/generation` import `features/canvas/components/...`。
- `features/assets` import `features/canvas/stores/...`。
- `features/*` import `src/app/...`。
- `src/shared/*` import `src/app/...` 或 `src/features/...`。
- `app/routes` 直接 hard-code import 每个业务页面。
- 页面侧绕过 feature public API 直接读取其他 feature 内部 store。

阶段 3 完成时，部分跨 feature 协作仍通过 store 型 public exports 过渡，例如 settings、assets、canvas 和 local-agent 的 UI/session store。该过渡只允许通过 `features/<feature-id>/index.ts` 使用；阶段 4 应把跨 feature store 访问收敛为 repository、domain service、shared contract、port、command 或事件机制。

## 状态层与持久化目标

允许重写状态层，不兼容当前本地数据格式。

目标原则：

- UI/session state 放在 feature store。
- 持久化读写放在 repository。
- 二进制和媒体数据通过 BlobStore 或 media storage adapter 管理。
- sync 依赖 repository/domain service，不直接读取 Zustand store。
- 资源清理依赖统一资源引用收集契约，不让 assets store 直接读取 canvas store。

优先建立：

- `CanvasProjectRepository`
- `AssetRepository`
- `GenerationLogRepository`
- `SettingsRepository`
- `BlobStore`
- `ResourceUsageCollector`

阶段 4 已确认实施边界：

- Blob 存储统一使用新的 `resource_blobs` namespace，不迁移或兼容旧 `image_files`、`media_files` 本地缓存。
- Canvas repository 继续保存当前 `CanvasProject` 运行时结构，canonical `CanvasDocument` 数据模型收敛留给后续画布核心拆解或专门数据模型切片。
- Settings repository 只抽离浏览器端持久化边界，不实现桌面密钥安全存储、Electron IPC 或密钥迁移。
- 资源删除通过全域引用收集判断，只有未被 canvas、assets、generation logs 或调用方额外上下文引用的 Blob 才可删除。
- 阶段 4 不抽象 generation workbench UI，不拆解 Canvas 巨页；这两类工作分别归属后续可复用功能抽取和 Canvas 巨页拆解阶段。

## 可复用能力抽取目标

优先抽取稳定重复能力，而不是抽象所有代码：

- 生成工作台流程：prompt、references、results、logs、settings、task runner。
- 素材选择与媒体引用：asset picker、reference strip、media reference parser。
- 画布资源引用：节点资源、素材资源、提示词资源、媒体 Blob 引用。
- 生成 provider：文本、图片、视频、音频请求的 adapter 边界。
- 设置能力：模型渠道、配置面板、平台差异 adapter。

抽取顺序应先逻辑后 UI：

1. 纯类型、repository、domain service。
2. 可测试 hook。
3. 组合 UI。
4. 页面级装配。

## 实施计划

### 阶段 0：文档与目标冻结

状态：已完成。

范围：

- 新增本文件。
- 更新 `AGENTS.md`、`README.md`、`docs/IMPLEMENTATION_PLAN.md`、`docs/OPEN_DECISIONS.md` 和 `docs/REFACTORING_PLAN.md`。
- 保留 Phase 1-7 历史文档，不清理历史记录。
- 明确 Phase 8 当前阶段的目标、非目标、架构边界、数据策略和验证策略。

验收标准：

- 当前阶段规则已经文档化。
- 用户确认的决策已经记录到开放决策文档。
- 后续代码实现不会被旧阶段描述误导。

### 阶段 1：Feature Manifest 接管路由与入口

状态：已完成。

范围：

- 扩展 `FeatureManifest`，支持 route loader。
- `AppRoutes` 只从 feature registry 获取启用 route。
- 移除 app route 对业务页面的一揽子 hard-code lazy import。
- 建立禁用 feature 的路由测试。

结果：

- `RouteContribution` 已要求提供 `loadComponent`。
- `canvas`、`generation`、`assets` 和 `prompts` 已通过 manifest 贡献页面 loader。
- `AppRoutes` 已移除对业务页面的一揽子 hard-code lazy import，只从启用 feature route 中解析页面组件。
- 新增通用 route pattern 匹配工具，支持 `/canvas/:id` 等动态路径。
- 新增禁用 feature route 不会被解析的单元测试。

验证：

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

验收标准：

- 禁用 feature 后，其页面入口不会注册。
- 首页和应用壳仍由 `app` 管理。
- 功能行为和视觉无有意变化。

### 阶段 2：目录归属重组

状态：已完成。

范围：

- 将 canvas 业务实现迁入 `src/features/canvas`。
- 将 image/video/audio 工作台迁入 `src/features/generation`。
- 将 assets、prompts、settings、sync 等页面和领域能力迁入对应 feature。
- 保持 `app` 仅作为壳层和装配层。

结果：

- `src/app` 已收敛为应用入口、provider、路由装配、feature registry、shell、导航和平台级主题装配；首页作为 shell 聚合页保留在 `src/app/shell/HomePage.tsx`。
- `canvas` 页面、组件、store、类型和工具已迁入 `src/features/canvas`；在线助手、本地 Agent 和素材选择入口已从 canvas 目录迁出。
- `generation` 已按 `image`、`video` 和 `audio` 子领域组织页面、API、设置组件和领域工具。
- `assets` 拥有素材库页面、素材选择弹窗、素材 store 和素材导入导出领域能力。
- `prompts` 拥有提示词页面、提示词 API、提示词卡片、详情弹窗、选择弹窗和画布提示词选择入口。
- `settings` 拥有应用配置弹窗、模型选择器、AI 配置 store、主题 store 和用户状态 store。
- `sync` 拥有 WebDAV 与应用同步服务。
- `assistant` 拥有在线助手面板和 Agent 聊天 UI；`local-agent` 拥有本地 Agent 面板和本地 Agent 会话 store。
- `shared` 已接收跨领域基础能力，包括媒体工具、storage adapter、public asset path、通用 UI、router、platform 和 tokens。
- `src/app/(user)`、`src/components`、`src/services`、`src/stores`、`src/lib`、`src/hooks` 和 `src/constant` 旧横向业务目录已移除。
- 每个已迁移 feature 均建立或补全 `src/features/<feature-id>/index.ts` public entry；阶段 2 只公开当前跨 feature 必需的最小 API，边界硬性检查留到阶段 3。
- feature route loader 继续保持动态导入；页面组件不得从 feature public API 静态导出，以免抵消路由分块。

验证：

- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- `npm run knip`
- 生产 preview 关键入口截图：`test-results/phase-8-stage-2/canvas.png`、`assets.png`、`prompts.png`、`image.png`、`video.png`。

验收标准：

- 业务代码主要位于 `features`。
- `app` 不承载领域实现。
- 路由和导航表现不变。

### 阶段 3：Feature Public API 与边界规则

状态：已完成。

范围：

- 为每个 feature 建立 `index.ts` public API。
- 引入 import boundary 规则。
- 禁止跨 feature 读取内部 `components`、`stores`、`utils`、`services`。
- 修复已有非法跨 feature import。

结果：

- 所有顶级 feature 均具备 `src/features/<feature-id>/index.ts` 和 `src/features/<feature-id>/manifest.ts`。
- `FeatureManifest`、`RouteContribution`、route loader 等注册契约已从 app registry 下沉到 `src/shared/features`，feature manifest 不再反向 import `src/app`。
- `canvas` 页面不再直接 import app shell 组件；`UserStatusActions` 已归属 `settings` feature 并通过 `features/settings/index.ts` 暴露。
- 纯品牌链接 `ZucoLink` 已归属 `src/shared/ui/zuco-link.tsx`。
- `app` 对 settings 内部 store 的直接 import 已改为通过 `features/settings` public API。
- 新增 `scripts/check-feature-boundaries.cjs`，检查 feature 形态与 import boundary，并接入 `npm run check:boundaries` 和 `npm run check`。
- 阶段 3 保留 store 型 public exports 作为阶段 4 前的过渡契约，不把状态层重写并入阶段 3。

验证：

- `npm run check:boundaries`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run check`
- `npm run build`
- `npm run test:e2e`
- `npm run knip`

验收标准：

- 边界规则能自动拦截非法依赖。
- 现有功能通过 public API、shared contract、repository 或 command/event 协作。

### 阶段 4：状态层与 Repository 重构

状态：已完成。

范围：

- 重写 canvas、assets、settings、generation logs 的持久化结构。
- store 聚焦 UI/session state。
- repository/domain service 负责持久化和跨功能数据访问。
- sync 不直接依赖 UI store。
- assets 不直接依赖 canvas store。
- Blob 存储统一到新的 `resource_blobs` namespace。
- 建立统一资源引用收集契约，替代跨 feature 读取 store 的资源清理方式。

建议切片：

1. 建立 `BlobStore`、资源 key 解析、资源引用收集与测试辅助。
2. 抽出 `CanvasProjectRepository`，让 canvas store 成为 repository-backed session cache，继续保留现有 `CanvasProject` shape。
3. 抽出 `AssetRepository`，让 assets store 只维护素材 UI/session cache，移除对 canvas store 的直接依赖。
4. 抽出 image/video `GenerationLogRepository`，把日志序列化、反序列化、读写、删除从页面移入 repository。
5. 抽出 `SettingsRepository`，拆开持久化设置和配置弹窗 UI 状态。
6. 重写 sync domain 装配，使 sync 只依赖 repository/domain service，不直接读取 UI store。
7. 收紧 public API 和边界检查，移除阶段 3 过渡性的跨 feature raw store 访问。
8. 补充 repository/domain 单元测试、资源清理测试、sync domain 测试和关键路径验证。

结果：

- 新增统一 BlobStore，底层使用新的 `resource_blobs` namespace；`image-storage` 和 `file-storage` 保留原 public 函数名，但统一委托到 BlobStore。
- 新增资源引用收集与 collector registry，资源清理改为全域引用判断，并补充资源 key 收集单元测试。
- 新增 `CanvasProjectRepository`，canvas store 改为 repository-backed session cache；Canvas 阶段 4 继续保留当前 `CanvasProject` 运行时 shape。
- 新增 `AssetRepository`，assets store 改为 repository-backed session cache，并移除对 canvas store 的直接依赖。
- 新增 image/video `GenerationLogRepository`，image/video 工作台页面不再直接操作 localforage，删除日志时通过全域资源引用收集避免误删仍被其他数据域引用的 Blob。
- 新增 `SettingsRepository`，config 和 theme 持久化从 Zustand persist 移入 repository；本阶段不实现桌面密钥安全存储、Electron IPC 或密钥迁移。
- sync 服务改为依赖 `CanvasProjectRepository`、`AssetRepository` 和 generation log repositories，不再读取 canvas/assets/generation UI store。
- assets、canvas、settings、local-agent public API 已收窄：跨 feature 调用使用 repository、domain API 或窄 public hook，不再从 feature public API 导出 raw store hook。
- `scripts/check-feature-boundaries.cjs` 已新增规则，禁止 feature public API 导出 `use*Store` raw store hook，并禁止跨 feature import raw store hook。

验收标准：

- 数据域可以独立测试。
- feature 之间没有 store 互相引用。
- 禁用 feature 不删除数据。
- sync 不 import 或读取 canvas/assets/generation/settings UI store。
- 资源清理不删除仍被其他数据域引用的 Blob。
- 功能行为和视觉输出无有意变化。

验证：

- `npm run format:check`
- `npm run lint`
- `npm run check:boundaries`
- `npm run typecheck`
- `npm run test`
- `npm run check`
- `npm run build`
- `npm run test:e2e`
- `npm run knip`

说明：

- `npm run build` 和 `npm run test:e2e` 仍输出既有 Vite chunk size warning；该 warning 不阻塞阶段 4，后续 bundle 拆分如需处理应作为独立性能切片确认。

### 阶段 5：可复用功能抽取

状态：已完成。

范围：

- 抽取 generation workbench 的通用逻辑。
- 抽取素材选择和媒体引用能力。
- 抽取 generation task runner。
- 收敛 settings/model channel 选择能力。
- 收敛 blob/media storage adapter。

用户确认的实施边界：

- 阶段 5 不新增 `/audio` 页面；音频能力只作为未来可接入的契约方向保留。
- 阶段 5 不把 image/video 工作台强行套进单一大而全 `GenericWorkbenchPage`；优先抽取稳定逻辑、可测试 hook 和局部组合 UI，保留子领域页面的明确差异。
- `AssetPickerModal` 可以新增窄 API 支持不同调用方筛选可插入素材类型，但必须保持既有视觉样式和默认行为不变。
- 阶段 5 只做代码结构调整，不进行视觉 redesign，不调整布局、间距、颜色、字体、文案或交互结果，除非为保持等效而进行必要接线。

建议切片：

1. 建立 generation shared 契约和基础工具，收敛工作台 result/log/timer/selection 等通用类型与纯函数。
2. 抽取 generation log 生命周期能力，覆盖日志 list/save/remove/serialize/hydrate 的可测试边界。
3. 抽取媒体引用与素材插入能力，覆盖文件上传、剪贴板读取、素材选择 payload 转换、reference 限制和资源清理上下文。
4. 抽取 task runner 能力，分别支持图片 immediate batch task 和视频 async polling task，避免合并成过度泛化的单一 runner。
5. 抽取可复用 hook 和局部组合 UI，减少 image/video 页面重复，同时保持页面 JSX 的视觉结构等效。
6. 补充单元测试、边界检查、关键页面截图或 E2E 验证，并更新阶段完成文档。

结果：

- 新增 generation workbench shared 复用层，覆盖 result 状态、batch summary、日志 base、日志排序、水合/序列化、reference 上传/分类、即时 batch task runner、轮询 task runner 和 elapsed timer hook。
- image/video 工作台复用 shared result/log/reference/task runner/timer 能力；页面仍保留子领域差异，不引入单一大而全 `GenericWorkbenchPage`。
- video page 和 video API 统一使用 shared polling task runner，保留既有 120 次轮询、Seedance 5 秒/OpenAI 2.5 秒间隔和超时/失败语义。
- 抽取 `GenerationWorkbenchLogPanel` 和 `GenerationWorkbenchModelField`，只复用日志面板外壳和模型选择行，保留 image/video 日志卡片、设置面板和页面 JSX 的视觉结构。
- `AssetPickerModal` 新增 `acceptedKinds` 窄 API；默认不传参时保持既有素材筛选、列表和视觉行为不变。
- 新增 generation shared 单元测试，覆盖 batch summary、result 更新、Seedance reference 文件分类、音频 reference 时长过滤、即时 batch task runner 和轮询 task runner。

验证：

- `npm run check`
- `npm run build`
- `npm run knip`
- `npm run test:e2e`
- image/video 工作台 Playwright 截图：`test-results/phase-8-stage-5/image-workbench.png`、`test-results/phase-8-stage-5/video-workbench.png`

说明：

- `npm run build` 和 `npm run test:e2e` 仍输出既有 Vite chunk size warning；该 warning 不阻塞阶段 5，后续 bundle 拆分如需处理应作为独立性能切片确认。

验收标准：

- image/video 子领域共享稳定流程，audio 作为未来可接入的契约方向保留，不新增 `/audio` 页面。
- 新增生成类型不需要复制整页结构。
- 不出现新的大而全耦合中心。

### 阶段 6：Canvas 巨页拆解

状态：核心等值拆解已完成，阶段 7 已继续细化 selection、drag、connection 和基础 node actions 控制层。

范围：

- 将 `canvas-client-page.tsx` 拆成 session、viewport、selection、history、node actions、generation bridge、agent bridge 和 overlays 等模块。
- 保持画布交互、视觉和生成流程不变。
- 将画布跨领域协作改为消费 public API 和 contract。
- 建立 `/canvas/:id` 工作区关键路径回归保护，覆盖画布打开、新增节点、选择/删除、缩放/小地图和阶段截图。

用户确认的实施边界：

- 阶段 6 可接受重构级别改动，以最终架构结果和 Phase 8 目标达成为优先。
- 阶段 6 是代码层优化，不新增或删减功能，不修改前台视觉交互样式。
- 本阶段保留当前 `CanvasProject` / `CanvasNodeData` 运行时结构，不强行切换为 canonical `CanvasDocument` 持久化模型。
- `CanvasDocument`、`CanvasCommand` 和 `CanvasOps` 继续作为画布核心契约方向；阶段 6 优先把在线助手、本地 Agent 和生成能力移出页面巨页并收敛到桥接层。
- 生成路径的自动化验证默认使用 mock 或 API 拦截，不真实调用外部 AI 服务。
- 可新增 `src/features/canvas/hooks`、`src/features/canvas/bridges` 和 `src/features/canvas/components/workspace` 等目录承载拆解结果。

拆解结果：

- 新增 `/canvas/:id` 工作区 E2E 回归，覆盖画布打开、新建画布、文本节点创建、选中删除、缩放控件和小地图可见性。
- 拆出 `CanvasRefreshShell`、`CanvasTopBar`、`ConnectionCreateMenu`、`CanvasOverlays` 和 `CanvasAgentDock`，让页面视觉装配进入 `src/features/canvas/components/workspace`，保持原有 JSX 输出和样式类名等效。
- 抽出 `canvas-workspace-helpers`，集中承载节点创建、连接归一化、批量节点可见性、生成 metadata、文件 metadata、配置构建、角度提示词等纯函数和常量。
- 抽出 `useCanvasProjectSession`、`useCanvasHistory` 和 `useCanvasViewport`，让项目加载保存、历史提交、视口尺寸和缩放状态从页面 JSX 中分离。
- 抽出 `useCanvasMediaNodes` 和 `useCanvasKeyboardShortcuts`，让媒体上传/拖放/剪贴板文件节点创建与全局快捷键监听离开页面巨页。
- 抽出 `useCanvasImageNodeActions`，集中承载图片下载、反推提示词、裁剪、切图、蒙版编辑、放大和角度生成等图片节点动作。
- 抽出 `useCanvasGenerationRequests` 和 `useCanvasGenerationActions`，将生成请求生命周期、文本/图片/视频/音频生成执行、retry 和由文本生成图片的跨领域逻辑移出页面。
- 抽出 `useCanvasAgentBridge` 和 `useCanvasAssetBridge`，隔离画布对 assets、assistant 和 local-agent public API 的跨领域依赖。
- `canvas-client-page.tsx` 已从阶段前约 5035 行收敛到约 1933 行；阶段 6 后页面保留 workspace 装配、高频 selection/drag/connection 控制和基础 node actions，后续阶段 7 已继续整理这些控制层。
- 阶段截图位于 `test-results/phase-8-stage-6/canvas-workspace.png`。

验证结果：

- `npm run check`
- `npm run build`
- `npm run test:e2e`
- `npm run knip`

建议切片：

1. 补充 Canvas 工作区最小 E2E 与截图基线，先保护 `/canvas/:id` 关键交互。
2. 拆出页面 shell、top bar、连接创建菜单、overlay/modal 装配等视觉组件，保持 JSX 输出等效。
3. 抽出画布纯函数和领域 helper，包括节点创建、连接归一化、批量节点可见性、生成 metadata、文件 metadata 和配置构建。
4. 抽出 session/history/viewport hooks，让项目加载保存、历史提交、视口尺寸和缩放逻辑脱离页面 JSX。
5. 抽出 selection/interaction hooks，让节点拖拽、框选、连接拖拽、快捷键、复制粘贴进入可维护控制层。
6. 抽出 node/media actions，让节点增删改、上传、素材插入、图片处理和 retry 逻辑从页面组件剥离。
7. 抽出 generation bridge 与 agent bridge，集中管理对 generation、assets、assistant 和 local-agent public API 的依赖。
8. 收尾为 `CanvasWorkspace` / `CanvasScene` / `CanvasOverlays` / `CanvasAgentDock` 装配结构，`canvas-client-page.tsx` 只负责路由挂载和页面 shell。
9. 运行完整验证并更新文档。

验收标准：

- 单文件不再承担所有画布职责。
- 关键画布交互回归通过。
- 在线助手、本地 Agent 和生成能力不直接污染画布核心。
- `canvas-client-page.tsx` 收敛为 workspace 装配与高频交互控制入口，生成执行、媒体/图片动作、项目 session、history、viewport、assistant/local-agent/assets 跨领域接线进入 hooks/domain/bridges/components/workspace 对应归属。
- 阶段 6 不引入视觉 redesign，不调整布局、间距、颜色、字体、文案或交互结果，除非为保持等效而进行必要接线。

### 阶段 7：完整验证与收尾

状态：已完成。

范围：

- 类型检查。
- lint。
- 单元测试。
- 关键 E2E。
- 涉及 UI 的视觉截图或视觉对比。
- feature 禁用矩阵测试。
- Web 与桌面 hash route 烟测。
- 文档收尾。

结果：

- Canvas selection、drag、connection、hover toolbar、连接创建菜单和框选等高频交互控制已从 `canvas-client-page.tsx` 收敛到 `src/features/canvas/hooks/use-canvas-interaction-controller.ts`。
- Canvas 基础 node actions 已从 `canvas-client-page.tsx` 收敛到 `src/features/canvas/hooks/use-canvas-node-actions.ts`，覆盖节点新增/删除、连接删除、清空画布、复制粘贴、剪贴板文本、节点 resize、自由缩放、批量图展开/收起、主图切换、文本编辑、prompt/config/fontSize 更新等行为。
- `canvas-client-page.tsx` 已从阶段 6 后约 1933 行继续收敛到约 1080 行；页面保留 workspace 装配、页面状态组合、渲染接线和跨模块 bridge 调用，不再承担 selection/drag/connection 和基础 node actions 的具体实现。
- `FeatureManifest` 补齐 `backgroundTasks` 契约，`FeatureRegistry` 提供 routes、toolbar items、node types、commands、storage domains、settings panels 和 background tasks 的启用 feature contribution 查询。
- `createFeatureRegistry` 单测覆盖真实 feature contribution 禁用矩阵，确保禁用 feature 后不会暴露其 route、command、node type、storage domain、settings panel 或 background task contribution，并继续校验依赖缺失会被拒绝。
- 新增 Stage 7 E2E 截图用例，覆盖首页、画布库、Canvas 工作区、生图工作台、视频创作台、提示词库和素材库；截图位于 `test-results/phase-8-stage-7/`。
- 新增 `scripts/smoke-desktop-hash-routes.cjs` 与 `npm run smoke:desktop-hash-routes`，在生产 `dist/index.html#/...` 上验证 `#/`、`#/canvas`、`#/image`、`#/video`、`#/prompts` 和 `#/assets` 的 `file://` hash route 可加载，并输出桌面 hash route 截图到 `test-results/phase-8-stage-7/`。
- 本阶段不新增或删减功能，不修改前台视觉交互样式，不引入第三方插件系统、运行时开关 UI、正式签名/公证、自动更新或商店发布配置。

验证结果：

- `npm run check`
- `npm run build`
- `npm run knip`
- `npm run test:e2e`
- `npm run smoke:desktop-hash-routes`

验收标准：

- 功能行为无有意变化。
- 视觉输出无有意变化。
- 架构边界由工具和测试保护。
- 项目文档反映当前结构。

## 验证策略

每个代码切片至少包含：

- `npm run typecheck`
- `npm run lint`
- 相关单元测试

涉及 UI 的切片补充：

- Playwright 关键路径。
- 截图或视觉对比。
- 主题切换和移动端关键路径检查，若切片影响主题或响应式布局。

涉及桌面路由或资源加载的切片补充：

- `file://` hash route 烟测。
- 相对资源路径检查。

## 风险与处理原则

- Canvas 交互复杂，拆分应后置，先建立 feature 边界和 repository 边界。
- 允许不兼容当前本地数据格式，但不得误删数据。
- 视觉一致性不能只依赖代码审查，涉及 UI 的切片必须做截图或手测验证。
- 新抽象必须服务于真实重复能力，不为了抽象而抽象。
- 如果实现中出现会改变功能行为、视觉输出、桌面分发、安全边界、模块契约或数据策略的新问题，必须先记录并请求用户确认。
