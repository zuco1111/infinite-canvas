# Phase 7 桌面端打包

状态：本地客户端分发包配置与三平台构建验证已完成；正式应用名、appId、图标和自动更新策略已确认。

日期：2026-07-02

用户授权：用户明确要求开始 Phase 7，并确认正式应用名使用 `Infinite Canvas`、图标使用现有 `public/zuco-brand.png`、appId 使用 `com.zuco.infinitecanvas`、暂不需要自动更新、Windows 真机验证后续再考虑。本阶段范围聚焦桌面端打包配置、三平台产物生成和本地运行烟测，不包含正式签名、公证或商店发布。

## 范围

- 使用 Electron Builder 生成桌面端分发产物。
- 使用 `Infinite Canvas` 作为正式应用名。
- 使用 `com.zuco.infinitecanvas` 作为桌面端 appId / bundle identifier。
- 使用现有 `public/zuco-brand.png` 生成桌面端图标资源。
- 支持目标平台：
  - Windows x64
  - macOS Intel
  - macOS Apple Silicon
- 保持 Web 与桌面共享同一 renderer、功能模块和 UI 表面。
- 将内置 Local Agent 和 Codex CLI 作为桌面包自包含资源处理。

## 实现内容

- 新增 `electron-builder.config.cjs`，配置 macOS dmg/zip、Windows NSIS/zip、asar、输出目录和 afterPack 钩子。
- 新增 `build-resources/icon.icns`、`build-resources/icon.ico` 和 `build-resources/icon.png`，由现有 `public/zuco-brand.png` 生成。
- 新增 `scripts/prepare-desktop-codex.cjs`，在打包前准备 `@openai/codex` 入口包和三平台 Codex 原生二进制包。
- 新增 `scripts/bump-desktop-version.cjs`，在桌面分发打包前自动递增应用版本号，并同步写入 `package.json` 与 `package-lock.json`。
- 新增 `scripts/clean-old-desktop-packages.cjs`，在正式桌面分发打包前删除 `release/` 中旧版本的 `Infinite Canvas-*` 分发包，只保留当前 `package.json` 版本对应的包，避免 release 目录长期残留多批版本。
- Electron Builder `afterPack` 按当前目标平台和架构只复制对应 Codex 原生包：
  - macOS Intel：`@openai/codex-darwin-x64`
  - macOS Apple Silicon：`@openai/codex-darwin-arm64`
  - Windows x64：`@openai/codex-win32-x64`
- Electron agent bundle 从 ESM 输出改为 CJS 输出，避免打包后 CommonJS 依赖的动态 require 失败。
- Electron 主进程的本地 agent 入口改为 `dist-electron/agent/index.cjs`。
- 打包后 agent 通过 `process.resourcesPath` 查找包内 Codex CLI；开发/未打包场景回退到本地 `node_modules`。
- Vite 生产构建使用相对资源 base，避免打包后 `file://` 加载 `/assets/...` 绝对路径导致客户端黑屏。
- 新增 `src/lib/public-assets.ts` 的 `publicAssetPath()`，用于在桌面包中正确定位 `public/` 下的品牌图和模型图标。
- 桌面端 `file://` 环境下客户端路由改为 hash 路由，例如 `index.html#/canvas`，避免 Windows 将 `/canvas` 解析为 `file:///C:/canvas` 后入口点击无响应；Web/开发环境仍保留普通路径路由。
- `src/shared/router/client-router-state.ts` 提供统一路由解析和链接生成函数，覆盖 Web、macOS `file://` 和 Windows `file://` 场景，并通过单元测试固化跨端路径行为。
- `next/link` shim 会自动把内部链接渲染为当前平台安全的 `href`；按钮式路由入口使用 `src/shared/router/route-button.tsx` 的 `RouteButton`。
- ESLint 已禁止页面侧直接给 Ant Design `Button` 写 `href`，也禁止原生 `a` 直接写根路径 `href="/..."`，避免新增入口绕开共享路由层。
- `release/` 和 `build/` 已加入忽略列表；`npm run clean` 会清理桌面中间资源和产物。

