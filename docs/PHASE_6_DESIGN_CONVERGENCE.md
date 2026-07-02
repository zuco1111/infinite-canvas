# Phase 6 设计样式收敛记录

状态：已完成。

日期：2026-07-02

用户授权：用户明确要求收敛当前项目中风格不一致、相似组件、相似 Token、重复组件和重复 Token，并要求修改完成后重启 `http://127.0.0.1:5173/` 供验收。本切片只覆盖设计样式、Token 与组件收敛，不包含桌面打包、旧数据兼容、物理级 feature 分包或功能行为变更。

## 完成范围

- 移除未被消费的蓝黑 `app-*` 颜色映射，应用全局 Tailwind 语义色、Ant Design 主题和应用页面样式统一到同一套中性 stone/neutral Token。
- `src/shared/tokens/app.ts` 扩展为浅色/深色应用语义 Token，覆盖背景、前景、卡片、弹层、边框、输入、ring、muted、primary、warning、danger 和 success。
- `src/styles/index.css` 的全局语义 CSS 变量从默认 oklch/shadcn 色值收敛到项目应用 Token，并让筛选标签、画布控制焦点色和网格背景消费语义变量。
- `src/lib/app-theme.ts` 的 Ant Design 主题消费同一套应用 Token，统一 Button、Input、Select、Modal、Drawer、Menu 和 Table 的基础表面、边框、文字和圆角。
- 新增 `src/shared/ui/app-surface.tsx`，抽取配置弹窗和普通表单区共用的表面容器、说明文本和提示条。
- 新增 `src/shared/ui/workbench-page.tsx` 和 `src/shared/ui/workbench-style.ts`，抽取图像/视频工作台共用的页面壳、侧栏、编辑面板、结果面板、字段标题、参考素材条、移动参数摘要、空状态、加载卡、失败卡、媒体结果卡和记录列表样式。
- 图像工作台和视频工作台已迁移到共享 workbench 组件，保留生成逻辑、参考素材上传/排序/删除、历史记录、参数抽屉和结果动作行为。
- 配置弹窗、顶部导航、移动导航、首页、画布库、素材库、提示词库、素材选择弹窗和提示词相关弹窗已从散落 stone/amber/blue/red Tailwind 类收敛到语义 Token。
- `src/components/ui/select.tsx` 和 `src/components/model-picker.tsx` 的 Radix Select 外观已统一到应用语义 Token，避免模型选择器与 Ant Design 表单控件形成第二套视觉语言。

## 追加等值组件/Token 收敛

日期：2026-07-02

用户补充边界：当前阶段不是视觉重构，而是在既有视觉基础上选择 canonical 规格替换相同或相似元素。例如两个页面存在 32px x 16px 与 32px x 14px 的相似按钮时，选用既有 canonical 规格统一替换，以实现风格统一和组件/Token 收敛。

完成范围：

- `src/shared/ui/catalog-page.tsx` 新增 `CatalogCheckableTagList` 和 `CatalogItemCard`，保留现有 catalog 视觉结构，统一素材库、提示词库、提示词选择弹窗和素材选择弹窗中的筛选 Tag 与卡片骨架。
- `src/styles/index.css` 将通用筛选 Tag 样式从 `prompt-filter-tag` 重命名为 `app-filter-tag`，保留原有 6px 圆角、5px/10px 内边距、14px 字号等 canonical 规格，并继续消费应用语义 Token。
- `src/components/prompts/prompt-card.tsx` 与 `src/app/(user)/assets/page.tsx` 的条目卡片迁移到共享 `CatalogItemCard`，保留 Ant Design Card、媒体比例、内容 padding 和动作区结构。
- `src/components/prompts/prompt-select-dialog.tsx` 与 `src/app/(user)/canvas/components/asset-picker-modal.tsx` 复用 shared catalog 筛选组件，移除手写重复 CheckableTag 结构。
- `src/shared/ui/workbench-page.tsx` 新增 `WorkbenchReferenceOrderButtons`，将图像/视频工作台重复的 24px 圆形参考素材排序按钮收敛到同一组件。
- `src/shared/ui/workbench-style.ts` 新增 `workbenchTagToneClassName` 与 `moveWorkbenchListItem`，将工作台日志状态 Tag 收敛到应用语义 Token，移除图片/视频工作台中重复的列表移动函数。
- `src/shared/ui/app-multi-select-checkbox.tsx` 新增 `AppMultiSelectCheckbox`，将条目多选和多项配置选择统一为 16px 方形、5px 圆角、语义 Token 配色的 canonical checkbox 组件。
- 画布库项目卡片、图像生成记录、视频生成记录和画布图像工具栏配置弹窗的多选控件已迁移到 `AppMultiSelectCheckbox`，不再在页面侧直接使用 Ant Design `Checkbox`、原生 checkbox 或重复手写 checkbox 样式。

## 上线前清理追加切片

日期：2026-07-02

用户补充边界：项目急于上线，Phase 5 记录中的遗留项暂缓，不作为当前阻塞；当前先推进 Phase 6 上线前清理。若清理中出现会改变功能行为、视觉输出、旧数据兼容承诺或桌面分发范围的问题，必须先与用户确认。

完成范围：

