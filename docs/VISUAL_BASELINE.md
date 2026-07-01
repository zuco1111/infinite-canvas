# Phase 1 运行时视觉基线

状态：已采集。

采集日期：2026-07-01

源项目位置：

- `/Users/simplemin/Desktop/CodeX/IC/`

截图目录：

- `docs/visual-baseline/phase-1/screenshots/`

## 采集边界

已执行：

- 使用旧项目 `web/` 的临时副本运行应用。
- 在临时目录安装依赖和启动 dev server。
- 通过浏览器创建一份临时画布并采集截图。
- 覆盖桌面、移动、深色主题、浅色主题、主要页面、画布节点状态和关键弹窗。

未执行：

- 未修改 `/Users/simplemin/Desktop/CodeX/IC/` 中任何文件。
- 未将 `node_modules`、构建产物、临时画布数据或截图写回旧项目。
- 未调用真实 AI 生成接口。
- 未启动旧项目的本地 `canvas-agent/` 服务。

## 运行环境

已验证：

- 运行副本目录：`/tmp/ic-web-baseline.fZ8PTz/web`
- 运行命令：`bun install --frozen-lockfile`，`bun run dev`
- Bun：`1.3.6`
- Node：`v25.9.0`
- 旧前端：Next.js `16.2.3`
- 本地地址：`http://127.0.0.1:3000`
- 为满足旧 `web/next.config.ts` 的读取需求，仅向临时副本父目录复制了旧仓库根部的 `VERSION` 和 `CHANGELOG.md`。

## 截图清单

桌面截图尺寸均为 `1440x900`，移动截图尺寸为 `390x844`。

| 文件 | 主题 | 视口 | 覆盖内容 |
| --- | --- | --- | --- |
| `01-home-desktop-dark.png` | 深色 | 桌面 | 首页与顶部导航 |
| `02-canvas-library-empty-desktop-dark.png` | 深色 | 桌面 | 空画布库 |
| `03-canvas-empty-desktop-dark.png` | 深色 | 桌面 | 新建后的空画布 |
| `04-canvas-text-node-selected-desktop-dark.png` | 深色 | 桌面 | 文本节点选中状态 |
| `05-canvas-text-and-config-nodes-desktop-dark.png` | 深色 | 桌面 | 文本节点与生成配置节点 |
| `06-canvas-node-types-desktop-dark.png` | 深色 | 桌面 | 文本、生成配置、图片、视频、音频节点 |
| `07-canvas-appearance-panel-dark.png` | 深色 | 桌面 | 画布外观面板 |
| `08-canvas-node-types-desktop-dark.png` | 深色 | 桌面 | 多节点状态复核 |
| `09-shortcuts-dialog-dark.png` | 深色 | 桌面 | 快捷键弹窗 |
| `10-app-config-modal-dark.png` | 深色 | 桌面 | 应用配置弹窗 |
| `11-canvas-agent-panel-dark.png` | 深色 | 桌面 | 画布 Agent 面板 |
| `12-image-workbench-dark.png` | 深色 | 桌面 | 生图工作台 |
| `13-video-workbench-dark.png` | 深色 | 桌面 | 视频创作台 |
| `14-prompts-library-dark.png` | 深色 | 桌面 | 提示词库 |
| `15-assets-library-dark.png` | 深色 | 桌面 | 我的素材 |
| `16-canvas-library-mobile-dark.png` | 深色 | 移动 | 移动画布库 |
| `17-canvas-mobile-dark.png` | 深色 | 移动 | 移动画布工作区 |
| `18-canvas-node-types-desktop-light.png` | 浅色 | 桌面 | 浅色多节点状态 |
| `19-canvas-appearance-panel-light.png` | 浅色 | 桌面 | 浅色画布外观面板 |

## 临时画布状态

采集期间在浏览器会话中通过旧应用 UI 创建了一份临时画布：

- 标题：`无限画布 1`
- 节点：文本、生成配置、图片、视频、音频。
- 该数据仅存在于运行旧应用的浏览器本地会话中，不写入旧项目源码目录。

## 运行时观察

已观察到的旧项目运行时信息：

- Next dev server 首次编译 `/canvas/[id]`、`/image`、`/video`、`/prompts`、`/assets` 时会有明显冷启动编译耗时。
- 旧应用在若干页面触发 React/浏览器告警：空字符串 `src` 属性可能导致页面重新下载。
- 旧应用触发 Ant Design 告警：`Drawer` 的 `height` 属性已废弃，建议使用 `size`。

这些观察只作为后续修复候选，不在行为等效重构阶段自动修复。

## 后续使用方式

迁移或重构相关 UI 前，应使用本截图集进行视觉对比。Phase 2 已确认以下验证原则：

- 每个迁移切片至少对比其直接影响的基线截图。
- 桌面主视口以 `1440x900` 为默认对比基准。
- 移动关键路径以 `390x844` 为最低覆盖基准。
- 自动截图差异用于发现明显回归，动态内容、时间戳、随机 ID 和浏览器开发控件需人工复核。
