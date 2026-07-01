# 源项目审计报告

状态：Phase 1 静态只读审计完成；运行时视觉基线已采集。

审计日期：2026-07-01

源项目位置：

- `/Users/simplemin/Desktop/CodeX/IC/`

审计规则见：

- `docs/SOURCE_AUDIT_PROTOCOL.md`

## 0. 审计范围与证据说明

已执行：

- 只读扫描旧项目文件结构、包配置、前端路由、画布源码、存储服务、AI API 服务、本地 Agent、旧文档和部署配置。
- 未修改 `/Users/simplemin/Desktop/CodeX/IC/` 中任何文件。
- 未继承旧项目 `AGENTS.md`。
- 静态审计阶段未安装依赖、未运行 dev server、未生成截图；运行时视觉基线已在后续步骤中使用旧项目临时副本单独采集，见 `docs/VISUAL_BASELINE.md`。

证据标记：

- “已验证”表示来自本地源码、配置或旧文档。
- “推断”表示基于源码结构得出的架构判断，需要在 Phase 2 由用户确认或记录为开放决策。

## 1. 技术栈与包结构

已验证：旧项目不是单一前端包，而是多子项目仓库。

- `web/`：主 Web 应用。Next.js 16.2.3、React 19.2.5、TypeScript、Tailwind CSS v4、Ant Design 6、Ant Design Pro Components beta、Zustand 5、TanStack Query、axios、localforage、lucide-react、motion、nanoid、fflate、file-saver、CodeMirror。
- `canvas-agent/`：本地 Agent。TypeScript、Node >=18、Express 5、`@modelcontextprotocol/sdk`、`@openai/codex`、zod、tsx。
- `docs/`：文档站。Next.js 16、Fumadocs、Tailwind CSS v4。
- `plugins/infinite-canvas/`：Codex app 插件，包含插件说明、图标和 skills。
- 根目录：Dockerfile、docker-compose、Render 配置、版本和变更日志；根目录没有 `package.json`。

已验证：前端脚本位于 `web/package.json`：

- `dev`: `next dev --webpack -H 0.0.0.0 -p 3000`
- `build`: `next build`
- `start`: `next start`
- `format`: `prettier --write .`
- `format:check`: `prettier --check .`

已验证：`web/next.config.ts` 使用 `output: "standalone"`，开发态允许任意 dev origin，并设置 `typescript.ignoreBuildErrors: true`。这会降低构建时类型错误的阻断能力。

技术栈评估：

- React + TypeScript 与现有实现高度绑定，迁移成本最低。
- Next.js 当前主要价值是路由、少量 Route Handler、standalone Docker 部署和文档站同栈；但画布核心功能本身是纯客户端 DOM/SVG/Blob/IndexedDB 逻辑，不强依赖 Next SSR。
- Tailwind + Ant Design + shadcn/Radix 风格混用，带来实现速度，但样式来源分散。
- Zustand/localforage 足以支撑现有本地优先数据模型，但当前 store、媒体 Blob、object URL 和清理逻辑耦合较强。
- 桌面分发尚无实现。目标桌面运行时应重点评估 IndexedDB/Blob、文件导入导出、本地 Agent、SSE、API Key 存储和跨域请求。

## 2. 应用入口与运行方式

已验证入口：

- 根布局：`web/src/app/layout.tsx`，加载 Ant Design reset、全局 CSS、主题初始化脚本和 `AppProviders`。
- Provider：`web/src/components/layout/app-providers.tsx`，提供 Ant Design、ProConfigProvider、React Query、客户端初始化。
- 用户区布局：`web/src/app/(user)/layout.tsx`，包含顶部导航。
- 画布项目库：`web/src/app/(user)/canvas/page.tsx`。
- 单个画布：`web/src/app/(user)/canvas/[id]/page.tsx` -> `canvas-client-page.tsx`。

已验证路由：

- `/`：用户首页。
- `/canvas`：画布项目库。
- `/canvas/[id]`：单个无限画布。
- `/image`：生图工作台。
- `/video`：视频创作台。
- `/prompts`：提示词库。
- `/assets`：我的素材。
- `/api/prompts`：远程提示词源抓取和内存缓存。
- `/webdav-proxy`：可选 WebDAV 代理。

已验证部署方式：

- Docker 构建阶段使用 `oven/bun:1.3.13` 安装和构建 `web/`。
- 运行阶段使用 `node:22-bookworm-slim` 启动 Next standalone `server.js`。
- 默认端口 3000。

