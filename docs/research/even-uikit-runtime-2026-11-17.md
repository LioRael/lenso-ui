# Even UIKit：WebKit 折射、加载成本与原型诊断

2026-11-17。目标：<https://uikit.even.how/>。结论：这个版本的图库是 C++ / Emscripten / Wasm 驱动的 WebGPU 自绘应用；在本机 Playwright WebKit 27.2 中，确实启用了背景折射，不是仅剩模糊。它掌握整个场景的纹理，不是在 Safari 中突破了任意 DOM backdrop 的采样限制。

作者公开消息、C++ 符号、资源体积、着色器公式与许可证调查见 [部署资源研究](even-uikit-source-2026-11-17.md)。本文补充实际执行的浏览器证据。没有修改组件库或原型源码，没有提交、推送或发布。

## 消息中哪些内容获得了实证支持

- [作者原帖](https://x.com/ktiays/status/2122389687218381147) 说 “UIKit is running on the Web”，没有提供完整构建链或公开渲染器仓库。
- 用户提供的 AndrewPrifer 补充截图明确说 “C++ recomp”，而非直接将 Swift / Objective-C runtime 编译为 Wasm。部署二进制的 `uiui::WindowScene`、`ipr::rendering::SceneSnapshot` 和 Emscripten 桥接支持 C++ / Wasm 这一部分。截图不是独立验证过的源码或构建产物对应关系。
- 着色器注释说明从自己的 Metal 后端移植，并引用 QuartzCore 函数。与截图描述一致，但没有独立验证 “UIKit / CoreAnimation 内部 1:1” 或 “exactly” 的精确性。
- 原帖下 “Safari 会变成毛玻璃” 的评论没有附可复现版本和设备证据，不能用来判定本版本。本机 WebKit 实际启用了折射分支。
- 没有找到这个图库和 IPR 渲染器的明确开源许可；已观察的着色器标注 all rights reserved。可以研究架构，不应默认将其代码复制进 Lenso。

## WebKit 实际选择了折射分支

用 Playwright 在 `createRenderPipeline` / `createRenderPipelineAsync` 创建时记录 fragment entry、specialization constants，并在真正 `setPipeline` 时确认被绑定。Liquid Lens 页实际用到：

```json
{
  "entry": "glassBackgroundSDFFragment",
  "constants": { "glassC": 1, "glassR": 1, "glassE": 0 }
}
```

`glassR=1` 启用了 `origin + profile * displacement` 的位移采样分支。另有实际绑定的 `sdfGlassDisplacementFragment`。两引擎捕获的 `IPR glass` WGSL SHA-256 均为 `d6d6d95cdf634785d971cbc4aad70ea5c9ba9742e4b3c2dcf3a952dc2c5d3318`；截图也能看到粉色／蓝色背景边界在镜片中弯折。不是仅凭 shader module 存在就宣称它执行了。

![WebKit 27.2：原始部署资源本地回放，Liquid Lens 中背景边界出现弯折](../../.amp/in/artifacts/even-uikit/webkit-replay-liquid.png)

这是真实的屏幕空间纹理重采样，叠加 blur、材质、光照与色彩处理；不是体积光线追踪，也不等于与原生系统像素一致。场景外的 DOM 没有被这套纹理采样自动覆盖。没有 WebGPU 时入口报告失败，不应将其描述为所有旧浏览器都能降级为同一套玻璃。

## 首载慢：本次主要等待在网络下载

一次完整远端冷载观测如下。随后远端导航也发生过超时，因此只有这一个可用冷载样本，不把它当作网站普遍延迟或用户设备复现结论。

| 观测项                          |                        结果 |
| ------------------------------- | --------------------------: |
| HTML + JS + Wasm 压缩后正文总计 |             2,306,909 bytes |
| Wasm 压缩正文／解压后           | 2,282,461 / 5,752,039 bytes |
| Wasm 请求开始至接收结束         |                 26,770.5 ms |
| 其中响应正文接收                |                 26,410.5 ms |
| Wasm 接收结束至应用 host-ready  |                  2,953.9 ms |
| 导航开始至应用 host-ready       |                 31,274.9 ms |

这次慢加载主要在传输，不是有证据证明 GPU 每帧慢。JS 执行后才发现 Wasm URL，HTML 没有 Wasm preload；流式编译可与下载重叠，因此最后 2,953.9 ms 不能全算成 Wasm 编译或 shader 编译。远端捕获观察到 21 个 shader module 和 175 次 pipeline 创建请求，也不能把 pipeline 数量当成耗时。

Wasm 与 JS 使用带版本号的 immutable 缓存；冷载和缓存后加载不应混在一起。第一次探针曾因等待阈值早于 host-ready 而记录 `ready=false`，但后续 status timestamp、完整 Resource Timing 和已检查的图库截图可确认该次应用确实完成初始化；原始记录保留，没有改成成功标志。

## 性能：本机短测交互顺畅，尚非 GPU 或功耗测量

设备：Apple M2 Pro、macOS 27.2.1。Chromium 158 headed，ANGLE Metal / Apple GPU；Playwright WebKit 27.2，WebGPU adapter 报告 Apple。viewport 1000 × 800 CSS px，DPR 2，Canvas backing 为 2000 × 1600。不是安装版 Safari，也没有运行 iPhone、Windows 或 Android。

为排除不稳定下载，用 Playwright route 在原 HTTPS URL 返回下载的原始 HTML / JS / Wasm，应用代码不改。JS 哈希 `7f63bbb9d8c370647527db4c34cef1e796cf0132aab5b4a4e72267bc4d591dd8`，Wasm 哈希 `cfce45e129179ad42c072a500a6aefc81263dccac539a04265fc42eb0eff8511`，与线上版本 token 一致。这是运行时回放，不是远端缓存命中、CDN 测速或正式部署结果。

拖动场景为默认 Slider 页的 Control Center Platter。实际鼠标 down、100 次带约 16 ms 延迟的移动、up；每引擎三次。RAF observer 采样间隔，未包装 WebGPU 方法。截图确认原来 72% 的亮度分别变成 Chromium 60%、WebKit 90%，不是只测一个无变化的 RAF 循环。不同引擎输入采样和时间推进并不完全相同，不用这些数值宣称 Chromium 快一倍。

| 引擎              | 各次 RAF 间隔 P50  | 各次 P95           | 各次 P99           | 各次最大值         |
| ----------------- | ------------------ | ------------------ | ------------------ | ------------------ |
| Chromium          | 8.3 / 8.3 / 8.3 ms | 9.3 / 9.3 / 9.3 ms | 9.3 / 9.4 / 9.4 ms | 9.4 / 9.4 / 9.4 ms |
| Playwright WebKit | 17 / 17 / 17 ms    | 18 / 18 / 19 ms    | 18 / 19 / 20 ms    | 21 / 19 / 21 ms    |

另外独立包装 `queue.submit` 的诊断轮中，两引擎静置约 4 秒都从 1 次提交保持为 1 次，没有新增提交；拖动时提交随交互增加。它没有为静止画面持续向 GPU 提交绘制，这是值得借鉴的事实；没有测 RAF 主循环 CPU 占用，不能宣称 idle 零耗电。

本地资源回放的首个启动 host-ready 为 Chromium 434.1 ms、WebKit 2,251 ms；随后约 0.23–0.29 秒。但浏览器／驱动已可能保留前次编译缓存，且一个 WebKit reload 的探针未捕获到 adapter，不作为独立干净启动样本。不能据此给出全新设备冷启动指标。

两引擎访问到的 Wasm linear memory 都是 22,347,776 bytes。这不是进程内存，更没有包括 GPU 纹理、缓存和浏览器开销。DOM 中按钮和输入框计数都为 0，控件由 Canvas 绘制；本次没有核查完整可访问性、文本输入或中文 IME，不能当成可直接替换 DOM / UI SDK 的生产组件库。

这些检查没有提供 GPU timestamp、input-to-present、长期压力、功耗或多层密集玻璃数据。短测支持“本机运行顺畅、静态提交有节制”，不支持“Wasm 必然更快”“所有 WebKit 都相同”或“比 Lenso 更省电”。

## 原型为什么奇怪：存在已确认的样式错误

用户截图中的白色上沿、灰色下沿厚边，不应被解释为有意设计的玻璃轮廓。实际 WebKit computed style：普通控制按钮和透明镜片按钮均为 `border-top-width: 2px; border-top-style: outset; appearance: auto`。源码的 `border: 0` 和 `border: "1px solid #747e76"` 没有进入本次 StyleX 编译 CSS，因此保留了浏览器默认立体按钮边框。

控制变量诊断仅在浏览器中给 Move glass 写入 `border-width: 0; border-style: solid`，其余三镜片、背景、材质和 shader 均不变。检查截图确认该按钮的厚白／灰边框消失，玻璃填色与模糊仍在。该诊断没有修改源码，也不是已交付的修复。

此外，默认 procedural 场景的高反差条纹、刻度和圆盘是检查位移／模糊的测试图案，不是产品视觉设计。固定 σ 15.3 CSS px 和简化 Snell IOR 1.5 的模型也不能代表该站复杂 QuartzCore 风格材质的视觉完成度。两路径像素接近只证明对照一致，不能证明好看；此前没有完成肉眼验收就交付，是验证缺口。

下一步应先修正确认的边框问题，再把已有真实照片、单块小玻璃设为便于视觉判断的展示入口，同时保留诊断图案为独立测试场景。这里没有擅自调整光学参数、重写设计或替换渲染架构。

## 证据位置与限制

原始数据位于 `.amp/in/artifacts/even-uikit/`：`chromium-first-attempt.json` 是完整远端时间线，`webkit-incomplete-attempt.json` 是未完成下载的旧尝试；`chromium-replay.json` / `webkit-replay.json` 记录回放、shader、实际 pipeline 使用和提交计数；`webkit-active-glass-specializations.json` 记录启用 `glassR=1` 的实际绑定；`uninstrumented-drag.json` 保留三轮全部 RAF 数组。

完整有效 Wasm 与逐字 WGSL 副本在 `.amp/in/even-source/`，不提交第三方完整实现。首次下载的无后缀 `KitGalleryWeb.wasm` 是不完整文件，不能复用。所有结果对应上述版本，不是未来部署保证。

这轮只新增研究笔记；没有给原型或组件库宣称修复完成，也没有借研究授权进行发布。
