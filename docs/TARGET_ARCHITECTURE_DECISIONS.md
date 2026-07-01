# Phase 2 目标架构决策

状态：已确认。

日期：2026-07-01

依据：

- `docs/SOURCE_AUDIT_REPORT.md`
- `docs/VISUAL_BASELINE.md`
- `docs/OPEN_DECISIONS.md`
- 官方资料：Vite、Next.js、Tauri、Electron 文档。

## 决策原则

- 优先保持旧项目行为和视觉等效。
- 优先降低模块间直接依赖，而不是追求一次性大重写。
- 初期支持构建时包含或排除功能模块。
- 架构保留后续运行时启用或禁用功能的能力。
- Web 与桌面共享核心业务、画布、组件、设计 Token、模块注册体系和 UI 表面。
- Web 与桌面不做产品功能差异化；平台差异只能隐藏在 adapter 内部。
- 平台能力通过明确 adapter 暴露，不让画布核心直接依赖浏览器、Node 或 Electron API。

## 已确认结论

| 决策项 | 结论 |
| --- | --- |
| 目标前端技术栈 | React + TypeScript + Vite |
| 桌面运行时 | Electron |
| Web 与桌面关系 | 同一功能集合、同一核心代码、同一 UI 表面 |
| 首轮迁移范围 | 主画布、素材库、提示词库、生图工作台、视频创作台、WebDAV、配置、在线助手、本地 Agent、导入导出 |
| 非首轮应用迁移范围 | 旧文档站、Codex app 插件 |
| 画布渲染策略 | 保留 DOM/SVG/CSS transform，先不切换 Canvas/WebGL |
| UI 与样式 | 保留 Tailwind + Ant Design 的等效基础，建立本地 Token 与组件封装层 |
| 状态管理 | 继续使用 Zustand，但拆成领域 store 与服务接口 |
| 持久化 | 建立 Repository/BlobStore adapter，旧 localforage 经验迁入接口实现 |
| 功能模块化 | 使用功能 manifest + 注册表 + 命令契约 |
| AI 请求 | 通过 AI provider adapter 隔离；Web 允许浏览器本地保存 API Key，桌面通过 Electron adapter 管理密钥和请求 |
| 本地 Agent | 桌面端内置；Web 端保留同一功能入口和协议，通过本地 Agent 连接 adapter 对接用户本机服务 |
| 导入导出 | 新格式不兼容旧项目旧导出文件；保留等效导入导出能力 |

## 技术栈

目标前端采用 React + TypeScript + Vite。

依据：

- 旧项目画布核心是客户端 DOM/SVG/CSS transform 实现，不依赖 SSR。
- Vite 更适合 Web 与 Electron 共享同一前端核心。
- 旧项目 Next.js Route Handler 主要用于提示词接口和 WebDAV 代理，这些能力更适合迁移为平台 adapter 或独立服务。
- 保留 Next.js 会增加桌面打包、客户端/服务端边界和运行时一致性复杂度。

保留方向：

- React
- TypeScript
- Zustand
- TanStack Query
- Tailwind CSS
- Ant Design
- localforage 或等价 IndexedDB adapter
- lucide-react
- fflate / file-saver 等导入导出能力

收敛方向：

- 不继续扩大 Ant Design Pro Components 使用面。
- 不继续散落硬编码颜色、阴影、圆角和尺寸。
- 不继续让页面组件直接调用跨领域服务。

## 桌面运行时

桌面运行时采用 Electron。

依据：

- 旧项目已有 Node/Express 本地 Agent、SSE、Codex SDK 和 MCP 集成，Electron 主进程更容易吸收或编排这些 Node 能力。
- Electron 捆绑 Chromium，有利于降低 Windows/macOS WebView 渲染差异带来的视觉基线不一致风险。
- 用户已确认桌面端需要内置本地 Agent。

约束：

- Electron renderer 不启用 Node integration。
- 必须保持 `contextIsolation`。
- renderer 只能通过 preload/IPC 暴露的有限 platform adapter 使用桌面能力。
- 本地 Agent 生命周期由 Electron 主进程或受控后台服务管理。

## 产品功能一致性

Web 与桌面必须保持同一产品功能集合：

- 同一导航结构。
- 同一画布能力。
- 同一素材、提示词、生图、视频、WebDAV、配置、助手和导入导出能力。
- 同一设计 Token 和组件视觉。
- 同一 `canvas-ops` 契约。

允许的差异仅限 platform adapter：

- 桌面端可以内置并启动本地 Agent。
- Web 端不能直接启动本地进程，但必须保留同一 Agent 入口、状态、配置和协议，通过本机服务连接实现能力。
- 桌面端密钥可由 Electron 安全 adapter 管理；Web 端继续允许浏览器本地保存 API Key。

## 目标模块边界

推荐目录与模块概念：

```text
src/
  app/
    routes/
    shell/
    feature-registry/
  features/
    canvas/
    generation/
    assets/
    prompts/
    sync/
    assistant/
    local-agent/
    settings/
  shared/
    ui/
    tokens/
    commands/
    storage/
    ai/
    platform/
    testing/
electron/
  main/
  preload/
  agent/
```

模块边界：

- `features/canvas`：画布渲染、节点布局、选择、拖拽、连线、视口、历史。
- `features/generation`：文本、图片、视频、音频生成流程和配置节点扩展。
- `features/assets`：素材库、媒体 Blob 管理、资源引用。
- `features/prompts`：提示词库、提示词选择弹窗。
- `features/sync`：WebDAV 或后续同步能力。
- `features/assistant`：在线助手 UI、工具调用、确认流程。
- `features/local-agent`：本地 Agent 连接、SSE、线程、操作确认。
- `features/settings`：模型渠道、API Key、WebDAV、版本信息。
- `shared/platform`：Web、桌面、文件、剪贴板、外部链接、密钥存储 adapter。

