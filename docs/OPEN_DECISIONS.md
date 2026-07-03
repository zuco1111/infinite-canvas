# 开放决策

本文件用于跟踪不应被猜测的决策。决策只能在源项目审计证据充分、用户明确确认，或用户明确委托 Codex 代为判断后，从开放状态移入已确认状态。

## 已确认

### 项目范围

决策：本仓库是 `/Users/simplemin/Desktop/CodeX/IC/` 旧项目的全新重构/重建工作区。

来源：用户确认。

### 源项目约束

决策：旧项目历史 `AGENTS.md` 和项目约束不继承。

来源：用户确认。

### Git 历史

决策：不需要保留旧项目 git 历史。

来源：用户确认。

### 功能开关要求

决策：当前阶段只需要支持构建时删除功能模块；后续需要保留运行期间开启/禁用功能的可能性。

来源：用户确认。

### 当前阶段边界

决策：用户已明确批准进入 Phase 3；Phase 3 项目骨架已完成。用户已明确批准按 `docs/IMPLEMENTATION_PLAN.md` 的顺序连续推进整个 Phase 4；Phase 4 已完成。用户已于 2026-07-02 明确批准进入 Phase 5；Phase 5 设计 Token 与组件抽取已完成。用户已于 2026-07-02 明确批准 Phase 6 中的设计样式收敛切片；该切片已完成。用户随后明确要求本阶段不是视觉重构，而是在既有视觉基础上选择 canonical 规格替换相同或相似元素，以实现风格统一和组件/Token 收敛；该追加切片已完成。用户已确认因上线优先，Phase 5 记录中的遗留项暂缓，不作为当前阻塞，并批准进入 Phase 6 上线前清理；本轮范围覆盖 hook/Fast Refresh warning、bundle size/ineffective dynamic import、旧来源命名、未使用函数、未使用资源、无效分支、过期注释、废弃样式和历史兼容 fallback 清理。Phase 6 上线前清理已完成。用户已明确要求删除 404 外部提示词来源，并将可访问提示词数据存为本地数据；提示词数据源本地化已完成。用户已明确要求开始 Phase 7；Phase 7 桌面端本地客户端分发包配置与三平台构建验证已完成。

来源：用户确认与项目工作规则。

### 提示词库数据源

决策：提示词库运行时数据库使用本地静态数据 `public/data/local-prompts.json`，不再在运行时抓取外部提示词数据库。外部来源如需更新，应先验证可访问性，移除 404 来源后再写入本地数据。

来源：用户确认。

### 包管理器

决策：目标仓库使用 npm 作为包管理器。

来源：用户确认。

### 源项目运行权限

决策：审计阶段允许运行旧项目，以获取行为和视觉基线；但不得修改旧项目源码或将无关产物写回旧项目。

来源：用户确认。

### 既有问题处理

决策：如果审计中发现旧项目存在问题，先记录为后续修复项；除非用户明确批准，不在等效重构阶段自动修复。

来源：用户确认。

### 旧数据兼容

决策：不需要兼容旧项目已有数据、文件格式、本地缓存或历史项目数据。

来源：用户确认。

### 文档语言

决策：项目文档默认使用中文。

来源：用户确认。

### 审计报告形式

决策：Phase 1 审计产出写入 `docs/SOURCE_AUDIT_REPORT.md`。

来源：用户确认。

### 视觉基线

决策：Phase 1 运行时视觉基线写入 `docs/VISUAL_BASELINE.md`，后续 UI 迁移以该截图集作为视觉等效对比依据。

来源：源项目临时副本运行验证。

### 桌面目标平台

决策：桌面端目标平台为 Windows x64、macOS Intel 和 macOS Apple Silicon。

来源：用户确认。

### 目标前端技术栈

决策：目标前端采用 React + TypeScript + Vite。

依据：旧项目画布核心为客户端 DOM/SVG/CSS transform，不依赖 SSR；Vite 更适合 Web 与 Electron 共享同一前端核心；Next.js 的 Route Handler 能力迁移为平台 adapter 或独立服务更利于桌面一致性。

来源：用户委托 Codex 决策；Codex 基于 Phase 1 审计和 Phase 2 架构评估确定。

### 桌面运行时

决策：桌面运行时采用 Electron。Tauri 不作为当前目标运行时，只保留为未来重评选项。

依据：旧项目存在 Node/Express 本地 Agent、SSE、Codex SDK 和 MCP 集成；Electron 的 Chromium + Node 主进程模型更利于内置本地 Agent，并降低跨平台 WebView 视觉差异。

来源：用户委托 Codex 决策；Codex 基于 Phase 1 审计和 Phase 2 架构评估确定。

### Web 与桌面功能一致性

决策：Web 端和桌面端保持同一产品功能集合、同一核心代码、同一模块注册体系和同一 UI 表面，不做产品功能差异化。

说明：平台能力差异只能隐藏在 adapter 内部。例如桌面端由 Electron 主进程内置和管理本地 Agent；Web 端保留同一 Agent 功能入口与协议，但浏览器不能直接启动本地进程，因此通过本地 Agent 连接 adapter 对接用户本机服务。

来源：用户确认。

### 目标迁移范围

