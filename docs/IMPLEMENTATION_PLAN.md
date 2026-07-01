# 实施切片计划

状态：Phase 4 已完成，等待用户批准 Phase 5 设计 Token 与组件抽取。

日期：2026-07-01

依据：

- `docs/SOURCE_AUDIT_REPORT.md`
- `docs/VISUAL_BASELINE.md`
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`
- `docs/OPEN_DECISIONS.md`

## 当前结论

Phase 2 目标架构决策已关闭。用户已明确批准进入 Phase 3，Phase 3 项目骨架已完成。用户已明确批准按本文件顺序连续推进整个 Phase 4，Phase 4 已完成。

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

## 下一步

等待用户批准 Phase 5：设计 Token 和组件抽取。不得在未批准的情况下进行视觉 redesign 或引入非等效产品行为。
