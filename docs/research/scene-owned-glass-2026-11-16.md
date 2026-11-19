# Lenso 局部场景 Glass Renderer 研究

复议结论：长期方向应验证「保留 DOM/SDK 交互语义、合成范围可扩展的光学合成器」，不能把永久独立的小场景宣布为最优架构。局部场景是起点；上限取决于完整的光学输入与合成顺序，下限由独立可用的 DOM 路径和明确降级保障。Rust/Wasm 不是这项选择的前提。

2026-11-17 新增上限探针已在本机 Chromium / Playwright WebKit 跑通有序叠层、显式提供的文字和同一合成域内跨照片/文字区域；详情见文末。它没有建立任意 DOM 获取、独立场景交换或性能优势。

照片扩展进一步限定了收益：动态照片下 Playwright WebKit 的提交与尾帧改善；静态照片、单块小玻璃且双方公平缓存时，优势基本消失，Chromium 的提交 P95 还略有倒退。不能推广为所有玻璃组件的默认提速方案。

这是实验性实现与有限环境证据，不是 Safari/iPhone/Windows/Android 性能问题已经解决的声明。原型在 `experiments/scene-owned-glass/`，不改变任何已发布入口、组件 API 或主题。

## 范围、版本和证据等级

- 检查起点：本地 HEAD `95a852fa1baf997cd5722a0309211184367070c1`，2026-11-16 UTC / 2026-11-17 Asia/Shanghai。
- 当前工作树在开始时已经修改 `refraction.ts`、`backdrop-scheduler.ts` 及相关浏览器测试和贡献文档。本研究保留这些修改；它们不是本研究的产物。
- **代码事实**：能从当前源码直接确认的分支、资源、API 调用。
- **推断**：由架构推导出的成本或风险，不等于在用户设备上归因成功。
- **本机测量**：独立实验的真实浏览器结果，不能外推到其它 GPU、浏览器或应用页面。
- **未验证**：缺少真机、驱动、合成器或 GPU 时间证据的项目。

外部一手来源及浏览器发布状态见[平台研究](scene-owned-glass-platforms-2026-11-16.md)。不以身份不明的 Telegram 演示作为技术依据。

## 当前实现：GPU 核心存在，背景入口仍有多层成本

### 实际路由比「Safari 走 GPU fallback」更受限制

1. [`refraction.ts`](../../packages/glass/src/refraction.ts) 的 `refractsBackdrop()` 用 Chromium UA 正则决定 live SVG backdrop 折射，不是像素级特性探测。`attachOptics()` 又令非 Chromium AppleWebKit 进入 `nativeBlur`，普通 `canCopy` 因此关闭。**系统 Safari 的普通控件不应被概括为总在运行 DOM 复制或共享 GPU 路径。** 它可能只有原生模糊与前景边缘。
2. 显式 `backdropSource` 仅在 `liveBackdrop && !selection && !liveGeometry` 等条件下尝试，失败或来源关系不合法时回落。[`backdrop-snapshot.ts`](../../packages/glass/src/backdrop-snapshot.ts)、[`backdrop-perimeter.ts`](../../packages/glass/src/backdrop-perimeter.ts) 与 `shared-core/snapshot.ts` 已经建立部分背景提供者契约。因此应扩展已有所有权概念，不再创造另一套不相关的页面截图协议。
3. [`backdrop.ts`](../../packages/glass/src/backdrop.ts) 的 `copyBackdrop()` 可建立 inert、aria-hidden 的 sibling DOM 副本。只有 viewport 且没有 input overlay 时才异步尝试 `registerSharedBackdrop()`。完整副本保留为回退，不会因为 GPU 模块存在就自动消失。
4. [`native-backdrop-candidate.ts`](../../packages/glass/src/native-backdrop-candidate.ts) 只接受 DPR 精确为 1 或 2、apple 材质、blur 精确为 3 或 8。DPR 3 的 iPhone、1.25/1.5 的常见 Windows 缩放不会满足该候选条件。**这是源码限制，不是在这些设备上测得的掉帧根因。**
5. [`gpu-backdrop.ts`](../../packages/glass/src/gpu-backdrop.ts) 进一步检查整数尺寸/边距、可解析 optics、表面尺寸、圆角、背景不透明性、source 覆盖范围、transform/filter/opacity。small 最大 256 × 256，medium 最大 512 × 1024；core 的精确几何和材料要求见 `core-optics.ts`。有 WebGPU 不代表满足这些条件。
6. 优先使用可匹配的 `shared-core` WebGL2；否则符合条件的非 nativeFallback 表面才可用 WebGPU fitted optics。分组键含 source、optics、尺寸、margin、DPR 等；不同尺寸/材质可能分裂成多个 group，不能把每页所有玻璃视为一个 batch。

### 捕获、上传和呈现

| 阶段          | 代码事实                                                                                                       | 成本判断及限制                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 背景解释      | `gpu-capture.ts:paintTree()` 只接受自包含 DIV/SPAN paint，无文本、URL 图片、常规流布局、复杂效果；多种动画拒绝 | 不是任意 DOM 截图，也不覆盖视频/Canvas/照片应用的所有背景                                                 |
| DOM 复制      | `backdrop.ts` 与 `gpu-capture.ts` 各有 clone/style 配对逻辑，但用于不同呈现路径                                | 有保留、缓存与渐进回退，不能把每次 clone 都说成每帧发生                                                   |
| SVG 栅格化    | `capture().update()` 序列化 foreignObject → SVG data URL → `Image.decode()` → 2D draw                          | 背景版本或保留范围失效时可能付出序列化/解码成本；是否是主瓶颈需 trace                                     |
| 已有缓存      | `createBackdropAtlas()` 保留 source-space 区域、复用 crop、追踪变更 tile；参见已有 11-10 缓存报告              | 不能声称当前实现每次滚动都完整重新捕获。连续不受支持背景变化仍是限制                                      |
| alpha 分支    | 不透明背景可传 canvas；其它路径存在 `getImageData()`                                                           | 确实存在显式 CPU 像素读取，但不能宣称所有镜片/所有帧都 readback                                           |
| WebGL core    | `shared-core/webgl.ts`：背景 revision 改变时 `texSubImage2D`，两次 blur，instanced lens draw                   | GPU 光学并未消除 Canvas 来源上传；同一 revision 不重复上传/blur                                           |
| core 呈现     | `shared-core/batch.ts`：共享离屏 WebGL atlas → 每个表面的 2D `drawImage()`                                     | 跨 Canvas 表示转换，浏览器可能优化；不能未经 GPU trace 断言一定经过 CPU                                   |
| WebGPU maps   | `gpu-optics.ts` 初始化：SVG/image decode、2D canvas、`copyExternalImageToTexture`、`onSubmittedWorkDone`       | 明确同步存在于 map 准备阶段，不是每帧无条件 queue wait                                                    |
| WebGPU 更新   | canvas upload 或 `writeTexture`、blur、多个 render pass、copy 到多个目标                                       | dirty cells 避免部分 lens 重画，但源 blur、atlas allocation 等不因此为零                                  |
| 调度          | `backdrop-scheduler.ts` 汇总读写，观察 mutation/resize/scroll/字体/输入/动画                                   | 仍有活跃 client 的 RAF 发现逻辑和动画 keyframe 检查。规模影响是推断，不能直接给主线程占用数字             |
| fusion fields | `fusion-gpu.ts`：PBO `readPixels` → fence 轮询 → `getBufferSubData` → CPU 精确修复 → PNG 编码                  | 这是 GPU 辅助 field preparation，不是 GPU 常驻最终画面。调用频率取决于几何失效，不能称为每帧 GPU readback |
| 光学初始化    | `refraction.ts`、`foreground-rim.ts`、`optical-fields.ts`                                                      | 起始工作树已在减少仅 foreground 情况的无用 field 准备，本研究不重复归功或覆盖其改动                       |

### 应优先观测的风险

**代码支持的风险**：候选分支频繁不满足、动态几何造成 group 重建、来源失效触发捕获、每表面呈现转换、高 DPR 下填充/模糊带宽、fusion field 的回读与编码。

**尚未确认的用户问题**：Windows/Android/iOS 掉帧究竟来自上述哪一项、驱动阻塞、热降频、布局还是第三方页面内容。本研究没有这些报告的复现页面或用户设备 trace，因此不将任何一项宣布为根因。

## 路线比较

| 路线                  | 能获得什么背景                           | 优势                                                  | 代价 / 判断                                                                     |
| --------------------- | ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| A. 独立 Glass shader  | 已有纹理或重建背景                       | 自己控制批处理、光学、缓存                            | Lenso 已有大部分；单独重写 shader 不能解决来源边界                              |
| B. DOM + GPU 局部场景 | 应用明确交给场景的内容                   | 保留真实 DOM 控件、输入、UI SDK；同上下文纹理直接采样 | **首选**。需显式处理几何、clip、z-order、Portal、滚动快照                       |
| C. 局部自绘整个区域   | Viewer、地图、图表、媒体等自己持有的内容 | 最容易保证纹理与玻璃同一帧                            | 适合 Photo Viewer/工具条，不适合默认接管普通表单与任意内容页面                  |
| D. Rust/Wasm          | 与 TS 同样需要来源                       | 大型 CPU 场景/布局或复用成熟渲染器时可能有价值        | 无 CPU 热点收益证据前不引入；保留启动、内存、桥接和资源传输成本                 |
| HTML-in-Canvas        | 支持浏览器中 canvas-owned drawable 后代  | 可能复用 DOM 排版/语义并获取像素                      | Chrome 157 厂商报告已发布；需探测并单独实测，不当作 Safari 方案                 |
| Flutter/Skia 全自绘   | 自己的完整场景                           | 渲染、布局与输入模型可统一                            | 大依赖与独立语义/文本桥接，不符合当前增量接入目标；不是免费的 Safari DOM 捕获器 |

先选 WebGL2 作为跨引擎实验路径，原因是它已能复用当前 GLSL，具有 framebuffer/instancing/纹理，能直接检验核心假设。没有证据表明多维护一个 WebGPU 后端会使本实验更公平。后续可按 compute blur、批次规模和测量结果再决定是否增加。

## 独立原型与对照契约

运行与复现见 [`experiments/scene-owned-glass/README.md`](../../experiments/scene-owned-glass/README.md)。所有新增实现仅在 experiments，平台笔记与本报告在 docs。

- **resident**：一个 WebGL2 context。背景 fragment shader → source framebuffer → 水平/垂直 blur → 同一背景上 instanced optics。纹理保留于该上下文。
- **upload**：相同背景 shader 在 source Canvas 生成 → **未修改的现有 `GlassRenderer`** 调用 `render_canvas()` → 原有上传、blur、optics → transparent Canvas 叠在同一背景上。
- 相同 CSS viewport、DPR、镜片数量（动态场景四块，静态小面积场景一块）、rounded geometry、time、scroll、15.3 CSS px blur 参数、IOR 1.5、RGB 1.02/1/.98、material tone、高光。直接引用 generated GLSL 与 `toneShader()`，不另写弱化版材质。
- 沿用 shader 的有限卷积循环，未改变既有最大 tap 范围。DPR 2 并不意味着无限 Gaussian support；不能据 full-resolution 宣称完整数学高斯核或原生 Apple 像素一致。
- 原生 DOM button 负责可访问名称/焦点/点击；UI SDK `bindDrag` 负责 pointer 跟踪与取消；Alt+方向键提供移动替代。弹簧沿用 `advanceSpring()`。
- 背景是真正可滚动的 scene；滚动偏移进入背景 uniform。不是旧截图平移伪造动态同步。
- 通过 WebGL2 context、texture-size、framebuffer、shader compile/link 检查选择路径，不通过 UA 判断。失败显式显示 unavailable；不把无折射 fallback 冒充成功。
- 显式删除 buffer/VAO/program/texture/framebuffer，释放 Canvas backing size；测试 loss/restore、重复挂载，旧 Canvas 的异步 loss 不能破坏新实例。

### 对照明确不代表的事情

这对照的是**当前 core 的跨 Canvas 输入契约**，不是完整 `attachGlass` 与所有浏览器实际默认路径的速度竞赛。它刻意不加入 DOM 捕获，以免背景内容和失真程度不同。两个 arm 都不需要 SVG 序列化，因此不能用这个测试量化「省下 DOM 捕获」的毫秒数。上传 API 调用也不等于每次必然 CPU 回读；浏览器内部能否零拷贝不由该计数证明。

当前 resident 每次动态帧仍全画背景、全分辨率 blur，再一次 instanced draw，**没有实现 dirty regions 或遮挡剔除**。背景不变时，两条路径都保留 source revision 与 blur。静态单镜片对照已加入，但仍使用全场景纹理；没有测量现有裁剪 atlas，不能据此宣称新路线优于它。

## 首轮验证结果（动态图案）

### 环境与方法

本机 Apple M2 Pro、macOS 27.2.1。Chromium 158.0.8127.18 以 headed ANGLE Metal 运行，报告 `ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)`；Playwright WebKit 27.2 报告 `Apple GPU`。这不是安装的 Safari。

800 × 480 CSS px、4 个镜片，DPR 1/2；每个组合三对交替顺序运行，每次预热 500 ms、采集 180 个 RAF 间隔，总计 24 个样本。每 12 个 callback 派发一次 range input。以下为各样本分位数的中位数，单位 ms，不把三个样本混成一条更稳定的长序列。计时期间没有并行构建或另一个实验浏览器测试，但不是专用空载机器，也没有温度控制。

首次尝试检测到默认 headless Chromium 使用 SwiftShader，因此未纳入性能结论。核对后还移除了 upload arm 中无用的 optical program 编译和重复 lens buffer 提交；下表只采用这一修正后的最终重跑，不使用更有利的旧初始化数据。

### 有限环境中 WebKit 提交与尾帧改善，Chromium 无明显帧率收益

表中「旧」= 当前 core + Canvas upload；「新」= scene-owned resident。帧时间是 **RAF callback 间隔，不是 GPU 时间或最终呈现时间**。

| 引擎 / DPR            | 旧帧 P50 / P95 / P99 | 新帧 P50 / P95 / P99 | 提交 P95 旧 / 新 | 合成输入至提交 P95 旧 / 新 |
| --------------------- | -------------------- | -------------------- | ---------------- | -------------------------- |
| Chromium / 1          | 8.3 / 10.1 / 10.2    | 8.3 / 9.9 / 10.2     | 0.6 / 0.4        | 0.9 / 0.8                  |
| Chromium / 2          | 8.3 / 9.1 / 10.1     | 8.3 / 9.8 / 10.2     | 0.1 / 0.1        | 0.3 / 0.2                  |
| Playwright WebKit / 1 | 17 / 21 / 29         | 17 / 18 / 19         | 9 / 1            | 11 / 2                     |
| Playwright WebKit / 2 | 16 / 30 / 33         | 17 / 18 / 19         | 15 / 1           | 16 / 2                     |

**解释边界：** WebKit DPR 2 的中位帧间隔并未变小，P95/P99 和提交耗时变小；Chromium 在 DPR 2 新路径 P95 反而略高。不能宣称所有浏览器都更快、平均帧率翻倍或输入可见延迟为 2 ms。WebKit 时间粒度约 1 ms；报告 0 的 JS 提交样本不等于零成本。输入计时从合成 handler 内部开始，排除了硬件输入、排队、合成与 scanout。

Chromium 每次约 1.5 s 样本内的 CDP 主线程 task 时间：DPR 1，旧 152.0/154.8/161.1 ms，新 152.0/156.8/147.6 ms；DPR 2，旧 30.1/24.9/24.7 ms，新 22.9/22.7/113.1 ms。存在明显波动，不据此归因整体 CPU 收益。Chromium 观测到的长任务为 0；WebKit 不支持该观察与 CDP 指标，记为 unavailable，而非 0。

navigation-to-ready 的中位数（旧/新）为 Chromium DPR 1 86.3/87.1 ms、DPR 2 73.9/84.8 ms；WebKit DPR 1 75.3/71.7 ms、DPR 2 108.0/72.3 ms。这包含导航自动化和可能温热的 Vite 缓存，不是冷启动或首个可见玻璃画面，不作为首次打开性能结论。

### 结构性不变量与资源

- 每个 180 callback 样本，旧路径有 209 次 `texSubImage2D`，新路径为 0。额外提交来自合成输入和随后的 scroll handler；不是每次提交都对应一个新显示帧。
- 两个 arm 的 `readPixels`、`getImageData`、SVG 序列化、`Image.decode` 在计时窗口均为 0。说明 scene-owned 的运行循环不需要这些显式操作；不证明浏览器内部无拷贝，也不量化旧 DOM 栈的成本。
- 每个样本重复卸载/挂载 6 次，共 144 次释放检查；显式创建的 texture/framebuffer/program/buffer/VAO 在每次卸载后计数均为 0。**未测物理 GPU/CPU 内存字节和驱动回收时机。**
- 代码按显式资源估算仅三张 RGBA8 scene texture 就需要 \(w \times h \times d^2 \times 12\) 字节（d 为 DPR）；800 × 480、DPR 2 是 18,432,000 字节。该数不含 Canvas backing、浏览器中间缓冲、program、driver，不是实测占用。新路径不应被宣传为天然更省显存。

### 正确性与视觉边界

- Chromium 与 Playwright WebKit，DPR 1/2/3，明暗材质共 12 组固定时间/滚动位置像素对照：最大通道差 1/255，平均差均小于 0.000158 个 8-bit channel unit。这里比较同浏览器两 arm，不比较跨浏览器/native Apple。
- 两引擎三个 DPR 均通过实际滚动像素变化、pointer drag、Alt+方向键、spring 按压、材质切换、两种路径的 context loss/restore、unmount/remount、320 px 布局与命中区域边界、动态 reduced-motion 检查。
- 已有 Glass 回归通过：45 个普通测试与 99 个 DOM 测试；DOM 测试不证明浏览器布局。实验 typecheck、Glass typecheck、受影响 lint/format 与独立 Vite production build 均通过；没有运行完整仓库候选门禁。
- 独立构建产物另以 Playwright 请求拦截模拟静态服务，在 Chromium/WebKit 验证挂载、两条路径选择及 context 恢复，无页面异常。这不是整个组件库的 production consumer 门禁，也没有用构建后的结果替代开发入口性能数据。
- 第一次截图审阅发现 label 对齐错误，已修正 StyleX custom property 的 DOM 应用，并通过后续像素与几何测试。最终截图再次调用 `view_media` 时被 Amp 每日上传配额阻止，**没有完成最终肉眼视觉验收**。保留 live preview 和截图，不把像素 parity 冒充美术审阅。

逐样本摘要及正确性结果保存在 [`results-2026-11-16.json`](../../experiments/scene-owned-glass/results-2026-11-16.json)；完整原始数组、日志和截图在本工作区 `.amp/in/artifacts/scene-owned-glass/`，复现脚本会重新生成它们。独立 production build 为约 30.72 kB JS / 11.23 kB gzip 的 fixture 输出，不是已发布组件包、网络冷启动或 Rust/Flutter 包体对比。

### 真机缺口

- macOS Safari：尝试 safaridriver 建立 session，连接 Safari 超时，未获得有效测量；临时进程已清理。
- iPhone 15 Pro Max / iOS 27.2.1：曾连接并尝试打开 Safari，导航结果不确定；复查显示系统 Spotlight，可能有并行用户操作，因此停止并释放控制权。没有 iOS Safari 合格样本，也没有继续干扰设备。
- Windows Chrome、Android Chrome：没有对应真机样本。macOS 上调整 DPR 不是这些设备的仿真证明。
- GPU execution、物理 input-to-present、持续热/功耗、真正 first-visible latency、内存峰值和 assistive technology 均未完成。

## 照片与静态小面积扩展

### 公平缓存后，静态场景不再体现上传优势

新增 Scene 选择器及 `?scene=photo-dynamic`、`?scene=photo-static-small`。复用仓库的 `apps/docs/public/assets/demo/photos/0.jpg`，1600 × 1067、88.92 kB，来源与 Unsplash 许可见同目录 README；没有引入 CDN 请求或新依赖。照片按比例覆盖可滚动内容，动态场景随时间平移，静态场景忽略时间，但显式滚动仍更新采样位置。

静态场景仅保留一块 172 × 64 CSS px 镜片，在 800 × 480 视口的外接矩形占比为 2.87%，其余三个按钮从可见布局与键盘导航中隐藏。双方只在背景 time/scroll 改变时更新 revision；镜片移动复用原 blur，不强迫 upload 重传。静态 idle 不提交画面，但实验 RAF 时钟仍运行，不能称为零 CPU 或零调度。

本轮与首轮同一机器、引擎和 GPU 设置。每个引擎 × DPR 1/2 × 两种新场景 × 两条路径各三次，交替路径顺序，共 48 个样本。预热 500 ms 后采集 180 个 callback；动态场景每 12 callbacks 合成滚动输入，静态场景改为 Alt+左右移动镜片，保持背景不变，再检查 60 callbacks 的 idle。计时与浏览器回归、构建分开运行；共享工作站没有热状态或后台进程控制。

以下仍是样本分位数的中位数，单位 ms。「旧」为现有 core + 全场景 Canvas 输入，「新」为同 context resident；不是裁剪 atlas，也不是完整 DOM/SVG 栈。

| 场景 / 引擎 / DPR         | 旧帧 P50 / P95 / P99 | 新帧 P50 / P95 / P99 | 提交 P95 旧 / 新 | 合成输入至提交 P95 旧 / 新 |
| ------------------------- | -------------------- | -------------------- | ---------------- | -------------------------- |
| 动态照片 / Chromium / 1   | 8.3 / 9.8 / 10.2     | 8.3 / 10 / 10.3      | 0.6 / 0.4        | 0.8 / 0.7                  |
| 动态照片 / Chromium / 2   | 8.3 / 9.3 / 10.2     | 8.3 / 9.7 / 10.2     | 0.1 / 0.1        | 0.2 / 0.3                  |
| 动态照片 / WebKit / 1     | 17 / 19 / 23         | 17 / 18 / 19         | 8 / 1            | 11 / 2                     |
| 动态照片 / WebKit / 2     | 16 / 29 / 31         | 17 / 18 / 20         | 14 / 1           | 15 / 2                     |
| 静态小玻璃 / Chromium / 1 | 8.3 / 10 / 10.2      | 8.3 / 9.9 / 10.3     | 1.3 / 1.4        | 1.3 / 1.4                  |
| 静态小玻璃 / Chromium / 2 | 8.3 / 10 / 10.2      | 8.3 / 10 / 10.3      | 1.1 / 1.3        | 1.2 / 1.3                  |
| 静态小玻璃 / WebKit / 1   | 17 / 18 / 19         | 17 / 18 / 19         | 2 / 2            | 2 / 2                      |
| 静态小玻璃 / WebKit / 2   | 17 / 18 / 19         | 17 / 18 / 19         | 2 / 2            | 2 / 2                      |

动态照片下，WebKit DPR 2 的提交 P95 为 14 / 1 ms，callback P95 为 29 / 18 ms；中位帧间隔没有改善。静态小玻璃下，WebKit 的帧分位数和提交 P95 相同，Chromium 提交 P95 新路径略高。样本少、时间粒度有限，不宣称统计等价；这些结果足以反对普遍提速的结论。

### 上传与绘制计数支持边界，而非普遍性能承诺

- 动态照片每样本 upload 有 194 次 `texSubImage2D`，resident 为 0；两者均有 209 次镜片 draw。双方复用同一 source revision，所以合成输入后的额外 scroll handler 不再无条件重传。不能将此计数与首轮的 209 次直接解释为跨版本提速。
- 静态场景两条路径每样本均为 0 次新增上传、0 次背景生成和 blur，15 次镜片 draw。resident 另有 15 次全背景 composite；upload 没有对应的全屏 copy draw。静态优势消失与双方保留缓存一致，但没有 GPU 时间证明这些额外 draw 的具体成本。
- 24 个静态样本各自的 idle 窗口均为 0 次提交与 0 次被插桩 API 调用。所有样本的显式 readback、SVG 序列化和 `Image.decode()` 在计时窗口仍为 0。
- 48 × 6，共 288 次卸载检查，显式 texture/framebuffer/program/buffer/VAO 均归零，包含新增照片 texture。它证明显式释放，不证明驱动即时回收或真实内存字节。
- 照片每页面解码一次，每个新 context 初始化时上传一次；context restore 也重建照片纹理。这些发生于 warm 窗口之外。现在 navigation-to-ready 包含照片加载/解码，即使默认是 procedural，也不能与首轮无照片入口比较冷启动。

### 新资源恢复与像素回归通过，最终视觉审阅仍受限

三场景 × 两引擎 × DPR 1/2/3 × 明暗材质，共 36 组像素对照，最大通道差为 1/255，最大平均差约 0.000209 个 8-bit channel unit。新增检查覆盖真实照片时间变化、静态时间保留、镜片移动的实际几何与像素变化、滚动使静态背景失效，以及两条路径在 remount/context restore 后恢复照片像素；原有拖拽、spring、材质、320 px 布局和 reduced-motion 检查继续通过。

