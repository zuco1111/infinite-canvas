# 版本收尾清理记录

日期：2026-07-08

追加记录：2026-07-09

## 范围

本轮版本收尾覆盖：

- 项目残留与旧来源命名。
- 未使用函数、未使用导出和未使用资源。
- 无效分支、过期注释、废弃样式和历史兼容 fallback。
- `AGENTS.md` 治理文档收敛。
- 当前项目目录生成物清理。

## 已清理

- 将包名从 `infinite-canvas-refactor` 收敛为 `infinite-canvas`，并同步 `package-lock.json`。
- Web 平台版本号不再硬编码旧 `0.1.0`，改为由 Vite 从 `package.json` 注入。
- 删除旧 WebDAV `nextjs` proxy 模式、`/webdav-proxy` 分支、无效设置项和未使用的 WebDAV sync helper。
- 删除未使用的图片本地角度变换函数 `transformAngleDataUrl` 及其类型。
- 删除未使用的旧配置 storage key 常量 `infinite-canvas:ai_config_store`。
- 删除未使用的旧资源包装函数：`deleteStoredImages`、`cleanupUnusedImages`、`collectImageStorageKeys`、`deleteStoredMedia`、`cleanupUnusedMedia`、`collectMediaStorageKeys`。
- 收窄 feature public API，移除未被跨 feature 消费的页面内部组件、hook、工具函数和导出。
- 将顶层 `src/types` 横向目录收敛到 `src/shared/media/reference-types.ts`。
- 删除未被当前应用引用的 `public/icons/linuxdo.svg`。
- 删除当前桌面目标平台不使用的 `build-resources/icon.png`。
- 将 `AGENTS.md` 收敛为治理、边界、工程约束和验证要求文件。
- 新增 `docs/PROJECT_STATUS.md`、`docs/PRODUCT_CONSTRAINTS.md`、`docs/RELEASE_AND_DISTRIBUTION.md` 承载长期项目状态、产品约束和发布分发知识。
- 清理被 gitignore 的生成物目录，确保项目目录不保留可再生成的 `build/`、`dist/`、`dist-electron/`、`release/`、`test-results/` 等产物。
- 将版本号更新为 `0.2.1`，并同步 `package.json` 与 `package-lock.json`。
- 2026-07-09 将版本号更新为 `0.2.2`，并同步 `package.json` 与 `package-lock.json`。
- 2026-07-09 将版本号更新为 `0.2.3`，并同步 `package.json` 与 `package-lock.json`。
- 2026-07-09 为桌面 `file://` 下的 `infinite-canvas://ai-proxy` axios 请求补充 `fetch` adapter，并记录对应发布约束。
- 2026-07-09 调整画布节点 prompt 提交与拖拽选择交互，补充对应单元测试。
- 2026-07-09 将桌面正式分发安装包命名规则调整为 `Mac-AppleSilicon`、`Mac-Intel` 和 `Windows`，并在 `0.2.3` 中要求 DMG 内部卷宗标题同步使用该平台名，不再显示原始 `arm64` / `x64`。
- 2026-07-09 新增 GitHub Release 固定 latest 下载别名策略：版本归档附件继续保留版本号，内部测试分发链接使用不带版本号的 `Infinite-Canvas-Mac-AppleSilicon.dmg`、`Infinite-Canvas-Mac-Intel.dmg` 和 `Infinite-Canvas-Windows.exe`。
- 将应用作者、版权主体、目标 Windows 发布者名称和用户可见署名统一为 `Zuco`。
- 将内置提示词库中明确要求画面署名、作者落款或水印的旧默认名称统一替换为 `Zuco`。

## 保留判断

- 非 GPT 图片模型请求分支仍服务当前多模型/多供应商配置能力，仅将测试命名从 `legacy` 改为 `non-GPT`，不删除行为。
- `next/link` 与 `next/navigation` shim 仍服务 Vite/Electron 共享路由层，不属于可删除旧兼容。
- 旧项目审计文档中的旧路径、旧 storage namespace 和 `/webdav-proxy` 记录是历史证据，不作为当前运行时代码残留清理。

## 验证记录