## npm 脚本

- `npm run bump:desktop-version`：递增桌面分发版本号，默认 patch 递增，例如 `0.1.0` -> `0.1.1`。
- `npm run clean:desktop-old-packages`：删除 `release/` 中旧版本的桌面分发包，保留当前 `package.json` 版本。
- `npm run dist:desktop:dir`：构建当前平台目录包，用于快速烟测。
- `npm run dist:desktop:mac`：先自动递增版本号，再构建 macOS Intel 和 macOS Apple Silicon 的 dmg/zip。
- `npm run dist:desktop:win`：先自动递增版本号，再构建 Windows x64 的 NSIS 安装器和 zip。
- `npm run dist:desktop:all`：先自动递增一次版本号，再同批构建 macOS Intel、macOS Apple Silicon 和 Windows x64 产物。
- `npm run dist:desktop`：先自动递增版本号，再按 Electron Builder 默认目标构建桌面分发产物。
- `npm run prepare:desktop-codex`：单独准备桌面包所需 Codex CLI 资源。

版本规则：

- 无特殊说明时，所有桌面分发打包入口默认执行 patch 版本递增。
- 如需同一批版本同时生成 macOS 与 Windows 产物，使用 `npm run dist:desktop:all`，避免分别执行单平台打包导致版本号连续递增。
- 如需 minor 或 major 递增，可使用 `DESKTOP_VERSION_BUMP=minor` 或 `DESKTOP_VERSION_BUMP=major`。
- 如需指定版本，可使用 `DESKTOP_VERSION=x.y.z`。
- 只有在用户明确说明不更新版本号时，才允许使用 `SKIP_VERSION_BUMP=1` 或 `DESKTOP_VERSION_BUMP=none`。
- `npm run dist:desktop:dir` 仅用于本地目录包烟测，默认不递增版本号。
- 正式分发打包入口会自动执行 `clean:desktop-old-packages`；目录包烟测入口 `npm run dist:desktop:dir` 不清理历史分发包。

GitHub 推送规则：

- 源码提交推送到 `main`，版本节点使用与 `package.json` 一致的 `vX.Y.Z` tag。
- `release/` 中的客户端桌面分发产物不得提交到 git，应上传到对应 tag 的 GitHub Release 作为附件。
- 当用户要求推送 GitHub 且 `release/` 中存在当前版本的 macOS 与 Windows 客户端产物时，默认创建或更新对应 GitHub Release，但只上传当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe` 三类客户端安装包。
- 不得上传 `.zip`、blockmap、latest 元数据或其他辅助产物，除非用户明确要求。
- 上传前必须确认附件文件名版本与当前 tag 一致，且附件范围严格限定为当前版本的 `mac-arm64.dmg`、`mac-x64.dmg` 和 `win-x64.exe`；缺少任一必需产物时，先按本文件的打包规则生成，或明确告知用户当前无法上传客户端附件。

## 验证结果

已执行并通过：

- `SKIP_VERSION_BUMP=1 npm run bump:desktop-version`
- `npm run check`
- `npm run knip`
- `npm run build`
- `npm run dist:desktop:dir`
- `npm run dist:desktop:mac`
- `npm run dist:desktop:win`
- 使用 Playwright 启动最终 macOS Apple Silicon `.app`，窗口标题返回 `Infinite Canvas`。
- 使用 Playwright 启动 macOS Apple Silicon 目录包，验证首页可渲染“无限画布/开始使用”，无页面异常、无失败资源请求。
- 使用 Playwright 点击首页进入“我的画布”，验证 `file://` 下站内跳转可用且无失败资源请求。
- 使用 Playwright 验证桌面目录包顶部功能入口可切换到 `#/canvas`、`#/image`、`#/video`、`#/prompts`、`#/assets`。
- 使用 Playwright 验证桌面目录包实际渲染出的应用内链接 href 为 `#/...` 形式，覆盖顶部导航、首页主操作和首页提示词入口。
- 使用 Playwright 验证画布库“新建画布”可切换到 `#/canvas/:id`，覆盖页面内 `router.push('/canvas/:id')` 场景。
- 使用打包后的 macOS Apple Silicon `.app` 启动并停止内置 Local Agent，状态从 `running: true` 正常回到 `running: false`。
- 使用包内 Codex CLI 执行 `--version`，返回 `codex-cli 0.142.5`。

