# 发布与分发规则

## 桌面打包

- 桌面端打包使用 Electron Builder，配置入口为 `electron-builder.config.cjs`。
- 正式应用名为 `Infinite Canvas`。
- appId / bundle identifier 为 `com.zuco.infinitecanvas`。
- 应用作者、版权主体、用户可见署名和目标 Windows 发布者名称统一使用 `Zuco`。
- 桌面图标来源为 `public/zuco-brand.png` 生成的 `build-resources/icon.icns` 和 `build-resources/icon.ico`。
- 桌面包输出目录为 `release/`，中间资源目录为 `build/desktop-codex/`，二者不得提交。
- 打包前必须通过 `scripts/prepare-desktop-codex.cjs` 准备 Codex CLI 资源；npm 打包脚本已自动串联该步骤。
- 当前桌面产物为本地客户端分发包，且暂不启用自动更新。
- 不得在未确认正式证书和真机验收前声称已完成正式发布配置；未完成 Windows 代码签名前不得声称系统安装界面已显示正式发布者。

## 版本号

- 任何会生成桌面分发产物的默认打包入口都必须自动递增应用版本号；无特殊说明时执行 patch 递增。
- 桌面版本号递增由 `scripts/bump-desktop-version.cjs` 统一执行，并同步更新 `package.json` 和 `package-lock.json`。
- 可通过 `DESKTOP_VERSION_BUMP=minor|major` 指定递增级别。
- 可通过 `DESKTOP_VERSION=x.y.z` 指定版本。
- 只有在用户明确说明不更新版本号时，才允许使用 `SKIP_VERSION_BUMP=1` 或 `DESKTOP_VERSION_BUMP=none` 跳过自动递增。
- macOS 与 Windows 需要作为同一批版本同时出包时，必须使用 `npm run dist:desktop:all`，确保只递增一次版本号后生成多平台产物。
- 不得连续单独执行 `dist:desktop:mac` 和 `dist:desktop:win` 造成同一批产物版本不一致。
- `npm run dist:desktop:dir` 仅用于本地目录包烟测，不视为正式分发出包，默认不递增版本号。

## 分发产物清理

- 每次正式桌面分发打包前必须删除 `release/` 中旧版本的 `Infinite Canvas-*` 分发包，只保留当前 `package.json` 版本对应的包。
- 该清理由 `scripts/clean-old-desktop-packages.cjs` 统一执行，并已串入正式打包脚本。
- `build/`、`dist/`、`dist-electron/`、`release/`、`coverage/`、`playwright-report/` 和 `test-results/` 是生成物或验证产物，不进入版本控制。

## 路由与资源

- 桌面端 renderer 通过 `file://` 加载生产产物，Vite 生产构建必须保持相对资源 base。
- 页面侧引用 `public/` 静态资源时应使用 `src/shared/platform/public-assets.ts` 的 `publicAssetPath()`，不得直接写根路径 `/...`。
- 桌面端 `file://` 环境必须使用 hash 路由，例如 `index.html#/canvas`。
- 不得依赖 `history.pushState('/canvas')` 形式的根路径导航；Windows 会将 `/canvas` 解析为盘符根路径并导致入口点击无响应。
- 应用内路由入口必须通过共享路由层统一处理：普通文本链接使用 `next/link` shim，Ant Design 按钮式路由入口使用 `src/shared/router/route-button.tsx` 的 `RouteButton`，程序化跳转使用 `next/navigation` shim。

## 网络代理

- 本地 Web/preview 下远端 AI 请求和远程图片资源读取必须走 Vite 本地代理。
- 桌面 `file://` 下必须走 Electron 主进程注册的 `infinite-canvas://ai-proxy` 与 `infinite-canvas://resource-proxy`。
- 正式 Web 部署如需规避 CORS，必须提供同源代理并通过 `VITE_AI_PROXY_PATH` / `VITE_RESOURCE_PROXY_PATH` 配置。
- 不得默认把用户 API Key 转发到未知第三方代理。

## GitHub 推送

- 推送项目到 GitHub 时，源码提交推送到 `main`。
- 版本节点必须创建并推送 `vX.Y.Z` tag，tag 版本必须与 `package.json` 和 `package-lock.json` 一致。
- 客户端桌面分发产物不得提交到 git；应从 `release/` 目录上传到对应版本的 GitHub Release 作为附件。
- 当用户要求“推送 GitHub”且当前版本存在匹配的桌面分发产物时，默认同时创建或更新对应 GitHub Release。
- 默认只上传当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe` 三类客户端安装包。
- 不得上传 `.zip`、blockmap、latest 元数据或其他辅助产物，除非用户明确要求。
- 上传 GitHub Release 前必须确认附件文件名版本与当前 tag 一致，且附件范围严格限定为当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe`。
- 若 `release/` 中缺少这些必需产物，先按桌面打包约定生成或向用户说明无法上传。