- `npm run format` 通过。
- `npm run typecheck` 通过。
- `npx knip --include exports` 通过。
- `npm run check` 通过，覆盖 `format:check`、`lint`、`check:boundaries`、`typecheck` 和单元测试；单元测试结果为 10 个测试文件、28 个测试全部通过。
- `npm run build` 通过。
- `npm run test:e2e` 通过，4 个 Playwright 测试全部通过；执行过程中仅出现 `NO_COLOR` 与 `FORCE_COLOR` 环境变量提示，不影响结果。
- `npm run smoke:desktop-hash-routes` 通过，覆盖 `#/`、`#/canvas`、`#/image`、`#/video`、`#/prompts` 和 `#/assets`。
- `npm run clean` 已用于最终清理生成物目录。
- 2026-07-08 版本 `0.2.1` 追加验证：`npm run check` 通过，11 个测试文件、32 个测试全部通过。
- 2026-07-08 版本 `0.2.1` 追加验证：`npm run build` 通过。
- 2026-07-08 版本 `0.2.1` 桌面分发验证：`DESKTOP_VERSION=0.2.1 npm run dist:desktop:all` 通过，生成 `release/Infinite Canvas-0.2.1-mac-arm64.dmg`、`release/Infinite Canvas-0.2.1-mac-x64.dmg` 和 `release/Infinite Canvas-0.2.1-win-x64.exe`；`.zip`、blockmap 和 latest 元数据仅作为打包生成物保留在本地，不作为默认 GitHub Release 附件。
- 2026-07-08 版本 `0.2.1` 追加验证：`npm run smoke:desktop-hash-routes` 通过，覆盖 `#/`、`#/canvas`、`#/image`、`#/video`、`#/prompts` 和 `#/assets`。
- 2026-07-09 版本 `0.2.2` 追加验证：`npm run check` 通过，13 个测试文件、36 个测试全部通过。
- 2026-07-09 版本 `0.2.2` 桌面分发验证：`DESKTOP_VERSION=0.2.2 npm run dist:desktop:all` 通过，生成 `release/Infinite Canvas-0.2.2-Mac-AppleSilicon.dmg`、`release/Infinite Canvas-0.2.2-Mac-Intel.dmg` 和 `release/Infinite Canvas-0.2.2-Windows.exe`；`.zip`、blockmap 和 latest 元数据仅作为打包生成物保留在本地，不作为默认 GitHub Release 附件。
- 2026-07-09 版本 `0.2.2` 追加验证：`npm run smoke:desktop-hash-routes` 通过，覆盖 `#/`、`#/canvas`、`#/image`、`#/video`、`#/prompts` 和 `#/assets`。
- 2026-07-09 版本 `0.2.2` 追加验证：`npm run test:e2e` 通过，4 个 Playwright 测试全部通过；执行过程中仅出现 `NO_COLOR` 与 `FORCE_COLOR` 环境变量提示，不影响结果。
- 2026-07-09 版本 `0.2.3` 追加验证：`npm run check` 通过，13 个测试文件、36 个测试全部通过。
- 2026-07-09 版本 `0.2.3` 桌面分发验证：`DESKTOP_VERSION=0.2.3 npm run dist:desktop:all` 通过，生成 `release/Infinite Canvas-0.2.3-Mac-AppleSilicon.dmg`、`release/Infinite Canvas-0.2.3-Mac-Intel.dmg` 和 `release/Infinite Canvas-0.2.3-Windows.exe`；DMG 挂载卷宗标题分别验证为 `Infinite Canvas 0.2.3-Mac-AppleSilicon` 与 `Infinite Canvas 0.2.3-Mac-Intel`；`.zip`、blockmap 和 latest 元数据仅作为打包生成物保留在本地，不作为默认 GitHub Release 附件。
- 2026-07-09 版本 `0.2.3` 追加验证：`npm run smoke:desktop-hash-routes` 通过，覆盖 `#/`、`#/canvas`、`#/image`、`#/video`、`#/prompts` 和 `#/assets`。
- 2026-07-09 版本 `0.2.3` 追加验证：`npm run test:e2e` 通过，4 个 Playwright 测试全部通过；执行过程中仅出现 `NO_COLOR` 与 `FORCE_COLOR` 环境变量提示，不影响结果。
- 2026-07-09 版本 `0.2.3` Release 分发追加验证：`npm run prepare:latest-release-aliases` 通过，并已将 `Infinite-Canvas-Mac-AppleSilicon.dmg`、`Infinite-Canvas-Mac-Intel.dmg` 和 `Infinite-Canvas-Windows.exe` 上传到 GitHub Release；固定 `/releases/latest/download/...` 下载链接返回有效响应。

## 阻塞项

当前未发现需要用户确认后才能删除的历史兼容项。