## 功能模块契约

每个功能模块提供 manifest：

```ts
type FeatureManifest = {
    id: string;
    title: string;
    routes?: RouteContribution[];
    toolbarItems?: ToolbarContribution[];
    nodeTypes?: NodeTypeContribution[];
    commands?: CommandContribution[];
    storageDomains?: StorageDomainContribution[];
    settingsPanels?: SettingsContribution[];
    dependencies?: string[];
};
```

构建时删除功能：

- 使用 `features.config.ts` 或等价配置声明启用功能。
- 应用入口只从注册表读取启用功能。
- 功能之间不直接 import 对方内部实现；通过 shared contract、command bus 或 service port 通信。

后续运行时开关：

- manifest 可继续保留，但运行时按用户配置过滤已注册功能。
- 被关闭功能不得注册路由、工具栏、命令或后台任务。

## Canvas Core 契约

画布核心拆成稳定 contract：

- `CanvasDocument`：项目、节点、连线、视口、背景设置。
- `CanvasCommand`：新增节点、更新节点、移动节点、删除节点、连线、选择、视口调整。
- `CanvasSelection`：选区与选中节点。
- `CanvasHistory`：undo/redo。
- `CanvasResourceRef`：图片、视频、音频、提示词和外部资源引用。
- `CanvasOps`：在线助手、本地 Agent 和后续 MCP 能力共用的操作协议。

旧项目中重复的在线助手工具 schema、本地 Agent schema、MCP schema 应收敛为单一来源。

## 样式与 Token 策略

初期做等值 Token 抽取：

- `shared/tokens/canvas.ts`：画布背景、网格、节点、选中边框、连接线、工具栏、小地图。
- `shared/tokens/app.ts`：应用背景、文本、边框、面板、危险色、品牌色。
- `shared/ui/`：封装按钮、弹窗、抽屉、表单、分段控件、工具栏按钮、节点壳、空状态等。

约束：

- 初期不得调整视觉，只做命名和集中化。
- 新组件必须能复现 `docs/VISUAL_BASELINE.md` 中的基线状态。
- Ant Design theme、Tailwind CSS 变量和画布 Token 需要有单向映射关系。

## 持久化与数据格式

目标持久化接口：

- `ProjectRepository`
- `AssetRepository`
- `BlobStore`
- `SettingsRepository`
- `SyncRepository`

目标新导出格式：

```text
project.iczip
  manifest.json
  projects/{projectId}.json
  assets/{assetId}
  blobs/{blobId}
```

说明：

- 已确认不需要兼容旧项目已有数据或旧导出文件。
- 仍需保持用户可导入/导出画布的等效能力。
- WebDAV 同步不应直接读写各页面 store，应通过 repository domain 清单同步。

## AI 与密钥策略

确认策略：

- `AiProviderPort` 统一文本、图片、视频、音频请求。
- Web 版本继续允许 API Key 保存在浏览器本地配置中，但必须隔离在 adapter 中。
- 桌面版本通过 Electron platform adapter 管理密钥和请求；renderer 只拿到能力状态，不直接接触 Node 或 Electron API。
- 视频轮询、远程媒体下载、文件落盘通过 platform adapter 处理。

## 本地 Agent 策略

确认策略：

- 本地 Agent 是可选功能模块，不进入画布核心。
- 前端、本地 Agent、在线助手和后续 MCP 能力共用同一份 `canvas-ops` schema。
- Web 版本保留外部 HTTP/SSE Agent 连接模式。
- Electron 版本由主进程编排本地 Agent 生命周期。
- Codex app 插件不进入首轮应用迁移；后续如需要，可基于同一 `canvas-ops` 契约独立维护。

## 验证策略

实施前建立：

- TypeScript 检查：目标项目不得默认忽略 TypeScript 构建错误。
- 单元测试：画布命令、节点模型、存储 adapter、导入导出。
- 集成测试：新建画布、添加节点、选择/拖拽/连接、打开弹窗、切换主题。
- 视觉测试：以 `docs/VISUAL_BASELINE.md` 截图作为迁移基线。
- 清理检查：未使用导出、未使用文件、未使用样式和旧命名。

工具方向：

- TypeScript strict 检查。
- ESLint。
- Prettier。
- Vitest。
- Testing Library。
- Playwright。
- Knip。

## Phase 2 关闭状态

已关闭：

- 目标前端技术栈。
- 桌面运行时。
- 首轮迁移范围。
- Web 与桌面功能一致性。
- 本地 Agent 集成策略。
- Web 端 API Key 存储策略。
- 目标导入导出兼容策略。
- 功能模块契约。
- 设计 Token 策略。
- 视觉与行为验证方向。

进入 Phase 3 前仍需用户明确批准开始代码实施。

## 外部依据

- Vite 官方文档：`https://vite.dev/guide/`、`https://vite.dev/guide/features`、`https://vite.dev/guide/build`
- Next.js 官方文档：`https://nextjs.org/docs/app/getting-started/route-handlers`、`https://nextjs.org/docs/app/guides/static-exports`
- Electron 官方文档：`https://electronjs.org/docs/latest/tutorial/security`、`https://electronjs.org/docs/latest/tutorial/process-model`、`https://electronjs.org/docs/latest/api/context-bridge`
- Tauri 官方文档：`https://v2.tauri.app/start/prerequisites/`、`https://v2.tauri.app/develop/sidecar/`、`https://v2.tauri.app/plugin/store/`、`https://v2.tauri.app/plugin/updater/`