- 收敛 `npm run lint` 中的 React hook dependency warning 与 Fast Refresh warning。
- 本地 Agent 面板的 EventSource 长连接回调改为消费最新函数 ref，避免为了消除依赖 warning 而造成频繁重连。
- 画布页自动打开 Agent、画布库自动进入项目、视频日志初始刷新、节点提示词同步和动态文字测量的 hook 依赖已显式收敛。
- 图像设置、视频设置、积分图标和客户端路由中的非组件导出拆分到纯工具/状态文件，组件文件只导出组件，消除 Fast Refresh warning。
- 应用路由改为页面级 `React.lazy` + `Suspense` 加载，保留原有路由表和功能 manifest 判断方式。
- 移除 `src/services/image-storage.ts` 与 `src/app/(user)/canvas/stores/use-canvas-store.ts` 的无效动态导入场景，消除 Vite `INEFFECTIVE_DYNAMIC_IMPORT` 构建提示。
- 更新应用壳测试以等待 lazy 页面完成加载。
- 更新 `AGENTS.md`、`README.md`、`docs/IMPLEMENTATION_PLAN.md`、`docs/OPEN_DECISIONS.md` 和 `docs/REFACTORING_PLAN.md`，记录上线优先、Phase 5 遗留暂缓和 Phase 6 上线前清理完成状态。

## 提示词数据源本地化追加切片

日期：2026-07-02

用户补充边界：外部提示词来源只要 404 就删除；可访问的数据写入本地，因为提示词数据库应在本地。

完成范围：

- 验证 6 个既有外部提示词来源，其中 `EvoLinkAI/awesome-gpt-image-2-API-and-Prompts` 的 `data/ingested_tweets.json` 返回 404，已从运行时数据源中移除。
- 将 5 个可访问来源解析出的 877 条提示词写入 `public/data/local-prompts.json`。
- `src/services/api/prompts.ts` 改为读取同源本地静态 JSON，并保留原有搜索、标签筛选、分类筛选和分页行为。
- `src/features/prompts/manifest.ts` 的 storage domain 从“远程提示词缓存”更新为“本地提示词库”。
- 本地提示词 JSON 作为静态资源提供，不再进入 JS chunk，也不再触发运行时外部提示词数据库抓取。

## 收敛原则

- 本切片允许在相同或相似元素之间选择既有 canonical 规格进行收敛，但不进行视觉 redesign，不新增产品行为，不修改生成、存储、同步或画布编辑逻辑。
- 画布编辑器内部仍以 `canvasThemeTokens` 为主题来源；普通应用页面以 `appThemeTokens` 和全局语义 CSS 变量为主题来源。
- 图片/视频缩略图上的黑色半透明覆盖层保留为内容可读性处理，不视为独立设计系统。
- 提示词数据库已本地化；提示词条目中的远程封面 URL 仍作为展示资源保留。
- 上线前清理允许进行页面级懒加载和无效动态导入收敛，但不得改变功能行为、视觉 redesign、旧数据兼容承诺或桌面安装包分发配置。

## 验证结果

已验证：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run knip` 通过。
- 浏览器视觉烟测通过，并已重新启动本地开发服务到 `http://127.0.0.1:5173/`。
- 追加等值组件/Token 收敛后，`npm run check`、`npm run build` 和 `npm run knip` 通过；`/`、`/canvas`、`/prompts`、`/assets` HTTP 烟测返回 200，并已重新启动本地开发服务到 `http://127.0.0.1:5173/`。
- 多选组件追加收敛后，`npm run check`、`npm run build` 和 `npm run knip` 通过；`/canvas`、`/image`、`/video` HTTP 烟测返回 200，并已重新启动本地开发服务到 `http://127.0.0.1:5173/`。
- 上线前清理追加切片后，`npm run check`、`npm run build` 和 `npm run knip` 通过。
- 上线前清理追加切片后，`npm run lint` 零 warning。
- 上线前清理追加切片后，Vite renderer 构建不再输出大 chunk warning 或 `INEFFECTIVE_DYNAMIC_IMPORT` warning；最大 renderer chunk 约 491 kB，原主入口约 1,762 kB 已拆分为页面级 lazy chunk。
- 当前开发服务 `http://127.0.0.1:5173/` 的 `/`、`/canvas`、`/image`、`/video`、`/prompts`、`/assets` HTTP 烟测返回 200。
- Playwright 路由烟测通过，以上页面均可完成文本加载验证。
- 提示词数据源本地化后，`npm run check`、`npm run build` 和 `npm run knip` 通过。
- `http://127.0.0.1:5173/data/local-prompts.json` 返回 877 条本地提示词；分类计数为 `awesome-gpt-image` 53 条、`awesome-gpt4o-image-prompts` 76 条、`youmind-gpt-image-2` 126 条、`youmind-nano-banana-pro` 128 条、`davidwu-gpt-image2-prompts` 494 条。
- `/prompts` Playwright 烟测通过，页面显示“共 877 条提示词”，未再请求已知 404 的外部提示词数据库 URL。

视觉烟测截图：

- `test-results/phase6-design-convergence/home.png`
- `test-results/phase6-design-convergence/canvas-library.png`
- `test-results/phase6-design-convergence/prompts.png`
- `test-results/phase6-design-convergence/assets.png`
- `test-results/phase6-design-convergence/image-workbench.png`
- `test-results/phase6-design-convergence/video-workbench.png`
- `test-results/phase6-design-convergence/config-modal.png`
- `test-results/phase6-design-convergence/mobile-assets.png`
- `test-results/phase6-design-convergence/mobile-image-workbench.png`

说明：

- Electron agent bundle 构建仍输出 `dist-electron/agent/index.mjs 3.3mb` 的 esbuild 体积提示；桌面安装包分发配置不属于本轮上线前清理范围。
- 提示词条目中的远程封面 URL 仍可能受上游资源可用性影响；本切片只本地化提示词数据库，不下载封面资源。

## 遗留项

- 如需完全离线展示提示词封面，需要后续单独确认是否下载并本地化封面资源。
- Electron agent bundle 体积优化需要与桌面分发策略一起评估，未进入本轮 Web 上线前清理范围。
- Electron 安全密钥存储 adapter 和 Windows/macOS 安装包分发配置仍未进入本切片范围。