## 3. 功能清单

### 3.1 多画布项目库

- 用途：创建、进入、重命名、批量选择、删除、导入、导出画布项目。
- 文件：`web/src/app/(user)/canvas/page.tsx`、`components/canvas-project-card.tsx`、`components/canvas-delete-projects-dialog.tsx`、`utils/canvas-export.ts`、`stores/use-canvas-store.ts`。
- UI 表面：画布库页面、项目卡片、导入文件选择器、删除确认弹窗。
- 命令/快捷键：页面按钮；无全局快捷键。
- 状态依赖：`useCanvasStore.projects`、`useCanvasUiStore.selectedProjectIds/deleteProjectIds`。
- 持久化依赖：localforage `infinite-canvas:canvas_store`；导入导出 zip 内 `projects.json` 和媒体文件。
- 资源依赖：图片/媒体 Blob 通过 `image_files`、`media_files` store。
- 样式依赖：Tailwind、Ant Design、全局主题。
- 外部库依赖：fflate、file-saver、localforage。
- 已知耦合点：项目数据和媒体文件导入导出同页面逻辑耦合；旧文档描述 JSON 导入导出，代码实际使用 zip。
- 建议目标模块边界：`projects` 功能模块 + `canvas-import-export` 服务 + `media-storage` 端口。
- 等效验证步骤：新建/重命名/删除/批量删除；导出含图片/视频/音频的画布，再导入并确认节点、连线、媒体可展示。

### 3.2 无限画布视图与导航

- 用途：平移、滚轮缩放、重置缩放、小地图、点阵/网格/空白背景、浅深主题。
- 文件：`components/infinite-canvas.tsx`、`canvas-zoom-controls.tsx`、`canvas-mini-map.tsx`、`canvas-toolbar.tsx`、`lib/canvas-theme.ts`。
- UI 表面：画布背景、底部工具栏、缩放控件、小地图、画布外观面板。
- 命令/快捷键：空白处拖拽平移、滚轮缩放、缩放滑杆、重置视图按钮。
- 状态依赖：`viewport` 本地 state、项目 `backgroundMode/showImageInfo/viewport`。
- 持久化依赖：项目 store；viewport 500ms debounce 写回。
- 样式依赖：`canvasThemes`、Tailwind、内联 transform。
- 外部库依赖：React DOM，无专用画布库。
- 已知耦合点：视图状态既在页面本地 state，又周期性写回项目 store；画布背景样式和主题常量绑定。
- 建议目标模块边界：`canvas-viewport`、`canvas-background`、`canvas-minimap`。
- 等效验证步骤：不同缩放比例下拖拽/滚轮/重置/小地图定位；刷新后恢复视口和背景。

### 3.3 节点模型与节点渲染

- 用途：图片、文本、配置、视频、音频五类节点的展示、编辑、缩放、状态显示。
- 文件：`types.ts`、`constants.ts`、`components/canvas-node.tsx`、`canvas-node-prompt-panel.tsx`、`canvas-config-node-panel.tsx`。
- UI 表面：节点卡片、连接点、四角缩放区、节点内容、错误/加载/空状态、节点下方生成面板。
- 命令/快捷键：双击文本编辑；双击有图图片打开预览；四角拖拽缩放。
- 状态依赖：`CanvasNodeData`、`CanvasNodeMetadata`。
- 持久化依赖：节点数组写入画布项目。
- 资源依赖：图片/视频/音频 `content` 展示 URL 和 `storageKey`。
- 样式依赖：`canvasThemes`、硬编码选中蓝 `#2f80ff`、大量 Tailwind 类。
- 外部库依赖：lucide-react、Ant Design、原生 `<img>/<video>/<audio>`。
- 已知耦合点：`metadata` 同时承载展示内容、生成参数、批量图片关系、媒体信息、错误状态和引用关系。
- 建议目标模块边界：`canvas-domain` 定义节点类型；各 node renderer 独立注册。
- 等效验证步骤：五类节点创建、展示、缩放、编辑、错误重试、媒体播放。

### 3.4 选择、拖拽、连线、剪贴板和历史

