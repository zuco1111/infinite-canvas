# Phase 3 项目骨架说明

状态：已完成。

日期：2026-07-01

## 范围

Phase 3 已创建目标项目的最小可运行骨架，用于支撑后续逐功能迁移。

已完成：

- 使用 npm 作为目标仓库包管理器。
- 创建 React + TypeScript + Vite 前端入口。
- 创建 Electron 主进程和 preload 入口。
- 建立 Web 与 Electron 共享的 app shell。
- 建立功能 manifest、构建时启用配置和 feature registry。
- 建立 command contract、platform port、storage repository port、AI provider port 和 canvas core contract 占位。
- 接入 Tailwind CSS、Ant Design、Zustand、TanStack Query 和 lucide-react。
- 接入 TypeScript strict 检查、ESLint、Prettier、Vitest、Testing Library、Playwright、Knip 和 npm audit。
- 添加最小 CSP，保持 Electron renderer 的基础安全边界。

未完成且不属于 Phase 3：

- 不迁移旧项目功能。
- 不实现旧项目业务行为。
- 不改变旧项目产品行为或视觉设计。
- 不进行桌面安装包分发配置。

## 关键目录

```text
src/
  app/
    feature-registry/
    providers/
    shell/
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
    ai/
    commands/
    platform/
    storage/
    testing/
    tokens/
    ui/
electron/
  main/
  preload/
tests/
  e2e/
```

## 脚本

- `npm run dev`：启动 Web 开发入口。
- `npm run dev:desktop`：启动 Vite 和 Electron 开发入口。
- `npm run build`：构建 Web renderer、Electron main 和 Electron preload。
- `npm run typecheck`：运行 TypeScript 检查。
- `npm run lint`：运行 ESLint。
- `npm run format:check`：检查代码和配置格式。
- `npm run test`：运行 Vitest 单元测试。
- `npm run test:e2e`：运行 Playwright 端到端测试。
- `npm run knip`：检查未使用文件、导出和依赖。
- `npm run check`：运行格式检查、lint、类型检查和单元测试。
- `npm run clean`：清理构建和测试输出。

## 验证结果

已在本地验证：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run test:e2e` 通过。
- `npm run knip` 通过。
- `npm audit` 通过，当前 0 个已报告漏洞。
- Electron 生产入口 smoke test 通过，主进程和 renderer 未立即崩溃。

Playwright Chromium 浏览器已下载到本机 Playwright 缓存，用于执行 `npm run test:e2e`。

## 后续要求

进入 Phase 4 前，需要由用户明确批准具体功能迁移切片。Phase 4 每个切片仍需声明：

- 模块边界。
- 状态依赖。
- 资源依赖。
- 行为等效验证方法。
- 视觉基线对照方法。
- 构建时包含或排除方式。
