import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// A copy freezes resolved paints inline. A tween on its parent must update
// explicitly inherited paints while preserving independently authored children.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
const modules = "/@fs" + new URL("../../../packages/glass/src/", import.meta.url).pathname;
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    await page.route(base + "/__paint-animation", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><style>
          #source {position:relative;width:400px;height:160px}
          .band,.peer {opacity:1;background-color:rgb(200,20,60)}
          .inherited {opacity:inherit;background-color:inherit}
          .fixed {opacity:1;background-color:rgb(200,20,60)}
          .lens {position:absolute;top:12px;left:12px;width:80px;height:40px}
          #boxes {position:relative;width:180px;height:90px;background:rgb(30,40,50)}
          #boxes>div {position:absolute;top:2px;left:2px;width:24px;height:20px;background:red}
        </style><div id="source" data-lenso-backdrop>
          <div class="band"><span class="inherited">Ink</span><span class="fixed">Fixed</span></div>
          <div class="peer"><span class="inherited">Peer</span></div>
        </div><div class="lens"></div><div class="lens" style="left:110px"></div>
        <div id="boxes"><div></div></div>`,
      }),
    );
    await page.goto(base + "/__paint-animation");
    await page.evaluate(async (modules) => {
      const { copyBackdrop } = await import(modules + "backdrop.ts");
      const source = document.querySelector("#source");
      for (const lens of document.querySelectorAll(".lens")) copyBackdrop(lens, source);
      window.paint = source.querySelector(".band").animate(
        [
          { opacity: 1, backgroundColor: "rgb(200,20,60)" },
          { opacity: 0.3, backgroundColor: "rgba(20,80,190,.65)" },
        ],
        { duration: 1000, fill: "both" },
      );
      window.paint.pause();
    }, modules);
    for (const action of [0, 800, 250, "replace", "retarget", 600, "cancel"]) {
      await page.evaluate(async (action) => {
        if (action === "replace")
          window.paint.effect.setKeyframes([{ opacity: 0.75 }, { opacity: 0.25 }]);
        else if (action === "retarget")
          window.paint.effect.target = document.querySelector("#source .peer");
        else if (action === "cancel") window.paint.cancel();
        else window.paint.currentTime = action;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, action);
      const samples = await page.evaluate(() => {
        const sample = (root) =>
          [...root.querySelectorAll(".band,.peer,.inherited,.fixed")].map((node) => {
            const style = getComputedStyle(node);
            return [style.opacity, style.backgroundColor];
          });
        const copies = [...document.querySelectorAll("[inert] .band")].map((node) =>
          sample(node.parentElement),
        );
        return { source: sample(document.querySelector("#source")), copies };
      });
      assert.equal(samples.copies.length, 2);
      for (const copy of samples.copies) assert.deepEqual(copy, samples.source, String(action));
    }

    const hidden = await page.evaluate(async () => {
      const lens = document.querySelector(".lens");
      const settle = () =>
        new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      lens.style.width = "0px";
      await settle();
      const effect = document
        .querySelector("#source .peer")
        .animate([{ opacity: 0.95 }, { opacity: 0.35 }], { duration: 800, fill: "both" });
      effect.pause();
      effect.currentTime = 300;
      await settle();
      const whileEmpty = lens.previousElementSibling.style.display;
      lens.style.removeProperty("width");
      await settle();
      const restored = lens.previousElementSibling.style.display;
      effect.cancel();
      return [whileEmpty, restored];
    });
    assert.deepEqual(hidden, ["none", ""]);

    // The single animated GPU paint box must return to a static capture on cancellation.
    const moving = await page.evaluate(async (modules) => {
      const { BackdropPaint } = await import(modules + "gpu-capture.ts");
      const { observeBackdrop } = await import(modules + "backdrop-scheduler.ts");
      const source = document.querySelector("#boxes");
      const child = source.firstElementChild;
      const capture = new BackdropPaint(source);
      const lens = document.createElement("div"),
        layer = document.createElement("div");
      document.body.append(lens, layer);
      let state;
      const subscription = observeBackdrop({
        source,
        element: lens,
        layer,
        prepare() {},
        read(change, reads) {
          const result = capture.read(change, reads);
          state = result ? result.moving === child : null;
          return () => {};
        },
      });
      const settle = () =>
        new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      try {
        const effect = child.animate([{ opacity: 1 }, { opacity: 0.3 }], {
          duration: 1000,
          fill: "both",
        });
        effect.pause();
        effect.currentTime = 350;
        await settle();
        const during = state;
        effect.cancel();
        await settle();
        return [during, state];
      } finally {
        subscription.stop();
        lens.remove();
        layer.remove();
      }
    }, modules);
    assert.deepEqual(moving, [true, false]);
    console.log(
      engine.name(),
      "passed inherited paint, keyframe replacement, retargeting and GPU capture cleanup",
    );
  } finally {
    await browser.close();
  }
}