- 用途：选择/多选/框选/删除/复制粘贴/拖拽移动/连接节点/右键菜单/撤销重做。
- 文件：主要集中在 `canvas-client-page.tsx`，部分在 `canvas-connections.tsx`、`canvas-context-menu.tsx`。
- UI 表面：连线 SVG、活动连线、右键菜单、框选矩形。
- 命令/快捷键：`Ctrl/Cmd` 拖动框选、`Shift/Ctrl/Cmd` 点击追加选择、`Ctrl/Cmd+A/C/V/Z/Y`、`Delete/Backspace`、`Esc`。
- 状态依赖：本地 state、refs、`historyRef`。
- 持久化依赖：节点/连线变化写入项目 store；历史只在内存中。
- 资源依赖：粘贴图片会写入图片 store。
- 样式依赖：SVG path、selection fill/stroke token。
- 外部库依赖：nanoid、browser Clipboard API。
- 已知耦合点：交互事件、历史提交、持久化写回、浮层关闭逻辑都在 `canvas-client-page.tsx`。
- 建议目标模块边界：`interaction-controller`、`history-service`、`clipboard-service`、`connection-model`。
- 等效验证步骤：所有快捷键；多选拖动；复制粘贴节点和连线；删除连接；撤销/重做跨节点、连线、背景和助手会话。

### 3.5 配置节点与资源引用

- 用途：汇总上游文本/图片/视频/音频，组装提示词，配置模型、比例、数量等生成参数。
- 文件：`canvas-config-node-panel.tsx`、`canvas-config-composer.tsx`、`canvas-node-generation.ts`、`canvas-resource-references.ts`。
- UI 表面：配置节点面板、contentEditable 提示词组装器、`@` 引用菜单、输入摘要 chip。
- 命令/快捷键：`@` 引用，方向键/Enter 选择引用。
- 状态依赖：节点 `metadata.composerContent/generationMode/model/size/count/...`，上游 `connections`。
- 持久化依赖：节点 metadata。
- 资源依赖：引用资源由上游节点内容计算。
- 样式依赖：`canvasThemes`、Tailwind、Ant Design。
- 外部库依赖：ModelPicker、设置 popover。
- 已知耦合点：资源引用编号、生成上下文、UI chip 和 prompt 序列化互相依赖。
- 建议目标模块边界：`resource-reference`、`prompt-composer`、`generation-config`.
- 等效验证步骤：连接不同资源后引用编号稳定；`@` 插入/删除；配置节点生成文本/图片/视频/音频。

### 3.6 AI 图片/文本/视频/音频生成

- 用途：文本问答、文生图、图生图/参考图编辑、视频生成、音频生成、取消和重试。
- 文件：`canvas-client-page.tsx`、`services/api/image.ts`、`services/api/video.ts`、`services/api/audio.ts`、`stores/use-config-store.ts`。
- UI 表面：节点下方生成面板、配置节点生成按钮、加载/错误状态、配置弹窗。
- 命令/快捷键：按钮触发；Agent 工具可触发 `run_generation`。
- 状态依赖：全局 AI config、节点 metadata、连接上下文、AbortController map。
- 持久化依赖：生成结果写入图片/媒体 store，节点 metadata 记录生成参数。
- 资源依赖：参考图片/视频/音频、Blob、data URL 转换。
- 样式依赖：加载和错误状态组件。
- 外部库依赖：axios、fetch SSE、OpenAI 兼容接口、Gemini、Seedance/火山 Agent Plan。
- 已知耦合点：生成编排、节点布局、错误恢复、媒体存储、全局配置和 UI 状态在同一页面函数中交织。
- 建议目标模块边界：`generation-orchestrator` + provider adapters + `media-storage` + node result writers。
- 等效验证步骤：空图片节点回填、多图批量、参考图编辑、文本流式、视频轮询、音频生成、取消、失败重试、刷新后 loading 变 error。

### 3.7 图片工具链

- 用途：上传/替换、下载、保存素材、复制提示词、反推提示词、局部蒙版编辑、裁剪、切图、放大、多角度、查看大图、快捷工具配置。
- 文件：`canvas-node-hover-toolbar.tsx`、`canvas-image-toolbar-tools.tsx`、`canvas-node-crop-dialog.tsx`、`canvas-node-mask-edit-dialog.tsx`、`canvas-node-split-dialog.tsx`、`canvas-node-upscale-dialog.tsx`、`canvas-node-angle-dialog.tsx`、`canvas-image-data.ts`。
- UI 表面：节点悬浮工具栏、工具设置 Modal、各处理弹窗。
- 命令/快捷键：悬浮按钮。
- 状态依赖：节点 metadata、`IMAGE_QUICK_TOOLS_STORAGE_KEY`。
- 持久化依赖：快捷工具配置存在 `localStorage`；处理结果写入图片 store。
- 资源依赖：Canvas 2D、图片 Blob/data URL。
- 样式依赖：悬浮工具栏硬编码白底和阴影、部分硬编码蓝色。
- 外部库依赖：Ant Design、lucide、copy-to-clipboard、file-saver。
- 已知耦合点：工具定义是可配置的，但执行 handler 仍集中在 `canvas-client-page.tsx`。
- 建议目标模块边界：`image-tools` 功能注册工具定义、UI、handler。
- 等效验证步骤：每个工具产生预期新节点/连接；快捷工具配置保存；未实现“AI 超分”仍显示暂未实现。

