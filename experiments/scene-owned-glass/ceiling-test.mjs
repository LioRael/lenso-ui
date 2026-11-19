import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/scene-owned-glass/ceiling/", import.meta.url);
await mkdir(output, { recursive: true });
const results = [];

async function difference(page, a, b, region) {
  return page.evaluate(
    async ({ captures, region }) => {
      const images = [];
      for (const capture of captures) {
        const image = new Image();
        image.src = `data:image/png;base64,${capture}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        images.push(
          region
            ? context.getImageData(
                Math.round(region.x * devicePixelRatio),
                Math.round(region.y * devicePixelRatio),
                Math.round(region.width * devicePixelRatio),
                Math.round(region.height * devicePixelRatio),
              ).data
            : context.getImageData(0, 0, canvas.width, canvas.height).data,
        );
      }
      let maximum = 0,
        sum = 0;
      for (let index = 0; index < images[0].length; index++) {
        const delta = Math.abs(images[0][index] - images[1][index]);
        maximum = Math.max(maximum, delta);
        sum += delta;
      }
      return { maximum, mean: sum / images[0].length };
    },
    { captures: [a.toString("base64"), b.toString("base64")], region },
  );
}

for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue;
  const browser = await engine.launch(
    name === "chromium" ? { headless: false, args: ["--use-angle=metal"] } : {},
  );
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
    await page.goto(base);
    await page.waitForFunction(() => window.lab?.ready);
    const contract = await page.evaluate(async (root) => {
      window.lab.configure({ running: false });
      const { SceneRenderer } = await import("/renderer.ts");
      const { GlassRenderer } = await import(`${root}/packages/glass/src/shared-core/webgl.ts`);
      const width = 360,
        height = 240;
      function canvas() {
        const value = document.createElement("canvas");
        value.width = width;
        value.height = height;
        return value;
      }
      const backdrop = canvas(),
        label = canvas();
      const b = backdrop.getContext("2d");
      b.fillStyle = "#fcf9ed";
      b.fillRect(0, 0, width, height);
      b.fillStyle = "#083b56";
      b.fillRect(0, 0, 173, height);
      b.fillStyle = "#ec533b";
      b.fillRect(173, 0, 7, height);
      b.fillStyle = "#131a20";
      b.font = "bold 42px system-ui";
      b.fillText("TYPE", 188, 158);
      const t = label.getContext("2d");
      t.fillStyle = "#ffd600";
      t.fillRect(80, 102, 160, 12);
      t.fillStyle = "#101519";
      t.font = "bold 24px system-ui";
      t.fillText("LOWER", 92, 136);
      const lower = new Float32Array([48, 66, 226, 114, 24, 7.68, 12.8, 1]);
      const upper = new Float32Array([164, 104, 158, 92, 24, 7.68, 12.8, 1]);
      const renderer = new SceneRenderer("resident", width, height, 1, false, undefined, true);
      const expected = canvas(),
        actual = canvas();
      const context = expected.getContext("2d");
      context.drawImage(backdrop, 0, 0);
      const legacy = [];
      for (const [index, record] of [lower, upper].entries()) {
        const surface = canvas();
        const lens = new GlassRenderer(surface, new Float32Array([27, 0, 0, 1]));
        legacy.push(lens);
        lens.set_lenses(record);
        lens.render_canvas(expected, index);
        context.drawImage(surface, 0, 0);
        if (index === 0) context.drawImage(label, 0, 0);
      }
      renderer.render(0, 0, new Float32Array(), 1, {
        layers: [
          { kind: "paint", source: backdrop },
          { kind: "glass", record: lower },
          { kind: "paint", source: label },
          { kind: "glass", record: upper },
        ],
        blur: 15.3,
        sampling: "ordered",
      });
      actual.getContext("2d").drawImage(renderer.canvas, 0, 0);
      const want = context.getImageData(0, 0, width, height).data;
      const got = actual.getContext("2d").getImageData(0, 0, width, height).data;
      let maximum = 0,
        sum = 0;
      for (let index = 0; index < want.length; index++) {
        const delta = Math.abs(want[index] - got[index]);
        maximum = Math.max(maximum, delta);
        sum += delta;
      }
      const result = {
        maximum,
        mean: sum / want.length,
        glError: renderer.canvas.getContext("webgl2").getError(),
        invalidation: [],
      };
      const layers = [
        { kind: "paint", source: backdrop, revision: 0 },
        { kind: "glass", record: lower },
        { kind: "paint", source: label, revision: 0 },
        { kind: "glass", record: upper },
      ];
      const frame = { layers, blur: 15.3, sampling: "ordered" };
      let revision = 2;
      for (const change of [
        "warm",
        "move upper",
        "move lower",
        "paint",
        "blur",
        "background",
        "shared",
        "ordered",
        "unversioned paint",
        "remove layer",
      ]) {
        if (change === "move upper") upper[0] += 19;
        if (change === "move lower") lower[1] -= 21;
        if (change === "paint" || change === "unversioned paint") {
          t.fillStyle = change === "paint" ? "#d51271" : "#00c98b";
          t.fillRect(118, 110, 48, 37);
          if (change === "paint") layers[2].revision++;
          else delete layers[2].revision;
        }
        if (change === "blur") frame.blur = 1.2;
        if (change === "background") revision++;
        if (change === "shared" || change === "ordered") frame.sampling = change;
        if (change === "remove layer") layers.splice(1, 1);
        renderer.render(0.5, 12, new Float32Array(), revision, frame);
        const fresh = new SceneRenderer("resident", width, height, 1, false, undefined, true);
        fresh.render(0.5, 12, new Float32Array(), revision, { ...frame, work: "full" });
        const pixels = [];
        for (const instance of [renderer, fresh]) {
          const gl = instance.canvas.getContext("webgl2");
          const data = new Uint8Array(width * height * 4);
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
          pixels.push(data);
        }
        let maximum = 0;
        for (let i = 0; i < pixels[0].length; i++)
          maximum = Math.max(maximum, Math.abs(pixels[0][i] - pixels[1][i]));
        result.invalidation.push({ change, maximum });
        fresh.dispose();
      }
      for (const lens of legacy) lens.free();
      renderer.dispose();
      result.spatial = [];
      result.caching = [];
      for (const work of ["cached", "bounded"]) {
        const cached = new SceneRenderer("resident", width, height, 1, false, undefined, true);
        const gl = cached.canvas.getContext("webgl2");
        let uploads = 0,
          blurArea = 0,
          extraTextures = 0;
        const upload = gl.texSubImage2D.bind(gl),
          draw = gl.drawArrays.bind(gl);
        const allocate = gl.createTexture.bind(gl),
          release = gl.deleteTexture.bind(gl);
        gl.createTexture = () => {
          extraTextures++;
          return allocate();
        };
        gl.deleteTexture = (texture) => {
          extraTextures--;
          return release(texture);
        };
        gl.texSubImage2D = (...args) => {
          uploads++;
          return upload(...args);
        };
        gl.drawArrays = (...args) => {
          if (gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), "sigma")) {
            const box = gl.isEnabled(gl.SCISSOR_TEST)
              ? gl.getParameter(gl.SCISSOR_BOX)
              : [0, 0, width, height];
            blurArea += box[2] * box[3];
          }
          return draw(...args);
        };
        const first = new Float32Array([58, 76, 74, 52, 12, 3, 4, 1]);
        const last = new Float32Array([93, 98, 68, 44, 12, 3, 4, 1]);
        const paints = [
          { kind: "paint", source: backdrop, revision: 0 },
          { kind: "paint", source: label, revision: 0 },
        ];
        const layers = [
          paints[0],
          { kind: "glass", record: first },
          paints[1],
          { kind: "glass", record: last },
        ];
        const checks = [];
        for (const change of [
          "warm",
          "move both",
          "move top inside",
          "move top outside",
          "paint revision",
          "unversioned",
          "mutable",
          "remove paint",
          "reinsert paint",
          "replace source",
          "switch full",
          "return optimized",
        ]) {
          if (change === "move both") {
            first[0] += 7;
            last[0] += 7;
          }
          if (change === "move top inside") last[0] += 1;
          if (change === "move top outside") last[0] = 270;
          if (change === "paint revision" || change === "mutable") {
            t.fillStyle = change === "mutable" ? "#ae2851" : "#1394de";
            t.fillRect(95, 99, 61, 32);
            if (change === "paint revision") paints[1].revision++;
          }
          if (change === "unversioned") delete paints[1].revision;
          if (change === "remove paint") layers.splice(2, 1);
          if (change === "reinsert paint") layers.splice(2, 0, paints[1]);
          if (change === "replace source") {
            const replacement = canvas();
            replacement.getContext("2d").fillRect(33, 19, 142, 117);
            paints[0].source = replacement;
          }
          uploads = blurArea = 0;
          cached.render(0, 0, new Float32Array(), 0, {
            layers,
            blur: 1.2,
            sampling: "ordered",
            work: change === "switch full" ? "full" : work,
          });
          const reference = new SceneRenderer("resident", width, height, 1, false, undefined, true);
          reference.render(0, 0, new Float32Array(), 0, {
            layers,
            blur: 1.2,
            sampling: "ordered",
            work: "full",
          });
          const pixels = [cached, reference].map((instance) => {
            const context = instance.canvas.getContext("webgl2"),
              value = new Uint8Array(width * height * 4);
            context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, value);
            return value;
          });
          let maximum = 0;
          for (let i = 0; i < pixels[0].length; i++)
            maximum = Math.max(maximum, Math.abs(pixels[0][i] - pixels[1][i]));
          checks.push({
            change,
            maximum,
            uploads,
            blurArea,
            extraTextures,
            glError: gl.getError(),
          });
          reference.dispose();
        }
        result.caching.push({ work, checks });
        cached.dispose();
      }
      // Missing sampling halos, stale scissor state and in-place feedback must change pixels here.
      for (const dpr of [1, 2]) {
        const sources = [backdrop, label].map((source) => {
          const scaled = canvas();
          scaled.width *= dpr;
          scaled.height *= dpr;
          scaled.getContext("2d").drawImage(source, 0, 0, scaled.width, scaled.height);
          return scaled;
        });
        for (const work of ["local-blur", "local", "dirty", "cached", "bounded"]) {
          const full = new SceneRenderer("resident", width, height, dpr, false, undefined, true);
          const local = new SceneRenderer("resident", width, height, dpr, false, undefined, true);
          const gl = local.canvas.getContext("webgl2");
          let area = 0,
            seedArea = null;
          for (const method of ["drawArrays", "drawArraysInstanced"]) {
            const original = gl[method];
            gl[method] = function (...args) {
              const bounds = this.isEnabled(this.SCISSOR_TEST)
                ? this.getParameter(this.SCISSOR_BOX)
                : [0, 0, this.drawingBufferWidth, this.drawingBufferHeight];
              const pixels = bounds[2] * bounds[3];
              seedArea ??= pixels;
              area += pixels;
              return original.apply(this, args);
            };
          }
          const records = [
            new Float32Array([66.25, 82.5, 84, 58, 14, 7.68, 12.8, 1]),
            new Float32Array([121.5, 106.25, 72, 54, 14, 7.68, 12.8, 1]),
          ];
          const checks = [];
          for (const [step, blur] of [1.2, 15.3, 1.2, 0.35, 28, 15.3, 1.2].entries()) {
            records[0][0] = [66.25, 81.5, -42.25, 334.5, 132, -200, 68][step];
            records[0][1] = [82.5, 96, -19.25, 212.5, 112, -160, 80][step];
            records[1][0] = [121.5, 107.25, 12.5, 310, 124, -160, 118][step];
            records[1][7] = [1, 1, -2, 3, 0, 1, 1][step];
            const layers = [
              { kind: "paint", source: sources[0], revision: 0 },
              {
                kind: "glass",
                record: new Float32Array(
                  [...records[0], ...(step === 1 ? [12, 19, 36, 30, 8, 7.68, 12.8, 1] : [])].map(
                    (v, i) => (i % 8 < 7 ? v * dpr : v),
                  ),
                ),
              },
              { kind: "paint", source: sources[1], revision: 0 },
              {
                kind: "glass",
                record: new Float32Array(records[1].map((v, i) => (i < 7 ? v * dpr : v))),
              },
            ];
            const frame = { layers, blur, sampling: step === 4 ? "shared" : "ordered" };
            area = 0;
            seedArea = null;
            const revision = step < 5 ? 0 : 1;
            full.render(0.5, 12, new Float32Array(), revision, { ...frame, work: "full" });
            local.render(0.5, 12, new Float32Array(), revision, { ...frame, work });
            const pixels = [full, local].map((instance) => {
              const context = instance.canvas.getContext("webgl2");
              const pixels = new Uint8Array(width * height * dpr ** 2 * 4);
              context.readPixels(
                0,
                0,
                width * dpr,
                height * dpr,
                context.RGBA,
                context.UNSIGNED_BYTE,
                pixels,
              );
              return pixels;
            });
            let maximum = 0;
            for (let i = 0; i < pixels[0].length; i++)
              maximum = Math.max(maximum, Math.abs(pixels[0][i] - pixels[1][i]));
            checks.push({ step, blur, maximum, area, seedArea, glError: gl.getError() });
          }
          result.spatial.push({ dpr, work, checks });
          full.dispose();
          local.dispose();
        }
      }
      return result;
    }, `/@fs${process.cwd()}`);
    assert.ok(
      contract.maximum <= 2 && contract.mean < 0.02,
      `ordered glass and interleaved text must match two independent legacy composites: ${JSON.stringify(contract)}`,
    );
    assert.equal(contract.glError, 0, "no texture/framebuffer feedback is allowed");
    for (const { work, checks } of contract.caching) {
      for (const check of checks) {
        assert.equal(
          check.maximum,
          0,
          `${work} ${check.change}: cache must match uncached full output`,
        );
        assert.equal(check.glError, 0);
      }
      assert.equal(checks[1].uploads, 0, `${work}: moving glass must not upload unchanged paint`);
      assert.equal(checks[4].uploads, 1, `${work}: upload only changed paint`);
      assert.equal(checks[6].uploads, 1, `${work}: unversioned mutation must upload`);
      assert.equal(checks[7].extraTextures, 0, `${work}: removed paint releases its extra texture`);
      assert.equal(
        checks[8].extraTextures,
        1,
        `${work}: reinserted paint allocates only one extra texture`,
      );
      assert.equal(
        checks[9].uploads,
        2,
        `${work}: replacement source and mutable label both upload`,
      );
      assert.equal(checks[2].blurArea, 0, `${work}: nearby top movement reuses blur`);
      if (work === "bounded") {
        assert.ok(checks[0].blurArea < 2 * 360 * 240, "both small lenses must use bounded blur");
        assert.ok(
          checks[3].blurArea > 0 && checks[3].blurArea < 2 * 360 * 240,
          "top leaving cached bounds recomputes only its local blur",
        );
      }
    }
    for (const check of contract.invalidation)
      assert.equal(
        check.maximum,
        0,
        `retained composition after ${check.change} matches fresh output`,
      );
    for (const { dpr, work, checks } of contract.spatial) {
      for (const check of checks) {
        assert.equal(
          check.maximum,
          0,
          `${work} DPR ${dpr} step ${check.step}: full-frame pixel parity`,
        );
        assert.equal(check.glError, 0, "local writes must not introduce framebuffer feedback");
      }
      assert.ok(
        checks[0].area < 14 * 360 * 240 * dpr ** 2,
        `${work} must shade less than fourteen full targets for a two-lens frame: ${checks[0].area}`,
      );
      if (["dirty", "cached", "bounded"].includes(work))
        assert.ok(
          checks[1].seedArea < 360 * 240 * dpr ** 2,
          "unchanged background and paint must restore only the old/new optical dependency region",
        );
    }
    await page.close();
    const probes = [];
    for (const dpr of [1, 2]) {
      const page = await browser.newPage({
        viewport: { width: 1100, height: 1100 },
        deviceScaleFactor: dpr,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/ceiling.html`);
      const stage = page.locator("#stage");
      await page.locator('#stage[data-state="ready"]').waitFor();
      const upper = page.getByRole("button", { name: "Move upper glass" });
      assert.equal(await upper.evaluate((node) => getComputedStyle(node).borderTopWidth), "0px");
      const save = (state, fullPage = false) =>
        fullPage
          ? page.screenshot({
              path: new URL(`${name}-${dpr}-${state}.png`, output).pathname,
              fullPage: true,
            })
          : stage.screenshot({ path: new URL(`${name}-${dpr}-${state}.png`, output).pathname });
      const ordered = await save("overlap-ordered");
      await page.getByLabel("Sampling", { exact: true }).selectOption("shared");
      const shared = await save("overlap-shared");
      const orderEffect = await difference(page, ordered, shared);
      assert.ok(
        orderEffect.maximum > 20 && orderEffect.mean > 0.1,
        "the negative control must visibly lose lower-layer content",
      );
      await page.getByLabel("Sampling", { exact: true }).selectOption("ordered");
      const retained = await difference(page, ordered, await stage.screenshot());
      assert.ok(
        retained.maximum <= 1,
        "switching the shared control off must not contaminate the retained background",
      );
      const box = await upper.boundingBox();
      const sceneBox = await stage.boundingBox();
      const upperRegion = {
        x: box.x - sceneBox.x,
        y: box.y - sceneBox.y,
        width: box.width,
        height: box.height,
      };
      const roi = { x: box.x + 32, y: box.y + 10, width: 80, height: 28 };
      const textEffects = [];
      for (const sampling of ["ordered", "shared"]) {
        await page.getByLabel("Sampling", { exact: true }).selectOption(sampling);
        await page.getByLabel("Lower label", { exact: true }).fill("LOWER LAYER");
        await stage.scrollIntoViewIfNeeded();
        const a = await page.screenshot({ clip: roi });
        await page.getByLabel("Lower label", { exact: true }).fill("MMMMMMMMMMMMMM");
        await stage.scrollIntoViewIfNeeded();
        const b = await page.screenshot({ clip: roi });
        textEffects.push({ sampling, ...(await difference(page, a, b)) });
      }
      assert.ok(
        textEffects[0].mean > 0.1,
        "changing the lower label must change pixels inside the upper glass",
      );
      assert.equal(
        textEffects[1].maximum,
        0,
        "the shared-backdrop control must demonstrably omit that lower label",
      );
      await page.getByLabel("Lower label", { exact: true }).fill("");
      await page.getByLabel("Sampling", { exact: true }).selectOption("ordered");
      const withLower = await page.screenshot({ clip: roi });
      await page.getByLabel("Lower glass", { exact: true }).uncheck();
      const withoutLower = await page.screenshot({ clip: roi });
      const lowerEffect = await difference(page, withLower, withoutLower);
      assert.ok(
        lowerEffect.mean > 0.1,
        "the upper lens must sample the lower glass itself, not only its label",
      );
      await page.getByLabel("Lower glass", { exact: true }).check();
      await page.getByLabel("Lower label", { exact: true }).fill("LOWER LAYER");
      await page.getByLabel("Refraction", { exact: true }).uncheck();
      const blurOnly = await save("overlap-blur-only");
      const displacementEffect = await difference(page, ordered, blurOnly, upperRegion);
      assert.ok(
        displacementEffect.maximum > 20 && displacementEffect.mean > 0.1,
        `identical blur with zero displacement must differ from refraction: ${JSON.stringify(displacementEffect)}`,
      );
      await page.getByLabel("Refraction", { exact: true }).check();
      await page.getByLabel("Probe", { exact: true }).selectOption("text");
      await page.getByLabel("Lower glass", { exact: true }).uncheck();
      const originalText = await save("text");
      const textBox = await upper.boundingBox(),
        textStage = await stage.boundingBox();
      const textRegion = {
        x: textBox.x - textStage.x,
        y: textBox.y - textStage.y,
        width: textBox.width,
        height: textBox.height,
      };
      await page.getByLabel("Refraction", { exact: true }).uncheck();
      const flatText = await save("text-blur-only");
      const textRefraction = await difference(page, originalText, flatText, textRegion);
      assert.ok(
        textRefraction.maximum > 20 && textRefraction.mean > 0.1,
        "text must move at the lens edge with blur and material held fixed",
      );
      const centre = await difference(page, originalText, flatText, {
        x: textRegion.x + 32,
        y: textRegion.y + 32,
        width: textRegion.width - 64,
        height: textRegion.height - 64,
      });
      assert.ok(
        centre.maximum <= 1,
        "zero displacement must not secretly change blur or the flat lens interior",
      );
      await page.getByLabel("Refraction", { exact: true }).check();
      await page.getByLabel("Scene text", { exact: true }).fill("IIIIIIII");
      assert.ok(
        (await difference(page, originalText, await stage.screenshot(), textRegion)).mean > 0.1,
        "supplied text edits must reach the optical texture",
      );
      await page.getByLabel("Scene text", { exact: true }).fill("REFRACT");
      await page.getByLabel("Probe", { exact: true }).selectOption("boundary");
      await save("boundary");
      const initial = await upper.boundingBox();
      const stageBox = await stage.boundingBox();
      assert.ok(
        initial.x < stageBox.x + stageBox.width * 0.43 &&
          initial.x + initial.width > stageBox.x + stageBox.width * 0.43,
        "the boundary probe must actually straddle the photo/text seam",
      );
      await upper.focus();
      await page.keyboard.press("Alt+ArrowLeft");
      assert.equal((await upper.boundingBox()).x, initial.x - 8);
      await page.keyboard.press("Alt+ArrowRight");
      await stage.scrollIntoViewIfNeeded();
      const origin = await upper.boundingBox();
      const beforeCrossing = await stage.screenshot();
      const crossingStage = await stage.boundingBox();
      await page.mouse.move(origin.x + 50, origin.y + 45);
      await page.mouse.down();
      await page.mouse.move(origin.x - 90, origin.y + 20, { steps: 8 });
      // bindDrag publishes movement once per animation frame, not per mouse protocol reply.
      await page
        .waitForFunction(
          (x) => document.querySelector("#stage button").getBoundingClientRect().x < x - 80,
          origin.x,
        )
        .catch(async (error) => {
          await save("drag-failed", true);
          throw new Error(
            JSON.stringify({
              name,
              dpr,
              origin,
              moved: await upper.boundingBox(),
              hit: await page.evaluate(
                ({ x, y }) => document.elementFromPoint(x + 50, y + 45)?.outerHTML,
                origin,
              ),
              error: error.message,
            }),
          );
        });
      const moved = await upper.boundingBox();
      assert.ok(
        moved.x < origin.x - 80,
        `drag must move the optical hit target across source regions: ${JSON.stringify({ name, dpr, origin, moved })}`,
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        (x) => document.querySelector("#stage button").getBoundingClientRect().x === x,
        origin.x,
      );
      await page.mouse.up();
      assert.equal(
        (await upper.boundingBox()).x,
        origin.x,
        "Escape must restore the lens and its hit target",
      );
      // Screenshot capture can release native pointer capture; inspect pixels after a committed drag.
      await page.mouse.move(origin.x + 50, origin.y + 45);
      await page.mouse.down();
      await page.mouse.move(origin.x - 90, origin.y + 20, { steps: 8 });
      await page.mouse.up();
      const crossPixels = await difference(page, beforeCrossing, await stage.screenshot(), {
        x: origin.x - crossingStage.x + 28,
        y: origin.y - crossingStage.y + 2,
        width: origin.width - 56,
        height: 16,
      });
      assert.ok(
        crossPixels.mean > 0.1,
        "cross-region dragging must move GPU pixels, not only the DOM label",
      );
      await page.getByLabel("Blur σ (CSS px)").fill("15.3");
      await save("high-blur");
      await page.getByLabel("Blur σ (CSS px)").fill("1.2");
      await page.getByLabel("Probe", { exact: true }).selectOption("overlap");
      await page.getByLabel("Lower glass", { exact: true }).check();
      await page.getByRole("button", { name: "Switch material" }).click();
      await save("dark");
      await page.getByRole("button", { name: "Switch material" }).click();
      const restored = await stage.screenshot();
      await page.getByRole("button", { name: "Simulate context loss" }).click();
      await page.locator('#stage[data-state="lost"]').waitFor();
      assert.ok(
        await page.getByText("lost. Scene text:", { exact: false }).isVisible(),
        "context failure must expose readable DOM content",
      );
      await save("context-lost");
      await page.getByLabel("Scene text", { exact: true }).fill("CONTEXT LOST");
      assert.ok((await page.locator("#stage").innerText()).includes("CONTEXT LOST"));
      await page.getByLabel("Scene text", { exact: true }).fill("REFRACT");
      await page.getByRole("button", { name: "Restore context" }).click();
      await page.locator('#stage[data-state="ready"]').waitFor();
      assert.ok(
        (await difference(page, restored, await stage.screenshot())).maximum <= 1,
        "context restoration must recover the full ordered scene",
      );
      for (let index = 0; index < 4; index++) {
        await page.getByRole("button", { name: "Remount renderer" }).click();
        assert.equal(await stage.locator("canvas").count(), 1);
        assert.ok((await difference(page, restored, await stage.screenshot())).maximum <= 1);
      }
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.waitForFunction(
        () =>
          document.querySelector("#stage canvas").width ===
          Math.round(document.querySelector("#stage").clientWidth * devicePixelRatio),
      );
      await save("narrow", true);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
        "narrow controls must not cause page overflow",
      );
      const narrow = await upper.boundingBox(),
        bounds = await stage.boundingBox();
      assert.ok(
        narrow.x >= bounds.x && narrow.x + narrow.width <= bounds.x + bounds.width + 1,
        "narrow optical and hit geometry must remain inside the scene",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.getByLabel("Probe", { exact: true }).selectOption("text");
      assert.equal(await stage.getAttribute("data-state"), "ready");
      assert.equal(
        await stage.locator("canvas").evaluate((canvas) => canvas.getContext("webgl2").getError()),
        0,
      );
      assert.deepEqual(errors, []);
      probes.push({
        dpr,
        orderEffect,
        textEffects,
        lowerEffect,
        displacementEffect,
        textRefraction,
        centre,
        crossPixels,
      });
      await page.close();
    }
    results.push({ engine: name, contract, probes });
  } finally {
    await browser.close();
  }
}
await writeFile(new URL("correctness.json", output), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
