# Infinite Canvas Refactor

本仓库是既有网页端无限画布项目的全新重构/重建工作区。

当前阶段：**Phase 4 逐功能迁移已完成，等待用户批准进入 Phase 5 设计 Token 与组件抽取**。

目前已迁移首轮应用功能，包括主画布、素材库、提示词库、生图工作台、视频创作台、配置、WebDAV、在线助手、本地 Agent 连接与 Electron agent bundle。

## 源项目

已静态审计的旧项目位于：

- `/Users/simplemin/Desktop/CodeX/IC/`

旧项目中的历史项目约束和 `AGENTS.md` 不继承到本仓库。

Phase 1 审计结果见：

- `docs/SOURCE_AUDIT_REPORT.md`
- `docs/VISUAL_BASELINE.md`

## 文档

- `AGENTS.md`：本仓库的项目级工作规则。
- `docs/REFACTORING_PLAN.md`：分阶段重构路线。
- `docs/SOURCE_AUDIT_PROTOCOL.md`：旧项目只读审计流程。
- `docs/SOURCE_AUDIT_REPORT.md`：旧项目 Phase 1 审计报告。
- `docs/VISUAL_BASELINE.md`：Phase 1 运行时视觉基线。
- `docs/TARGET_ARCHITECTURE_DECISIONS.md`：Phase 2 已确认目标架构决策。
- `docs/PHASE_3_SCAFFOLD.md`：Phase 3 项目骨架、脚本和验证结果。
- `docs/PHASE_4_MIGRATION.md`：Phase 4 逐功能迁移范围、验证结果和遗留项。
- `docs/IMPLEMENTATION_PLAN.md`：Phase 3 与后续迁移切片计划。
- `docs/OPEN_DECISIONS.md`：实施前需要关闭或持续跟踪的开放决策。

## 开发命令

目标仓库使用 npm：

```bash
npm install
npm run dev
npm run dev:desktop
npm run check
npm run build
npm run test:e2e
npm run knip
```

## 当前边界

Phase 4 迁移优先保持旧项目行为和视觉等效。后续不得在未经批准的情况下进行视觉 redesign、旧数据兼容承诺或桌面安装包分发配置。
