# 设计系统改前视觉基线

状态：已采集并冻结；阶段 1 已于 2026-07-11 获用户确认。

采集日期：2026-07-11

## 1. 基线身份

本目录保存设计系统视觉修改前、基于当前仓库实际运行结果采集的长期视觉证据。

| 元数据 | 当前值 |
| --- | --- |
| Source revision | acd16e3bd164a8cd5efa094e6e97e356dd2e2bd2 |
| Production input tree SHA-256 | 3949a6c8406af61b31d39df177a89dd057168b84d5770d6bb12b53a6a7c25764 |
| Capture script SHA-256 | bab35b96ca2a2c5eb1b3fb9a73be562dafe7d5423a910af685a96106b946e525 |
| Application | infinite-canvas 0.3.0 |
| Screenshot count | 59 |
| Total size | 约 5.3 MB |
| Web desktop viewport | 1440 × 900 CSS px |
| Web mobile viewport | 390 × 844 CSS px |
| Electron window | 1280 × 800；renderer 1280 × 768 CSS px；DPR 2；PNG 2560 × 1536 device px |
| Theme | Light/Dark，按矩阵覆盖 |
| Locale / timezone | zh-CN / Asia/Shanghai |
| Reduced motion | reduce |

完整机器可读元数据、逐文件尺寸、字节数和 SHA-256 在 capture-metadata.json；采集时的 console/page error 在 diagnostics.txt。

后续经用户批准的新目标基线必须保存到 docs/design-system/baselines/approved/<batch-id>/。test-results 只保存临时测试输出，不是长期事实源。

用户后续确认 `/` 首页非导航视觉在本轮保持不变。用户提供的完整 Electron 窗口参考图及所有适用组合的保护规则另存于 `docs/design-system/HOMEPAGE_VISUAL_FREEZE.md` 和 `docs/design-system/references/`；不得通过改写本目录增加或替换截图。

## 2. 运行环境

| 项目 | 本次解析版本 |
| --- | --- |
| OS | Darwin 25.5.0, x64 |
| Node.js | v25.8.0 |
| npm | 11.11.0 |
| Playwright | 1.61.1 |
| Chromium | 149.0.7827.55 |
| Electron | 43.0.0 |
| Electron app.getVersion() | 43.0.0；隔离 entry 启动未打包 runtime，不是 package.json 的 0.3.0 |
| Tailwind | 3.4.19；package.json 范围为 ^3.4.17 |

版本值来自实际采集进程，不以 package.json 的最低版本代替。

## 3. 截图矩阵

| 环境 | 主题/视口 | 数量 | 目的 |
| --- | --- | --- | --- |
| Web | Desktop Dark | 17 | 全路由、配置、详情、新增、Canvas 核心浮层、代表 loading/error |
| Web | Desktop Light | 12 | 全路由和 Canvas 关键状态的主题对照 |
| Web | Mobile Dark | 11 | 全路由、移动导航、参数 Drawer、Canvas |
| Web | Mobile Light | 5 | 代表页面、导航和 Canvas 主题对照 |
| Chromium file mode | Desktop Dark | 7 | 独立 Chromium 的 file:// hash route 烟测 |
| Isolated unpackaged Electron runtime | Desktop Dark | 7 | 生产 main/preload bundle、真实 BrowserWindow 与 file://；外层为采集隔离 entry |
| 合计 | — | 59 | — |

Electron 没有产品意义上的移动视口，因此不做 Electron × Mobile 组合。Light 主题已经在 Web 的桌面和移动代表表面覆盖；Electron 本轮用于验证真实桌面运行形态和 file:// 差异。

## 4. 完整截图清单

### 4.1 Web / Desktop Dark（17）

- web/desktop-dark/01-home.png
- web/desktop-dark/02-canvas-library.png
- web/desktop-dark/03-image-workbench.png
- web/desktop-dark/04-video-workbench.png
- web/desktop-dark/05-prompts.png
- web/desktop-dark/06-assets.png
- web/desktop-dark/07-config-channels.png
- web/desktop-dark/08-config-webdav.png
- web/desktop-dark/09-prompt-detail.png
- web/desktop-dark/10-asset-create.png
- web/desktop-dark/11-canvas-empty.png
- web/desktop-dark/12-canvas-node-types.png
- web/desktop-dark/13-canvas-appearance.png
- web/desktop-dark/14-canvas-shortcuts.png
- web/desktop-dark/15-canvas-assistant.png
- web/desktop-dark/16-prompts-loading.png
- web/desktop-dark/17-prompts-error.png

### 4.2 Web / Desktop Light（12）