### 3.8 在线画布助手

- 用途：右侧在线助手读取画布状态、回答问题、通过工具修改画布、创建生成流程、维护会话历史。
- 文件：`canvas-assistant-panel.tsx`、`canvas-agent-chat-ui.tsx`、`services/api/image.ts`。
- UI 表面：右侧 Agent 面板、在线/本地模式切换、会话历史、日志、确认工具调用。
- 命令/快捷键：聊天输入 Enter 发送；工具调用可由模型触发。
- 状态依赖：项目内 `chatSessions/activeChatId`、`useCanvasAgentStore.confirmTools`。
- 持久化依赖：助手会话保存在画布项目中。
- 资源依赖：选中图片/文本节点作为引用，图片转 data URL。
- 样式依赖：`canvasThemes`、motion 动画、Ant Design。
- 外部库依赖：OpenAI Responses/Gemini 工具调用、copy-to-clipboard。
- 已知耦合点：在线助手复制了一套本地 Agent 工具 schema 与 op 转换逻辑。
- 建议目标模块边界：`assistant-online`，依赖统一 `canvas-ops` 契约。
- 等效验证步骤：读取画布、选中节点引用、确认/拒绝写操作、撤销上次工具操作、会话持久化。

### 3.9 本地 Canvas Agent 与 Codex 集成

- 用途：通过本地 Express/SSE 服务连接 Codex app-server / MCP，让 Agent 操作当前画布。
- 文件：`canvas-agent/`、`components/canvas-local-agent-panel.tsx`、`stores/use-canvas-agent-store.ts`、`utils/canvas-agent-ops.ts`、`plugins/infinite-canvas/`。
- UI 表面：本地连接设置、对话、历史、日志、待确认工具卡、紧凑连接状态。
- 命令/快捷键：聊天输入；Codex 插件可携带 `agentUrl/agentToken` 自动连接。
- 状态依赖：`useCanvasAgentStore`、当前画布 snapshot、agent workspace/thread。
- 持久化依赖：localStorage `canvas-agent-url`、`canvas-agent-token`、`canvas-agent-panel-width`；本地 Agent 配置保存到用户目录。
- 资源依赖：附件图片 data URL，SSE，MCP 工具。
- 样式依赖：`canvasThemes`、motion、Ant Design。
- 外部库依赖：Express、MCP SDK、`@openai/codex`、zod。
- 已知耦合点：同一 ops 契约在前端、在线助手、本地 agent schemas 三处维护。
- 建议目标模块边界：`local-agent-bridge` + `canvas-ops-contract`；桌面端需决定是否内置 sidecar。
- 等效验证步骤：手动/URL 自动连接、读取画布状态、应用工具、确认/撤销、线程历史、断线恢复。

### 3.10 我的素材

- 用途：保存文本、图片、视频素材；搜索、筛选、编辑、删除、下载、插入画布。
- 文件：`web/src/app/(user)/assets/page.tsx`、`stores/use-asset-store.ts`、`components/asset-picker-modal.tsx`、`asset-transfer.ts`。
- UI 表面：素材页面、画布中的素材选择 Modal、节点“存素材”按钮。
- 命令/快捷键：按钮操作。
- 状态依赖：`useAssetStore.assets`。
- 持久化依赖：localforage `infinite-canvas:asset_store` + 图片/媒体 store。
- 资源依赖：图片/视频 Blob。
- 样式依赖：Tailwind、Ant Design。
- 外部库依赖：localforage、file-saver。
- 已知耦合点：素材清理动态导入画布 store，素材和画布互相作为媒体引用保活来源。
- 建议目标模块边界：`assets` 模块依赖 `media-storage` 和 `canvas-insert` 端口。
- 等效验证步骤：从画布保存素材、素材页编辑/删除、从素材插入画布并保留媒体。