缓存回归在 DPR 3 的小数 CSS 位置发现 stage 圆角裁切抗锯齿存在 1 个通道单位的重绘差异。定位到裁切边缘后，使用最大差 ≤ 1、平均差 < 0.001 的像素比较检查重复画面，避免把 PNG 字节相等当作渲染契约；跨路径对照阈值未放宽。另隐藏原生 overlay scrollbar，避免其淡出混入 stage 截图，原生滚动、键盘和 range 输入仍可用。

本轮实验 typecheck、受影响 oxlint/oxfmt 与独立 production build 通过；构建产物在 Chromium/WebKit 各两场景、两路径均能挂载及恢复 context，照片 asset 正常加载，无页面异常。输出约 33.32 kB JS / 11.92 kB gzip，另有 88.92 kB JPEG；不是发布包或网络冷启动结果。没有运行完整仓库候选门禁，也没有新增真 Safari/iPhone/Windows/Android 样本。

截图已保存，但本轮再次调用 `view_media` 被每日上传配额阻止，仍未完成最终肉眼视觉验收；自动像素、布局和交互检查不替代该验收。已重新通过单次登录 URL 打开现有 Portal，确认 HTTP 200、lab ready，无失败请求。

本轮逐样本摘要、源码哈希和正确性结果保存在 [`results-photo-2026-11-16.json`](../../experiments/scene-owned-glass/results-photo-2026-11-16.json)，首轮 JSON 保持不变。完整数组、日志、截图、production/Portal 检查记录位于 `.amp/in/artifacts/scene-owned-glass/`。所有改动仍为本地未提交；没有修改公共 API、发布包、推送或部署生产。

## 长期建议及九个问题

1. **绕过 WebKit 核心限制了吗？** 在自有纹理上，路径不使用 SVG backdrop-filter，实验已能验证该绕行机制；这与修复 WebKit 对页面 backdrop 的实现不是一回事。真正 Safari/设备支持需单独验证。
2. **哪里能完整折射？** 完整交给 scene 的图像、视频帧、Canvas、自绘背景可采样；来源之外的 DOM、跨来源受保护内容、浏览器 UI 仍不在纹理内。显式像素 provider 也需完整性/新鲜度契约。
3. **收益具体从哪里来？** 可以消除跨 Canvas source upload API、副本同步和每镜片 output Canvas；在全 owned scene 才可消除 DOM 捕获。实际速度是否改善由等画质测量决定，不由这些结构性减少直接推定。
4. **API 能不变吗？** 既有组件保持；需要新的可选 scene host/provider 或扩展现有 provider 才能声明来源和 z-order。没有背景声明的旧用法不能悄悄升级为真实折射。
5. **需要完整自绘吗？** 取决于光学依赖范围。Photo Viewer 可以作为起点，但文字、叠层和跨区域光学可能要求扩大可视合成范围，不能一概排除页面级自绘。React/UI SDK/DOM 可以继续持有状态、交互和语义，但把所有可见文字永久放在所有 GPU 光学之上会限制画质。
6. **值得 Rust/Wasm 吗？** 当前不值得。原型的 CPU 只提交少量 lens records；GPU shader 与背景来源不因语言变更获益。只有 profiler 指向可批量转移的大 CPU 任务，再比较 TS、worker 和 Wasm 的冷启动/包体/耗时。
7. **替换 `@lenso/glass` 吗？** 不立即替换。实验先保留；具备目标设备证据后，抽取现有 optical core 的可重用纹理入口，避免维护两套材质算法。公开 provider 的升级需独立 API 设计。
8. **能力选择如何做？** 先确认 source 所有权和语义，再检查 context/资源/材质/clip 限制；小型实际像素 probe 再选择 native SVG / owned WebGL2 / 后续 WebGPU。context lost 立即停止提交并恢复或降级；不在失败后无界重试。CSS.supports 只能证明语法，不证明正确 backdrop 像素。
9. **长期核心方向？** 作为局部场景能力值得继续验证；还不支持作为所有组件的默认渲染架构。跨引擎高质量玻璃的核心契约应是背景所有权、帧一致性和渐进回退，而不是指定 Rust 或单一 GPU API。

## 分阶段工程任务与退出条件

### 先把可采纳性验证完整

- 在 macOS Safari、iPhone DPR 3、Windows Chrome 常见分数缩放、Android Chrome 真机，顺序重复相同场景。采集 release 入口及开发入口，区分冷启动与 warm frame；记录热状态/设备/浏览器/driver。
- 增加实际 Viewer 图像/视频来源与旧 provider 同场景对照，不只测 procedural background；验证跨域图片策略、色彩空间、alpha 和动态媒体。
- 已补本机照片与静态单镜片对照；继续补现有裁剪 atlas 的等画质对照、密集镜片与频繁 resize。不能把全场景 Canvas 输入对照推广成优于裁剪路径。
- 加合成器呈现 trace 和物理输入测量，获得 input-to-present 而非 handler-to-submit；使用可用的 disjoint timer query/平台 profiler 单独测 GPU，不用 `gl.finish()` 污染常规 benchmark。
- 退出条件：同画质下目标设备没有稳定收益，或 frame 同步/语义代价超过收益，停止推广，保留现有回退。

### 再做一个真正消费方

- 仅选 Photo Viewer 的明确图片背景。复用 `GlassBackdropSourceContext` 的所有权边界，设计 scene-frame 快照（geometry、clip、z、source revision、theme）。公共 UI 控件 API 不变。
- 所有布局 read 批量收集，GPU 与 DOM foreground 从同一 frame snapshot 更新。异步 compositor scrolling 不保证 JS 每帧同步；先明确该场景支持的 scroll 方式。
- Portal 必须显式登记目标 scene 和层级，不能仅按 React 树猜 painter order。clip chain 需要 scissor/stencil/mask，而不是只保留一个圆角矩形。
- 叠层玻璃要按 painter order ping-pong 到其它 framebuffer，前层采样后层的完成输出；禁止同一 texture 同时作为采样源和绘制目标。文末的独立探针已实现显式有序叠层；融合形状仍未实现。
- 退出条件：复杂 clip、DOM 外部遮挡、Portal 或辅助技术用例不满足时，保持原路径，不能只隐藏差异。

### 最后才考虑共享核心和后端扩展

- 将已证明可用的 GPU texture 输入纳入 optical core，保留单一材质源码、许可证和参数模型。按 changed region 与 blur sampling halo 传播 dirty rect，再按需要批处理、实例化和资源池。
- 加 idle/offscreen 暂停、分辨率预算、资源丢失重建、内存压力策略；不得为了维持帧率静默降低光学质量。
- 单独评估 Chrome HTML-in-Canvas 渐进后端与 WebGPU compute；只有测量显示收益，才评估 Rust/Wasm。每个后端都必须有像素与交互契约测试。

## 设计取舍

这是一页研究仪器而非营销页面。沿用系统字体和 Lenso 的克制信息层级；浮动控件使用玻璃是因为其背景采样正是实验对象。暖色/青色、细线和移动圆盘是明确的折射/模糊测试图案，不是品牌资产。页面 chrome 固定浅色，Switch material 只切换被测材质，便于控制对照条件。无 logo、头像、虚构数据或对外性能宣称。

## 上限探针：有序叠层、文字与同域跨区已跑通

2026-11-17，独立入口 `experiments/scene-owned-glass/ceiling.html`，复用原监督服务，从旧实验顶部链接进入。没有修改公共 Glass API、依赖或组件实现。原入口的 StyleX 边框声明改为显式长属性，去掉已确认的浏览器默认厚按钮边框。

绘制顺序是照片、显式文字区、下层玻璃、下层标签、上层玻璃。两个交替目标保存已完成图像，每层玻璃对当前图像模糊并折射，禁止读写同一纹理。最高层自己的标签和命中区域保留真实 DOM，拖拽沿用 SDK `bindDrag`；下层文字进入纹理，不再永远浮在所有光学上方。

### 对照排除了“只画重叠形状”和“只有模糊”

- **独立参考**：使用未修改的 `GlassRenderer`，先渲染下层，再通过 2D 合入标签，再把完成结果交给第二个 `GlassRenderer`。新路径与此参考最大通道差在两引擎均为 1/255，平均差分别约 0.00114 / 0.00131 个 8-bit channel unit，WebGL error 为 0。该测试在实现前失败，最大差 239、平均差约 74.29；不是只检查两条同样错误的新路径。
- **下层标签依赖**：固定上层镜片内、排除其自身 DOM 标签的 80 × 28 CSS px 区域，修改下层文字。有序路径像素改变，共享底图负对照最大差和平均差均为 0。该对照明确展示共享底图会漏掉已绘制的下层内容。
- **下层材质依赖**：清空下层主标签，开关下层玻璃，上层内部的同一区域仍改变；其差异不只来自标签。当前辅助标签在 ROI 之外。
- **文字折射依赖**：单独文字探针中，固定 blur/material，仅将位移系数从 1 改为 0。镜片区域最大差为 115/255，而排除边缘的平坦中心所有通道差为 0。修改提供的场景文字也会改变镜片内部像素。
- **跨区移动**：镜片实际跨越照片/文字边界，指针拖动时检查不包含 DOM 标签的镜片边缘像素改变；Alt + 方向键移动，Escape 取消拖动并恢复几何。这里的“跨区”指共享一个合成器的两个来源区域，不是独立 Canvas/DOM 场景之间的自动交换。

### 实际验证与视觉审阅

本机 M2 Pro、macOS 27.2.1，headed Chromium 158 / ANGLE Metal、Playwright WebKit 27.2，DPR 1/2。`ceiling-test.mjs` 通过以上对照、明暗材质、低/高 blur、文本编辑、context lost 的可读 DOM 回退、恢复完整像素、四次 remount、390 px 几何和 reduced-motion 下操作。没有进行真实 Safari、iPhone、Windows、Android 或屏幕阅读器验收。

已检查最终 WebKit 默认、共享底图、blur-only、文字与文字 blur-only、跨区、暗材质、高模糊、失效态和窄屏截图，以及通过已登录 Runner Portal 打开的完整桌面入口。窄屏纸面文字裁切和下层表面越界已修正。折射会使下层标签重影或缺损，这是可见的光学测试结果，不代表产品可读性已经达标。

实验 typecheck、oxlint、oxfmt 通过。原照片/静态实验两引擎 × DPR 1/2/3 × 明暗 × 三场景共 36 组对照及交互回归通过，最大通道差为 1/255。`bun run test` 完整运行通过（仓库测试以及 9 个 workspace 任务成功、没有缓存复用）；未运行生产候选门禁。没有修改生产构建集成，本入口是 dev 研究工具。

### 上限证据成立的边界与成本

这证明保留 DOM 交互并不必然阻止叠层和文字折射，但前提是可见光学输入已交给同一合成域。这里的文字从显式内容模型用 Canvas2D 栅格化，不是任意 DOM 捕获；原生选区、场景内编辑、IME、DOM Portal 层级、复杂 clip、融合和合成器滚动同步仍未证明。

本路径优先正确性：七张全尺寸 RGBA8 目标，加照片纹理；每次绘制上传两个 paint Canvas，并按玻璃层重复全图模糊。没有脏区、上传缓存或图层缓存优化。没有持续动画时钟；但未据此测得功耗、显存或逐帧优势。不能拿原照片 resident/upload 的性能表为此路径背书。

原始结果与截图：`.amp/in/artifacts/scene-owned-glass/ceiling/`；完整仓库测试日志 `.amp/in/ceiling-repo-tests.log`。所有改动为本地未提交，没有推送、发布或生产部署。

## 叠层成本实测：正确性成立，当前实现尚不能规模化承诺流畅

2026-11-17，使用新增 `ceiling-benchmark.mjs`，未修改 renderer、页面或 shader。M2 Pro 16 核 GPU、16 GB 统一内存、macOS 27.2.1、接交流电，headed Chromium 158.0.8127.18 / ANGLE Metal 和 headed Playwright WebKit 27.2 / Apple GPU。这是共享开发机，未停止用户其它应用，不是隔离实验室或热稳定性、功耗测试；WebKit 也不等于安装版 Safari 或 iPhone。

### 方法与指标不能混淆

- 正式扫测 120 组：2 引擎 × DPR 1/2 ×（原页面双层交互和 renderer 1/2/4/8 层）× blur 1.2/15.3 × 3 轮。每组 24 次预热，30 个 idle RAF，120 个测量 RAF，一次 RAF 执行一次绘制；奇数轮反向次序。总计 14,400 次正式绘制。
- 页面组通过真实 Alt + 方向键 handler 移动上层，包含 DOM/StyleX/status 更新；renderer 组去掉原页面 renderer，用同一个类和两张原 paint Canvas，在页面中绘制重叠层。照片、文字保持静态，仅镜片位置改变，保留完整分辨率、明材质及相同光学参数；不是每帧重新排版文字或视频测试。
- RAF interval 是回调节奏，不是 GPU 执行、实际 present 或硬件输入延迟；各浏览器基础节奏不同。submission 是 JS/WebGL 调用墙钟，可含驱动阻塞，不能解释为全部渲染成本。计数器和计时 wrapper 自身有开销。
- 每组之后另做 20 次 render + 同步 1 像素 `readPixels` 墙钟诊断，共 2,400 次，不混入正式窗口；包括 CPU、等待、传输和同步开销，不是纯 GPU busy time，也不等于完整画面呈现。
- 下表对 P50/P95 分别取三轮的中位数。括号展示各轮 P50 范围，避免隐藏 WebKit 的长会话异常；不是把全部帧混成一次独立运行。

### DPR 2 下叠层和模糊的代价已显现

880 × 460 CSS px、σ 15.3 CSS px，renderer 组，单位 ms：

| 玻璃层数 | Chromium 回调 P50 / P95 | WebKit 回调 P50 / P95 | WebKit 各轮 P50 范围 | Chromium / WebKit 提交 P50 | Chromium / WebKit render + readback P50 |
| -------- | ----------------------- | --------------------- | -------------------- | -------------------------- | --------------------------------------- |
| 1        | 8.3 / 9.3               | 21 / 27               | 18–35                | 0.1 / 8                    | 8.9 / 18                                |
| 2        | 16.6 / 17.6             | 27 / 40               | 20–40                | 0.1 / 9                    | 16.0 / 25                               |
| 4        | 29.8 / 37.1             | 51 / 80               | 34–387               | 0.1 / 10                   | 32.0 / 41                               |
| 8        | 58.1 / 66.7             | 392 / 427             | 390–405              | 0.1 / 16                   | 58.7 / 77                               |

**392 ms 不能被当成 WebKit 的固定八层着色器成本。** 额外启动三个独立浏览器，只跑 DPR 2 / σ15.3 / 8 层，每次同样预热和测 120 RAF，P50 为 **60、60、59 ms**，P95 为 78、90、65 ms，render + readback P50 三次均 67 ms，提交 P50 三次均 11 ms。初测没有控制原生宿主应用是否处于前台，不能称为显存泄漏，也不能据此给渲染管线排名。后续同 context 对照已复现非前台退化与前台恢复，见文末诊断；此表保留为历史数据，不用受控重测覆盖它。

σ1.2 时，DPR 2 renderer 的 Chromium 1/2/4/8 层回调 P50 为 8.3/8.3/16.6/30.6 ms；WebKit 为 17/19/43/37 ms，但 WebKit 八层各轮为 37、398、34 ms，不能把非单调中位数理解成八层更便宜。DPR 1 明显轻于 DPR 2，完整数据保留在 JSON，不据此宣称任意设备达到固定 FPS。

原页面默认双层、低 blur、DPR 2：Chromium 回调 P50/P95 8.3/9.3 ms；WebKit 17/27 ms，各轮 P50 16–34 ms。将 blur 提至 15.3：Chromium 16.5/17.7 ms；WebKit 21/26 ms，各轮 P50 20–40 ms。说明默认演示的流畅程度不能代表高模糊、密集叠层的预算。

### 显存只得到逻辑资源账本，没有物理驻留读数

拦截实际 `texImage2D` 及删除调用，所有组均为七张 scene-size RGBA8 中间纹理，加一张 1600 × 1067 RGBA 照片；没有 mipmap。纹理逻辑字节为 `7 × round(880 × DPR) × round(460 × DPR) × 4 + 1600 × 1067 × 4`。1 到 8 层的显式纹理分配相同。

| DPR | 七张目标 MiB | 照片 MiB | 合计 MiB | 证据                         |
| --- | ------------ | -------- | -------- | ---------------------------- |
| 1   | 10.81        | 6.51     | 17.32    | 实际 API 分配账本            |
| 2   | 43.24        | 6.51     | 49.75    | 实际 API 分配账本            |
| 3   | 97.28        | 6.51     | 103.80   | 由公式计算，本轮未运行 DPR 3 |

MiB = 1,048,576 bytes。该账本不是独立显存芯片占用、进程 RSS、物理驻留或峰值测量，也不应拿来作为物理驻留的严格上下界。M2 是统一内存；默认 drawing buffer（当前 `depth:true`、`antialias:false`）、浏览器合成表面、两个 Canvas2D backing、照片解码、上传暂存、驱动对齐/缓存都未纳入，不能未经确认把可能共享的分配再次相加。WebGL 没有提供这页的物理显存字节读数。

按同一分配方式扩大到 1440 × 900 CSS px、DPR 2，纹理逻辑合计约 144.94 MiB，这是容量推算，不是已跑过的大屏性能或物理显存数据。七张中的一张仅供 shared 负对照，正常路径仍分配它；这些不是生产实现的最低必要纹理数。

### 成本来自实际工作，不因复用纹理而消失

每次重绘均上传两张完整 paint Canvas，DPR 2 时 API 输入像素为 **12.35 MiB/帧**；若以 60 次重绘/秒执行，对应 **741.21 MiB/s** 的逻辑输入量。后者是假设频率的算术，不是测得的物理内存带宽、PCIe 传输或当前实际提交频率。

玻璃层数为 N 时，预热后的每次重绘实际为 **4N + 5 次 draw**：每层两次全图 blur、一次全图 copy、一次玻璃 draw；两张 paint 各有 copy/draw，最后一次呈现 copy。两层为 13 次，八层为 37 次；blur 次数从 4 增至 16，纹理容量却不随 N 增长。这解释了为什么固定分配不能推出固定逐帧成本，但没有给 GPU 各阶段耗时作精确归因。

所有 120 组的 30 个 idle RAF 中，draw/upload/readback 计数都为零。96 个 renderer 组在 dispose 后显式 Texture/Framebuffer/Program/Buffer/VertexArray 计数均归零，3 次独立会话也通过相同断言。这只能验证 API 对象清理，不代表驱动立即释放内存或没有浏览器内部资源问题。

### GPU query 的异常数据被保留，但没有进入正式分数

预跑 Chromium 支持 `EXT_disjoint_timer_query_webgl2`，却出现双层 query P50 28–49 ms 对应回调约 8.3–8.6 ms、八层约 90 ms 对应回调约 16.6 ms 的不一致。即使 disjoint 未置位，也不足以把读数解释成排他的 GPU 执行时间。正式 120 组及三个独立会话均关闭 query，GPU 时间记为 null；WebKit 在本环境没有该扩展。

