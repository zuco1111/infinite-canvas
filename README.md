# Infinite Canvas

Infinite Canvas 是一个基于 React、Vite 和 Electron 的无限画布应用。当前仓库是旧网页端项目的全新重构/重建工作区，旧项目约束和历史 `AGENTS.md` 不继承。

当前状态见 `docs/PROJECT_STATUS.md`。

## 文档

- `AGENTS.md`：代理执行规则、目录边界、工程约束和验证要求。
- `docs/PROJECT_STATUS.md`：项目状态、已确认目标、非目标和文档地图。
- `docs/PRODUCT_CONSTRAINTS.md`：长期产品约束、数据源约束和用户可见文案边界。
- `docs/RELEASE_AND_DISTRIBUTION.md`：桌面打包、版本号、GitHub Release 和分发规则。
- `docs/VERSION_CLOSING.md`：版本收尾清理记录、验证结果、阻塞项和后续计划。
- `docs/PHASE_8_MODULAR_ARCHITECTURE.md`：模块化架构、feature 边界和 Phase 8 实施记录。
- `docs/OPEN_DECISIONS.md`：需要关闭或持续跟踪的开放决策。

历史阶段文档保留在 `docs/` 下，用于追溯审计、迁移、设计收敛、桌面打包和模块化重构过程。

## 开发命令

```bash
npm install
npm run dev
npm run dev:desktop
npm run check
npm run check:boundaries
npm run build
npm run smoke:desktop-hash-routes
npm run dist:desktop:dir
npm run dist:desktop:all
npm run test:e2e
npm run knip
```

## 当前边界

- Phase 8 模块化架构与功能复用重构已完成。
- `src/app` 只负责应用壳、provider、路由装配、feature registry 和平台级初始化。
- 业务实现位于 `src/features/*`，跨领域基础能力位于 `src/shared/*`。
- 不兼容旧项目数据、旧文件格式、旧本地缓存或本仓库当前本地持久化数据。
- 正式签名、公证、自动更新、商店发布和第三方插件系统尚未获批准。