### 3.11 全局配置、模型渠道与 WebDAV 同步

- 用途：配置多个 OpenAI/Gemini 渠道、模型能力列表、默认生成偏好、WebDAV 同步。
- 文件：`stores/use-config-store.ts`、`components/layout/app-config-modal.tsx`、`services/app-sync.ts`、`services/webdav-sync.ts`、`app/webdav-proxy/route.ts`。
- UI 表面：配置与用户偏好 Modal。
- 命令/快捷键：顶部设置按钮。
- 状态依赖：`useConfigStore.config/webdav`。
- 持久化依赖：Zustand persist 默认 localStorage。
- 资源依赖：WebDAV manifest、媒体文件。
- 样式依赖：Ant Design、Tailwind。
- 外部库依赖：axios/fetch、localforage。
- 已知耦合点：配置既服务非画布工作台，也直接影响画布生成；WebDAV sync 跨画布、素材、图片工作台、视频工作台。
- 建议目标模块边界：`settings`、`model-registry`、`sync-webdav`。
- 等效验证步骤：新增渠道、拉取模型、按能力选择模型、保存默认偏好、WebDAV 测试和同步。

### 3.12 提示词库、生图工作台、视频创作台

- 用途：旧 Web 应用中的非画布创作和素材来源页面。
- 文件：`web/src/app/(user)/prompts/page.tsx`、`image/page.tsx`、`video/page.tsx`、`services/api/prompts.ts`、`app/api/prompts/route.ts`。
- UI 表面：顶部导航中的“生图工作台”“视频创作台”“提示词库”。
- 状态依赖：配置 store、素材 store、localforage 日志。
- 持久化依赖：`image_generation_logs`、`video_generation_logs`。
- 资源依赖：远程提示词仓库、图片/视频媒体。
- 已知耦合点：WebDAV 同步包含这些页面数据；画布提示词选择依赖 `CanvasPromptLibrary`。
- 建议目标模块边界：迁移范围需要用户确认；若保留，应作为画布外功能模块。
- 等效验证步骤：提示词搜索/筛选/复制/加入素材；生图和视频日志；与 WebDAV 同步。

## 4. UI 表面清单

已验证 UI 表面：

- App 顶部导航：Logo、主导航、文档、设置、主题、版本、GitHub。
- 画布项目库：项目卡片、新建、导入、导出选中、删除选中/全部、空状态。
- 单画布顶栏：菜单、标题双击编辑、文档/配置/主题/版本/GitHub/快捷键、Agent 按钮。
- 画布主体：背景网格、节点、SVG 连线、框选矩形、连接创建菜单。
- 底部工具栏：选择、撤销/重做、添加文本/图片/视频/音频/配置、上传、素材、外观、删除、清空。
- 缩放控件和小地图。
- 节点悬浮工具栏和快捷工具设置。
- 节点信息 Modal、图片预览 Modal、清空确认 Modal、图片处理类 Dialog。
- 节点生成面板、配置节点面板、prompt composer、资源 mention 菜单。
- 右侧在线/本地 Agent 面板。
- 全局配置 Modal。
- 我的素材、提示词库、生图工作台、视频创作台页面。

## 5. 画布与核心交互模型

已验证：

- 画布是 DOM/SVG 实现，不使用 Canvas/WebGL 或第三方流程图库。
- 世界坐标由 `ViewportTransform { x, y, k }` 管理，子内容用 CSS `translate(...) scale(...)`。
- 节点是绝对定位 DOM 元素，连线是 SVG path，连线端点由节点位置和尺寸实时计算。
- 可视节点有简单视口裁剪：只渲染进入视口 padding 范围的节点。
- 配置节点不能与配置节点连接；连线规范化逻辑会尽量让配置节点作为下游。
- 当连线拖拽未命中节点时，会弹出创建下游节点菜单。
- 批量生图使用根节点 + 子节点模型，折叠时隐藏子节点和相关连线。

推断：

- 目标架构不必引入重型画布库即可保持等效；但应拆出交互控制器，避免页面组件继续承载所有行为。

## 6. 状态管理与持久化模型

已验证：