- web/desktop-light/01-home.png
- web/desktop-light/02-canvas-library.png
- web/desktop-light/03-image-workbench.png
- web/desktop-light/04-video-workbench.png
- web/desktop-light/05-prompts.png
- web/desktop-light/06-assets.png
- web/desktop-light/07-config-channels.png
- web/desktop-light/11-canvas-empty.png
- web/desktop-light/12-canvas-node-types.png
- web/desktop-light/13-canvas-appearance.png
- web/desktop-light/14-canvas-shortcuts.png
- web/desktop-light/15-canvas-assistant.png

### 4.3 Web / Mobile Dark（11）

- web/mobile-dark/01-home.png
- web/mobile-dark/02-canvas-library.png
- web/mobile-dark/03-image-workbench.png
- web/mobile-dark/04-image-parameters.png
- web/mobile-dark/05-video-workbench.png
- web/mobile-dark/06-video-parameters.png
- web/mobile-dark/07-prompts.png
- web/mobile-dark/08-assets.png
- web/mobile-dark/09-mobile-navigation.png
- web/mobile-dark/10-config.png
- web/mobile-dark/11-canvas-workspace.png

### 4.4 Web / Mobile Light（5）

- web/mobile-light/01-home.png
- web/mobile-light/02-image-workbench.png
- web/mobile-light/03-prompts.png
- web/mobile-light/04-mobile-navigation.png
- web/mobile-light/05-canvas-workspace.png

### 4.5 Chromium file mode / Desktop Dark（7）

- electron-file/desktop-dark/01-home.png
- electron-file/desktop-dark/02-canvas-library.png
- electron-file/desktop-dark/03-image-workbench.png
- electron-file/desktop-dark/04-video-workbench.png
- electron-file/desktop-dark/05-prompts.png
- electron-file/desktop-dark/06-assets.png
- electron-file/desktop-dark/07-canvas-workspace.png

### 4.6 Isolated unpackaged Electron runtime / Desktop Dark（7）

- electron/desktop-dark/01-home.png
- electron/desktop-dark/02-canvas-library.png
- electron/desktop-dark/03-image-workbench.png
- electron/desktop-dark/04-video-workbench.png
- electron/desktop-dark/05-prompts.png
- electron/desktop-dark/06-assets.png
- electron/desktop-dark/07-canvas-workspace.png

## 5. 采集协议

### 5.1 隔离与安全

- Web 每个主题/视口使用全新 BrowserContext，不读取用户浏览器 profile。
- Electron 使用 test-results 下的空白 HOME 和 user-data-dir，不读取真实 Infinite Canvas profile 或本地 Agent 配置。
- 不点击启动 Local Agent，不调用真实 AI、WebDAV、在线 Assistant 或同步服务。
- 所有外部图片统一返回确定性的 MEDIA FIXTURE SVG。
- 其他外部 HTTP(S) 请求全部阻断。
- Web 同源 /__resource-proxy 直接返回 fixture，/__ai-proxy 直接阻断，不进入 Vite Preview 的代理中间件。
- Electron renderer 强制 offline；infinite-canvas://resource-proxy 在浏览器层直接返回 fixture，infinite-canvas://ai-proxy 直接阻断。
- Electron 通过隔离的 main entry 在加载未修改的生产 main bundle 前替换全局 fetch；拦截标记未生效时采集立即失败，避免主进程代理外网。
- Service Worker 禁用；动画在截图时禁用；caret 隐藏。

### 5.2 稳定条件

- Web 设置 zh-CN、Asia/Shanghai 和 reduced motion。
- Electron 通过隔离环境设置语言/时区，并使用 reduced motion media。
- 页面等待 body、目标主题和页面 marker 可见。
- 网络空闲最多等待 3 秒，随后稳定 500ms。
- Portal/交互打开后额外等待 650ms。
- 截图为当前 viewport，不使用自动 full-page 拼接。
- Canvas fixture 只创建本地确定节点，不发起生成。

### 5.3 交互步骤

- Light：从默认 Dark 通过真实主题切换按钮进入。
- Config：打开真实配置 Modal，并分别采集渠道与 WebDAV tab。
- Prompt：打开真实详情 Modal。
- Prompt States：在隔离 Context 中挂起本地 JSON 得到 loading，再返回确定的 503 fixture 得到 error；正常路由作为 success。
- Assets：打开真实新增素材 Modal。
- Canvas：从空 Catalog 新建画布，依次添加 Text、Config、Image、Video、Audio 节点并移动到确定位置。
- Canvas Overlay：打开 Appearance、Shortcuts、Assistant。
- Mobile：打开真实 Navigation Drawer 和 Image/Video Parameters Drawer。
- Electron：启动真实 Electron main/preload，遍历 hash route，并创建一个本地 Text Node。

## 6. 可复现命令

