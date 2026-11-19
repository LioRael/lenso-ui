import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { webkit } from "../../apps/docs/node_modules/playwright/index.mjs";

const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/tab-bar-text/", import.meta.url);
await mkdir(output, { recursive: true });
// The quality check supplies the real TabBar's owned glyph DOM and embedded fonts.
const source = JSON.parse(await readFile(new URL("source-webkit.json", output), "utf8"));
const results = [];
for (const dpr of [1, 2]) {
  const browser = await webkit.launch({ headless: process.env.HEADED !== "1" });
  try {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 900 },
      deviceScaleFactor: dpr,
    });
    await page.addInitScript(() => {
      const proto = WebGL2RenderingContext.prototype;
      const create = proto.createTexture,
        remove = proto.deleteTexture,
        upload = proto.texImage2D,
        draw = proto.drawArrays;
      const textures = new Set();
      window.textWork = { live: () => textures.size, uploads: [], draws: 0 };
      proto.createTexture = function (...args) {
        const value = create.apply(this, args);
        if (value) textures.add(value);
        return value;
      };
      proto.deleteTexture = function (texture) {
        textures.delete(texture);
        return remove.call(this, texture);
      };
      proto.texImage2D = function (...args) {
        window.textWork.uploads.push(
          args.length === 6 ? [args[5].width, args[5].height] : [args[3], args[4]],
        );
        return upload.apply(this, args);
      };
      proto.drawArrays = function (...args) {
        window.textWork.draws++;
        return draw.apply(this, args);
      };
    });
    await page.goto(`${base}/text-refraction.html`);
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => window.textProbe?.ready);
    await page.evaluate((source) => window.textProbe.loadSource(source), source);
    const result = await page.evaluate(async () => {
      const probe = window.textProbe,
        work = window.textWork;
      const initialUploads = work.uploads.length;
      const initialDraws = work.draws;
      const quantile = (values, fraction) =>
        [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * fraction)];
      const blocks = [];
      for (const arm of ["svg", "gpu", "gpu", "svg", "gpu", "svg", "svg", "gpu"]) {
        document.querySelector("#svg-output").style.visibility =
          arm === "svg" ? "visible" : "hidden";
        document.querySelector("#gpu-output").style.visibility =
          arm === "gpu" ? "visible" : "hidden";
        const intervals = [],
          submissions = [];
        let last;
        await new Promise((resolve) => {
          let frame = 0;
          const tick = (now) => {
            const theta = frame * 0.13;
            probe.state.position = 122 + (1 + Math.sin(theta)) * 17;
            // Equalize physical displacement; the review UI intentionally keeps the old, stronger profile.
            probe.state.amount =
              ((0.35 + 0.325 * (1 + Math.cos(theta))) * probe.strengths.gpu) / probe.strengths[arm];
            const started = performance.now();
            probe.draw(arm);
            const submitted = performance.now() - started;
            if (frame >= 30) {
              intervals.push(now - last);
              submissions.push(submitted);
            }
            last = now;
            if (++frame < 150) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        blocks.push({
          arm,
          samples: intervals.length,
          intervalP50: quantile(intervals, 0.5),
          intervalP95: quantile(intervals, 0.95),
          intervalMax: Math.max(...intervals),
          submitP50: quantile(submissions, 0.5),
          submitP95: quantile(submissions, 0.95),
          intervals,
          submissions,
        });
      }
      return {
        userAgent: navigator.userAgent,
        visibility: document.visibilityState,
        focus: document.hasFocus(),
        strengths: probe.strengths,
        fixturePreparation: probe.preparation,
        liveTextures: work.live(),
        textureSizes: work.uploads.slice(-2),
        additionalUploads: work.uploads.length - initialUploads,
        additionalDraws: work.draws - initialDraws,
        blocks,
      };
    });
    assert.equal(
      result.additionalUploads,
      0,
      "static glyphs/maps must not upload while optics moves",
    );
    assert.equal(
      result.additionalDraws,
      600,
      "each GPU update is one draw, with no hidden extra passes",
    );
    assert.equal(result.liveTextures, 2);
    await page.evaluate(() => window.textProbe.dispose());
    assert.equal(
      await page.evaluate(() => window.textWork.live()),
      0,
      "text textures are released",
    );
    results.push({ dpr, ...result });
    console.log(
      JSON.stringify({
        dpr,
        ...result,
        blocks: result.blocks.map(
          ({ intervals: _intervals, submissions: _submissions, ...block }) => block,
        ),
      }),
    );
  } finally {
    await browser.close();
  }
}
await writeFile(new URL("performance-webkit.json", output), JSON.stringify(results, null, 2));