- 画布项目持久化：`useCanvasStore` + localforage `app_state`，key `infinite-canvas:canvas_store`。
- 项目字段：`id/title/createdAt/updatedAt/nodes/connections/chatSessions/activeChatId/backgroundMode/showImageInfo/viewport`。
- 画布编辑中的 nodes/connections/chatSessions 等先存在页面本地 state，再同步写回项目 store。
- 图片 Blob：localforage `image_files`，storageKey 形如 `image:<id>`。
- 媒体 Blob：localforage `media_files`，storageKey 形如 `video:<id>`、`audio:<id>` 等。
- 素材持久化：localforage `app_state`，key `infinite-canvas:asset_store`。
- AI 配置和 WebDAV 配置：Zustand persist 默认 localStorage，key `infinite-canvas:ai_config_store`。
- 主题：localStorage，key `infinite-canvas:theme_store`。
- Agent 面板部分设置：localStorage `canvas-agent-url/token/panel-width`。
- WebDAV 同步：按 domain 写 manifest，domain 包括 `canvas`、`assets`、`image-workbench`、`video-workbench`。

风险：

- `content` 字段常是本次会话的 `blob:` URL，不是长期标识；长期标识是 `storageKey`。
- 清理媒体依赖跨 store 全量引用扫描，功能模块裁剪时必须保留统一引用收集契约。

## 7. 命令、快捷键与工具交互

已验证快捷键：

- 拖动画布空白处：平移视图。
- 鼠标滚轮：缩放。
- `Ctrl/Cmd` + 拖动：框选。
- `Shift/Ctrl/Cmd` + 点击节点：追加/取消选择。
- `Ctrl/Cmd + A`：全选节点。
- `Ctrl/Cmd + C/V`：复制/粘贴节点；无内部剪贴板时尝试系统剪贴板文本/图片。
- `Ctrl/Cmd + Z`：撤销。
- `Ctrl/Cmd + Shift + Z`、`Ctrl/Cmd + Y`：重做。
- `Delete/Backspace`：删除选中节点或连线。
- `Esc`：取消选择并关闭浮层。
- 拖入图片/视频/音频：上传到画布。

已验证 Agent 工具契约：

- 读工具：`canvas_get_state`、`canvas_get_selection`、`canvas_export_snapshot`。
- 写工具：`canvas_apply_ops` 以及创建节点、更新文本、移动、缩放、删除、连接、选择、设置视口、触发生成等语义工具。
- op 类型：`add_node`、`update_node`、`delete_node`、`delete_connections`、`connect_nodes`、`set_viewport`、`select_nodes`、`run_generation`。

## 8. 资源清单

已验证静态资源：

- `web/public/logo.svg`
- `web/public/icons/openai.svg`
- `web/public/icons/gemini.svg`
- `web/public/icons/grok.svg`
- `web/public/icons/deepseek.svg`
- `web/public/icons/glm.svg`
- `web/public/icons/claude.svg`
- `web/public/icons/linuxdo.svg`
- `docs/public/logo.svg`
- `docs/public/github.svg`
- `docs/public/qq.svg`
- `plugins/infinite-canvas/assets/icon.png`

运行时资源：

- 用户上传或生成的图片/视频/音频 Blob。
- 远程提示词源的封面和结果图。
- WebDAV manifest 和媒体文件。
- 本地 Agent 附件图片 data URL。

## 9. 样式来源与设计常量

已验证样式来源：

- `web/src/app/globals.css`：Tailwind v4、tw-animate-css、shadcn/tailwind.css、全局 CSS 变量、滚动条、prompt tag、canvas 控件、popover、批量图片动画。
- `web/src/lib/app-theme.ts`：Ant Design token 和组件 token 覆盖。
- `web/src/lib/canvas-theme.ts`：画布 light/dark 专用颜色。
- `web/src/components/ui/*`：shadcn/Radix 风格基础 UI 和自定义动画。
- 组件内 Tailwind 原子类和内联 style：大量散落在画布节点、工具栏、弹层、Agent 面板中。

候选设计常量：

- 画布背景：light `#f4f2ed`，dark `#181715`。
- 节点面板/填充/描边/文本/占位色：`canvasThemes.node`。
- 工具栏面板/边框/hover/active：`canvasThemes.toolbar`。
- 选中蓝：`#2f80ff` 多处硬编码。
- 主要半径：节点 `rounded-3xl`，工具栏 `rounded-xl`，浮层 `rounded-2xl`/`18px`。
- 阴影：工具栏、节点、浮层多套硬编码阴影。
- z-index：40/50/70/90/100/120 等散落。
- 节点默认尺寸：图片 340x240、文本 340x240、配置 340x240、视频 420x236、音频 340x120。
- 画布缩放范围：0.05 到 5。
- 连接命中：handle 半径 40px、节点 padding 32px。

