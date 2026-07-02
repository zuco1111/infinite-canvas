# Infinite Canvas Refactor

本仓库是既有网页端无限画布项目的全新重构/重建工作区。

当前阶段：**Phase 7 桌面端未签名本地分发包配置与三平台构建验证已完成；正式签名、公证和发布元数据待确认**。

目前已迁移首轮应用功能，包括主画布、素材库、提示词库、生图工作台、视频创作台、配置、WebDAV、在线助手、本地 Agent 连接与 Electron agent bundle，并已完成等值设计 Token、共享 UI 组件抽取、首轮应用层设计样式收敛、等值组件/Token 追加收敛、提示词数据源本地化和桌面端打包配置。

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
- `docs/PHASE_5_DESIGN_TOKENS.md`：Phase 5 设计 Token 与组件抽取范围、验证结果和遗留项。
- `docs/PHASE_6_DESIGN_CONVERGENCE.md`：Phase 6 设计样式收敛、上线前清理范围、验证结果和遗留项。
- `docs/PHASE_7_DESKTOP_PACKAGING.md`：Phase 7 桌面端打包配置、验证结果和正式发布待确认项。
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
npm run dist:desktop:dir
npm run dist:desktop:mac
npm run dist:desktop:win
npm run test:e2e
npm run knip
```

## 当前边界

Phase 7 桌面端未签名本地分发包配置已获用户批准并完成。用户已确认因上线优先暂缓 Phase 5 记录中的遗留项；后续不得在未经批准的情况下扩大到功能行为变更、进一步视觉 redesign、旧数据兼容承诺、正式签名/公证、自动更新或商店发布配置。

提示词库运行时读取本地静态数据 `public/data/local-prompts.json`，不再抓取外部提示词数据库。
