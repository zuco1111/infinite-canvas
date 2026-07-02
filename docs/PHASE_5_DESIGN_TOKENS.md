# Phase 5 设计 Token 与组件抽取记录

状态：已完成。

日期：2026-07-02

用户授权：用户明确批准进入 Phase 5，并要求在存在不确定项时先确认后继续。本阶段未发现需要改变项目范围、视觉等效要求或架构决策的开放问题。

## 完成范围

- 应用 Ant Design 主题值已收敛到 `src/shared/tokens/app.ts`，`src/lib/app-theme.ts` 保持原有 `getAntThemeConfig` 入口并从共享 Token 读取。
- 画布浅色/深色主题值已收敛到 `src/shared/tokens/canvas.ts`，`src/lib/canvas-theme.ts` 保持原有 `canvasThemes` 与类型入口并从共享 Token 读取。
- 新增 `src/shared/ui/catalog-page.tsx`，抽取素材库和提示词库共用的页面滚动壳、标题区、筛选标签组、文本操作和状态文本。
- 新增 `src/shared/ui/settings-panel.tsx`，抽取图像、视频和音频设置面板共用的主题 Provider、设置分组、选项按钮、尺寸输入、数字输入、预览按钮和尺寸预览。
- `src/app/(user)/prompts/page.tsx` 和 `src/app/(user)/assets/page.tsx` 已迁移到共享 catalog 组件，保留原筛选行为、空状态和页面视觉。
- `src/components/image-settings-panel.tsx`、`src/components/video-settings-panel.tsx` 和 `src/components/audio-settings-panel.tsx` 已迁移到共享 settings 组件，保留原参数读写、尺寸输入提交时机和视频 Seedance 分支行为。

## 等值约束

- 本阶段只做 Token 与组件抽取，不进行视觉 redesign。
- 页面背景、筛选标签、按钮、设置面板尺寸、选中态、输入提交行为和主题色值保持等效。
- 未新增功能行为，也未修复旧迁移遗留问题。
- 未进行 feature 物理级分包；该项仍归入后续 Phase 6 清理与收敛。

## 验证结果

已验证：

- `npm run check` 通过。
- `npm run build` 通过。
- `npm run knip` 通过。
- 浏览器视觉烟测通过，应用页面 console error 为空。

视觉烟测截图：

- `test-results/phase5-visual/prompts.png`
- `test-results/phase5-visual/assets.png`
- `test-results/phase5-visual/image-workbench.png`
- `test-results/phase5-visual/video-workbench.png`
- `test-results/phase5-visual/video-settings.png`

说明：

- 浏览器工具自身曾出现一次外部统计请求超时，应用页面 `tab.dev.logs({ levels: ['error'] })` 返回为空，不计入应用错误。
- Phase 5 验证时 `npm run lint` 曾输出 Phase 4 已记录的 React hook dependency 与 Fast Refresh warning，本阶段未扩大处理范围。
- Phase 5 验证时 `npm run build` 曾输出 Phase 4 已记录的相关构建提示，本阶段未进行物理级分包。
- 上述 lint warning、Vite 大 chunk warning 和 ineffective dynamic import warning 已在后续 Phase 6 上线前清理切片中处理。

## 遗留项

- Phase 6 已完成上线前 warning 与 renderer chunk 清理；后续如继续做更深层物理分包，需要另行确认范围。
- 当前导入导出仍保持 Phase 4 迁移后的旧项目等效 zip 行为；新 `project.iczip` 格式仍是后续格式收敛方向。
- Electron 安全密钥存储 adapter 和 Windows/macOS 安装包分发配置仍未进入本阶段范围。