推断：

- Token 抽取应先以“等值收拢”为目标，至少分为 app token、canvas token、node token、toolbar token、motion/z-index token。

## 10. 可复用组件与重复热点

既有可复用组件：

- `ModelPicker`
- 图片/视频/音频设置面板和 popover。
- `CanvasResourceMentionTextarea`
- `CanvasPromptLibrary`
- `AssetPickerModal`
- `CanvasToolbar`
- `CanvasNodeHoverToolbar`
- `AgentChat*` 系列组件。
- `AnimatedThemeToggler`、`Select`、`DiaTextReveal`。

重复热点：

- `buildNodeConfig` 在配置节点面板和节点生成面板中重复。
- 在线助手和本地 Agent 各有一套工具 schema / op 转换 /工具说明。
- `canvas-client-page.tsx` 中生成配置、节点布局、错误处理、媒体上传元数据转换有大量可拆服务。
- 浮层、悬浮工具栏、Modal、chip、图标按钮样式模式重复。

## 11. 耦合风险

高风险耦合：

- `canvas-client-page.tsx` 超过 3200 行，承担加载项目、状态同步、历史、交互、生成、媒体上传、Agent ops、UI 弹窗、工具栏编排。
- `CanvasNodeMetadata` 是跨功能大杂烩，缺少按节点类型或功能 namespace 的约束。
- 生成逻辑直接读写节点布局和状态，难以构建时删除视频/音频/Agent 等功能。
- 图片/媒体存储和素材清理跨画布、素材、助手、工作台，引用收集没有统一模块契约。
- 在线助手、本地 Agent、MCP schemas 三处维护相似工具契约。
- 样式值来源分散，Token 等值抽取需要覆盖 CSS、TS 常量、组件内联 style。
- Next Route Handler 只承担少量功能，但与部署/同步/提示词库有耦合；桌面方案需决定是否保留。

中风险耦合：

- 全局配置同时服务画布、工作台、助手、WebDAV。
- WebDAV 同步包含非画布页面数据，目标迁移范围不明确时会影响模块边界。
- `next.config.ts` 忽略 TypeScript 构建错误，可能掩盖迁移风险。

## 12. 候选模块边界

建议 Phase 2 评估以下目标边界：

- `app-shell`：导航、主题、全局配置入口、版本、文档链接。
- `settings`：渠道、模型、默认生成参数、WebDAV 配置。
- `project-library`：多画布管理、导入导出。
- `canvas-domain`：节点、连线、项目、viewport、history、ops 契约。
- `canvas-renderer`：DOM/SVG 画布、节点渲染、连线、小地图。
- `canvas-interactions`：选择、拖拽、缩放、连线、快捷键、剪贴板。
- `node-types`：text/image/config/video/audio 以注册方式提供 renderer、toolbar actions、生成入口、资源能力。
- `generation`：prompt context、provider adapters、任务/取消/重试、结果写入端口。
- `media-storage`：图片/视频/音频 Blob、object URL、水合、清理、导入导出。
- `assets`：素材库和画布插入端口。
- `assistant-online`：在线工具调用和会话。
- `local-agent-bridge`：本地 Agent 连接、SSE、Codex thread。
- `sync-webdav`：跨 domain 同步。
- `design-system`：Token、基础控件、浮层、工具栏、节点框架。

## 13. 候选共享组件

- `IconButton` / `ToolbarButton`
- `FloatingToolbar`
- `FloatingPanel`
- `ConfirmDialog`
- `AsyncStatusView`
- `ModelControlGroup`
- `MediaSettingsControl`
- `NodeFrame`
- `NodeResizeHandles`
- `ConnectionHandles`
- `MentionTextarea`
- `ResourceReferenceMenu`
- `SegmentedToolbarControl`
- `ImagePreviewDialog`
- `AgentToolApprovalCard`

## 14. 候选设计 Token