决策：首轮迁移包含主画布、素材库、提示词库、生图工作台、视频创作台、WebDAV、应用配置、AI 渠道配置、在线助手、本地 Agent 能力和导入导出能力。

决策：旧项目文档站和 Codex app 插件不作为首轮应用功能迁移目标；相关能力通过项目文档和本地 Agent 架构保留后续扩展可能性。

来源：用户确认首轮包含范围；Codex 按产品应用边界补充迁移边界。

### 本地 Agent 集成方式

决策：桌面端需要内置本地 Agent。本地 Agent 作为可选功能模块实现，不进入画布核心；在线助手、本地 Agent 和后续 MCP 能力共享同一份 `canvas-ops` 契约。

来源：用户确认桌面端内置本地 Agent；Codex 基于已确认目标架构确定模块边界。

### AI 请求与密钥存储边界

决策：Web 端继续允许浏览器本地保存 API Key。

决策：桌面端功能与 Web 端一致，但密钥存储通过 Electron 平台 adapter 处理；renderer 不直接依赖 Node 或 Electron API，密钥只通过受控能力接口暴露状态和请求能力。

来源：用户确认 Web 端策略；Codex 基于 Electron 安全边界确定桌面 adapter 策略。

### 目标数据与导入导出格式

决策：接受新的导入导出格式不兼容旧项目导出文件；目标系统仍需保留导入导出的等效功能。

目标方向：使用新归档格式，例如 `project.iczip`，包含 `manifest.json`、项目 JSON、素材引用和 Blob 文件。

来源：用户确认。

### 功能模块契约

决策：采用功能 manifest + 注册表 + 命令契约。功能模块声明自己的路由、工具栏入口、节点类型、命令、设置面板、存储 domain 和依赖关系。

来源：Codex 基于构建时删除功能模块和后续运行时开关要求确定。

### 画布核心契约

决策：画布核心以 `CanvasDocument`、`CanvasCommand`、`CanvasSelection`、`CanvasHistory`、`CanvasResourceRef` 和 `CanvasOps` 为主要契约。在线助手、本地 Agent 和后续 MCP 能力不得各自维护重复的画布操作 schema。

来源：Codex 基于 Phase 1 审计中的重复 schema 和耦合点确定。

### 设计 Token 策略

决策：初期只做等值 Token 抽取，不调整视觉。Token 分为应用级 Token、画布级 Token 和组件消费层；Ant Design theme、Tailwind CSS 变量和画布 Token 保持单向映射关系。

来源：用户确认视觉等效要求；Codex 基于样式来源审计确定。

### 视觉一致性验证方法

决策：以 `docs/VISUAL_BASELINE.md` 的截图集作为迁移基线。迁移切片必须覆盖受影响页面或组件的桌面截图；移动关键路径和主题切换在涉及布局或主题时补充验证。

来源：Phase 1 运行时视觉基线。

### 行为等效验证方法

决策：目标项目必须建立类型检查、单元测试、集成测试和端到端验证。迁移切片应至少验证对应功能的核心命令、状态变化、持久化和关键 UI 路径。

来源：Codex 基于旧项目测试缺口和行为等效要求确定。

### 清理工具链

决策：目标项目使用 TypeScript 检查、ESLint、Prettier 和未使用代码/依赖检查工具进行清理。具体工具在 Phase 3 脚手架中落地，默认方向为 ESLint + Prettier + TypeScript strict 检查 + Knip。

来源：Codex 基于项目清理要求和目标技术栈确定。

### 桌面打包策略

决策：桌面端本地客户端分发包使用 Electron Builder 生成。当前支持 macOS Intel、macOS Apple Silicon 和 Windows x64 的客户端分发包。

决策：桌面包内置 Local Agent 和 Codex CLI。打包前通过 `scripts/prepare-desktop-codex.cjs` 准备 Codex 资源，Electron Builder `afterPack` 钩子按目标平台和架构复制对应的 Codex 原生二进制。

决策：正式应用名使用 `Infinite Canvas`，桌面端 appId / bundle identifier 使用 `com.zuco.infinitecanvas`，图标使用现有 `public/zuco-brand.png` 生成的桌面图标资源。

决策：当前暂不启用自动更新。

决策：当前桌面包输出目录为 `release/`，中间 Codex 资源目录为 `build/desktop-codex/`，二者不进入版本控制。

来源：用户批准 Phase 7；用户确认发布信息；本地构建和运行验证。

## 开放

当前无阻塞本地客户端打包的开放架构决策。

Phase 7 本地客户端分发包配置已获用户明确批准并完成。

### 正式桌面发布

状态：开放，不阻塞本地客户端打包。

待确认：

- 应用作者、版权主体和 Windows 发布者名称。
- macOS Developer ID 证书、Team ID、notarization 账号和 hardened runtime 配置。
- Windows 代码签名证书。
- 是否将 Codex CLI 继续作为自包含资源，或改为首次运行下载/可选组件以降低包体。
- Windows x64 产物是否已在真实 Windows 设备上完成运行验收。

若后续实现中出现会改变项目范围、功能等效、视觉等效、桌面分发、安全边界、模块契约或数据格式的新问题，必须先记录到本文件，再继续执行相关实现。