采集脚本位于 scripts/capture-design-system-current-baseline.mjs。它是“改前基线重写”工具，不是日常截图命令。

先安装 lockfile 对应依赖：

~~~sh
npm ci
~~~

然后执行：

~~~sh
DESIGN_SYSTEM_BASELINE_WRITE=OVERWRITE_FROZEN_CURRENT_BASELINE \
  node scripts/capture-design-system-current-baseline.mjs
~~~

脚本具有四层保护：

1. 必须提供显式确认变量。
2. 必须从仓库根目录运行；src、electron、public、HTML、Tailwind/PostCSS/Vite/tsconfig 和 package/lock 等生产渲染输入既不能有未提交修改，其 Git blob 清单 SHA-256 也必须与冻结值一致。文档提交不会改变该值，生产输入一旦变化则无法重写 current。
3. 脚本自行重建 renderer/electron，并在 127.0.0.1:4174 启动 strict、in-process Vite Preview；服务 HTML 必须与刚生成的 dist/index.html 完全一致。
4. 所有结果先写入 test-results staging；只有 59 个精确路径、预期尺寸、逐文件 hash、metadata，以及恰好 2 条 fixture 503 + 3 条 file-mode 已知错误全部匹配时才替换 current。采集失败时保留上一份完整 current。

发布时以 staging 目录整体替换 current，并保留/复制本 README；approved 基线永远不在脚本写入范围内。

生产视觉开始修改后，不得重写 current。新结果应写入 approved/<batch-id>，并使用独立的批准记录。

## 7. 已知诊断与环境差异

### 7.1 确定性 Prompt error fixture

web/desktop-dark/16-prompts-loading.png 与 17-prompts-error.png 分别冻结代表 loading/error 状态。diagnostics.txt 中对应的两次 503 console error 是采集脚本有意制造的本地错误，不是外部服务故障。

### 7.2 Chromium file mode 的提示词失败

独立 Chromium 直接打开 dist/index.html 时，Fetch API 不支持读取 file:///.../dist/data/local-prompts.json。结果：

- electron-file/desktop-dark/05-prompts.png 显示 Failed to fetch、0 条提示词。
- diagnostics.txt 另保存了 3 次对应 console error。
- 这是 Chromium file-mode 烟测的当前事实，不在阶段 1 修复。

真实 Electron runtime 的同一路由成功加载 510 条提示词，见 electron/desktop-dark/05-prompts.png。两组截图必须保留，不能把 Chromium 模拟结果冒充真实 Electron。

### 7.3 媒体与网络

截图中的外部媒体内容是统一 fixture，不代表真实远程图片的裁切、色彩或加载时序。当前基线用于组件、布局、状态和 overlay 对比，不用于评价媒体内容本身。

Chromium file-mode 为独立烟测，启动参数包含 --allow-file-access-from-files；它不是打包 Electron 的替代物。

### 7.4 字体与像素

仓库声明 Inter，但没有打包 Inter 字体资产。实际截图使用本机可用回退字体，跨 OS 可能出现字宽差异。Electron 组是隔离、未打包的 runtime，加载生产 main/preload bundle；navigator.language 为 zh-CN、时区 Asia/Shanghai、DPR 2。PNG 不能直接与 1x Web PNG 按原始像素尺寸比较。

### 7.5 状态覆盖边界

本轮基线覆盖全部公开路由、关键主题/视口、代表 Portal，以及 Prompt 的 success/loading/error；但不是每个组件状态的完整视觉笛卡尔积。Workbench pending/failure、键盘 focus、hover-only、长文本、200% zoom 和全部 Canvas 编辑 Dialog 已进入 INVENTORY.md；它们应在 Design Lab 的确定 fixture 中补齐，而不是依赖真实服务制造。

## 8. 人工检查记录

本轮已人工查看并确认以下代表截图可读且没有采集脚本遮挡：

- Config Modal 与 WebDAV tab。
- Prompt Detail、Asset Create。
- Prompt success/loading/error。
- Canvas 五类节点、Appearance、Shortcuts、Assistant。
- Mobile Navigation 与 Parameters Drawer。
- Chromium file mode 的提示词失败状态。
- 真实 Electron 的 Home、Prompts 510 条与 Canvas Workspace。

## 9. 基线使用规则

- current 是改前历史证据，不能随生产视觉变化滚动更新。
- 阶段 2 Design Lab 的“当前实现”必须使用真实组件或确定 fixture，并可回查本目录。
- 每个批准批次单独写入 approved/<batch-id>，不得覆盖其他批次。
- 比较前先核对 capture-metadata.json 中的 revision、环境、尺寸和 hash。
- 动态媒体、字体回退、Retina scale 和已记录诊断必须作为比较解释，不能误判为目标视觉决策。