- `color.canvas.background`
- `color.canvas.grid.dot/line`
- `color.canvas.selection.stroke/fill`
- `color.node.fill/panel/stroke/activeStroke/text/muted/faint/placeholder`
- `color.toolbar.panel/border/item/itemHover/activeBg/activeText`
- `color.accent.selectionBlue`
- `radius.node/card/toolbar/panel/chip/button`
- `shadow.toolbar/floatingPanel/nodeActive/nodeRelated/imageToolbar`
- `zIndex.topbar/toolbar/nodeToolbar/modalOverlay/mentionMenu/contextMenu`
- `size.node.default.{image,text,config,video,audio}`
- `size.canvas.connectionHandleHitRadius`
- `motion.batchChildIn/out`

## 15. 桌面打包影响

已验证影响点：

- 当前 Web 依赖浏览器能力：IndexedDB/localforage、Blob、object URL、FileReader、Clipboard API、drag/drop、`<video>/<audio>` metadata。
- AI 请求由前端直连用户配置的 Base URL 和 API Key；桌面端需要决定 API Key 是否继续存在 Web localStorage，或改用桌面安全存储。
- WebDAV 有 direct 和 Next.js proxy 两种模式；桌面端可能不需要 Next proxy，但仍需处理 CORS/证书/网络错误。
- 本地 Agent 当前是独立 Node/Express 服务，监听 `127.0.0.1:17371`，通过 token、SSE 和 HTTP 与网页通信。
- Codex 插件依赖 `npx -y @basketikun/canvas-agent mcp` 和网页 URL 自动连接。
- Docker/Render 部署不解决桌面打包。

桌面运行时决策依据：

- 若优先保持 Web 技术和快速集成本地 Node/Agent，Electron 可能更贴近当前依赖形态，但包体和资源成本较高。
- 若优先轻量分发，Tauri 需要验证 IndexedDB/Blob、下载/文件系统、sidecar、SSE、跨域请求和三平台签名打包。
- 无论选择哪种，核心画布、生成、存储、Agent bridge 应先抽成运行时无关模块。

## 16. 测试、Lint 与验证缺口

已验证：

- 旧项目没有发现测试文件，只有 `docs/content/docs/progress/pending-test.mdx`。
- `web/package.json` 没有 lint、test、typecheck 脚本。
- `docs/package.json` 有 `types:check`。
- `canvas-agent/package.json` 有 `build`，使用 `tsc -p tsconfig.json`。
- `web/next.config.ts` 设置 `typescript.ignoreBuildErrors: true`。

验证缺口：

- 行为等效测试缺失。
- 视觉回归基线缺失。
- 画布交互自动化缺失。
- 媒体存储、水合、清理测试缺失。
- Agent ops 契约测试缺失。
- AI provider adapter 单元测试缺失。
- 桌面打包验证缺失。

## 17. 已发现问题与后续修复项

仅记录，不在等效重构阶段自动修复：

- 旧文档与代码不一致：旧文档仍描述“三类节点”或节点类型不含 audio，代码实际有五类节点。
- 旧文档导入导出描述偏 JSON，代码实际导出 zip + `projects.json` + 媒体文件。
- README 提到根目录 `vercel.json`，静态扫描未发现该文件。
- `AI 超分`工具在 UI 中存在入口，但 Modal 内容为“暂未实现”。
- 前端构建忽略 TypeScript 错误。
- 画布核心页面过大，维护和模块裁剪风险高。
- 在线助手、本地 Agent、MCP 三套工具契约存在漂移风险。

## 18. 架构决策输入

Phase 2 决策应基于以下事实：

- 画布核心是纯客户端 DOM/SVG 模型，不强依赖服务端渲染。
- 旧项目包含画布外页面和服务：素材、提示词、生图工作台、视频工作台、WebDAV、docs、Codex 插件、本地 Agent。目标迁移范围需要先确认。
- 构建时删除功能要求每个功能声明：UI 表面、节点类型扩展、命令/快捷键、状态读写、持久化、媒体资源、生成 provider、Agent ops。
- 未来运行时开关要求模块不能直接互相 import 业务 store；应通过注册表、端口或事件边界连接。
- 设计 Token 初期必须等值抽取，不能趁机调整现有视觉。
- 生成能力跨图片、文本、视频、音频和多 provider；应优先设计 provider adapter 和任务生命周期。
- 媒体存储是核心基础设施，应早于功能迁移定型。
- Agent 能力应依赖统一 `canvas-ops-contract`，避免在线/本地/服务端 schemas 分裂。
- 桌面运行时选择必须同时评估 Web 技术栈、媒体存储、API Key 保存、本地 Agent 和三平台打包。

仍需用户或 Phase 2 关闭的决策见 `docs/OPEN_DECISIONS.md`。