已生成产物：

- `release/Infinite Canvas-0.1.0-mac-arm64.dmg`
- `release/Infinite Canvas-0.1.0-mac-arm64.zip`
- `release/Infinite Canvas-0.1.0-mac-x64.dmg`
- `release/Infinite Canvas-0.1.0-mac-x64.zip`
- `release/Infinite Canvas-0.1.0-win-x64.exe`
- `release/Infinite Canvas-0.1.0-win-x64.zip`

产物尺寸记录：

- macOS Apple Silicon dmg：约 209MB。
- macOS Intel dmg：约 224MB。
- Windows x64 NSIS 安装器：约 173MB。
- Windows x64 zip：约 257MB。

说明：包体大小主要来自 Electron runtime 和自包含 Codex 原生二进制。当前每个目标包只携带自身平台架构需要的 Codex 原生包。

### 2026-07-03 图片编辑修复后三平台客户端重包

用户要求：图片编辑 Loading 修复后重新打包客户端用于本地验收。

执行结果：

- 执行 `npm run dist:desktop:mac`，桌面版本号按约定自动从 `0.1.0` 递增到 `0.1.1`，并同步更新 `package.json` 与 `package-lock.json`。
- 重新生成 macOS Intel 和 macOS Apple Silicon 本地客户端分发包。
- 为补齐同一批 `0.1.1` 验收产物，随后执行 `npm run build && npm run package:desktop:win:no-bump`，使用当前 `0.1.1` 版本重新生成 Windows x64 本地客户端分发包，避免补包时再次递增为 `0.1.2` 导致同批版本不一致。
- 已确认 `release/mac/Infinite Canvas.app` 与 `release/mac-arm64/Infinite Canvas.app` 的 `CFBundleIdentifier` 为 `com.zuco.infinitecanvas`，`CFBundleName` 为 `Infinite Canvas`，`CFBundleShortVersionString` 与 `CFBundleVersion` 均为 `0.1.1`。
- 已确认 `release/win-unpacked/resources/app.asar` 存在。

新增产物：

- `release/Infinite Canvas-0.1.1-mac-arm64.dmg`，约 209MB。
- `release/Infinite Canvas-0.1.1-mac-arm64.zip`，约 209MB。
- `release/Infinite Canvas-0.1.1-mac-x64.dmg`，约 224MB。
- `release/Infinite Canvas-0.1.1-mac-x64.zip`，约 224MB。
- `release/Infinite Canvas-0.1.1-win-x64.exe`，约 173MB。
- `release/Infinite Canvas-0.1.1-win-x64.zip`，约 247MB。

## 已知限制

- 当前产物用于本地客户端分发和验收。
- macOS 正式发布配置待确认。
- Windows 正式发布配置待确认。
- 当前图标使用现有 Zuco 品牌图生成，尚未单独进行桌面端图标视觉优化。
- 应用作者、版权主体和 Windows 发布者名称尚未确认。
- 自动更新已确认暂不启用。
- Windows x64 产物已在 macOS 上完成交叉构建，但尚未在真实 Windows 设备上运行验收。
- Electron Builder 构建时仍会输出生产依赖扫描和 duplicate dependency references 噪声；最终 app.asar 已验证只包含 `dist`、`dist-electron` 和 `package.json`，Codex CLI 资源通过 afterPack 单独复制。

## 后续正式发布前待确认

- macOS Developer ID 证书、Team ID、notarization 账号和 hardened runtime 配置。
- Windows 代码签名证书和发布者名称。
- 是否需要减少包体，例如将 Codex CLI 改为首次运行下载或可选组件。
- Windows x64 真实设备安装和运行验收。