所检查的 [ANGLE QueryMtl.mm](https://raw.githubusercontent.com/google/angle/170484eea03a4255a388072add4232e1fadfbee4/src/libANGLE/renderer/metal/QueryMtl.mm) 在 query 起止处 flush command buffer；[mtl_command_buffer.mm](https://raw.githubusercontent.com/google/angle/170484eea03a4255a388072add4232e1fadfbee4/src/libANGLE/renderer/metal/mtl_command_buffer.mm) 累加每个 buffer 的 `GPUEndTime - GPUStartTime`。跨度累加不应直接解释成不重叠的 GPU busy time。本机 Chromium 所含 ANGLE 的确切提交未锁定，因此源码是计量风险证据，不是对本机异常的完整归因。

### 下一步应优先去掉已知重复工作并定位退化

先定位 WebKit 长轮次退化，再验证静态 paint 纹理和已完成下层缓存、带 sampling halo 的 dirty-region/blur 裁剪；继续用独立像素参考约束优化，不通过静默降分辨率或换材质制造提速。这些是基于实际调用的优化候选，还没有测得收益。当前数据既不能证明 Rust/Wasm 能解决这些成本，也不能拿来比较不同场景的 Even UIKit。

复现命令：`node experiments/scene-owned-glass/ceiling-benchmark.mjs`。独立会话使用 `ENGINE=webkit DPRS=2 KIND=renderer LAYERS=8 BLUR=15.3 PERF_RUNS=1 PERF_FRAMES=120`，每次新进程执行并另存结果；默认会覆盖同名 JSON。计时期间不做源代码修改、构建或另开测试浏览器；其它应用未受控。

原始文件在 `.amp/in/artifacts/scene-owned-glass/ceiling/`：`performance-layered.json` / `performance-layered-sweep.json` 为完整扫测；`performance-layered-summary.json` 为聚合；`performance-layered-isolated.json`、`-isolated-2.json`、`-isolated-3.json` 为三次独立启动；`performance-layered-query-smoke.json` 为弃用的 query 诊断。日志在 `.amp/in/ceiling-benchmark-final.log` 与 `ceiling-benchmark-isolated*.log`。新增基准与研究为本地未提交，未优化生产或实验 renderer，没有推送或部署。

## WebKit 长会话诊断：非前台状态可触发调度退化

2026-11-17 进一步定位：**同一 context、同一八层负载，非前台运行后出现 413 ms RAF P50；只激活原生浏览器应用即恢复 59 ms。** 不需要重启浏览器、重建 context、释放纹理或修改 shader。受控前台的完整 60 组重测没有重现约 400 ms 的异常。证据支持宿主非前台状态参与的调度退化，不支持把旧数值解释为八层 shader 的固有成本或已确认的显存泄漏。

### 先排除容易混淆的解释

- 只重复八层高 blur，DPR 1/2 各四轮，没有复现异常：DPR 2 各轮 P50 为 62、59、59、59 ms。另连续创建、绘制并释放 32 个 context 后，八层为 60、59 ms，原始基线 62 ms。context 数量增长本身在这些控制中不足以触发问题，不等于排除所有资源风险。
- 恢复完整混合历史、每组改测 60 RAF 后，再次出现八层 P50 402、399 ms；对应的 **30 个不提交绘制的 idle RAF 也为 401、399 ms**。这排除用每帧光学工作直接解释全部 400 ms。该轮在完成第 43 组后、下一组期间激活宿主，最后一轮八层恢复 59 ms；它不是全程保持同一前后台条件的实验，不作为纯后台三轮数据。
- `document.visibilityState === "visible"` 和 `document.hasFocus() === true` 在异常时仍成立。它们不能代替 macOS 的原生前台应用状态。`lsappinfo` 读到实际前台为 Amp；激活后为 `org.webkit.Playwright`。

### 同一个 renderer 的前台/非前台对照

隔离页面只创建一个被测 renderer；880 × 460 CSS px、DPR 2、八层、σ15.3、相同照片与两张 paint 来源。每个观察窗口 24 次 warm-up、30 次 idle、30 次绘制，窗口间不更换 context 或数据。只切换哪个原生应用处于前台，没有缩放、改画质、增加同步 readback 或用新 context 清理状态。

| 同一实例的状态           | 绘制 RAF P50 | idle RAF P50 | JS/WebGL 提交 P50 |
| ------------------------ | ------------ | ------------ | ----------------- |
| 非前台，异常前一个窗口   | 60 ms        | 17 ms        | 11 ms             |
| 非前台，异常窗口         | 413 ms       | 397 ms       | 17 ms             |
| 激活浏览器后的下一个窗口 | 59 ms        | 17 ms        | 11 ms             |

RAF timestamp 与独立 `performance.now()` 墙钟间隔的最大差为 1 ms，异常不是单纯时间戳虚报。本轮有一次明确的退化/恢复转换；此前首段 16 个非前台窗口仍为 58–62 ms，不能声称一切到后台就必然立即退化或存在已知固定触发时长。

**本阶段定位边界：** 当时尚未区分 App Nap、遮挡/显示链路、WebKit 内部节奏控制或其它宿主策略。下节追加的进程策略往返干预已确认 UI 进程 task suppression 的因果影响，但没有建立每个内部阶段的逐帧因果链。采样栈出现 `prepareForDisplay` 同步 IPC 和 ANGLE Metal 上传等待，仍不能单独给约 400 ms 归因。没有得到真 Safari/iPhone 的相同复现。

### 首尾验证原生前台状态后，八层连续三轮为 54 ms

新增 `PERF_FOREGROUND=1` 诊断开关，仅支持本机 macOS headed WebKit：每组前激活原生 Playwright 应用，首尾确认其为原生前台；另外记录 idle 节奏、页面可见/焦点状态。首尾检查不等于逐毫秒跟踪窗口状态，也不是产品防后台节流方案。未修改实验或生产 renderer。

同一混合矩阵：DPR 1/2、原页面双层与 renderer 1/2/4/8 层、两种 blur、三轮正反扫测，60 组，每组 60 次正式绘制。计数、资源释放和 WebGL error 断言通过；所有组 idle P50 为 17 ms，最大绘制 P50 为 54 ms，没有超过 150 ms 的组。DPR 2、σ15.3 renderer 结果：

| 层数 | 三轮 RAF P50    | 三轮 RAF P95    | 三轮 render + readback P50 |
| ---- | --------------- | --------------- | -------------------------- |
| 1    | 18 / 18 / 18 ms | 26 / 25 / 22 ms | 18 / 18 / 18 ms            |
| 2    | 19 / 20 / 19 ms | 23 / 25 / 25 ms | 25 / 25 / 24 ms            |
| 4    | 32 / 32 / 32 ms | 34 / 35 / 35 ms | 37 / 38 / 37 ms            |
| 8    | 54 / 54 / 54 ms | 61 / 62 / 62 ms | 63 / 63 / 63 ms            |

这是新的受控条件和较短测量窗口，不与旧 120-RAF 表计算提速倍数，也不修改 Chromium 的历史分数。约 54–60 ms 的八层本身仍超出 60 Hz 预算；全尺寸逐层 blur 和每帧两次 paint 上传的真实成本没有被消除。49.75 MiB 显式纹理账本也没有变化，仍不是物理驻留测量。

受控复现：`ENGINE=webkit DPRS=1,2 PERF_RUNS=3 PERF_FRAMES=60 PERF_FOREGROUND=1 PERF_OUTPUT=session-foreground.json node experiments/scene-owned-glass/ceiling-benchmark.mjs`。省略 `PERF_FOREGROUND` 可保留不主动激活的历史条件，使用不同的 `PERF_OUTPUT` 保留结果；非前台不保证每次复现。

证据在原 `ceiling/` 目录：`session-repro.json`、`session-contexts-32.json`、`session-mixed.json`、`session-activation.log`、`session-activation-16.json`、`session-foreground.json`。前台/非前台观察日志 `.amp/in/ceiling-activation-probe.log`；混合和受控日志为 `ceiling-session-mixed.log`、`ceiling-session-foreground.log`。本轮仅改测量与研究说明，没有优化光学实现或修改系统节能设置；仍未提交、推送或部署。

## 系统机制追踪：UI 进程的 CPU 调度抑制已有因果对照

2026-11-17 补充。**完整解除 UI 进程抑制后，同一实例从约 400 ms 恢复至 54 ms；随后在未锁屏会话中，仅清除 UI 的两个 CPU 抑制字段，也将约 400 ms 降至 61–65 ms，恢复字段后再次变慢。** 这把定位从“非前台相关”推进到 macOS App Nap 所用的 CPU 调度抑制。不能再把它仅列为没有实测依据的猜测，也不能说单个 timer 字段负责全部延迟。

### 完整策略往返：没有切前台或重建 GPU 资源

本机 macOS 27.2.1（26B131）、M2 Pro、Playwright 1.65.0 / WebKit r2388 / browser version 27.2。继续使用同一八层 renderer、880 × 460 CSS px、DPR 2、σ15.3、照片和两张 paint 来源。每窗口顺序测 24 个不绘制 RAF 和 30 个绘制 RAF，记录 RAF timestamp、独立墙钟、原生前台应用及进程策略；不是 GPU busy time 或最终呈现延迟。

完整往返发生在锁屏条件：所有窗口原生前台均为 `com.apple.loginwindow`，没有尝试解锁。UI PID 91000；Networking / GPU / WebContent 分别为 91001 / 91003 / 91004。未附加 profiler/debugger，没有修改 context、shader、几何、分辨率或另加 readback。

| 同一实例的 UI 策略         | idle RAF P50    | 八层绘制 RAF P50 |
| -------------------------- | --------------- | ---------------- |
| 原策略，仅做只读查询后     | 407 ms          | 400 ms           |
| 全部字段清零，连续三个窗口 | 17 / 17 / 17 ms | 54 / 54 / 54 ms  |
| 恢复原向量，连续两个窗口   | 405 / 401 ms    | 400 / 407 ms     |

每个清零窗口之后再次读取全部进程：UI 的 16 个策略字段仍为零，`PROC_FLAG_SUPPRESSED` 为 0；恢复原向量后该标志回到 1，最终策略与原向量完全相同。其它三个进程的 suppression 向量在各检查点均未改变。WebContent 的 `active` 为 0，但保留原有 latency tier，不能说所有字段为零。所有观察窗口 WebGL error=0、context lost=false。

原策略为 `[1,1,16711686,1,0,0,0,1,1,0,0,0,0,0,0,0]`。按检查的 XNU 声明，前九项依次为 active、lowpri_cpu、timer_throttle、disk_throttle、cpu_limit、suspend、throughput_qos、suppressed_cpu、background_sockets；后七项保留。`task_policy_get` 读回的是请求策略；另用 BSD process flag 确认有效 suppressed 标志切换。更完整的 `TASK_POLICY_STATE` 查询返回 2，未提权，也未取得所有 effective QoS 位。

### 未锁屏再次往返，仅解除 CPU 抑制就消除了约 400 ms 退化

后续机器已解锁，另一个会话在原生前台为 `com.openai.codex` 时自然复现。观察到慢状态后，没有再次激活任何应用。UI PID 91339，仍是相同实验负载；timer 字段为 16711685，与锁屏会话不同，所以两会话不混算分数。

只把 UI 策略下标 1 的 `lowpri_cpu` 和下标 7 的 `suppressed_cpu` 从 1 改为 0，保留 `active=1`、timer、disk、background_sockets 以及所有其它字段。每个干预窗口之后读取全部进程核对，确认只有这两个请求字段改变；UI 的 BSD suppressed 标志始终仍为 1，其它进程向量未变。

| 同一未锁屏实例的 UI 策略  | idle RAF P50 | 八层绘制 RAF P50 |
| ------------------------- | ------------ | ---------------- |
| 原策略，只读查询后        | 403 ms       | 394 ms           |
| 两个 CPU 字段为 0，两窗口 | 33 / 33 ms   | 65 / 61 ms       |
| 恢复这两个字段，两窗口    | 404 / 403 ms | 393 / 406 ms     |

所有这些窗口前后原生前台均为 Codex，没有重建 context、改变渲染参数或附加 profiler，WebGL error=0、context lost=false。退出前策略恢复到原向量 `[1,1,16711685,1,0,0,0,1,1,0,0,0,0,0,0,0]`，然后关闭实验浏览器。

这确认 CPU 抑制字段组对这次退化有因果影响，不能再笼统说“可能只是 timer 合并”。尚未把两个 CPU 字段逐一拆分，不声称某一个单独充分。仍剩 33 ms idle，而不是前台的 17 ms；UI 日志在 16:13:55.046 进入状态 63，后续往返未见清回 31，这与仍有视觉空闲限速相容，但不是对具体二进制内部 rAF 原因的独立直接观测。

### 单清 timer 或 active 没有恢复，不能把它们当总开关

此前两个独立的锁屏会话中，只清 UI `timer_throttle`，绘制三窗口仍为 405 / 405 / 403 ms；只清 `active`，仍为 399 / 407 / 403 ms。timer 实验中途读回确认字段仍为 0。XNU 的 CPU 降优先级和 timer 计算分别读取自己的请求字段，不都以 `active` 门控，因此清 `active` 并不等于完整解除抑制。

在仍有约 400 ms RAF 的 timer 实验中，额外加入的 WebContent 20 ms interval 实测 P50 24 ms、P95 26 ms。它表明页面普通 timer 并未同步降至约 400 ms，但不能独自证明延迟发生在 UI 线程的哪次唤醒、display link 或呈现确认。

另一个启动时附加 `-NSAppSleepDisabled YES` 的锁屏会话，71 个窗口 idle P50 均为 17 ms、绘制 P50 为 53–55 ms，查询时 UI suppression active=0。它与完整往返结果一致，但只是独立启动对照，不是未锁屏前台样本，也不是网页可采用的产品 API。没有使用 `defaults write` 或更改全局节能偏好。

### WindowServer 的视觉空闲是另一条已识别的链，不能与 App Nap 混同

未锁屏、原生前台为 Amp 的默认会话中，再次出现 idle 401 ms / draw 387 ms。统一日志记录 UI 进程在 15:52:09.333 将页面活动状态从 31 改为 63；两者都保留 active/focused/visible 等位，差别是 bit 32 `IsVisuallyIdle`。公开 WebKit 基线中，这个位可由 WindowServer connection 的“窗口停止修改”通知触发，即使 view 自身仍报告 visible、unhidden、unoccluded。

该状态会进入 WebCore 的 `ThrottlingReason::VisuallyIdle` 并影响 rendering/rAF 调度；禁用 hidden-page DOM timer throttling 并不能消除这条路径。2026-11-03 上游修复专门给 WindowServer 通知增加 `windowOcclusionDetectionEnabled()` 门控，说明测试宿主确有误判视觉空闲的已知问题。

但它不是本轮约 400 ms 的完整解释：检查的公开基线与后续 HEAD 把 VisuallyIdle 列为 half-speed 原因，没有建立 400 ms 常数；完整策略往返会话的统一日志也未记录 31↔63 转换。不能将这两种状态视为一一对应，也没有证明 UI 进程抑制一定是由 bit 32 引起。

### 观测会改变条件，显示链路仍有未闭合的细节

给默认慢会话的 WebContent 附加 System Trace 后，原生前台仍为 Amp，但 idle/draw 已变成 34/64 ms，随后 17/54 ms；UI 日志于 15:52:40.217 将 63 清回 31。因此 trace 中的正常表现不能用来否认未附加时的异常，更不能把分析器附加当成修复。

公开 WebKit 中，不绘制的 rAF 仍可能经过 remote layer-tree transaction / backing-store-swap 确认；WebContent 自己持有反 App Nap activity，并不保证 UI 宿主的显示刷新与确认链路不受抑制。UI 进程 CPU 抑制如何具体形成约 400 ms 节奏，尚缺无扰动的逐帧调度/确认关联。这里确认的是 CPU 策略字段组的因果影响，不是已定位某个固定 400 ms 定时器或逐条证实了呈现确认链。

### 源码版本缺口和一手依据

- [Playwright v1.65.0 browser manifest](https://github.com/microsoft/playwright/blob/a1f35e1955976e84411f9c10358228a80b763ebe/packages/playwright-core/browsers.json) 对应 r2388 / 27.2；公开 `UPSTREAM_CONFIG.sh` 指向 WebKit `5b391e6d3b14d549908dad2c6695999291313f30`。实际浏览器 roll 指向无法访问的 `microsoft/playwright-browsers` 构建提交，不能宣称公开基线就是安装二进制的精确源码。
- [活动位定义](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebCore/page/ActivityState.h)、[旧视觉空闲判断](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebKit/UIProcess/mac/PageClientImplMac.mm)、[WindowServer 通知](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebKit/UIProcess/mac/WindowServerConnection.mm)。
- [2026-11-03 视觉空闲修复](https://github.com/WebKit/WebKit/commit/e8659685a9b8231ef962774c005a07b6a620dc31) 与本案高度相关；尚未证明 r2388 是否含该修复，也未运行补丁前后的同构二进制对照。
- [WebCore 动画节奏选择](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebCore/platform/graphics/AnimationFrameRate.cpp)、[remote layer-tree 调度](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebKit/WebProcess/WebPage/RemoteLayerTree/RemoteLayerTreeDrawingArea.mm)、[Playwright 宿主反 App Nap activity](https://github.com/microsoft/playwright/blob/a1f35e1955976e84411f9c10358228a80b763ebe/browser_patches/webkit/embedder/Playwright/mac/AppDelegate.m)；headed 与 headless 分支不同。
- [XNU suppression 字段](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/osfmk/mach/task_policy_private.h#L111-L129)、[策略读写和独立计算](https://github.com/apple-oss-distributions/xnu/blob/f6217f891ac0bb64f3d375211650a4c1ff8ca1ea/osfmk/kern/task_policy.c)。下载副本与该固定提交文件的 SHA-256 一致；不据此宣称该公开 XNU 版本就是本机内核的完整匹配源码。16 字段读写在本机返回成功，BSD suppressed 常量也由已装 SDK 核对。

原始证据仍在 `.amp/in/artifacts/scene-owned-glass/ceiling/`：`session-policy-full.json` / `session-policy-full-native.json` / `session-policy-full-processes.txt` / `session-policy-full-webkit.log` 为锁屏完整策略因果对照；`session-policy-cpu.json` / `session-policy-cpu-native.json` / `session-policy-cpu-processes.txt` / `session-policy-cpu-webkit.log` 为未锁屏 CPU 字段组因果对照；`session-policy-default*` 为未锁屏复现与观察者干扰；`session-policy-intervention*`、`session-policy-active*` 为单字段反证；`session-policy-no-nap*` 为启动对照。System Trace 含机器环境信息且改变了被测条件，只保留本地诊断，不作为未受扰动的性能样本或公开附件。

对工程决策的影响：保留受控原生前台的 54–60 ms 八层基线，不能拿约 400 ms 为自绘管线上限定性，也不能因定位了宿主抑制而忽略高 DPR 全图 blur 和逐帧上传的真实成本。49.75 MiB 显式纹理账本未变，未补物理驻留/功耗测量；没有真 Safari/iPhone 的相同因果验证。实验干预仅针对自有浏览器 UI 进程，恢复原策略后关闭浏览器；不建议在产品中使用私有 Mach 策略绕开系统调度。

## 叠层缓存优化与公平旧 core 对照（2026-11-17，局部化前）

**结论：静态下层可以消除重复工作，但不是新管线独有的优势；所有层都改变时，驻留 GPU 的顺序合成才在本轮旧 core 对照中显示明显收益。新管线没有降低显式纹理容量，也没有让八层全动进入 60 Hz 预算。**

本轮只修改独立实验的 renderer、paint revision 调用方、测试和基准。没有修改 GlassRenderer、shader、公共组件、依赖或系统策略。ordered 帧以玻璃结束时，缓存它背后的完整合成与最后两遍 blur，复用原本只用于 shared 负对照的第 6 号纹理。仅最终玻璃移动时保留前缀；下层 record 值、paint 来源或显式 revision、层数/顺序、背景 revision、blur 或 sampling 改变后重算。没有 revision 的可变 Canvas 保持不缓存。材质、尺寸与 context 恢复沿用重建。缓存未命中比原流程多一次全图 copy，尚未实现局部 blur、脏区或独立分层缓存。

### 优化前后，保持同样的叠层画面

M2 Pro、接交流电、880 × 460 CSS px、DPR 2、σ15.3。每组 24 次预热、30 个 idle RAF、30 个正式回调，3 轮反向扫测；计时期间没有并行构建/浏览器测试。WebKit 每窗口首尾原生前台都是 Playwright，idle P50 均为 17 ms。这里只是边界检查，不是连续前台审计。以下为三轮 P50 的中位数，单位 ms，属于 RAF 回调间隔，不是 GPU 执行或实际呈现延迟。

| 同域玻璃层数                    | WebKit 优化前 | WebKit 缓存后 | Chromium 不缓存 | Chromium 缓存后 |
| ------------------------------- | ------------- | ------------- | --------------- | --------------- |
| 1（结尾是 paint，不启用此缓存） | 18            | 18            | 8.3             | 8.3             |
| 2                               | 20            | 17            | 9.1             | 8.3             |
| 4                               | 32            | 17            | 23.4            | 8.3             |
| 8                               | 55            | 17            | 50.1            | 8.3             |

WebKit 八层三轮从 55/55/55 到 17/17/17 ms，P95 从 61/61/61 到 17/18/18 ms。同步 render + readback 诊断的 P50 从每轮 63 ms 到每轮 2 ms；这个诊断含同步等待，不能叫 GPU 时间。真实双层页面的 Alt + 方向键 handler 在 DPR 1/2、σ1.2/15.3 四个窗口均为 RAF P50 17 ms，预热后每帧 3 次 GL draw、0 次 paint upload。

两层/八层的预热后 draw 从 13/37 减到 3，完整 paint 上传从 2 次、DPR 2 的 12.35 MiB 输入减到 0。七张目标与照片仍共 49.75 MiB 显式纹理逻辑字节，没有新增纹理，也没有证明物理驻留更低。八层全动使缓存每帧失效，新管线缓存开/关的三轮 P50 分别为 55/54/54 与 54/54/54 ms；这部分没有实质提速，不能用仅上层移动的结果替代。

### 给旧 GlassRenderer 同样缓存机会后，静态下层打平

另加 `PERF_PIPELINE=legacy`，通过未修改的 `GlassRenderer.render_canvas()` 顺序光学渲染，用 Canvas2D 合成明确的照片、文字和已完成的下层。复用一个旧 core context，不按层制造额外 context。仅上层移动时，旧路径也预先保留下层与其 blur，不强迫逐帧上传。全动时按顺序更新每层。双方 optical WebGL context 都设置 `antialias:false`；初次默认 AA 不一致时，边界最大差达到 20，因此该失败样本没有进入正式计时。

每个旧路径样本在预热前与驻留管线完整画面比较：WebKit 双层最大差 1/255、八层最大差 2/255，平均约 0.000381/0.000508 个 8-bit channel unit；Chromium 八层最大差 1/255、平均约 0.000373。通过后才计时。全动后每帧像素未逐一比对，独立叠层回归覆盖了 record 改动与上层移动；不声称所有动态帧严格逐像素相等。

| 条件                      | 新驻留管线 RAF P50 | 旧 core 顺序合成 RAF P50 |
| ------------------------- | ------------------ | ------------------------ |
| WebKit 双层，仅上层移动   | 17 / 17 / 17       | 17 / 17 / 17             |
| WebKit 八层，仅上层移动   | 17 / 17 / 17       | 17 / 17 / 17             |
| WebKit 八层，全部移动     | 55 / 54 / 54       | 123 / 126 / 124          |
| Chromium 八层，仅上层移动 | 8.3 / 8.3 / 8.3    | 8.3 / 8.4 / 8.3          |

旧 core 全动每帧 8 次 Canvas 输入上传、24 次 GL draw，外加 Canvas2D 顺序合成；新管线为 2 次 paint 上传、38 次 GL draw，没有逐层 Canvas 跨表面输入。GL draw 数少不意味着总成本低。静态下层时双方都达到各自 RAF 基础节奏，不能宣布新管线普遍比旧 core 快。render + readback 诊断里，旧路径另外同步读取最终 Canvas2D 像素，因此与新路径的诊断不属于同一 GPU 时间指标。

旧适配器的 GL 账本是 3 张全尺寸纹理、DPR 2 共 18.53 MiB；它另有照片基底、下层前缀、最终输出三张全尺寸 Canvas2D（仅像素载荷也为 18.53 MiB），独立参考画布在计时前缩为 1 × 1。新路径 GL 账本 49.75 MiB。两边共同的 supplied paint、默认缓冲、照片解码、驱动池、Canvas2D 的真实 GPU/CPU 分配均未测，不能只相减这两个 GL 数字就声称总显存胜负。

旧对照是现有 core 的等能力顺序合成适配器，仍不是完整 `attachGlass`、DOM/SVG 捕获或裁剪 atlas。全动优势也不能直接归因成“GPU 比 DOM 快”，因为双方都使用相同 GPU shader；本轮差别包含逐层跨 Canvas 输入与合成组织方式。

### 正确性与交付状态

- cache 工作量断言先在未优化实现观察到失败（30 帧仍有 60 次 paint upload），实现后通过。缓存失效序列与新建 renderer 的完整像素最大差均为 0。
- `ceiling-test.mjs` 在 Chromium/WebKit、DPR 1/2 通过文字/叠层/跨区、编辑、blur、材质、指针移动与 Escape、context 恢复、重挂载与窄屏。拖动检测等待 SDK 的逐帧更新，Escape 验证与可能扰动 native pointer capture 的截图分开，不修改 SDK 交互。
- 原实验 `test.mjs` 的 36 组光学对照与交互、实验 typecheck/oxlint、完整 `bun run test` 均通过。已检查优化后 WebKit 默认叠层截图，未见黑帧、缺失文字或漏合成；画质判断仍以独立像素参考为依据。
- 原始数据：`ordered-before-cache.json`、`ordered-after-cache.json`、`ordered-chromium-{uncached,cached}.json`、`ordered-all-{cache,uncached}.json`、`ordered-ui-cached.json`，最终旧路径为 `ordered-legacy-final-{2,8,all,chromium}.json`。均位于 `.amp/in/artifacts/scene-owned-glass/ceiling/`，早期诊断失败保留在 `.amp/in/` 日志，不冒充通过样本。

本地未提交、未推送。未做生产候选/真实 Safari/iPhone 验证、物理显存或功耗测量。

## 全动局部模糊与脏区验证（2026-11-17）

**解锁后受控前台实测，全动从本轮 full 的 64 ms 降至 dirty 的 29 ms，主要收益来自局部模糊；原地合成与脏区没有测出额外 RAF 改善。** 初次因锁屏被拒绝，解锁后另有两次因前台变为 Codex/微信被拒绝，均未纳入结果。用户随后提供不操作窗口，完成下方 18 个有效样本。没有绕开锁屏、修改系统调度策略，或将后台计时与上一阶段的 54 ms 相比较。

### 三项优化分开验证，不改 shader 或分辨率

- `PERF_WORK=full` 保留本阶段之前的全图模糊和交替目标路径。
- `local-blur` 只限制两遍 blur 的输出范围。镜片 bounds 扩展保守的折射位移、1.02 色散与双线性采样足迹；横向中间结果再沿 Y 扩展纵向卷积支撑。卷积仍为原 shader 的 `min(72, ceil(3σ × DPR))`，没有缩核或降采样。
- `local` 再去掉每层全图拷贝：玻璃只采样独立 blur 纹理，可在当前合成目标中按原顺序混合，不形成纹理反馈。每帧先恢复背景，再画 paint 与玻璃。
- 默认 `dirty` 保留上一帧合成目标，重建所有旧、新玻璃及完整采样/卷积依赖的外接矩形；在该矩形内恢复背景并重画所有层。它不是只擦新位置，也不是只重画最上层。背景 revision、paint 来源/版本、层结构或前一帧模式不兼容时，回到完整重建。缺少 paint revision 不使用跨帧脏区。

为保留只移动顶层时原有的零 blur 复用，最终玻璃的 retained blur 仍完整计算。脏区是一个保守外接矩形，没有独立逐层历史或 tile 跟踪，密集/大范围玻璃会扩展到接近全图。最终提交仍完整呈现 Canvas；paint 输入仍逐帧上传。

### 实际工作量减少，不能换算成 FPS

Chromium 158 / Metal、880 × 460 CSS px、DPR 2、σ15.3、八层全部交替移动 8 CSS px；每模式 24 次预热、30 个 idle RAF、30 帧正式工作量计数。每模式在预热前另外把六个移动帧与 `full` 完整像素对照，最大通道差均为 0。计数窗口无显式读回，idle 无绘制，销毁后显式 GL 对象均为 0。

| 模式       | draw/帧 | blur pass 像素/帧 | copy/paint pass 像素/帧 |
| ---------- | ------: | ----------------: | ----------------------: |
| full       |      38 |        25,907,200 |              22,668,800 |
| local-blur |      38 |         7,310,720 |              22,668,800 |
| local      |      29 |         7,310,720 |               8,096,000 |
| dirty      |      29 |         7,310,720 |               5,329,040 |

从 `full` 到 `dirty`，blur pass 像素减少约 71.8%，copy/paint pass 像素减少约 76.5%，draw 减少约 23.7%。copy/paint 统计包含使用 copy shader 的 paint 混合；这些是实际提交的 scissor 矩形像素计数，不是硬件带宽、真实片元执行总数、GPU 时间或实际呈现 FPS，也不能将两类像素直接按相同成本相加。

**四个工作量验证窗口首尾均为 `loginwindow`，其耗时全部不用于前台性能判断。** 原始文件为 `spatial-validation-{full,local-blur,local,dirty}.json`；没有保存一份伪装成功的 WebKit 前台样本。前台测量现在在正式 evaluation 之前也检查，锁屏时快速失败。

显式纹理依旧为 52,166,400 bytes（49.75 MiB）；未新增 GL 纹理或 framebuffer。每帧两个 paint 输入依旧为 12,953,600 bytes（12.35 MiB），不能因局部混合就宣称局部上传。未测物理驻留或功耗。

### 正确性、可视检查与剩余工作

局部工作量断言先观察到失败（双层仍处理 15 个整幅目标），局部实现后通过；脏区背景恢复断言也先在无脏区路径失败，再通过。Chromium/WebKit 的 DPR 1/2 完整像素比较覆盖：交叠文字、连续两层移动、分数位置、四边及完全离场、负折射与较大折射、零折射、同层多个镜片增删、σ0.35/1.2/15.3/28、shared 来回、背景与 paint 失效。局部路径对完整路径最大差为 0，没有放宽像素阈值。

`ceiling-test.mjs`、原 `test.mjs` 的 36 组光学对照与交互、完整 `bun run test`（9 个 workspace task）、实验 typecheck/oxlint 通过。已审阅 `spatial-default.png` 与 `spatial-eight-moving.png`：未见黑帧、局部模糊矩形边界或明显漏绘；八层高模糊导致文字不可读属于密集材质结果，不是产品可读性验收。截图不是动态每帧或性能的证据。

### 解锁后，前台三轮对照完成

同一 M2 Pro、接交流电、WebKit 27.2、880 × 460 CSS px、DPR 2、σ15.3。18 个独立启动样本：四种全动模式各三轮，以及 full/dirty 仅顶层移动各三轮。全动顺序为 full/local-blur/local/dirty，第二轮反转；仅顶层为 full/dirty，第二轮反转。每样本 24 次预热、30 个 idle 回调、30 个正式回调，计时期间没有并行构建或浏览器测试。

所有样本首尾原生前台都是 Playwright，idle RAF P50 均为 17 ms；这是边界检查，不是连续前台审计。每样本预热前六帧完整像素对照最大差为 0，正式窗口显式读回为 0，GL error 为 0，销毁后显式对象为 0。

| 模式       | 全动 RAF P50 三轮（ms） | 全动 RAF P95 三轮（ms） | render + 同步读回 P50 三轮（ms） |
| ---------- | ----------------------- | ----------------------- | -------------------------------- |
| full       | 62 / 64 / 65            | 79 / 79 / 78            | 74 / 75 / 74                     |
| local-blur | 27 / 28 / 29            | 37 / 38 / 40            | 33 / 34 / 33                     |
| local      | 28 / 29 / 30            | 35 / 36 / 40            | 33 / 33 / 33                     |
| dirty      | 29 / 29 / 30            | 38 / 35 / 37            | 32 / 32 / 33                     |

full 到 dirty 的 P50 中位数从 64 到 29 ms，降低约 54.7%；P95 中位数从 79 到 37 ms。主要收益在 local-blur 就已获得，其 P50 为 28 ms；后续模式没有额外 RAF 提速的证据，不能将三项工作量下降折算成累加提速。1 ms 级差别不足以认定哪个局部模式更快。JS 提交 P50 都在约 8–10 ms，未测得明显下降。

仅顶层移动的 full 与 dirty 都为 17/17/17 ms，P95 分别为 18/17/18 与 18/18/17 ms；每帧三 draw、零 paint 上传、零 blur，保留了之前的缓存收益。

RAF 回调间隔不是 GPU 执行时间或实际呈现延迟；同步读回诊断另含等待和读回成本，不能叫 GPU 时间。29 ms 仍超出 60 Hz 的约 16.7 ms 预算。上阶段独立会话 full 约 54 ms，本轮为 62–65 ms，收益以本轮四模式的 full 为准，不跨会话相减。不声明真实 Safari/iPhone、热稳定性、物理显存或功耗已过关。

原始文件：`spatial-unlocked-r{0,1,2}-{full,local-blur,local,dirty}.json` 和 `spatial-unlocked-top-r{0,1,2}-{full,dirty}.json`，均在 ceiling 证据目录。复现命令见实验 README。本轮只更新实验 README 和研究记录，仍本地未提交、未推送，没有修改 renderer、shader、公共组件或已发布接口。

## 剩余约 29 ms 的分项诊断（2026-11-17）

**本机八层全动的两个主要成本已得到独立证据：未变化的 Canvas paint 重复上传，以及仍然昂贵的顺序卷积。顶层为未来缓存而每帧执行的整幅模糊，是其中可单独定位的一项。** 未发现需要先重写 JS 为 Rust/Wasm 的证据，也没有完成等画质 60 Hz 优化。

本轮只增加 benchmark 的显式诊断开关和记录，不修改 renderer、公共 shader 或组件。M2 Pro/交流电、Playwright WebKit 27.2、880 × 460 CSS px、DPR 2、σ15.3、八层全部交替移动 8 CSS px。初筛 `r0` 不纳入正式结论；正式 `r1/r2/r3` 各六个独立浏览器启动样本，顺序反转。每样本 24 帧预热、30 个 idle RAF、30 个计时回调，以及单独 20 帧同步读回诊断。18 个正式样本首尾原生前台都是 Playwright，idle RAF P50 都为 17 ms。这不是连续前台审计。

| 诊断                        | RAF P50 三轮（ms） | RAF P95 三轮（ms） | 提交 P50 三轮（ms） | render + 同步读回 P50（ms） |
| --------------------------- | ------------------ | ------------------ | ------------------- | --------------------------- |
| 原 dirty，不加诊断包装      | 29 / 30 / 29       | 36 / 36 / 35       | 10 / 10 / 10        | 33 / 33 / 32                |
| 复用两个不变 paint 纹理     | 20 / 19 / 20       | 23 / 24 / 27       | 0 / 0 / 0           | 24 / 24 / 25                |
| 跳过顶层两遍 blur，画面错误 | 18 / 18 / 21       | 30 / 33 / 32       | 9 / 8 / 9           | 25 / 26 / 25                |
| 跳过前七层 blur，画面错误   | 16 / 16 / 17       | 26 / 26 / 27       | 8 / 9 / 9           | 22 / 22 / 22                |
| 跳过全部 blur，画面错误     | 17 / 17 / 17       | 17 / 17 / 18       | 9 / 9 / 8           | 13 / 13 / 13                |

提交的 0 ms 是 WebKit 粗粒度计时舍入，P95 均 1 ms，不是没有成本。RAF 是回调节奏，不是 GPU 时间或呈现延迟；各消融差值不可相加。前七层跳过后的 P50 略低于全部跳过，是量化/波动范围，不表示多做 blur 会更快。

### 重复 Canvas 上传占据了约 9.5–9.7 ms/帧调用内耗时

独立 `api-times` 样本的 RAF P50 为 27/29/29 ms，提交 P50 均 10 ms。每 30 帧的 60 次 `texSubImage2D` 调用，内部累计 286/291/287 ms；被包裹的全部 API 合计 289/294/292 ms。`getUniformLocation`、uniform、draw 提交等其余 API 的计时大多舍入为零，不能据此声称其绝对免费。计时有包装与时钟分辨率误差，不把该窗口当成未插桩基准。

这 9.5–9.7 ms 包含 Canvas 转换、上传提交或隐式同步，尚不能拆成纯 CPU 拷贝与 GPU 等待。独立 cache-paint 探针不跳过任何 blur，通过固定来源纹理复用使 RAF P50 降到 19–20 ms、提交 P95 降到 1 ms，佐证应优先消除重复上传，而非只缓存 uniform location。

缓存探针只适用于 fixture 中两个不变 Canvas。预热后，在六个交替移动帧中，分别强制 prefix 失效后完整合成，逐像素比较原上传路径与缓存路径，最大通道差均为 0。没有利用第二次同几何渲染的 retained-prefix 命中绕过 paint；早期一次计数失败正是 parity 留下偶数帧导致首个计时帧缓存命中，已修正预热终态并重跑。正式窗口各有 60 次缓存命中，零显式读回，GL error 0，销毁后显式对象 0。

该诊断额外保留两张全尺寸纹理，显式账本从 52,166,400 bytes（49.75 MiB）增为 65,120,000 bytes（62.10 MiB），多 12.35 MiB。不代表产品缓存必须增加这么多：探针仍保留原共享 scratch 纹理，未做复用/裁剪。它也没有处理 mutable Canvas、revision 改变、回收或 context 恢复，不能直接当正式缓存实现。

### 顶层缓存准备占 44.3% 的剩余 blur-pass 像素

顶层两遍整幅 blur 每帧覆盖 3,238,400 像素，占剩余 7,310,720 的约 44.3%。代码这样做，是为了将来只移动顶层时能够在任意位置复用完整 blur；八层全动时 prefix 每帧变化，这份完整缓存也每帧失效。只跳过这两次 draw，RAF P50 为 18/18/21 ms，单独同步诊断为 25/26/25 ms，说明这项准备不是小成本。

前七层局部 blur 仍有重要成本。当前 DPR 2、σ15.3 下，原 shader 的循环上限使每个 blur 输出名义执行 145 次 texture 调用，全部局部 blur 约 10.60 亿次/帧。这个数量来自 shader 和 scissor 像素的运算，不是硬件实际访存次数、带宽或 GPU 指令测量。全部跳过时同步诊断降到 13 ms，但画面已错误，不能拿来声称等画质 60 Hz 已达标。

下一步优先把两个已证实成本变成保真的实现：按来源/revision 复用 paint，控制纹理预算；顶层 blur 记录有效区域，仅生成当前光学依赖，后续跨区移动时补齐或重算，保留完整采样/卷积 halo。不能直接删掉最终 blur、缩核或用共享底图替代有序合成。若这些完成后仍不足，再单独验证等精度卷积实现。

### 证据与验证范围

原始文件为 ceiling 目录下 `bottleneck-screen-r{1,2,3}-{none,cache-paint,skip-final-blur,skip-prefix-blur,skip-blur,api-times}.json`；`r0` 仅初筛，其 cache parity 较弱，不用于正式表格。普通 `raw.parity` 在诊断启用前检查，不能为错误 blur 消融背书；cache 额外证据是 `raw.diagnosticPixelParity`。原 `raw.calls` 记录尝试调用，实际跳过次数在 `raw.diagnosticResult`，不把缓存模式仍有的尝试上传计数说成真实上传。

每正式样本无页面异常、GL error 0、计时窗口零显式读回、idle 无绘制、销毁后显式 GL 对象为零；跳过次数断言分别为每窗口 60/420/480。受影响 benchmark 的 Node 语法、oxlint、oxfmt 与 whitespace 检查通过。没有改视觉或交互实现，未为这些故意错误的消融增加产品截图验收；未重跑全仓测试或真实 Safari/iPhone 验收。工作仍本地未提交、未推送。

## Paint 缓存与顶层按需模糊落地（2026-11-17）

**实验默认路径已改为 `bounded`：本轮八层全动的 RAF P50 中位数从旧 dirty 的 30 ms 降至 17 ms；P95 仍为 28–30 ms，没有证明稳定呈现 60 FPS。** 本节为真实等画质实现，不是上一节跳过 blur 的诊断。改动只在独立实验 renderer、验证脚本和文档，未改公共 shader、SDK 交互或发布入口。工作本地未提交、未推送。

### 两步实现分别保留可运行对照

- `dirty` 保持本轮之前的行为，继续逐帧上传 paint，并生成完整顶层 blur。
- `cached` 在 dirty 上按 paint 层次缓存纹理，检查来源、revision 与上传尺寸；缺少 revision 时每帧更新。第一层复用已有 target 5，后续层只增加纹理，不增加 framebuffer。移除图层、退回不缓存模式、非 composition 渲染及 dispose 都回收额外纹理。页面既有 context-restored 处理创建全新 renderer，不复用丢失的纹理。
- 默认 `bounded` 再记录顶层 blur 的有效矩形，包含原有折射/色散采样依赖与至少 16 CSS px、或一卷积半径的移动余量。顶层留在有效区时不模糊，离开后从 retained prefix 重新计算所需局部矩形；不是只补新露出的条带。两遍卷积之间的依赖 halo 不变，没有缩核、降采样或调整材质。

这些 paint 仍是当前模型中与 stage 对齐的完整 Canvas，不是任意 DOM 捕获。缓存按当前层数持有资源，没有跨场景的永久来源池。

### 同会话分阶段前台性能

M2 Pro、交流电、Playwright WebKit 27.2、880 × 460 CSS px、DPR 2、σ15.3、八层全部交替移动 8 CSS px。三轮独立启动 dirty/cached/bounded，第二轮反序；每样本 24 帧预热、30 个 idle RAF、30 个正式回调，另做 20 帧同步读回诊断。首尾原生前台均为 Playwright，idle P50 均为 17 ms，不是连续前台审计。

| 模式    | RAF P50 三轮（ms） | RAF P95 三轮（ms） | 提交 P50（ms） | render + 同步读回 P50（ms） |
| ------- | ------------------ | ------------------ | -------------- | --------------------------- |
| dirty   | 30 / 30 / 28       | 38 / 36 / 37       | 9 / 10 / 9     | 33 / 32 / 32                |
| cached  | 20 / 21 / 21       | 24 / 25 / 24       | 0 / 0 / 0      | 24 / 23 / 25                |
| bounded | 17 / 16 / 18       | 30 / 30 / 28       | 0 / 0 / 1      | 18 / 18 / 18                |

中位数 30→17 ms，约降低 43.3%；提交的 0 ms 是粗时钟舍入，优化路径提交 P95 均为 1 ms。bounded 的 RAF 尾部比仅 paint 缓存的 24–25 ms 更差，短窗口尚未解释这个差异，不以中位数掩盖它。两次单独仅顶层移动负对照 dirty/bounded 都为 P50 17 ms、三 draw、零上传和零 blur；没有将单次对照说成三轮热稳定性验证。

每个全动帧都为 29 次 draw。dirty/cached/bounded 的 blur-pass 像素分别为 7,310,720 / 7,310,720 / 4,960,000，最终局部化再减少约 32.2%。copy/paint 像素仍为 5,329,040。缓存后正式窗口每帧 paint 上传从 2 次（12.35 MiB 输入）变为 0。这里是 API/pass 工作量，不是实际 GPU 带宽。RAF 不是呈现延迟；同步读回另含等待，不是 GPU 时间。

显式纹理从 dirty 的 52,166,400 bytes（49.75 MiB）增至 58,643,200 bytes（55.93 MiB），只多 6,476,800 bytes（6.18 MiB），而非诊断版的两张/12.35 MiB。顶层按需模糊不额外增加纹理。未测真实物理驻留、功耗、热稳定性或 Safari/iPhone 表现。

### 测试先失败，再实现；完整参考仍独立

缓存断言先在未实现时以“移动玻璃仍上传 2 次而非 0”失败；paint 缓存实现后通过。按需 blur 的工作量断言随后在整幅顶层路径失败，实现后通过。缓存序列覆盖两层移动、有效区内/外顶层移动、paint revision、缺少 revision 与连续内容变化、移除/重插层、相同版本更换来源、full 模式来回；完整像素最大差均为 0。纹理释放断言确认移除第二层后额外纹理归零。

原有 DPR 1/2、边缘/离场、负/大/零折射、同层多镜片、blur 与采样切换矩阵扩展到 cached/bounded，Chromium/WebKit 共 140 组空间比较对 full 最大差 0。两顺序旧 core 的独立参考、UI 编辑/拖动/Escape、context 恢复、重挂载、窄屏和 reduced-motion 均通过。原照片/静态实验 36 组对照与交互、完整 `bun run test`（9 tasks）、实验 typecheck/oxlint/oxfmt 通过。

中途 Chromium 拖动回归两次在等待移动时超时；加入失败截图/目标信息后重跑通过，未修改 SDK 或交互实现，不能声称已确定该偶发现象的原因。原始失败日志保留于 `.amp/in/cached-bounded-correctness.log`、`.amp/in/cached-bounded-chromium.log`，后续通过见 `.amp/in/cached-drag-diagnostic.log`。WebKit 完整套件通过。

已审阅优化后的默认叠层与跨区截图，未见新增黑块或 scissor 裁切；默认叠层中的文字模糊与重影在优化前截图中已存在，且完整像素参考通过。它仍是光学实验，不是产品文字可读性验收。Chromium UI DPR 1/2、σ1.2/15.3 四个窗口与单层低 blur 资源/上传检查也通过。

正式原始数据为 ceiling 证据目录下 `implemented-r{0,1,2}-{dirty,cached,bounded}.json`、`implemented-top-{dirty,bounded}.json`；额外覆盖为 `implemented-ui-check.json`、`implemented-one-check.json`。每个计时窗口零显式读回、GL error 0、销毁后跟踪的 GL 对象为零，六个移动帧与 full 的预检像素差均为 0。

## P95 尾帧与约五分钟会话验证（2026-11-17）

**证据将尾部排查范围缩小到异步渲染完成与回调节奏的交界，未见 paint 缓存抖动或本窗口内的渐进退化；仍没有把 GPU 执行、合成器回执和显示调度完全拆开。** 本轮只改 benchmark 的可选观测与文档，没有改 renderer、shader、材质或分辨率，仍本地未提交、未推送。

### 连续 18,000 帧没有越跑越慢，但尾部确实持续存在

M2 Pro、交流电、Playwright WebKit 27.2、880 × 460 CSS px、DPR 2、σ15.3，八层全部交替移动 8 CSS px，与上一轮相同。主窗口持续 296.736 秒，约五分钟；不是半小时、真实 Safari 或物理 iPhone 测试。正式窗口无并行构建、其他浏览器测试、阻塞 fence 等待或显式像素读回。

| 指标                                       | 结果                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| RAF / 实际回调到达 P50 / P95 / P99         | 两者均 16 / 28 / 31 ms                                                 |
| 最大回调间隔                               | 44 ms                                                                  |
| 每连续 30 秒窗口 P95（最后窗口不足 30 秒） | 27–29 ms，无单调恶化                                                   |
| renderer 提交 P50 / P95 / 最大值           | 0 / 1 / 3 ms，0 是粗时钟舍入                                           |
| 独立 50 ms 定时器 P50 / P95 / 最大值       | 52 / 54 / 59 ms                                                        |
| 显式纹理容量                               | 全部 61 个快照均 58,643,200 bytes（55.93 MiB）                         |
| 资源与 context                             | 9 texture / 7 framebuffer / 4 program / 1 buffer / 1 VAO，未丢 context |

301 次约 1 Hz 原生前台观测全部为 Playwright；逐帧 document visible/focused 均为真。原生采样不是连续审计，不能排除采样间极短切换。没有重现早前的约 400 ms 后台退化，也没有修改系统调度策略。纹理账本稳定不等于物理显存、RSS、驱动资源或功耗已测得稳定。

每帧工作量完全一致：29 draw、零上传/显式读回、4,960,000 blur-pass pixels、5,329,040 copy/paint pixels。销毁后全部跟踪 GL 对象归零。预热前六个移动帧与 full 最大像素差 0；长窗口末端只检查 GL error/资源和读回像素 alpha，没有重做末端全画面像素参考，不能声称逐帧视觉证明。

### 排除时间戳假象、偶发缓存重建和单纯启动影响

主样本中 1,652 个间隔大于 25 ms，其中 1,638 个（99.15%）后接小于 10 ms 的间隔；二者合计 P50 为 34 ms。实际到达间隔具有同样分布，rAF timestamp 与实际到达时间之差最多 1 ms，因此不是只在 timestamp 上出现的假象。独立 timer 没有相应长停顿，提交 P95 仅 1 ms，且长短帧的 API/pass 工作量相同。

初筛 300 帧 P95 曾为 21 ms，一度怀疑 30 帧旧统计放大了恢复绘制初段影响；长窗口否定了“只是启动阶段”的解释。再做两轮 `PERF_IDLE_FRAMES=0`，P95 为 23/27 ms、P99 均 31 ms，摆动未被消除。不能靠延长预热或删掉前若干帧宣布解决。

关闭新增时间线、timer 和原生轮询的两轮 600 帧样本，P50/P95/P99 均 16/28/31 ms，说明它不是这些新增探针创造的现象；原有 API 计数包装仍然存在。两轮 300 帧 cached 对照 P50/P95 均为 20/22 ms，支持“bounded 吞吐更快，但回调尾部更差”，不能因 P95 较低而回退到更多模糊工作。

### 无阻塞 fence 指向在途工作，但不是 GPU 计时器

独立 600 帧探针在每次提交末尾插入 fence，下一次回调用 `clientWaitSync(sync, 0, 0)` 查询后删除，不等待完成。WebKit σ15.3 的 66 次小于 10 ms 回调全部返回 `TIMEOUT_EXPIRED`；46 次大于 25 ms 回调中，43 次返回 `CONDITION_SATISFIED`，3 次仍超时。P50/P95/P99 为 16/28/31 ms，与无 fence 控制一致。

显式 flush 后另测 600 帧，P95 仍为 28 ms；83 次短间隔全部报告未完成，63 次长间隔中 59 次报告完成。故不能用遗漏一次 flush 来解释或解决本次 WebKit 摆动。这里只观测到浏览器报告的完成状态，不能据一次 poll 推出 GPU 完成的精确时间，也不能将 timeout 都解读成 GPU 正在执行。

把 σ 降到 1.2 的负载对照，600 帧 P95/P99 均为 18 ms，599 次上一帧 fence 全部报告完成。它改变模糊核和依赖面积，只说明现象随渲染负载变化，**不是等画质提速，更没有据此修改默认参数**。cached 高模糊 fence 对照 P50/P95 为 19/21 ms，但绝大多数 fence 仍报告未完成，说明单看回调 P95 平稳也不能宣称 GPU 有余量。

Chromium 158 的单次 600 帧对照进一步说明时钟/协议差异：不显式 flush 的 RAF P95 为 24.1 ms、实际到达 P95 18.3 ms；flush 窗口 RAF P95 为 17.6 ms。两种情况下上一帧 fence 都报告超时，没有建立可跨引擎比较的完成时刻；这也不是重复多轮的 Chromium 优化结论。WebKit 的实际到达时间与 RAF timestamp 更接近，不把 Chromium 的分布用于解释 WebKit 尾帧。

### 决策与复现

保留 bounded，不加 gl.finish、阻塞等待、丢帧或降低画质的“平滑修复”。证据更支持在途光学工作接近帧预算时，与异步完成/调度发生节奏摆动；尚未证明某一条 WebKit 内部 display-ack、Metal 或 WindowServer 路径就是唯一原因。下一项有依据的保画质优化是验证完整精度卷积的采样复用/实现成本，让关键路径明显低于预算，并继续同时比较实际到达节奏与渲染完成信号，而不只追 P50。

benchmark 新选项：`PERF_TIMELINE=1`、`PERF_IDLE_FRAMES=0`、`PERF_FENCE=1`（要求 timeline 且禁用 timer query）、`PERF_FENCE_FLUSH=1`（要求 fence）。前台模式只在样本开始激活；时间线开启时保留结束已切后台的原始结果而不直接断言丢弃，分析必须单独排除这些窗口。没有持续抢前台或常驻系统修改。

主证据为 ceiling 目录 `tail-long-bounded.json`、`tail-analysis.json`；控制为 `tail-control-{bounded-idle30,cached-idle30,bounded-idle0}.json`、`tail-uninstrumented-bounded.json`、`tail-fence-{bounded-15.3,bounded-1.2,cached-15.3}.json`、`tail-chromium-fence-bounded.json` 和 `tail-flush-{webkit,chromium}-bounded.json`。初筛 `tail-screen-bounded.json` 不代替正式长窗口。受影响 benchmark 的 Node 语法、oxlint、oxfmt 和 whitespace 检查通过；真实运行覆盖默认/无 idle/时间线/fence/flush、两引擎与 cached/bounded。未改视觉实现，未重跑产品全仓测试或生产候选门禁。

## 完整卷积支持范围的采样复用验证（2026-11-17）

**线性配对有明确性能收益，但没有通过逐像素无损门槛，不能宣布完整精度优化已经落地。** 默认 renderer 和原型 UI 仍选用原卷积；`paired` 只作为实验 constructor 参数和 renderer benchmark 显式选项保留。公共组件、生成 shader、材质、DPR 和 blur 默认值均未改。仍未提交、推送或发布。

### 同核、同分辨率不意味着逐像素等价

候选将相邻 Gaussian taps 的权重相加，再用权重比例选择一次 LINEAR 采样位置。最终版本保留中心 tap，左右对称配对，并复用两侧相同的权重。仍为 highp、RGBA8 全尺寸双遍卷积、CLAMP_TO_EDGE、相同 `ceil(3σ)` / 最大半径 72；没有缩核、降采样或改为共享底图。σ30.6 backing px 时，每片元调用 `texture()` 的次数从 145 降到 73，**不是已经测得硬件访存或 GPU 时间减半**。

先做原算法对原算法的 64 例 WebKit 校准，最大差 0。初版负端起始配对在 Chromium / WebKit 各 64 例叠层检查中最大差均为 7/255，集中于低 blur 暗材质叠层；单独改 highp sampler 声明没有改变结果。保留中心的对称配对将同矩阵最大差降到 3/255。最终矩阵覆盖 DPR 1/2、light/dark、8 个 blur（含半径取整边界）、1/8 层、负/小数位置与边缘输入。它不是任意图像的误差上界证明。

去掉玻璃，单独对边缘脉冲、随机噪声、阶跃、棋盘运行单/双遍卷积，每引擎 40 例，最终候选最大差 1/255。叠层矩阵的 DPR2、σ15.3 CSS px、八层场景 light/dark 最大差均为 1/255，平均通道差约 0.00505 / 0.00479 个 8-bit unit；这些是高频探针，不是性能照片场景的逐像素数据。`convolution-test.mjs` 保留最大差必须为零的断言，因此最终运行退出 1，未放宽成容差通过。

独立线性采样探针使用 2 × 1 黑白 RGBA8 输入、高精度 sampler、4096 个渐变采样位置，并写入 RGBA32F 后以 FLOAT 读回。两引擎均只得到 257 种输出，距理想线性值最大差约 0.00195361，GL error 0。浮点目标排除了最终 RGBA8 写回作为该阶梯的来源，证明本机采样路径本身并非任意精度插值；不能将该现象唯一归于 WebKit 或泛化所有 GPU。浮点求和次序与后续量化也发生变化，尚未逐项分摊最终叠层差异。

### 三轮新鲜进程交错对照，尾部降低但不是等像素提速

同机交流电、Playwright WebKit 27.2、880 × 460 CSS px、DPR2、σ15.3、八层全部交替移动 8 CSS px。每条件 24 帧绘制预热、30 idle callbacks、600 帧计时，每轮独立启动，顺序 paired/reference、reference/paired、paired/reference。正式窗口不并行其他浏览器或构建、不读回、不阻塞等待。

| 指标                         | 原卷积三轮       | 对称配对三轮     |
| ---------------------------- | ---------------- | ---------------- |
| RAF P50                      | 16 / 16 / 16 ms  | 17 / 17 / 17 ms  |
| RAF P95                      | 27 / 29 / 28 ms  | 18 / 18 / 18 ms  |
| RAF P99                      | 31 / 31 / 31 ms  | 18 / 19 / 19 ms  |
| 计时后独立 render + 读回 P50 | 18 / 19 / 18 ms  | 10 / 10 / 10 ms  |
| 显式纹理容量                 | 58,643,200 bytes | 58,643,200 bytes |

实际到达间隔的分位数与 RAF 表内数据一致。每个条件各 13 次约 1 Hz 原生观测均为 Playwright，逐帧 visible/focused；这不是原生前台连续审计。提交 P95 均 1 ms。计时后同步读回包含驱动等待与读回成本，**不是纯 GPU 计时或 input-to-present 延迟**。未给候选重跑五分钟长会话，不把原算法的长会话结论转移给候选，也不据短窗口宣称稳定 60 FPS。

每帧仍为 29 draw、零上传/显式读回、4,960,000 blur-pass pixels、5,329,040 copy/paint pixels。9 textures / 7 FBO，显式容量 55.93 MiB，未加纹理；不是物理显存或功耗测量。六个样本的 GL error 均零、dispose 后跟踪对象归零。各样本六移动帧的 bounded/full 最大差 0，二者使用**同一个候选核**，只验证区域/缓存，不证明与原卷积等价。

初版非对称配对也测过三轮：基线 P95 30/27/25 ms、候选均 18 ms，同步 render + 读回中位 13–14 ms。原始文件 `convolution-r{0,1,2}-{reference,paired}.json` 属于该已替换初版；最终对称版为 `convolution-symmetric-r{0,1,2}-{reference,paired}.json`，不可混淆。

### 保留实验，不默认采用

这轮证明在本机减少卷积采样调用能缓解尾帧，但 LINEAR 配对不满足当前零差要求。下一步应验证不依赖有限精度线性插值的采样复用方案，或先明确可接受的数值误差合同；不把 3/255 改名为无损，也不为追求零差宣称已证明所有采样复用不可行。

默认路径完整 `ceiling-test.mjs`（Chromium/WebKit、DPR1/2、空间矩阵、独立光学参考、交互、context/生命周期）通过。实验 typecheck、oxlint、oxfmt 与 Node 语法检查通过；严格跨核像素门槛未通过。实测检查照片、文字、叠层的原核与候选截图，没有新增黑块/矩形裁切；原有下层文字被上层覆盖、折射模糊不等于产品文字可读性验收。未重跑产品全仓或生产门禁。

汇总为 ceiling 证据目录 `convolution-analysis.json`，精度与采样扫描为 `convolution-parity.json`，初版证据为 `convolution-lowp-parity.json` / `convolution-adjacent-highp-parity.json`，最终门槛日志为 `.amp/in/convolution-final.log`。最终照片裁图为 `convolution-stage-{reference,paired}.png`；候选通过浏览器临时替换 blur shader 核查，未改变 UI 默认设置。

## 不依赖插值的相邻输出复用（2026-11-17）

**四输出 texelFetch 复用通过本机零差检查，但完整管线比新测的原核更慢、纹理更多，不默认采用。** 这一结果证明本机存在不依赖 LINEAR 的等像素复用途径，不能证明它是性能优化，也不证明所有设备的浮点结果完全一致。只增加显式实验选项 `reused`；默认原核、材质、分辨率和已发布组件都未改。本轮仍本地未提交、未推送。

### 复用读取，不合并卷积 taps

WebGL2 没有 compute workgroup 共享内存。本探针让一个片元同时计算沿卷积方向的四个相邻输出：每次 `texelFetch` 只读取一个整数坐标，送入四个独立的 highp 累加器，滚动复用对应 Gaussian 权重。每个输出仍按原核从负偏移到正偏移累加，保留 `ceil(3σ)`、最大半径 72、CLAMP_TO_EDGE 效果以及每遍 RGBA8 写回。没有双线性配对、缩核、降采样或漏采叠层。

完整半径下，四个原始输出需要 580 次 shader 采样调用，新卷积组需要 148 次 texelFetch；这不等于硬件访存减少同样比例。四个结果先写四张紧凑 MRT RGBA8 附件，再额外 draw 解包到原全尺寸目标；两遍共多两次 draw。两轴共享 scratch 纹理，局部区域紧凑派发；最末不完整的四像素组只在解包时写有效区域。实现保留照片纹理单元，后续背景更新不会被 scratch 绑定覆盖。

### 零差门槛与尺寸、区域边界通过

Chromium 158 / Playwright WebKit 27.2 各 64 组叠层对照最大通道差为 0，包含 DPR1/2、light/dark、8 个 blur 与半径取整边界、1/8 层、负/小数位置和高频输入。另各 320 组独立卷积对照最大差为 0：129×93、128×96、1×7、9×1，边缘脉冲、彩色/透明噪声、阶跃与棋盘，5 个 sigma、单/双遍、整幅/带小数边界的偏移区域。区域外先填固定非零值再比较，覆盖解包不能损坏区域外像素；窄纹理也覆盖末组补齐和边缘 clamp。

用浏览器会话路由临时将候选读取坐标沿卷积轴错移一个 texel，严格零差断言按预期失败：WebKit 叠层最大差 255、独立卷积最大差 247。该负对照确认测试会拒绝实际坐标回归，不是误跑两份原核；未改磁盘 shader，正确结果单独保留。证据为 `convolution-reused-shift-negative.json` 和 `.amp/in/reused-negative-control.log`。

所有新候选 renderer benchmark 预检的六个移动帧，均用新候选 bounded 对**原核 full**，最大差 0；与上轮 paired 的同核区域检查不同。这些是给定数据、格式和本机驱动的实测，不是任意输入/所有 GPU 的形式化等价证明。独立卷积使用保留原 shader 作期望，不从候选重建期望值。浮点 LINEAR 扫描仍保留，不能将其当成候选 texelFetch 的依赖。

另用 WebKit DPR2、真实照片做 12 帧非计时序列：顶层有效区内/外移动、下层移动、paint 内容/revision 与来源身份更新、ordered/shared/full/bounded 切换，以及四次递增背景 revision 的照片位移，逐帧对原核 full 最大差均为 0。它覆盖后续背景刷新仍读到照片纹理，不能拿作连续动画性能数据。

### 三轮新进程交错对照反而更慢

M2 Pro、交流电、WebKit 27.2，880×460 CSS px、DPR2、σ15.3、八层全部交替移动 8 CSS px。每条件仍为 24 帧绘制预热、30 idle callbacks、600 计时帧。顺序 reference/reused、reused/reference、reference/reused；正式窗口没有并行构建或其他浏览器测试、显式读回、阻塞 fence 等待。

| 指标                         | 原核三轮                     | 四输出复用三轮               |
| ---------------------------- | ---------------------------- | ---------------------------- |
| RAF P95                      | 18 / 18 / 18 ms              | 27 / 28 / 23 ms              |
| RAF P99                      | 18 / 18 / 18 ms              | 30 / 30 / 28 ms              |
| 独立 render + 读回 P50       | 13 / 13 / 13 ms              | 16 / 16 / 16 ms              |
| 每帧 draw                    | 29                           | 45                           |
| 显式纹理容量                 | 58,643,200 bytes / 55.93 MiB | 65,120,000 bytes / 62.10 MiB |
| 跟踪 texture / FBO / program | 9 / 7 / 4                    | 13 / 8 / 6                   |

实际回调到达分位数与 WebKit RAF 分位数相同。两者提交 P95 均 1 ms；0 ms 仍为粗时钟舍入。每条件 13 次约 1 Hz 原生采样全为 Playwright，逐帧 visible/focused，不能代替连续原生审计。同步 render + 读回在正式窗口外，包含等待和读回；不是纯 GPU 时间、呈现 FPS 或输入延迟。

**新测原核明显快于前次 P95 27–29 ms 的历史样本；未确认其原因，不把环境/驱动状态变化算成代码收益，也不拿旧慢基线制造候选提速。** 三轮新基线都为 18 ms，当前同期对照支持拒绝默认切换。第一次初筛候选 P95 29 ms、同步中位 16 ms，单独保留，不混入正式三轮。

每帧零上传、零显式读回。原核 blur-pass 位置 4,960,000，新 MRT blur viewport 位置 1,253,120，包含将被 discard 的 atlas padding；后者每有效片元最多输出四个像素，二者不能直接称为相同意义的“处理像素减少 75%”。额外 unpack 写回每帧 4,960,000 像素，使 copy/paint/unpack 位置合计从 5,329,040 增至 10,289,040。计数器现跟踪 viewport/scissor 交集，`repackPixels` 是 `copyPixels` 的子集，不把这笔工作藏掉，也不将它当成实际 GPU 带宽。

显式纹理增加 6,476,800 bytes（6.18 MiB，约 11.04%）；不是 RSS、物理显存或实测驱动驻留。所有样本 GL error 0，销毁后跟踪对象归零。少采样但更多中间写回/解包、寄存器占用和驱动成本是后续应拆分的候选解释，本轮没有分别归因，不能断言“全是 unpack”。

### 其他引擎与缓存控制没有隐藏收益

Chromium 的一对 600 帧控制中，原核/候选实际到达 P95 约 12.7/16.9 ms，RAF P95 17.3/18.1 ms，独立 render + 读回中位约 13.3/16.4 ms。RAF 与实际到达仍有协议差异；只是一对控制，不是跨设备或多轮 Chromium 结论。

WebKit 两个额外 300 帧控制通过：八层仅顶层移动时仍三 draw、零 blur/unpack/上传、P95 18 ms，但预分配纹理仍是 62.10 MiB；DPR1、单层、σ1.2 时跨核预检零差，P95 18 ms、资源释放归零。未给这一性能倒退候选做五分钟长会话，也未测物理 Safari、iPhone 或功耗。

### 保留复现实验，默认不切换

默认完整 `ceiling-test.mjs`、两引擎严格零差矩阵、实验 typecheck/oxlint/oxfmt/Node 语法检查、`bun run test` 的 9 个工作区任务均通过。全仓测试仍输出 native `moduleSuffixes is not supported yet` 的已有警告；没有抑制。未跑生产构建/发布门禁，未提交或推送。

WebKit DPR2 的默认重叠与跨区截图已检查；两种状态的原核/候选 PNG SHA-256 分别完全相同，未出现黑块、分组接缝或新增裁切。context 恢复与三次重挂载后也与各自恢复前 PNG 相同；候选实际执行 MRT draw 已检查，非误跑默认核。下层标签原有折射重影仍存在，不代表文字可读性验收通过。候选仅在浏览器会话中替换默认参数以拍摄，不改变 UI 默认。

下一项有意义的实验是验证能否直接消费打包中间结果或使用共享加载，减少/免除解包和额外全图往返；需同时评估存储、同步与完整管线成本。不能从本轮推出 WebGPU compute 一定更快，或 WebGL2 的一切精确复用都不可行。

复现见实验 README；原始证据为 ceiling 目录的 `reused-r{0,1,2}-{reference,reused}.json`、`reused-screen.json`、`reused-chromium{,-reference}.json`、`reused-top.json`、`reused-one-low.json`、`convolution-reused-parity.json`、`reused-visual.json`、`reused-refresh.json`，汇总为 `reused-analysis.json`。截图为 `reused-{reference,reused}-{overlap,boundary}.png`；默认回归、零差矩阵和全仓测试日志在 `.amp/in/reused-{default-regression,parity-expanded,workspace-test}.log`。

## 直接消费打包中间结果：解包已去掉，尚未稳定胜过原核（2026-11-17）

**新增显式 `direct` 叠层实验，零差通过，完整八层每帧 draw 从 reused 的 45 降回 29，解包写回归零；默认仍为 reference。** 三轮独立同步完成中位数从原核 13 ms 到候选 12 ms，但最终复核为双方 13 ms，WebKit P95 始终与原核打平。当前证据支持消除旧候选的额外开销，不支持稳定优于原核、降低物理显存或功耗。

### 两遍直接衔接，保留每遍 RGBA8 量化

横向保留四输出、独立 highp 累加器和原来的负到正累加顺序；四个 RGBA8 输出写入同一个 NEAREST `TEXTURE_2D_ARRAY` 的四层，宽为 `ceil(W/4)`、高为 H。纵向从该数组直接 `texelFetch`，逐输出累加并写普通全尺寸目标，不再先解包横向结果，也不再生成需要解包的纵向结果。局部计算仍保留纵向读取的完整 halo，采样先按整图坐标 clamp，再换算区域坐标。

这是以放弃纵向四输出采样复用换取两次 draw 的候选。未缩核、降采样、改变 Gaussian 权重或量化格式，未跳过下层光学或改变玻璃材质。最后的玻璃继续读取正常纹理，所以未引入手工 LINEAR、色散采样或材质边界近似。数组四层的全部容量已计入新 `texImage3D` 资源账本，不能把一个 GL 对象当成一层存储。

首个直接读取版本仍用线性 atlas 和四个 sampler 分支，60 帧筛查得到 P95 57 ms、独立 render＋读回中位 56 ms，虽然零差仍不合算；未保留其实现。改成数组后同时去掉逐采样 atlas 除余地址换算和分纹理执行路径，短测 P95 18 ms、中位 12 ms。多项布局因素同时改变，不能将全部回退独立归因给某个分支或某条整数指令。初筛证据分别是 `direct-smoke.json`、`direct-array-smoke.json`。

### 三轮同期对照与最终复核都保留

M2 Pro、交流电、WebKit 27.2、880×460 CSS px、DPR2、σ15.3、八层全动。每条件 24 绘制预热、30 idle callbacks、600 计时帧、新进程；顺序 reference/reused/direct、direct/reference/reused、reused/direct/reference。计时窗口无并行构建或浏览器测试、无上传/显式读回/阻塞 fence。

| 指标                    | 原核 reference  | 四输出＋解包 reused | 数组直读 direct |
| ----------------------- | --------------- | ------------------- | --------------- |
| RAF P95，三轮           | 18 / 18 / 18 ms | 28 / 18 / 18 ms     | 18 / 18 / 18 ms |
| RAF P99，三轮           | 18 / 18 / 18 ms | 30 / 22 / 28 ms     | 18 / 18 / 18 ms |
| 独立 render＋读回 P50   | 13 / 13 / 13 ms | 17 / 16 / 16 ms     | 12 / 12 / 12 ms |
| 每帧 draw               | 29              | 45                  | 29              |
| 每帧 unpack 输出位置    | 0               | 4,960,000           | 0               |
| 显式纹理容量            | 55.93 MiB       | 62.10 MiB           | 62.10 MiB       |
| Texture / FBO / Program | 9 / 7 / 4       | 13 / 8 / 6          | 10 / 8 / 6      |

最终模式切换边界修改后再跑一对 600 帧，双方 P95/P99 均为 18/18 ms、render＋读回 P50 均为 13 ms。前三轮约 1 ms 的同步差异没有在最终复核保持，不能宣称稳定提速 8%。旧 reused 本轮 P95 也随轮次下降，不使用历史较慢数据计算收益。九个正式条件逐帧 visible/focused，各 13 次约 1 Hz 原生前台采样均为 Playwright；这不是连续原生状态审计。实际到达 P95 都与 RAF 对应；原核第二轮实际到达 P99 为 19 ms，而 RAF 为 18 ms。

数组版每帧 blur viewport 位置为 2,814,016，普通 copy/paint 为 5,329,040，unpack 为 0；旧 reused 的 blur viewport 为 1,253,120、copy/paint/unpack 合计 10,289,040。这些是派发位置，不是等价输出数量或实测带宽。数组仍额外分配 6,476,800 bytes（6.18 MiB，约 11.04%）；普通横向中间目标尚未退役，存在后续回收机会，不能把当前资源账本视为最低需求。全部正式样本 GL error 0、销毁后跟踪对象归零。未测纯 GPU 时间、物理驻留、功耗或五分钟长会话。

Chromium 一对 600 帧控制：原核/数组版实际到达 P95 12.6/11.2 ms，独立 render＋读回中位 13.3/11.3 ms；RAF P95 17.3/16.8 ms。仅单对控制，不推广为多轮、多设备结论。WebKit 300 帧仅顶层移动控制仍三 draw、零 blur/unpack/上传，P95 18 ms，但数组预分配仍占用；DPR1、单层、σ1.2 的 300 帧控制也通过。

### 零差包括偏移区域、照片刷新和退出叠层

Chromium/WebKit 各 64 组叠层、4 组退出叠层、160 组独立双遍卷积，最大通道差均为 0。独立矩阵保留四种奇偶/窄尺寸、四种非平凡输入、五个 σ、整幅/偏移小数区域及区域外非零填充；不把本候选没有单轴普通输出的路径计成单轴零差覆盖。测试还要求每对卷积恰为两次实际 draw。实现前同一预算断言看到四次 draw 并拒绝；运行时将数组 row 错移一个 texel 后，叠层/独立最大差均为 255，严格零差断言拒绝。负对照不改磁盘 shader。

另在两个引擎、DPR2、257×173 CSS px 真实照片上，各做 17 步非计时序列：有效区内/外移动、下层移动、paint revision/来源身份、shared/ordered、full/bounded、σ切换、三次背景 revision、退出/重返叠层，逐帧对原核 full 最大差均为 0。退出模式时发现旧 reused 和初版 direct 硬编码 σ30.6，而原核实际沿用前次 σ2.4，导致最大差 3；已用运行时 uniform 值确认，不是新数组采样失真。新 direct 因此只作用于显式叠层合成，普通路径沿用原核及其 uniform 语义，保留退出回归；没有顺手修改旧 reused 的这一独立实验边界。

WebKit DPR2 的默认重叠、文字和跨区三个状态，原核/候选 PNG SHA-256 分别相同，并已检查没有新增黑块、分组缝或裁切。context 恢复、三次重挂载后的 PNG 也与原先相同，候选数组卷积实际 draw 已检查。已有下层文字折射重影仍存在，不是可读性验收。未改变 UI 默认，截图使用会话级候选选择。

实验 typecheck、oxlint、oxfmt、Node 语法、direct 与既有 reused 矩阵通过。默认 ceiling 初次回归通过；最终重跑在 Chromium DPR1 的跨区指针拖动超时，随后再次完整运行通过。没有改动拖动实现或测试断言，原因未确认，失败日志及 `drag-failed` 截图保留，不能宣称该交互测试稳定无波动。首次 `bun run test` 在未改动的 docs `even nonconvergent hook outputs have at most one follow-up per input edit` 用例上等待超时；该文件单独复跑 6/6 通过，随后完整重跑 9/9 workspace tasks 通过，初次失败日志保留，未修改该模块。native 的既有 `moduleSuffixes` 警告仍保留。未跑生产候选门禁，全部本地未提交、未推送。

证据：`direct-r{0,1,2}-{reference,reused,direct}.json`、`direct-final-{reference,direct}.json`、`direct-analysis.json`、`convolution-direct-parity.json`、`convolution-direct-shift-negative.json`、`direct-refresh.json`、`direct-visual.json`、`direct-chromium-{reference,direct}.json`、`direct-top.json`、`direct-one-low.json`。日志在 `.amp/in/direct-*.log`，截图为 `direct-{reference,direct}-{overlap,text,boundary}.png`。下一步应先评估回收闲置普通横向目标，再决定是否值得长会话与更高负载验证；当前不切默认。

## 回收横向目标：容量回到原核，尚无稳定帧时收益（2026-11-17）

**直读叠层不再常驻普通横向纹理及 FBO，八层全动显式容量从 62.10 MiB 降到 55.93 MiB，与同期原核相同。** 本轮收益是消除上一阶段额外存储；WebKit 尾帧没有进一步下降，不能把少分配纹理说成已证明 GPU 更快。默认仍为 reference，全部本地未提交、未推送。

### 资源随实际模式分配，不牺牲普通渲染

`SceneRenderer` 的 direct composition 初始化跳过普通横向目标；`ReusedBlur.renderPair` 只要求真实来源和最终纵向输出目标，横向结果由其自有数组持有。没有伪造已删除目标参数、资源别名或重复释放。退出叠层时按需分配普通横向目标，重新生成普通背景及模糊，即使背景 revision 没变也不能读取不存在/过期的中间结果；重新进入叠层时释放这对普通目标。普通路径仍沿用原核 shader 及前次 σ uniform 语义。

退出叠层的首帧因此需要一次全尺寸 RGBA8 分配、一个 FBO 以及普通路径的两遍卷积；数组暂时仍保留，直到重返叠层再删除普通目标。因此这是降低叠层稳态容量、接受模式切换冷成本的选择，下面的预热计时不覆盖这次分配，也没有测其物理驻留回收延迟。普通非 composition renderer 不移除实际需要的普通目标。

在 880×460 CSS px、DPR2 下，回收 6,476,800 bytes（6.18 MiB，回收前容量的 9.95%），65,120,000→58,643,200 bytes。Texture / FBO 从 10 / 8 降到 9 / 7，与原核一致；direct 仍六个 program，原核四个。账本计入照片、额外 paint 缓存及数组全部四层，不是物理显存、RSS、驱动驻留或内存压力测试。宽不能整除四时，数组补齐最多多三列，不能把本 fixture 的容量相等推广到任意尺寸。

### 回收前控制与同期原核都未显示稳定提速

M2 Pro、交流电、Playwright WebKit 27.2，880×460 CSS px、DPR2、σ15.3、八层全动。修改前先测两次独立 direct 进程；修改后三轮新进程顺序为 reference/direct、direct/reference、reference/direct。每条件 24 绘制预热、30 idle callbacks、600 正式帧，串行运行且不与构建或其他浏览器验证并行。

| 指标                  | 回收前 direct 两次 | 同期原核三轮    | 回收后 direct 三轮 |
| --------------------- | ------------------ | --------------- | ------------------ |
| RAF P95               | 18 / 18 ms         | 18 / 18 / 18 ms | 18 / 18 / 18 ms    |
| RAF P99               | 18 / 19 ms         | 18 / 18 / 18 ms | 18 / 18 / 18 ms    |
| 独立 render＋读回 P50 | 12 / 13 ms         | 12 / 13 / 13 ms | 12 / 12 / 12 ms    |
| 每帧 draw             | 29                 | 29              | 29                 |
| 显式容量              | 62.10 MiB          | 55.93 MiB       | 55.93 MiB          |

修改后三轮的实际到达 P95/P99 也均为 18/18 ms。候选比部分原核同步样本低 1 ms，但修改前已出现 12 ms，WebKit 时钟又为毫秒粒度，无法独立归因给目标回收。更少存储没有改变每帧工作量：direct 仍 blur viewport 2,814,016、copy/paint 5,329,040、unpack 0；这些不是实际带宽。六个同期条件各 13 次约 1 Hz 原生前台采样全是 Playwright，逐帧 visible/focused；不是连续原生审计。正式窗口零上传/显式读回，GL error 0，dispose 后跟踪对象均归零。

Chromium 158 的单对 600 帧控制，原核/direct 实际到达 P95 为 12.5/11.2 ms、RAF P95 为 17.2/17.0 ms，但独立同步 render＋读回 P50 为 12.4/12.7 ms，没有同步完成优势。不能只选有利指标称为普遍提速。WebKit 300 帧仅顶层移动控制仍三 draw、零 blur/unpack/upload、P95/P99 18/18 ms，容量同步降到 55.93 MiB；DPR1 单层 σ1.2 控制也通过。未测五分钟长会话、纯 GPU 时间、物理内存或功耗。

### 零差与反复模式切换通过

新增资源回归先在未修改实现上失败：初始化期望七个 texture/FBO，实际八个；修改后通过初始化、三次叠层/普通往返、最终重返及 dispose 零对象检查。Chromium/WebKit 各 64 组叠层、8 组退出叠层、160 组独立双遍卷积均最大差 0。退出覆盖新增 revision 和 direct 未变 revision 两种情况，后者对照原核强制刷新后的结果，确保按需分配后不会显示旧中间纹理。独立矩阵保留全部既有尺寸、输入、σ和区域外非零填充门槛。

另在两引擎各跑 17 步真实照片、几何、paint/revision/identity、shared/ordered、full/bounded、σ、三次照片更新和退出/重返序列，逐帧对原核 full 最大差 0。WebKit DPR2 三种 UI 状态（overlap/text/boundary）的原核和候选 PNG SHA-256 分别相同，context 恢复及三次重挂载截图也完全一致。已审阅候选三个最终截图，未见新增黑块、四像素分组缝或裁切；文字原有折射模糊/重影仍存在，不代表产品文字可读性通过。

默认完整 ceiling 回归、既有 reused 核矩阵、实验 typecheck/oxlint/oxfmt/Node 语法及 `bun run test` 九个工作区任务通过；未抑制 native 已有 moduleSuffixes 警告，未跑生产候选门禁。源文件、实验默认和已发布入口之外的并行改动保持原样。

证据为 ceiling 目录 `retire-before-{0,1}.json`、`retire-r{0,1,2}-{reference,direct}.json`、`retire-chromium-{reference,direct}.json`、`retire-{top,one-low,validation,analysis}.json`、更新后的 `convolution-direct-parity.json`。截图为 `retire-{reference,direct}-{overlap,text,boundary}.png`；日志为 `.amp/in/retire-*.log`。下一步若继续追求吞吐，应针对仍实际执行的顺序卷积/合成工作做瓶颈实验，而不是从这次资源回收推导速度结论。

## 顺序卷积归因：两轴 tap 循环都有成本，尚不能归咎纵向或单一依赖（2026-11-17）

**在不减少 draw、目标或派发范围的诊断中，分别简化横向、纵向都能缩短同步完成；没有证据支持仅优化纵向、预计算权重或解除前层来源依赖即可解决主要成本。** 本轮没有修改 renderer、shader 源文件、benchmark 或默认行为，只增加研究记录。所有诊断替换均通过临时浏览器会话注入，不能当成等画质优化，更不能把毫秒差直接标成 GPU 阶段时间。

### 保留派发与存储，改变明确的一项工作

复用已回收横向目标的 direct 叠层、M2 Pro、交流电、Playwright WebKit 27.2，880×460 CSS px、DPR2、σ15.3、八层全动。六种条件各三个新进程、600 正式帧，顺序为 full/H/V/both/weights/frozen、反序、V/full/frozen/H/weights/both。每次仍有 24 帧绘制预热、30 idle callbacks，正式计时后另测 20 次独立 render＋1 px 读回。本线程串行测试，未并行运行构建或其他浏览器验证。

横向 identity 保留四层 MRT、坐标、bounds/halo 与量化，只把四个卷积输出改为四个对应中心 texel。纵向 identity 保留数组输入和普通目标，只取各自中心 texel。both 同时替换两轴，不删除任意 draw。weights 保留所有采样与累加，但用 CPU 计算、Float32 uniform 表代替循环里的指数表达式；因此同时引入 uniform 数组访问与动态选择成本。frozen 只把每层横向输入从刚合成的目标改为本 renderer 的固定原始背景纹理，仍运行完整两轴卷积与后续合成。

| 会话诊断             | 独立同步完成 P50，三轮 | RAF P95 / P99，各轮 |
| -------------------- | ---------------------- | ------------------- |
| 完整两轴（插桩基线） | 13 / 13 / 13 ms        | 18 / 18 ms          |
| 横向取中心，纵向完整 | 9 / 9 / 9 ms           | 18 / 18 ms          |
| 横向完整，纵向取中心 | 9 / 10 / 9 ms          | 18 / 18 ms          |
| 两轴都取中心         | 4 / 4 / 4 ms           | 18 / 18 ms          |
| 权重改为 uniform 表  | 13 / 13 / 13 ms        | 18 / 18 ms          |
| 固定横向背景来源     | 13 / 13 / 13 ms        | 18 / 18 ms          |

十八个正式条件均为每帧 29 draw、横向 8 draw＋纵向 8 draw、零上传/显式读回、2,814,016 blur viewport 位置、5,329,040 copy/paint 位置、58,643,200 bytes 显式纹理容量。注入计数确认各条件实际执行了相应分支：每条件横/纵各 4,800 次，identity/weights/frozen 数量与选择完全一致；frozen 的 4,800 次替换来源均不同于正常来源。GL error 均 0，dispose 后跟踪对象归零。各条件 13 次约 1 Hz 原生前台采样全为 Playwright，逐帧 visible/focused；实际到达 P95/P99 也均为 18/18 ms，不是连续原生状态审计。

### 能判断的成本层级与不能相加的毫秒

1. **两轴 tap 循环都是可操作的成本。** 单独把一轴替换成中心采样都改善约 3–4 ms；不能把纵向数组寻址宣布为唯一或压倒性的瓶颈。两轴都简化仍需约 4 ms，说明其余绘制、提交、完成和读回成本仍在。差值不具可加性，不能声称横向精确占 4 ms、纵向精确占 4 ms，更不能从 13→4 算“GPU 已提速约 69%”。横向虽然复用了读取，仍维护四个独立累加器并计算 halo；更少 texelFetch 调用不等于该方向必然更便宜。
2. **本 uniform 权重表没有收益，也没有过零差。** 不把此结果解释为 exp 指令天然便宜：它改变了内存访问、动态分支及寄存器使用，没有采集编译后 GPU 指令。额外的双层高频像素对照中，表版本最大差 1、9 个通道改变，当前零差合同下不能直接采用。
3. **解除前一层玻璃输出到下一层横向输入的依赖，没有显示改善。** frozen 仍为 13 ms，但它没有解除横向到纵向的依赖、数组 scratch 的重复使用和整条渲染顺序，而且改变了输入数据与缓存行为。因此只支持“这一个来源依赖替换未带来收益”，不能排除全部资源屏障、tile flush 或驱动调度成本。
4. **没有硬件层归因。** WebKit 不提供本次计时扩展，未采集 Metal trace、GPU counters、纯 GPU 时间、带宽或寄存器占用；同步完成包含浏览器、驱动、等待及读回，仍不能区分最终受采样/寻址、加权累加、缓存还是 pass 边界主导。下一步应拆分 tap 内的采样/寻址与累加，或采集原生 GPU 证据，再决定共享加载/纵向复用方案。

补跑一次完全无注入的同 fixture：同步中位 12 ms、P95/P99 18/18 ms，而插桩完整路径为 13 ms，说明观测与额外 shader 分支可能带来约毫秒级差异，也可能包含运行波动；不能将诊断差值当成无插桩原核的精确阶段预算。所有条件的 RAF 都稳定在约 60 Hz 的节奏，不能从回调打平推出 GPU 工作相同。

### 验证分支确实改变像素，不伪造优化验收

所有正式条件在启用替换前，都先以 costProbe=0 对原核 full 的六个移动帧做零差预检；这只验证关闭诊断的路径，**不证明简化后的诊断有光学正确性**。另在相同尺寸、DPR2、双层高频文字/条纹输入上分别读回完整图像：完整插桩模式开关最大差 0；H identity 最大差 147，V identity 54，both 147，frozen 122，确认其确实改变画面；权重表最大差 1。没有把这些错误画面作为功能截图交付。

初筛中有一次 weights 条件原生前台切到 Safari，该 60 帧样本被排除；正式十八个条件全部通过前台与资源审计。无新增产品代码，因此本轮没有重新运行全仓/生产门禁或做五分钟长会话，不把上一轮测试声明改成此轮新证据。临时脚本清理，仅保留原始数据、诊断源码文本与实际编译输入作复核材料。

原始证据位于 ceiling 目录 `cost-r{0,1,2}-{full,horizontal-identity,vertical-identity,both-identity,weights,frozen}.json`、`cost-uninstrumented.json`、`cost-analysis.json`、`cost-pixels.json`、`cost-horizontal.glsl`、`cost-vertical.glsl`、`cost-probe-source.txt`、`cost-pixels-source.txt`；日志为 `.amp/in/cost-*.log`。GLSL 是包含诊断分支的实际 shader 输入，不是驱动编译后的 ISA。

## 采样、寻址与累加拆分：源码减法未变成稳定收益（2026-11-17）

**在当前 direct 核上，内部像素免 clamp 保持零差但没有稳定提速；去掉乘权重、重复读中心点或改用坐标值均未显示稳定改善；奇偶双累加链明显更慢且不满足零差。** 这轮排除了几种具体改写作为现成优化，不等于已经证明纹理读取、寻址或乘法在硬件上便宜。正式 renderer、shader、benchmark 和默认 reference 路径均未改动。

### 五种诊断都保留相同绘制与资源范围

沿用 M2 Pro、交流电、Playwright WebKit 27.2、880×460 CSS px、DPR2、σ15.3、八层全动、bounded/direct。每个新进程 24 帧绘制预热、30 idle callbacks、600 正式帧，另测 20 次独立 render＋1 px 读回。本线程没有并行运行浏览器测量或构建；未确认整机其他进程的 GPU 负载。

- **center：** 两轴的卷积循环、权重及累加保留，改为每个输出反复读取其中心坐标。编译器可以提升或合并重复读取，不能声称实际执行了原数量的 fetch，也同时改变寻址、画面及下游输入。
- **synthetic：** 用取样坐标生成 RGBA 值代替 texelFetch，保留坐标对输出的影响和加权累加。它引入归一化等 ALU，并允许不同编译优化，不是纹理读取硬件时间的精确减法。
- **interior：** 每个输出先判断整个固定支持域是否位于纹理内部，内部 tap 不做 clamp，边界维持原式。保留坐标偏移、分组、数组 channel 寻址及完整核；没有使用越界读取。
- **unweighted：** 采样、支持范围、权重计算/门控及归一化保留，颜色只累加，不乘权重。它改变 FMA 机会、结果饱和及下游数据，不能等同于单独测量乘法指令。
- **split：** 奇偶 tap 分别累加，最后合并。保留原采样及权重，但增加累加器、奇偶判断并改变加法顺序；不能把它的退化直接归咎于寄存器溢出或分支。

### 去掉备用执行路径后，负结果仍成立

先测含原始 baseline 函数和诊断函数的动态版本，各条件三轮，共 18 份。随后使用每个程序只含被测算法的单用途版本再跑三轮，避免备用函数和运行期分支混入主要比较。单用途版本从创建时就执行诊断，因此临时 benchmark 副本明确报告对原核 reference 的像素差，而不是把关闭诊断的预检当成其正确性。full/interior 仍要求差 0；其余条件要求确实改变像素，并标记 `deliberately-incorrect-counterfactual`。原 benchmark 未修改，副本不作为产品验收。

动态 `tap-v3-r2-split.json`、单用途 `tap-static-r0-full.json` 和 `tap-static-r0-center.json` 出现原生前台 Safari，保留原始数据但全部排除。补测单用途 full/center 各一次后，主要比较每条件均有三份有效新进程样本：

| 单用途诊断                | 有效同步完成 P50，按采集顺序 | 有效回调 P95 / P99           |
| ------------------------- | ---------------------------- | ---------------------------- |
| 完整原核 full             | 13 / 13 / 15 ms              | 18 / 18、18 / 18、18 / 22 ms |
| center，重复读中心        | 18 / 17 / 18 ms              | 18 / 19、18 / 19、19 / 20 ms |
| synthetic，坐标代替纹理值 | 14 / 14 / 13 ms              | 均 18 / 18 ms                |
| interior，内部免 clamp    | 14 / 13 / 13 ms              | 18 / 18、18 / 18、18 / 21 ms |
| unweighted，去掉乘权重    | 16 / 15 / 13 ms              | 均 18 / 18 ms                |
| split，奇偶双累加链       | 17 / 16 / 17 ms              | 26 / 31、26 / 29、24 / 30 ms |

center 的第二份实际到达 P99 为 20 ms，RAF 时间戳 P99 为 19 ms；其它主比较的实际到达 P95/P99 与上表一致。同步完成包含 CPU、浏览器、驱动、等待和读回；20 次样本的毫秒级中位不能作为精确 GPU 阶段预算。动态版本有效同步中位分别为 full 13/15/15、center 19/17/18、synthetic 15/15/14、interior 14/13/13、unweighted 14/13/13、split 16/17 ms，亦未出现可稳定采用的改写。不据此宣称备用函数造成了某个确定耗时。

### 像素检查区分可保真改写与错误画面

单用途版本另对独立原核 reference 做六步双层高频条纹/文字、接近四边的全图读回。full/interior 六步均最大差 0、变化通道 0；center 最大差 129–144，synthetic 161–213，unweighted 83–87，确认这些反事实确实改变输出。split 六步最大差均为 1，变化通道依次 11/9/21/55/22/25，不能满足零差合同。计时 fixture 的六帧预检中，full/interior 差 0，其余最大差分别为 center 127、synthetic 169、unweighted 107、split 1。

初版把所有诊断揉进同一循环时，关闭替换也出现对 reference 的最大差 1，因而没有进入正式对照。分离未修改 baseline 后恢复关闭诊断零差；单用途版本又独立验证实际算法对 reference 的差值。这说明源码结构变化本身就需要精度复核；本轮未取得驱动 ISA，不能断言具体是哪种编译/FMA 决策导致差异。

38 份计时记录（含三份排除样本）均核验：横纵各 4,800 次实际 draw，选择记录符合条件；每帧 29 draw、2,814,016 blur viewport 位置、5,329,040 copy/paint 位置，正式窗口零上传/显式读回/解包，显式纹理容量 58,643,200 bytes，GL error 0，dispose 后跟踪对象归零。逐帧 visible/focused，原生状态约 1 Hz 抽样，不能代替连续原生审计。计数确认 draw 与程序选择，不证明编译后的 tap 指令条数。

**下一步应先取得原生 GPU 证据，而不是把剩余耗时分配给猜测的指令。** 当前只支持“两轴完整 tap 循环的整体工作昂贵，以上具体简化没有给出可用收益”。不能判定最终受采样带宽、整数寻址、FMA 吞吐、寄存器压力、循环编译还是 pass 边界主导。WebKit timer 扩展仍不可用；未采集 Metal trace、硬件 counters、纯 GPU 时间、物理显存或功耗，也没有新增五分钟长会话。本轮无产品代码变化，不重跑或冒称通过产品全仓/生产门禁。

证据在 ceiling 目录 `tap-analysis.json`、`tap-v3-r{0,1,2}-*.json`、`tap-static-r{0,1,2}-*.json`、`tap-repeat-r0-{full,center}.json`、`tap-static-pixels.json`、`tap-v3-pixels.json`、`tap-static-*-{horizontal,vertical}.glsl` 和对应源码归档文本。临时执行脚本清理后，仅保留明确标识的证据；研究记录本地未提交、未推送。

## 原生 Metal trace：完整卷积主要占用片元执行区间（2026-11-17）

**已取得目标 WebKit GPU 进程的原生执行区间。相同 encoder 结构下，完整卷积批次的 GPU 区间并集中位 11.58 ms，双轴取中心诊断为 1.29 ms；完整核批次内部没有发现占主导的执行空档。** 这支持优先调查卷积对应的片元执行，不支持把大部分成本归为 pass 之间空等。执行区间包含硬件内部的等待，仍不能区分纹理采样、寻址、ALU、缓存未命中、寄存器压力或 tile 操作；没有获得硬件计数器或编译后 ISA。

### 三份短录制，只有后两份用于受控对照

本机 M2 Pro、交流电、Playwright WebKit 27.2/r2388、880×460 CSS px、DPR2、八层全动、σ15.3、bounded/direct。复用既有服务与 benchmark，以临时 preload 启动 `xcrun xctrace record --template 'Metal System Trace' --attach <本次新建的 GPU PID> --time-limit 14s`。Xcode Instruments 为 27.2 (27B52)。没有修改正式 renderer、shader、benchmark 或默认 reference。

- `native-direct-full`：无 cost shader 插桩，600 正式帧；录制实际开始较晚，只与后约 8 秒相交，筛得 457 个完整绘制批次。原生前台从 Playwright 切到其他应用，不能作为受控性能基线，也不能用来测量录制开销。
- `native-cost-full` / `native-cost-both-identity`：相同 cost 插桩的完整核与双轴中心取样，各 480 正式帧、一个新浏览器进程。等待 xctrace 报告开始后激活实验页，再执行 benchmark；各筛得 479 个完整批次。两次全部 15 个原生前台抽样均为 Playwright，逐帧 visible/focused。它们是各一次短录制，不是重复统计或长会话稳定性结论，也未控制整机其他进程的 GPU 工作。

分析只纳入指定 GPU PID，并以 benchmark 的 `timeOrigin`、逐帧 arrival/end 和 trace 的 start-date 对齐。以稳定出现的 27＋19 encoder 两个相邻非空 command buffer 识别重复绘制批次，要求从首条 submission 起点到最后 GPU 区间结束完整落在正式测量窗口内；不是把 Instruments 的 Frame # 当成呈现帧编号。最后在途批次被排除。通过 command-buffer ID / encoder ID 关联 CPU encoder 列表与 GPU 事件，不混入 TOC 中的其他 GPU 进程。没有逐帧浏览器呈现标记，未验证屏幕呈现延迟。

### encoder 数量不变，长片元区间明显缩短

| 原生区间指标，每个完整批次                  | 完整卷积，中位 / P95 | 双轴取中心，中位 / P95 |
| ------------------------------------------- | -------------------- | ---------------------- |
| 各 GPU 通道执行区间并集                     | 11.579 / 11.925 ms   | 1.285 / 1.656 ms       |
| Fragment 执行区间并集                       | 11.566 / 11.912 ms   | 1.174 / 1.514 ms       |
| 首次到末次 GPU 执行跨度                     | 11.622 / 12.014 ms   | 1.982 / 3.168 ms       |
| 上述跨度内未被本批次 GPU 区间覆盖的时间     | 0.030 / 0.097 ms     | 0.748 / 1.787 ms       |
| 首条 submission 区间起点到首次 GPU 执行     | 1.333 / 2.651 ms     | 1.329 / 2.921 ms       |
| 首条 submission 区间起点到末次 GPU 执行结束 | 13.230 / 14.455 ms   | 3.364 / 5.796 ms       |

每批均为 27 Render＋11 Compute＋8 Blit，共 46 encoder；应用正式窗口每帧仍为 29 draw。原生 encoder 与 WebGL draw 不一一对应；没有把额外 Compute/Blit 直接认定为某种 resolve 或复制算法。27 个 Render encoder 中有 16 个在中心诊断下的 Fragment 区间中位缩短超过 0.25 ms，与八层的 16 次卷积相符，但未取得 shader 标签绑定，不能逐个命名为横向/纵向。不能将不同指标或 encoder 的中位数相加充当帧预算。

这里的 GPU 区间并集来自 Instruments `metal-gpu-intervals` 的目标进程事件，按批次跨通道合并重叠区间；不是 shader 指令活跃时间或 GPU 利用率。Vertex/Compute 与 Fragment 重叠，不能相加。区间内部的访存等待、依赖或争用仍可能很大；只有区间外空档较小，不能据此宣布屏障或带宽成本不存在。中心诊断改变光学与缓存访问，不是精确的采样指令成本减法，更不是可采用的提速方案。

录制中独立 render＋1 px 读回中位为完整核 14 ms、中心诊断 5 ms；两者 RAF P95/P99 都为 18/18 ms。读回不计入上述正式 GPU 窗口，不能把同步完成、回调间隔与原生执行并集混称为同一类 GPU 时间。

### Metal 分配量有实测，物理驻留仍未知

`metal-current-allocated-size` 提供目标进程 Metal device 的 `MTLDevice.currentAllocatedSize`。两份插桩录制在正式窗口内的事件采样中位均为 167,149,568 bytes（159.406 MiB），初段最高 191,971,328 bytes（183.078 MiB）；无 cost 插桩首录中位为 144,195,584 bytes（137.516 MiB），但其条件不等同，不能将差值归为确定的插桩开销。采样随事件产生，不是等间隔或时间加权的内存分布。

renderer 的显式纹理账本仍为 58,643,200 bytes（55.927 MiB）。Metal device 指标包括该 GPU 进程的其他 Metal 资源、上下文及驱动分配，不能把约 159 MiB 全部计为玻璃纹理，也不是物理驻留显存、峰值 RSS 或整机统一内存占用。原生分配量明显高于显式纹理账本，后者不能继续当作总成本上界。

模板元数据为 Counter Set `(null)`、Shader Timeline `Disabled`。中心诊断的 `gpu-counter-value`、`metal-shader-profiler-intervals`、`gpu-shader-profiler-sample` 实际导出均为 0 行；加入 `Metal GPU Counters` 的 recording-options 查询也没有暴露该仪器可配置选项。故本轮未定位采样/ALU/缓存/寄存器中的具体硬件瓶颈。后续应先验证可用的 shader profiler/counter 采集方式，再考虑新的核改写，不根据这些区间猜测寄存器溢出或带宽饱和。

### 复核与隐私

两份对照各核验横/纵 3,840 次实际 draw：full 的 identity 计数为零，both-identity 两轴计数均为 3,840；正式窗口零上传/显式读回/解包，GL error 0，dispose 后跟踪对象归零。替换启用前的六帧原核 parity 最大差 0，不代表启用中心诊断后光学正确；其错误光学已在前一轮独立像素实验确认。本轮没有产品改动、全仓/生产门禁或新增长会话结论。

证据前缀为 ceiling 目录 `native-{direct-full,cost-full,cost-both-identity}`：`.trace`、录制元数据 `.json`、`-benchmark.json`、`-toc.xml`、各 schema `.xml`、目标进程筛选 `-target.json`、`-batches.json` 与 `-analysis.json`。分析方法为 `native-analysis-source.txt`，录制包装为 `native-trace-source.txt`，cost 包装复用 `cost-probe-source.txt`。临时执行脚本归档后清理。即使指定 attach，模板仍记录系统级进程/设备/环境元数据；原始 trace、TOC 与全量 XML 仅留本地，研究 artifact 只发布脱敏结论，不上传原始录制。研究记录本地未提交、未推送。

## Shader Timeline 与硬件计数器已采到，长执行区间指向 ALU 侧（2026-11-17）

**已打通 Performance Limiters、原始 PC 采样和目标 GPU 进程的 Shader Timeline。排除其他已记录 GPU 工作并收紧边界后，完整核长执行区间中采到的 ALU Limiter 时间加权均值为 95.19%，Texture Sample Limiter 为 23.50%。** 这支持优先调查 ALU 侧工作，而不是直接认定纹理采样吞吐饱和。它还不是逐 shader、逐指令的瓶颈证明：未取得 GLSL 源码行、生成 MSL 或 ISA 与 PC 的对应关系，不能把成本分配给整数寻址、循环分支、exp、浮点乘加或寄存器压力。

### 真实模板解决配置入口，不能只添加一个计数器仪器

前一轮模板没有启用相关选项，空表不代表设备无法采集。本轮在 Instruments 的 Metal Application 录制选项中选择 **Counter Set: Performance Limiters**，开启 **Shader Timeline**，Performance State 保持 Default；通过 File → Save As Template 导出本地 `Glass Counters.tracetemplate`，再以 `xcrun xctrace record --template <该文件> --attach <新建 GPU PID> --time-limit 6s` 精确附加。没有手改模板、安装全局模板、更改系统权限、重签或修改浏览器二进制。

两份正式 trace 的 TOC 均确认为 `counter-profile=3`、`shader-profiler=1`。`--show-recording-options` 没有暴露这些配置，单独添加 Metal GPU Counters 也没有解决入口；使用原生界面导出的模板才采到非空数据。[Apple 官方演示](https://developer.apple.com/videos/play/wwdc2020/10603/?time=435)给出了相同的 Counter Set 和 Shader Timeline 选择方法，也解释了 limiter、utilization 与 occupancy 的区别。

首份 `native-profiler-enabled` 仅用于验证入口：原生前台为 Instruments，14.977 秒录制与正式绘制只相交 4.764 秒，不作为受控性能结果。其后补录 `native-counters-full` / `native-counters-both-identity`，保持前述 M2 Pro、WebKit 27.2/r2388、880×460 CSS px、DPR2、八层全动、σ15.3、bounded/direct 和相同 cost 插桩；每份一个新进程、120 正式帧、6 秒录制。等待录制 ready 后，按本次 UI PID 激活原生窗口，再执行 benchmark。

### Shader 数据已非空，但尚未映射回横纵 GLSL

| 导出与筛选结果                           | 完整卷积  | 双轴取中心诊断 |
| ---------------------------------------- | --------- | -------------- |
| 原始 PC sample 行，整份录制、无 PID 列   | 148,652   | 50,199         |
| 目标 PID 的 Shader Timeline 行，整份录制 | 5,753     | 2,076          |
| 上述 Timeline 与正式窗口相交的行         | 3,777     | 1,141          |
| 目标 PID 的 compiled-shader 记录         | 64        | 75             |
| 硬件 counter interval 行，整份录制       | 2,755,142 | 1,015,228      |

compiled-shader 数量是表记录数，不是唯一 shader 程序数。原始 PC 表没有 PID，不能把所有 PC 样本宣称为玻璃 shader；派生 Timeline 和 shader list 才提供目标进程归属。目标程序主要显示为 ANGLE 的 `main0 (n)`；目前导出没有 GLSL 行映射或可靠横纵向标签，故这里只声称采到了 PC、目标 shader 记录和执行时间线，不声称源码行级 profiler 已完成。Timeline 层级、通道与 shader 类型也不是独立可相加的指令时间。

### 计数器支持 ALU 方向，不支持直接推导指令预算

以 trace start-date 和 benchmark timeOrigin、逐帧 arrival/end 对齐。两份正式窗口分别为 1,975 / 1,985 ms，均完整落在录制内。基础 counter 使用 ring 3 的 31 项；ring 0 的派生 Total Occupancy / Top Performance Limiter 单独保留，不与基础 counter 混合平均。每项只按实际采到的区间时长加权，未采到的空档不填零：

| 基础 counter，已采区间时间加权均值 | 完整核正式窗口 | 完整核收紧窗口 | 中心诊断正式窗口 |
| ---------------------------------- | -------------- | -------------- | ---------------- |
| ALU Limiter                        | 69.05%         | 95.19%         | 14.35%           |
| ALU Utilization                    | 49.29%         | 67.64%         | 12.05%           |
| Texture Sample Limiter             | 17.58%         | 23.50%         | 7.46%            |
| Texture Cache Limiter              | 13.44%         | 18.49%         | 3.91%            |
| Fragment Occupancy                 | 51.28%         | 70.00%         | 19.94%           |

完整核正式窗口的每项基础 counter 有 46,293 个样本，覆盖 925.845 ms，即窗口的 46.88%；中心诊断有 7,850 个样本，覆盖 157.000 ms，即 7.91%。这两列不是全窗口平均、不是进程独占数据，也不能从其差值推出优化比例。

收紧方法：先合并目标进程的 Active GPU 区间，减去其他进程及无归属的所有已记录 GPU 区间，再在剩余各段两端各去掉 100 µs，仅纳入完整落在内部的 counter 样本。完整核剩余可选窗口 827.061 ms，实际采到 21,954 个基础样本、439.080 ms，覆盖可选窗口的 53.09%。边界收紧是诊断用保护带，不是硬件隔离保证；它还偏向较长执行段，不能当作所有短 pass 的代表值。中心诊断同样收紧后仅剩 0.514 ms 可选窗口和 4 个样本，因此不报告其收紧均值，也不用它与完整核作硬件比例对照。

这些计数器仍来自整块 GPU，按目标活动窗口筛选只能减轻可见的其他负载污染，不能赋予进程独占语义或排除未被记录的工作。95.19% 是 ALU Limiter 指标，不是“95% 帧时花在 ALU”，各 limiter 可并行、不能相加；ALU Utilization 的 67.64% 也不能解释为单一 F32 乘加利用率。完整核 F32 Utilization 在收紧窗口为 15.69%，不足以判定其余成本具体属于整数、特殊函数还是控制流。GPU Read/Write Bandwidth、LLC、MMU 等若干项目全零，没有独立验证其采集能力，不能据此宣称无带宽或缓存成本。

**本轮决策是继续调查完整 tap 循环的算术、控制与寻址生成代码，不先按“纹理采样饱和”设计降精度或减少取样的优化。** 前一轮权重表、内部免 clamp 和双累加链的负结果依然有效，不能因为 ALU Limiter 高就宣称这些改写一定会变快。需要后续受控扰动与生成代码/PC 热点对应，才能进一步收窄。

### 前台、分支与资源核验通过，仍不是新的性能胜出结论

两份各 9 个原生前台抽样均为 Playwright，正式 120 帧均 visible/focused；这不是连续原生前台审计。横纵各 960 次 draw，full 的 identity 计数为 0，中心诊断两轴均为 960。每帧 29 draw、2,814,016 blur viewport 位置、5,329,040 copy/paint 位置，零上传/显式读回/解包；显式纹理容量 58,643,200 bytes，GL error 0、dispose 后对象归零。替换启用前六帧原核 reference parity 最大差为 0，不证明启用中心诊断后的光学正确。

录制中的同步 render＋1 px 读回中位 full / identity 为 13 / 3 ms，RAF P95/P99 均 18/18 ms。它们不是纯 GPU 时间；每条件只录一次短样本，没有测录制开销、持续功耗、物理驻留内存或新增长会话，中心诊断仍是错误光学探针。正式 renderer、shader、benchmark 与默认路径未改，不声明新增产品全仓/生产门禁通过。

证据前缀为 ceiling 目录 `native-profiler-enabled*`、`native-profiler-gui-benchmark.json`、`native-counters-{full,both-identity}*`，包括 trace、导出 XML、目标 shader 筛选、counter/shader 分析 JSON 和本地模板。方法归档为 `native-counters-source.txt`、`native-counters-cost-source.txt`、`native-counters-analysis-source.txt`、`native-counters-shader-analysis-source.txt`；临时执行脚本归档后清理。原始 trace、TOC、XML 与模板含系统元数据，只留本地，不上传；共享 artifact 仅同步脱敏结论。研究记录本地未提交、未推送。

## 热点已绑定横纵程序并取得真实 MSL，逐指令映射仍缺机器码（2026-11-17）

**通过同一进程内分别简化横、纵轴，已确认本次录制的 `main0 (80)` 是横向卷积、`main0 (86)` 是纵向卷积；同时通过 `WEBGL_debug_shaders.getTranslatedShaderSource()` 取得它们的真实 MSL 翻译输出。** PC 采样已经能落到这两个程序内部的偏移，但尚未对应到具体 MSL 行或 GPU 指令。这里完成的是程序级热点与生成代码的关联，不是 ISA 级性能归因。

### MSL 来自运行中的浏览器，不是离线模拟翻译

临时 Playwright preload 记录实际 `compileShader` 输入、状态、翻译结果和 program 连接关系。成功捕获 28 个 shader、14 个 program，全部编译/链接成功。按横向四输出与纵向数组采样的源码标记筛选，得到 `generated-17-h.metal`（14,699 字符）和 `generated-19-v.metal`（11,732 字符）；两者输入 GLSL 与上一轮完整核及本次绑定录制的实际 GLSL **逐字相同**，对应 SHA-256 为 `d6f9460dac6405bf8d579bad23968f9cccd6592b0d2b30dda0a91ee662faef1d` / `f64d6f1e0a6e80e965bec80e5ac5f9031e8309466e7c1d5f06450dd26c9a19dd`。

该接口返回的是 shader 翻译阶段的 MSL：纵向输出仍带 `[[__unassigned_output__]]`，含 function constants 与运行期 uniform，不等同于最终链接、专用化及原生编译后的代码。MSL 里的临时变量、helper、循环和分支也不是最终机器指令数量。公开 WebKit 基线的 [WebGLDebugShaders.cpp](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/WebCore/html/canvas/WebGLDebugShaders.cpp)、[ShaderMtl.mm](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/ThirdParty/ANGLE/src/libANGLE/renderer/metal/ShaderMtl.mm) 和 [ProgramMtl.mm](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/ThirdParty/ANGLE/src/libANGLE/renderer/metal/ProgramMtl.mm)解释了接口和后续链接步骤；不将此公开基线冒称为 r2388 的精确构建源码。

首次源码捕获等待页面 ready 超时，未进入测量；补充异常/控制台与失败态观测后再次捕获成功，没有复现具体错误，原因未确认。成功捕获时原生前台为其他应用，因此其帧时全部排除，不用于性能比较；源码一致性由实际字符串比较核实，不依赖这些帧时。

### 三阶段受控替换绑定程序，不跨进程套用编号

`native-pc-binding` 使用同一浏览器、同一组 shader 程序和同样的 GLSL，仅改变已有 `costProbe` uniform。120 正式帧分为 full、horizontal-identity、vertical-identity 各 40 帧，每个实际卷积 draw 都记录其轴、阶段、flag 和时间。每轴每阶段 320 次 draw，横纵各 960 次，分别恰好 320 次走 identity；其他轴在对应阶段仍执行完整核。每阶段去掉首尾各两帧，取内部 36 个帧间隔对应的窗口；三个窗口此次恰好均为 600 ms。

| 目标程序的 Shader Timeline 区间并集 | 完整核阶段 | 仅横向取中心 | 仅纵向取中心 |
| ----------------------------------- | ---------- | ------------ | ------------ |
| `main0 (80)`，横向                  | 146.617 ms | 0.081 ms     | 234.484 ms   |
| `main0 (86)`，纵向                  | 217.615 ms | 209.065 ms   | 0.039 ms     |

只简化横向时第一个程序的长区间消失，只简化纵向时第二个程序的长区间消失，构成互相排除的程序绑定证据，而不是凭注册顺序、MSL 长度或 `main0` 编号推断。这是各窗口内 profiler 区间的并集，不是 PC 指令活跃时长；替换会改变下游输入、缓存与执行重叠，不能把表中差值当作各轴稳定预算，或将错误光学当作优化。横向在纵向被简化时的区间变长也保留，不用这些短样本宣布阶段提速。

旧完整核录制的主导名字是 `main0 (84)` / `main0 (90)`，新录制为 `(80)` / `(86)`。编号不是跨进程稳定 ID；本轮绑定结论严格限于新录制，不直接给旧编号贴轴标签。

### PC 地址需要时间和进程上下文才能消歧

只按整份 compiled-shader 注册表的 PC 范围匹配，旧完整核正式窗口有 530,580 个 PC occurrence 多重命中，无法唯一归给目标。没有选择第一个命中强行生成热点。改为只取目标 Active GPU 区间中不存在其他已记录活动、且两端各缩 100 µs 的窗口，再要求目标 PID 注册范围和该目标 shader 的活动 Timeline 同时匹配；仍保留未匹配样本，不宣称绝对硬件隔离。

新绑定录制在上述限制下有 220,420 个 occurrence 匹配、5,802 个未匹配，前两个程序占匹配结果的 99.8825%。`main0 (80)` / `(86)` 分别有 117,277 / 102,884 个 occurrence。它们不是 PC sample 行数，也不按 shader 时间或采样行数计算百分比：一个 sample 行可包含多个并行 PC，长停顿也可能被重复采到。

- 横向程序的导出 PC 范围为 12,672–16,196，最热偏移包括 `+3012`、`+1368`、`+1572`、`+2526`、`+2046`。
- 纵向程序范围为 17,280–18,184，偏移 `+530`、`+686`、`+844`、`+680`、`+704` 合计 88,366 个 occurrence，占该程序匹配结果的 85.89%。

偏移单位沿用导出地址值，不能当作指令编号或源码行号。派生 Shader Timeline 本身也来自 profiler，不是独立于 PC 采样的第二套硬件证明；结合它筛选是消费工具的归属信息。未被 trace 记录的其他 GPU 工作仍是限制。额外尝试导出的 `gpu-shader-profiler-interval` 表实际为空，没有从中取得 submission/PC 关联。

### 生成代码缩小了调查范围，没有证明某个 helper 很贵

横向 MSL 第 216–217 行包含按运行期 `groupsWide` 的整数除模；第 271–350 行保留 tap 循环、权重门控、四路累加。纵向第 198–201 行为除 4 / 模 4 的 channel 寻址，第 218–265 行保留 tap 循环、权重计算、数组读取和累加。helper 会表达整数溢出/除零语义和坐标转换，但常数折叠、内联、提取循环不变量、向量化及强度削减仍由后续编译器决定，不能把除 4 的 helper 宣称为真实整数除法指令瓶颈。

两个 `texelFetch` helper 都落到 Metal texture `.read()`，没有新增线性过滤；两份循环中仍能看到 `metal::exp()`，这也不证明其占主导，前一轮权重表未改善的结果不能被忽略。MSL 中的 `ceil(sigma*3)` 出现在循环体，不能据源码位置断言硬件每 tap 重算。当前最合理的下一步是取得最终链接代码/机器码的调试对应，或对这些已绑定程序做单因素、完整精度的代码生成实验；不是立刻替换精度或宣布某项 ALU 改写有效。

本机 `xcrun --find metal` 虽能找到入口，`xcrun metal --help` 实际报告缺 Metal Toolchain；`metal-objdump` / `metal-dsymutil` 未找到。没有安装组件或改 Xcode 配置。更关键的是现有导出未提供本次实际执行的机器码及行表，即使另行编译 MSL，也不能冒称所得 ISA 与浏览器本次管线完全相同。当前不能把上述热偏移译成 `exp`、除法、分支或 FMA。

### GPU 进程的编译输入也已取得，仍不能代替 ISA

追加验证打通了更晚的代码阶段。公开基线 [mtl_utils.mm](https://github.com/WebKit/WebKit/blob/5b391e6d3b14d549908dad2c6695999291313f30/Source/ThirdParty/ANGLE/src/libANGLE/renderer/metal/mtl_utils.mm) 的 `CreateShaderLibrary` 在 `newLibraryWithSource:options:error:` 调用后，按 `ANGLE_METAL_PRINT_MSL_ENABLE` 输出同一个 MSL 字符串。仅传普通环境变量的首次探针没有日志；再次只在本次启动环境中同时传 `ANGLE_METAL_PRINT_MSL_ENABLE=1` 和 `__XPC_ANGLE_METAL_PRINT_MSL_ENABLE=1`，浏览器 stderr 实际出现来自 GPU PID 79624 的 28 段 MSL。未更改全局环境、浏览器二进制、系统偏好或权限；该结果不证明普通变量失败的唯一原因就是传递机制。

按横向 `groupsWide` 与纵向 array texture 加 costProbe 标记分别唯一筛出 `generated-final-horizontal.metal` / `generated-final-vertical.metal`，为 397 / 306 行。两者不再有 `__unassigned_output__`，横向输出已绑定 `color(0..3)`，纵向为 `color(0)`，纹理和 uniform buffer 也已有槽位。探针记录的横纵 GLSL 与前述捕获及绑定录制逐字相同，SHA-256 再次相符。日志提取、括号配对与标记断言通过，记录于 `generated-final-msl-extraction.json`，提取方法为 `final-msl-extract-source.txt`。

这是 ANGLE 填好接口后交给 Metal 库编译器的输入，尚非 function constants 专用化后的最终机器码，也没有编译选项、优化结果或调试行表。最终输入仍包含横向运行期除模、纵向除 4 / 模 4、两轴 tap 循环与 `metal::exp()`；不能据此推翻后端优化或给热点分配指令成本。该源码日志探针与 PC 绑定录制不是同一进程；由 GLSL 相同及源码标记建立程序族关联，不能把新源码的行号直接绑定到旧录制 PC 地址。此次探针原生前台为其他应用，且逐行 NSLog 有扰动，因此全部帧时排除，不作为提速或前台性能证据。GL error 为 0，dispose 后对象归零；unified log 查询仍为空，不影响 stderr 已取得源码的事实。

本次绑定录制原生前台 16 个抽样均为 Playwright，正式逐帧 visible/focused，原核预检六帧零差、GL error 0、资源释放归零；没有修改正式 renderer、shader、benchmark 或默认路径，没有新的性能胜出、长会话或产品全仓门禁声明。原始 trace、TOC 与 XML 只留本地。证据为 `native-pc-binding*`、`native-counters-full-pc-map.json`、`generated-webkit-shaders.json`、两份 `.metal`；方法归档 `generated-shader-capture-source.txt`、`pc-map-source.txt`、`pc-binding-{probe,record,analysis}-source.txt`。临时执行脚本归档后清理，研究本地未提交、未推送。

## 完整精度循环生成对照：分块展开零差但没有稳定提速（2026-11-17）

**4 步和 8 步分块展开通过当前 RGBA8 零差合同，三轮前台对照没有稳定收益；完全静态展开出现最大 1/255 通道差，未进入性能候选。默认路径不变，不落地这些改写。** 本轮仅在独立浏览器会话的 `shaderSource` 入口替换实验 GLSL，没有改正式 renderer、shader、benchmark 或公开组件。它不是对所有循环优化无效的证明，也没有新增逐指令归因。

### 同一采样与累加顺序，先确认检验会拒绝错误

以当前 direct 路径为基线，保留 highp、所有 texelFetch、原权重表达式、原每输出累加次序、原高斯有限支持、RGBA8 中间边界和所有目标。基线也执行同一套 JS 观测包装，没有 tapProbe/costProbe uniform 或 shader 动态诊断分支。候选从编译开始就生效，因此 benchmark 的六个移动帧原核 full-region 预检真正覆盖候选，而非只检查诊断关闭的分支。

- 分块 4/8：外层按 4/8 步递增，循环体内顺序复制各 tap；保持横向 rolling weight 的更新次序。尾块显式过滤超界位置，不多算横向 75 或纵向 72 之后的 tap。
- 静态展开：把横向 -72…75 的 148 步、纵向 -72…72 的 145 步写成连续独立作用域，tap 索引为字面量，仍保留每个输出的累加次序。
- 纵向原 `continue` 改为同一有效半径的条件块，让它不会误跳整个展开块。只在原合同有限正 sigma 范围评估。
- 首先故意去掉纵向乘权重；现有移动 full-reference 预检确实失败，最大差 82，未进入计时。源码序列断言又独立检查每个生成版本恰好按顺序访问原始 tap 范围，不能遗漏最后一个 tap 或重复尾块。

复用原卷积测试的私有副本，只给输出命名加条件/引擎，并把孤立 sigma 扩为 `1/3, 0.334, 0.35, 1.2, 15.3, 23.999, 24.001, 30.6, 56`。每引擎、每条件有 72 个叠层/退出合成检查及 288 个孤立两 pass 检查：包含 DPR1/2、明暗材质、1/8 层、奇偶/单行/单列纹理、裁切 halo、边缘脉冲、半透明随机色、棋盘及半径边界。该零差定义是实际 RGBA8 结果，不是所有驱动上的浮点逐位等价保证。

基线、chunk4、chunk8 在 Chromium 和 Playwright WebKit 各自全部零差。完全静态展开两引擎都在 4 个叠层案例出现最大差 1，孤立检查全部零差；说明只看孤立卷积还不够。WebKit 单独展开横轴仍有 4 个叠层失败，单独展开纵轴有 2 个；不能把差异只归给一个方向。未放宽零差门槛，也未用失败候选宣称等画质加速。具体造成差异的后端变换尚未定位。

### 实际 MSL 已改变，不等于实际机器指令按比例改变

在计时之外通过 `WEBGL_debug_shaders.getTranslatedShaderSource()` 捕获本次实际翻译输出；四条件、两轴均编译成功，原始 GLSL 逐字相同。没有沿用上一轮带 costProbe 的编译输入。

| 条件       | 横向 MSL 字符 | 纵向 MSL 字符 | 每轴源码 while / exp 出现次数 |
| ---------- | ------------: | ------------: | ----------------------------- |
| baseline   |        13,188 |        10,586 | 1 / 1                         |
| chunk4     |        21,916 |        16,131 | 1 / 4                         |
| chunk8     |        33,262 |        23,615 | 1 / 8                         |
| 全静态展开 |       321,166 |       226,210 | 0 / 148（横）、0 / 145（纵）  |

这证明源码改写确实进入 ANGLE 的 MSL 输出，不是改了未执行的字符串。但字符、循环和 exp 的源码出现次数都不是机器码体积、动态执行次数或指令耗时。这里没有重新取得最终库输入、ISA、寄存器数、编译耗时或硬件计数器；不从代码膨胀推导寄存器溢出，也不能认定性能接近就说明 Metal 把各版本编译成同一指令序列。

### 三轮新进程测量没有可采用的胜出条件

沿用 M2 Pro/交流电、Playwright WebKit 27.2、880×460 CSS px、DPR2、八层全动、sigma15.3、bounded/direct。先以 120 帧筛测 baseline、两轴 chunk4/chunk8、分别只改横轴/纵轴的 chunk4/chunk8，共 7 个新进程：回调 P95/P99 全为 18/18 ms，另测同步完成 P50 为 12–13 ms，没有单轴明显胜出。

随后 baseline/chunk4/chunk8 各三次新进程、每次 600 正式帧。顺序分别为 baseline/4/8、8/4/baseline、4/baseline/8；24 绘制预热、30 idle callbacks。正式窗口只记录提交与回调，不读像素；结束后另作 20 次 render＋同步 1 px 读回诊断。源码捕获与正确性运行不和计时并行，计时不开生成 MSL 或 NSLog。

| 条件     | 独立同步完成 P50，三轮 | 同步完成 P95，三轮 | RAF 与实际到达 P95/P99，每轮 |
| -------- | ---------------------- | ------------------ | ---------------------------- |
| baseline | 13 / 12 / 12 ms        | 13 / 14 / 13 ms    | 18 / 18 ms                   |
| chunk4   | 13 / 13 / 12 ms        | 13 / 13 / 13 ms    | 18 / 18 ms                   |
| chunk8   | 13 / 13 / 13 ms        | 14 / 14 / 14 ms    | 18 / 18 ms                   |

每个正式条件有 13 个约 1 Hz 原生前台抽样，全部为 Playwright；逐帧 visible/focused，提交 P95 为 1 ms。边界采样与周期采样不是连续前台保证。结果没有显示稳定提速，也不足以排除低于约 1 ms 计时粒度的差异。同步诊断包含浏览器、提交、等待与读回；不能当纯 GPU 时间。回调打平也不是已证明同样 GPU 成本或呈现 FPS。

全部 16 个筛测/正式样本的原核预检最大差 0，GL error 0、释放归零；每帧 29 draw、横纵各 8 次卷积、2,814,016 blur viewport 位置、5,329,040 copy/paint 位置、零上传/显式读回/解包。改写 draw 计数与所选轴相符，显式纹理容量都为 58,643,200 bytes（55.93 MiB），9 textures / 7 framebuffers / 6 programs。未测物理驻留、持续功耗、新增长会话或 Chromium 性能。没有产品代码改动，因此没有重跑全仓/生产门禁或新增视觉交付声明。

证据在 ceiling 目录 `loop-{webkit,chromium}-*-parity.json`、`loop-screen-*.json`、`loop-r{0,1,2}-*.json`、`loop-generated-webkit-*.json`、`loop-{baseline,chunk4,chunk8,unroll}-{horizontal,vertical}.{glsl,metal}` 与汇总 `loop-analysis.json`。方法归档为 `loop-{probe,matrix,analysis}-source.txt`，私有矩阵相对原测试的差异仅为上述 sigma 和输出名；原负对照拒绝日志为 `.amp/in/loop-negative.log`。复现时把 probe 和 matrix 源码文本恢复到 `.amp/in/loop-probe.cjs` / `.amp/in/loop-matrix.mjs`，维持同层相对路径。正确性使用 `CONVOLUTION=direct ENGINE=webkit LOOP_MODE=chunk4 NODE_OPTIONS="--require=$PWD/.amp/in/loop-probe.cjs" node .amp/in/loop-matrix.mjs`；计时沿用 ceiling-benchmark，另设 `PERF_CONVOLUTION=direct PERF_FOREGROUND=1 PERF_TIMELINE=1 PERF_FRAMES=600` 及上文固定条件，保留每个输出文件。临时执行脚本归档后清理，本地未提交、未推送。

## 边界与不变量外提已过零差，小模糊有局部收益（2026-11-17）

**五条件在 Chromium/WebKit 共 3,600 个检查全部零差；补测显示小模糊组合的同步完成诊断中位数更低，大模糊没有收益，暂不替换默认路径。** 第一批计时被前台审计排除，用户提供静止窗口后完成 34 个有效样本，补测结果见本节末。正式 renderer、shader、benchmark 和默认路径未改。

### 三项单因素与组合都保留原光学计算

仍通过临时会话 preload，在 direct 的实际 `shaderSource` 入口生成条件，无 costProbe/tapProbe uniform，不使用上一轮的分块展开。baseline 也有相同 JS 观测包装。候选在原核 full-region 六帧预检之前已生效。

| 条件        | 对原 GLSL 的唯一算术/控制变化                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| radius      | 把 `ceil(sigma*3.)` 按原表达式存入循环前的 highp float `radius`，循环内引用它                                                                 |
| denominator | 把 `2.*sigma*sigma` 按原求值次序存入循环前的 highp float `denominator`，仍作原除法，不改乘倒数                                                |
| bounds      | 在 GPU 计算 `support=int(min(72.,ceil(sigma*3.)))`，横向循环改为 `-support…support+3`，纵向为 `-support…support`；循环体原权重/门控表达式不变 |
| combined    | 组合以上三项，support 使用 GPU 上算出的 radius                                                                                                |

保留纹理精度、采样点、高斯支持、逐输出累加顺序、横向 rolling weight 更新及 RGBA8 中间边界。边界不由 CPU 计算，避免 JS/GLSL 精度差导致 ceil 边界不同；正有限 sigma 是本次合同。按全部 1…72 整数支持半径独立检查有序 tap 序列和归一化项，收紧前后完全一致。横向结束还需 3 步推进剩余权重：故意删掉这 3 步的负对照实际被移动原核预检拒绝，最大差 2，未进入计时。

复用上一轮扩充过的矩阵，仅改私有副本输出名和环境变量。每条件、每引擎 72 个叠层/退出及 288 个孤立两 pass 检查全部零差，包含 DPR1/2、明暗、1/8 层、奇偶与单行/单列纹理、半透明随机色、边缘/脉冲/棋盘、裁切 halo，以及 sigma `1/3,0.334,0.35,1.2,15.3,23.999,24.001,30.6,56`。同一 renderer 中变更 blur 的既有检查也覆盖这些候选，无 CPU 半径缓存。该结果只证明当前矩阵的 RGBA8 零差，不是跨驱动浮点逐位相同。

### MSL 确认外提位置，尚非后端成本证明

在非计时运行捕获真实 MSL 翻译结果，两引擎各条件两轴均编译成功、原 GLSL 输入逐字相同。WebKit 每轴仍有一个源码 while：radius/denominator 的局部赋值在 while 前，bounds/combined 的 support 计算也在 while 前，位置断言通过。原 baseline 翻译文本把 ceil 和分母表达式放在 while 内，但不能据此认定后端机器码原来每 tap 重算。

| 条件        | 横向 MSL 字符 | 纵向 MSL 字符 |
| ----------- | ------------: | ------------: |
| baseline    |        13,188 |        10,586 |
| radius      |        13,168 |        10,570 |
| denominator |        13,178 |        10,580 |
| bounds      |        13,897 |        11,130 |
| combined    |        13,753 |        10,994 |

bounds 故意保留循环体的原 ceil 门控，所以翻译文本有两个 ceil 出现位置；这是隔离边界因素的控制，不是最终合并实现。combined 共用 radius，只有一个。MSL 文本及哈希已保留，没有新 ISA、寄存器、硬件计数器或编译耗时数据。

在 DPR2、blur15.3 主场景中 GPU sigma 为 30.6，有效支持已达上限 72，bounds 的 GLSL 迭代数仍为横 148 / 纵 145，不能期望靠删除无效迭代获益。blur1.2 的 sigma2.4 对应支持 8，GLSL 迭代数变为横 20 / 纵 17；原核本来已跳过范围外的权重和取样，因此这些是循环迭代数，不能宣称纹理读取按同比例减少或预告加速。

### 第一批前台审计拒绝了对照，未用后台样本作结论

以原 M2 Pro、WebKit27.2、880×460 CSS px、DPR2、八层全动、bounded/direct、120 帧、PERF_FOREGROUND/PERF_TIMELINE 开始筛测，计划覆盖高低 blur。已返回的 7 份结果中，6 份有原生前台不合格记录，只有高 blur 的 denominator 单份全通过；其中 combined 开始/结束均为 Playwright，中途 3/5 原生抽样却是其他应用。所有逐帧 DOM focus 仍为 true，不能代替原生状态。单独一份有效条件缺少有效 baseline，也不用于对比。

随后低 blur denominator 调用出现 `Execution context was destroyed`，没有生成结果，原因未确认，不把它归因于 shader 或前台切换。未启动余下样本或正式三轮测试。当前不报告毫秒胜出、速度比例或候选回退。重新计时时必须另命名输出，保留这批被排除数据，并需要连续不切应用的前台窗口。

7 份已返回结果均通过像素预检、GL error 0、对象释放归零；29 draws/frame、横纵各 8 卷积 draws、零上传/正式窗口显式读回/解包，改写 draw 计数匹配条件，显式纹理容量仍为 58,643,200 bytes（55.93 MiB）。这些结构与资源检查不因帧时失效而无效，但也不提供物理显存、功耗或长会话结论。没有改产品代码，未重跑全仓/生产门禁。

证据为 ceiling 目录 `bound-{chromium,webkit}-*-parity.json`、`bound-generated-*.json`、`bound-{baseline,radius,denominator,bounds,combined}-{horizontal,vertical}.{glsl,metal}`、被排除的 `bound-screen-*.json` 与汇总 `bound-analysis.json`。方法归档为 `bound-{probe,matrix,analysis}-source.txt`；执行时恢复前两份到 `.amp/in/bound-probe.cjs` / `.amp/in/bound-matrix.mjs`。正确性使用 `BOUND_MODE=combined BOUND_CAPTURE=1 ENGINE=webkit CONVOLUTION=direct NODE_OPTIONS="--require=$PWD/.amp/in/bound-probe.cjs" node .amp/in/bound-matrix.mjs`。负对照和中断日志为 `.amp/in/bound-negative.log` / `.amp/in/bound-screen-1.2-denominator.log`；后续计时保留各模式与 blur 的输出并进行前台筛选。临时执行脚本归档后清理，本地未提交、未推送。

### 静止窗口补测完成：小模糊组合更快，大模糊不宜替换

用户提供五分钟不操作窗口后，在相同 M2 Pro/交流电、WebKit27.2、880×460 CSS px、DPR2、八层全动、bounded/direct 上，完成五条件 × 两种 blur × 三轮的 30 个独立浏览器进程，每条件 120 正式帧，轮次采用正序、反序、轮转。随后以 baseline、combined、combined、baseline 顺序补做小模糊四个独立进程，每个 600 正式帧。共 34 个样本、6,000 正式帧，全部通过开始/结束及 202 次周期性原生前台抽样，均为 Playwright；逐帧 visible/focused。原生抽样不是连续前台监控，不能证明抽样间绝无瞬时切换。

下表是每进程另做的 20 次 render＋1 px 同步读回的 P50，单位 ms。它包含提交、等待和读回，不是纯 GPU 时间；600 帧复测也没有把同步诊断次数扩成 600 次。正式帧窗口没有显式读回。

| 条件        | 大模糊 blur15.3，三轮 P50 | 小模糊 blur1.2，三轮 P50 |
| ----------- | ------------------------- | ------------------------ |
| baseline    | 11 / 11 / 12              | 9 / 9 / 9                |
| radius      | 11 / 12 / 12              | 9 / 9 / 9                |
| denominator | 11 / 11 / 12              | 9 / 10 / 9               |
| bounds      | 12 / 12 / 12              | 9 / 8 / 9                |
| combined    | 12 / 12 / 13              | 8 / 7 / 7                |

小模糊加长窗口的 baseline 两次 P50 为 10 / 9 ms，combined 为 9 / 8 ms；按相邻正反序配对，各低 1 ms。四次同步诊断 P95 均为 10 ms，RAF 及实际回调到达间隔 P95 均为 18 ms。三轮筛测中，小模糊 combined 的同步 P95 为 11 / 9 / 11 ms，baseline 为 10 / 11 / 10 ms，也没有一致的尾部改善。计时粒度约 1 ms，不能外推精确百分比、功耗或吞吐提升。

大模糊 combined 相对每轮 baseline 的同步 P50 都慢 1 ms；单独外提无稳定收益。小模糊 combined 有重复出现的中位完成诊断收益，但仅收紧 bounds 的效果弱，不能把 combined 的全部差值归因于少做循环。大模糊支持已满、循环次数不变，结果不支持全局启用，更没有证明 ceil 或分母原来被后端逐 tap 重算。除小模糊 combined 第一轮 RAF/实际到达 P95 为 17 ms 外，所有 120 帧条件均为 18 ms；尚无可见流畅度改善证据。

34 个样本全部原核六帧预检零差、GL error 0、对象释放归零；均为 29 draws/frame、每轴 8 卷积 draws/frame、零上传/正式窗口显式读回/解包，实际 shader 改写 draw 数匹配条件。显式纹理容量仍为 58,643,200 bytes（55.93 MiB），不是测得的物理驻留。此前跨两引擎的 3,600 案例精度结论保留，本次没有新增驱动/硬件覆盖或长会话验证。

**决策：不替换默认管线。** 保留小支持半径的 combined 作为后续候选；需要覆盖中间半径、单轴组合和收益交界，才能决定是否值得分支选核。目前无法给出可靠的 sigma 切换阈值。没有改正式 renderer/shader/benchmark，不以旧后台样本或更早轮次的绝对毫秒数作性能比较。

新增证据：`bound-quiet-r{0,1,2}-{15.3,1.2}-{mode}.json`、`bound-confirm-{1,2,3,4}-1.2-{mode}.json` 与 `bound-quiet-analysis.json`；分析方法归档为 `bound-quiet-analysis-source.txt`。分析逐份断言前台、像素、draw、资源和实际到达间隔。研究文档做局部格式/空白检查，未重跑全仓/生产门禁；临时执行脚本清理，所有结果本地未提交、未推送、未部署。

## 中间半径与单轴组合：收益分布不单调，不能使用单阈值（2026-11-17）

**四条件在 Chromium/WebKit 的 6,144 个检查全部零差，完整前台三轮已补完：blur1.2/1.5 的双轴、blur8 的双轴及纵轴、blur10 的纵轴重复降低同步完成中位数；blur2/4/6 无稳定收益，blur12 不宜替换。** 这是已测点的结果，不是连续启用区间，更不支持一个 sigma 阈值。正式 renderer、shader、benchmark 和默认路径未改；首批中断记录及后续完整结果分别保留在下文。

精度矩阵扩充至每条件、每引擎 160 个叠层/退出合成和 608 个孤立两 pass 案例。叠层 blur 为 `0.35,1/3,0.334,1.2,1.5,2,4,5.1,6,8,10,11.83325,11.8334,11.999,12,12.001,15.3,24,28`，覆盖 DPR1/2、明暗和 1/8 层；孤立 sigma 补入 `2.4,3,4,8,12,16,20,23.6665,23.6668,24` 等中间值，保留窄纹理、半透明噪声、边缘和裁切 halo。`ceil(3*sigma)` 的支持半径在 sigma 大于 71/3 时已达 72，而未截断支持在 sigma 大于 24 时才超过 72；两处边界分别覆盖，没有把它们混为一个切换点。采样、求权、累加和 RGBA8 中间边界不变，只改变所选轴的既有 combined 生成。

### 两次计时启动的问题都保留，不从退出码推断采到样本

首次以 `BLUR=2/4/8/12` 调用原基准时没有产出 JSON。调查发现 `BLUR` 只筛选硬编码的 1.2/15.3 预设，并不添加新条件；48 次调用虽然退出 0，但实际测量数为零。它们不是性能样本。私有基准副本改为显式半径列表，并断言请求的配置数量，正式基准没有修改。

修正后得到 13 个各 120 帧的单轮样本，其中 blur2/4/8 的 12 个样本通过开始/结束与周期性原生前台抽样；blur12 baseline 从 Playwright 切至 Safari，两个周期抽样与结束状态不合格，立即停止。单轮数据内部也有明显波动，既没有完整三轮，也没有完整上限条件，因此不选取看起来更快的单次结果作为收益边界。13 个样本的六帧原核预检、GL error、释放、29 draws/frame、每轴 8 卷积 draws/frame 和轴向改写计数均通过；零上传/正式窗口读回/解包，显式纹理容量仍为 58,643,200 bytes。

### 批量私有基准准备与试跑

为减少重复启动，准备时改为同一轴向浏览器会话内轮转半径，外层三轮反转/轮转轴向及半径次序。blur 为 `1.2,1.5,2,4,6,8,10,12`，DPR2 对应 GPU sigma `2.4,3,4,8,12,16,20,24`、支持半径 `8,9,12,24,36,48,60,72`；四条件、三轮、每条件 60 正式帧，共 96 个样本、5,760 正式帧。保留 24 预热、30 idle、六帧原核预检和每样本独立 20 次同步完成诊断；该计划已在后续静止窗口完整执行，结果见下文。

批处理基准已用仅横轴、blur1.5/6、各 30 正式帧试跑，恰好输出请求的两个条件；每条件横纵各 240 次卷积 draw，只有横向的 240 次被改写，计数在两个条件间正确重置，均原核零差、GL error 0、释放归零。该试跑未要求原生前台，实际为 Safari，全部计时排除。新增的数量断言、轴向计数和原生切换即停避免把空运行或后台结果当成功。

批处理协议与前一轮独立进程协议不同，baseline 一起重新采，不能把旧轮次绝对毫秒数拼入新对照。准备阶段的证据在 ceiling 目录 `bound-range-*-parity.json`、`bound-range-r0-*.json`、`bound-range-harness-smoke.json`、`bound-range-parity-audit.json` 和 `bound-range-audit.json`。私有方法归档为 `bound-range-{matrix,benchmark,run,audit}-source.txt`，shader preload 复用 `bound-probe-source.txt`；执行时恢复至 `.amp/in/` 的 `.mjs/.sh/.py/.cjs` 对应路径。

### 完整静止窗口：八个半径点、四条件、三轮全部有效

用户再次提供静止窗口后，完整执行上述批处理计划，取得 12 个浏览器会话、96 个样本、5,760 正式帧。每样本开始/结束及总计 384 次周期性原生前台抽样全部为 Playwright，逐帧 visible/focused；这是抽样审计，不是连续原生窗口监控。机器为 M2 Pro/交流电，Playwright WebKit27.2，880×460 CSS px、DPR2、八层全动、bounded/direct；没有安装版 Safari、其他 GPU 或设备性能覆盖，也不是长会话验证。

下表为三轮各自的同步完成诊断 P50（ms）。每样本在 60 正式帧之后，另做 20 次 render＋1 px 同步读回，包含提交、等待和读回，**不是纯 GPU 时间**，不能将 60 帧当作 60 次同步诊断。约 1 ms 计时粒度，不计算精确提速百分比。

| blur | 原循环       | 仅横轴 combined | 仅纵轴 combined | 双轴 combined |
| ---- | ------------ | --------------- | --------------- | ------------- |
| 1.2  | 9 / 9 / 9    | 9 / 9 / 9       | 9 / 9 / 9       | 7 / 8 / 8     |
| 1.5  | 9 / 9 / 9    | 9 / 9 / 9       | 9 / 8 / 10      | 8 / 8 / 8     |
| 2    | 9 / 9 / 9    | 10 / 9 / 9      | 9 / 10 / 9      | 9 / 9 / 9     |
| 4    | 9 / 9 / 9    | 9 / 9 / 9       | 9 / 9 / 9       | 9 / 10 / 9    |
| 6    | 10 / 9 / 9   | 9 / 9 / 9       | 9 / 9 / 9       | 9 / 9 / 9     |
| 8    | 11 / 10 / 11 | 10 / 10 / 10    | 10 / 9 / 10     | 9 / 9 / 10    |
| 10   | 11 / 11 / 12 | 12 / 12 / 12    | 10 / 10 / 11    | 11 / 11 / 12  |
| 12   | 12 / 11 / 12 | 13 / 13 / 13    | 12 / 12 / 13    | 12 / 12 / 13  |

blur8 双轴的同步 P95 相对原循环三轮均低 1 ms；blur10 仅纵轴的同步 P95 分别低 2 / 1 / 1 ms。blur10 双轴 P50 打平，但同步 P95 三轮均低 1 ms，仍保留这个区别，不把 P50 无收益等同于全部指标无收益。小 blur 双轴虽 P50 重复改善，P95 并不一致，blur1.5 的第三轮同步 P95 还高 1 ms。

所有条件 RAF 与实际回调到达 P95 都在 17–18 ms；没有候选相对同轮 baseline 在三轮实际到达 P95 均降低。当前有局部完成时间/同步尾部收益，**尚无流畅度改善证据**。仅横轴在任何点都没有三轮 P50 同时降低，blur10/12 还分别高 1/1/0 与 1/2/1 ms，不能把双轴收益机械拆成两个独立收益相加。

### 收益边界是待细化的窗口，不是可落地的产品阈值

本轮相邻已测点标出了四个需要进一步区分的过渡：blur1.5 与 2 之间，小模糊双轴中位收益消失；6 与 8 之间再次出现局部收益；8 与 10 之间，双轴 P50 优势消失而仅纵轴仍有优势；10 与 12 之间，纵轴 P50 优势也消失。没有测这些点之间的所有值，不推断每个区间内单调、连续获益或切换点恰好在端点。DPR2 的对应 sigma 分别为 blur 的两倍，不能直接把这里的 CSS blur 数字用于其他 DPR。

**决策：默认保持不变，保留已测候选，不添加按 blur/sigma 自动选核。** 进一步细化应集中于上述相邻点，而不是重复整段扫测；blur8 双轴与 blur10 仅纵轴是同时有重复 P50 和同步 P95 收益的优先复核点。本次不足以归因到具体循环、寄存器、编译器或 Metal 指令机制；没有新增 GPU timestamp、原生 trace、机器码或功耗证据。

96 个样本全部通过原核六帧零差、GL error 0、释放归零；每帧 29 draw、横纵各 8 次卷积、零上传/正式窗口显式读回/解包。每轴实际原 GLSL 与既有 baseline 编译输入逐字相同，被选中轴的改写文本也与既有 combined 逐字相同，计数每样本正确重置。显式纹理容量仍为 58,643,200 bytes（55.93 MiB），没有测物理显存驻留或程序驱动内部缓存。

新增数据为 `bound-range-steady-r{0,1,2}-{baseline,combined}-{axis}.json` 共 12 文件，审计 `bound-range-steady-analysis.json` 保留三轮逐点差值、实际到达 P95/P99、原始文件哈希及前台/资源断言；分析方法归档为 `bound-range-steady-analysis-source.txt`。交互结果见 [Glass 半径收益](https://ampcode.com/artifacts/visuals/glass-a2f61fda-229b-4a8b-82ce-cf1fb52012b6)，可切换同步 P50/P95 和回调到达 P95；图内数据与审计逐项相同。报告在 headless Chromium 检查了三指标切换、5/3/0 个三轮改善条件计数、Enter 展开原值、360 px 无横溢出及明暗渲染，并审阅四个截图；原生 select 弹窗的键盘操作未在 headless 模式建立，不宣称已通过。

本轮仅本地研究与报告，文档格式/空白、数据断言与脚本语法通过，未重跑全仓/生产门禁；临时执行脚本归档后清理，未提交、未推送、未部署。

## 重点复核：blur8 双轴批量收益复现，blur10 纵轴未复现

本次结论比上一轮更窄：**blur8 双轴在四帧批量完成诊断中复现收益，但单帧 P50 并不稳定；blur10 仅纵轴本次没有复现收益。默认不变，不能据此前轮结果落地半径选核。** 用户提供五分钟静止窗口后，两个重点的八次独立浏览器启动完成并通过前台审计；其后的交界扫测两次因原生前台变为 Amp 而中止，没有完成三轮，不能声称 blur7/9/11 的收益边界已收敛。

### 先独立重采两个重点，保留不同诊断的分歧

环境为 M2 Pro/交流电、Playwright WebKit 27.2、880×460 CSS px、DPR2、八层全动、bounded/direct。每个重点按原版、候选、候选、原版（ABBA）四次独立启动；每次 120 正式帧，加 20 次单帧 render＋1px 同步读回，再加 8 个“四次 render 后一次 1px 读回”的批次。批次开始前先执行一次 1px 读回，降低同上下文前序工作的影响；计时仍包含提交、等待与最后一次读回，不能叫纯 GPU 时间。

下表按实际 ABBA 顺序列出四个独立会话的统计量，单位均为 ms。批量列按批次总耗时除以 4 后取中位数，不是单帧延迟，也不是单帧 P95。每个会话内的八个批次不能当成八次独立浏览器复现。

| 条件          | 单帧同步 P50（原/候/候/原） | 单帧同步 P95（原/候/候/原） | 四帧批次总耗时中位数（原/候/候/原） | 批次折算中位数（原/候/候/原） |
| ------------- | --------------------------- | --------------------------- | ----------------------------------- | ----------------------------- |
| blur8 双轴    | 10 / 9 / 10 / 9             | 11 / 10 / 11 / 12           | 34 / 31 / 31 / 34                   | 8.50 / 7.75 / 7.75 / 8.50     |
| blur10 仅纵轴 | 10 / 10 / 10 / 10           | 11 / 11 / 11 / 11           | 37 / 37 / 37 / 37                   | 9.25 / 9.25 / 9.25 / 9.25     |

blur8 两对邻近原版/候选的批量折算中位数都降低 0.75 ms，约 8.8%；原始四帧批次中位数降低 3 ms，超过原始计时约 1 ms 的取整粒度，增强了这个批量吞吐条件下的收益证据。不能将其改述为真实逐帧耗时降低 8.8%：单帧 P50 的两对差值分别为 −1 和 +1 ms，仍没有一致优势；单帧同步 P95 两对都低 1 ms，但 20 个读数按当前分位算法取 P95 恰好取到样本最大值，样本不足以证明长期尾帧改善。

blur10 仅纵轴两次候选的单帧 P50/P95、批量折算中位数都与邻近原版打平，应将上一轮“重复获益”收窄为“前轮条件内曾观察到，本次独立复核未复现”，不能直接否定前轮数据，也不能拼接前轮的绝对耗时维持收益结论。八次会话的 RAF 与实际回调到达 P95 全是 18 ms，尚无新增流畅度收益证据。

### 前台中断单独归档，交界扫测未完成

八次会话共 960 正式帧，48 次周期/边界原生前台抽样全部为 Playwright，逐帧与批次的 DOM visible/focused 检查全部通过。原生前台是抽样，不能称为连续监控。八个样本均通过原核六帧零差、原始与改写 GLSL 逐字核对、轴向计数、GL error 0 及释放归零；正式帧每帧 29 draws、每轴 8 次卷积 draw、零上传/显式读回/解包。每个四帧批次实际执行 116 draws、一次计时内读回，没有跳过渲染。显式纹理容量仍为 58,643,200 bytes（55.93 MiB），不代表物理显存驻留或驱动内部程序缓存。

第一次扫测只写出 blur7/8/9 三个原版样本，blur9 的原生前台变为 `com.ampcode.amp.macos`；保留完整重点对照后，剩余扫测重启一次，首个 blur7 样本也发生同样切换，随即停止，不再反复抢前台。两个中断文件的全部四个样本均不参与收益比较，包括第一次原本合格但没有配对候选的两个原版样本。两次切换的原因尚未核实，不归因于用户操作、App Nap、WebKit 退化或 Amp 的具体机制；中断时 DOM visible/focused 仍为真，不能只按 DOM 状态筛选。

新增精度预检在 headless Chromium/WebKit、baseline/combined 双轴/combined 仅纵轴下共 5,904 项全部零差，包含 blur7/9/11、DPR1/2、明暗、单层/八层、窄纹理、半透明输入、裁切和支持上限两侧。四帧探针的 headless 试跑仅验证计数、精度与释放，所有试跑计时均排除，没有把后台数据算入性能结论。

证据位于 ceiling 目录：`bound-edge-anchor{8,10}-a*.json` 共八文件；`bound-edge-analysis.json` 保存逐会话统计、配对差值、实际到达分位、排除项与原始文件哈希；两个 `bound-edge-interrupted-*.json` 保留中断数据；`bound-edge-preflight.json`、三个 `bound-edge-all-*-parity.json` 保留前检。执行、分析与预检方法分别归档为 `bound-edge-*-source.txt`，沿用未改的 `bound-probe-source.txt`。未完成的 blur7/9/11 扫测不作插值或阈值判断；产品 renderer/shader/正式基准均未改，未提交、未推送、未部署，也未重跑全仓或生产门禁。

## 文档站可交互交付（2026-11-17）

中英文 Materials 页面增加叠层实验说明与入口：`/cn/glass-lab?pipeline=scene`、`/en/glass-lab?pipeline=scene`。无此查询参数时仍是原有组件演示。实验视图从原 ceiling 页面提取为可挂载、可释放的共享场景，独立实验入口继续复用；不会覆盖文档 body，离开页面时停止拖动、断开尺寸观察并释放 GPU 资源，异步照片准备完成后不会重新挂载已销毁场景。

文档实验选择 bounded/direct 路径，使用 paint 缓存、局部模糊、脏区和直接消费打包中间结果；独立实验仍默认 reference 卷积。循环边界候选未启用，产品 renderer/shader 未切换。页面明确标注实验范围，不把显式文字绘制称为任意 DOM 捕获，也不宣称整体性能胜过原有组件。

新增 `apps/docs/test/glass-composition-lab.mjs`，先验证未实现入口失败，再在 Chromium/WebKit 的开发服务和生产静态产物上验证层序像素差异、文字输入、键盘移动、三个预设、上下文丢失/恢复、窄屏及往返导航。补充浏览器验证覆盖中英文材料文档链接、剩余控件、Escape 取消拖动、reduced motion、独立实验入口和 WebGL2 不可用时的可用控件。审阅默认叠层、文字、跨区域、深色、390px 窄屏及 WebKit 默认截图；截图中折射造成的下层文字变形是探针目的，不是正文排版保证。

受影响格式、lint、文档与实验 typecheck、文档包 127 个单元/DOM 测试、生产构建及 2 个 StyleX/静态导出检查通过。没有新性能测量、安装版 Safari/真机或辅助技术验收。开发 portal 曾出现模块请求长时间未返回，未确认通道内具体原因；另起受监督的静态产物预览，已通过外部 portal 的登录、场景 ready 与预设切换检查。两者都只是本地预览服务，未提交、未推送或部署到正式站点。
