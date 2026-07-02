# Phase 4 逐功能迁移记录

状态：已完成。

日期：2026-07-01

用户授权：用户明确批准按 `docs/IMPLEMENTATION_PLAN.md` 的顺序连续推进整个 Phase 4。

## 完成范围

- 应用壳与导航已迁移到 Vite/Electron 共享入口。
- 主导航、主题入口、配置入口和 Zuco 外链入口已迁移；顶部文档入口、单画布菜单文档入口、版本入口和旧右侧外链入口已按 2026-07-02 验收反馈移除。
- 画布库、单画布页面、生图工作台、视频创作台、提示词库、素材库页面已迁移。
- 配置与用户偏好 Modal 已迁移，包含模型渠道、模型选择、生成偏好和 WebDAV 配置。
- 默认 OpenAI 兼容渠道的 Base URL 已按 2026-07-02 验收反馈调整为 `https://api.zuco.ai/`。
- 画布项目模型、节点模型、连接、视口、背景设置、画布渲染、缩放/平移、选择、拖拽、连线、撤销/重做、复制粘贴、右键菜单已迁移。
- 文本、图片、视频、音频、配置节点已迁移。
- 底部工具栏、小地图、缩放控件、画布外观面板、快捷键弹窗、节点悬浮工具栏和图片工具弹窗已迁移。
- 图片/视频/音频 Blob 存储、素材库、资源引用、上传入口已迁移。
- 提示词库、提示词选择弹窗、提示词详情和提示词加入素材能力已迁移。
- AI 配置、模型渠道、文本/图片/视频/音频请求服务、生成参数面板和工作台历史记录已迁移。
- WebDAV 同步配置、domain manifest 和同步服务已迁移；目标项目使用直接 WebDAV 请求路径。
- 在线助手 UI、工具调用确认流程和画布操作应用逻辑已迁移。
- 本地 Agent 前端连接模式已迁移；旧 `canvas-agent` 已迁入 `electron/agent` 并作为 Electron 可启动 agent bundle 构建。
- 导入导出能力已迁移，当前保持旧项目等效 zip 导入导出行为；目标新归档格式仍按 Phase 2 决策保留为后续格式收敛方向。
- Electron build 已包含 renderer、main、preload 和 agent bundle；尚未进行 Windows/macOS 安装包分发配置。
- Phase 3 占位 app shell 和未使用迁移文件已清理。

## 模块边界

- `src/app/routes`：Vite 下的应用路由适配。
- `src/shared/router`：`next/link` 与 `next/navigation` 的轻量兼容层。
- `src/app/feature-registry`：构建时启用功能配置和 manifest 注册表。
- `src/features/*/manifest.ts`：功能模块声明。
- `src/app/(user)/canvas`：画布库、画布核心、节点、工具栏、Agent 面板和画布相关 store。
- `src/app/(user)/image`、`src/app/(user)/video`：画布外生成工作台。
- `src/app/(user)/prompts` 与 `src/components/prompts`：提示词库。
- `src/app/(user)/assets` 与 `src/stores/use-asset-store.ts`：素材库。
- `src/services`：AI 请求、媒体存储、WebDAV 和应用同步服务。
- `electron/agent`：本地 Agent 服务源码。
- `electron/main/local-agent-manager.ts`：Electron 主进程管理内置 Agent 生命周期。

## 平台适配

- Web 端保留手动连接本地 Agent 的能力。
- Electron 端通过 preload 暴露 `startLocalAgent`、`stopLocalAgent` 和 `getLocalAgentStatus`。
- Renderer 不启用 Node integration，仍通过 platform adapter 调用桌面能力。
- CSP 已更新为允许用户配置的 HTTP/HTTPS AI 请求、GitHub raw 提示词源、本地 Agent 和 Blob/data 媒体资源；后续 Phase 6 已将运行时提示词数据库本地化，GitHub raw 不再作为提示词数据库运行时抓取入口。
- 本地 Vite dev/preview 服务提供 `__ai-proxy` 同源代理，用于转发用户配置的外部 AI Base URL 请求，规避不支持浏览器 CORS 的模型服务；该代理仅用于本地运行验证，后续桌面正式分发仍需按 platform adapter 收敛。

## 构建时功能包含/排除

已启用功能 ID：

- `settings`
- `canvas`
- `generation`
- `assets`
- `prompts`
- `assistant`
- `local-agent`
- `sync`

功能 manifest 声明路由、节点类型、命令、设置面板、存储 domain 和依赖。导航和 route switch 会根据 `featureRegistry.listRoutes()` 过滤入口。

说明：当前迁移优先保持旧功能等效，尚未完成按 feature 做物理级代码分包；构建时禁用功能已经能隐藏 registry 路由入口，但后续 Phase 5/6 仍需继续拆分跨功能直接 import。

## 验证结果

已验证：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run test:e2e` 通过。
- `npm run knip` 通过。
- `npm audit` 通过，当前 0 个已报告漏洞。

视觉烟测截图：

- `test-results/phase4-visual/home.png`
- `test-results/phase4-visual/canvas-library.png`
- `test-results/phase4-visual/canvas-empty.png`
- `test-results/phase4-visual/image-workbench.png`
- `test-results/phase4-visual/video-workbench.png`
- `test-results/phase4-visual/prompts-after-csp.png`
- `test-results/phase4-visual/assets.png`
- `test-results/phase4-visual/app-config-modal.png`

Phase 4 验证时，提示词库曾通过运行时远程数据源完成烟测，返回 877 条提示词。后续 Phase 6 已按上线要求移除 404 外部提示词来源，并将可访问提示词数据写入 `public/data/local-prompts.json`，当前提示词数据库不再运行时抓取外部来源。

## 已知迁移遗留

- Phase 4 验证时 `npm run lint` 通过但曾输出 React hook dependency 与 Fast Refresh warning；这些 warning 来自旧项目实现迁移，未阻断检查。
- Phase 4 验证时 Vite build 曾输出大 chunk 和 ineffective dynamic import warning；这是旧项目页面级静态 import 和跨 store 动态 import 并存导致。
- 上述 lint warning、Vite 大 chunk warning 和 ineffective dynamic import warning 已在后续 Phase 6 上线前清理切片中处理。
- 当前导入导出保持旧项目 zip 行为；Phase 2 决策中的新 `project.iczip` 格式尚未单独实现。
- Electron 目前验证到 build 产物路径，尚未配置 Windows x64、macOS Intel 和 macOS Apple Silicon 的安装包产物。
- WebDAV 的 Next.js proxy 模式未保留为 Vite route handler；目标项目当前使用 direct 模式，后续如需要代理应通过 platform adapter 或独立服务实现。
- 密钥仍按 Web 端本地配置保存；Electron 安全密钥存储 adapter 还未实现。
- 旧 Codex app 插件仍不进入首轮应用迁移范围。

## 下一步建议

- Phase 5：等值设计 Token 与组件抽取，继续保持视觉一致。
- Phase 6：按 feature 物理拆分直接 import、收敛 hooks warning、降低 bundle size；其中上线前 warning 与 renderer chunk 清理已完成。
- Phase 7：补桌面安装包配置并分别验证 Windows x64、macOS Intel 和 macOS Apple Silicon。
