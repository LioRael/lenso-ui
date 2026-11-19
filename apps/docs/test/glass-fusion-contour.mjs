import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";

// Structural gate: the fused light contour must be produced off the main thread
// and committed without losing the previous frame. Host timings are reported,
// never asserted, because they vary with the runner.
const server = process.env.DOCS_URL
  ? undefined
  : await createServer({
      configFile: new URL("../vite.config.ts", import.meta.url).pathname,
      server: { port: 0, strictPort: false },
      logLevel: "warn",
    });
await server?.listen();
const base = process.env.DOCS_URL ?? server.resolvedUrls.local[0];
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch(
      name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
    );
    try {
      for (const count of [2, 4, 8]) {
        const page = await browser.newPage({
          viewport: { width: 1440, height: 900 },
          colorScheme: "light",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/cn/glass-lab`);
        await page.waitForLoadState("networkidle");
        await page.evaluate(
          async ({ count }) => {
            const { mount } = await import("/test/glass-fusion-contour-fixture.tsx");
            for (const child of document.body.children)
              if (child instanceof HTMLElement) child.hidden = true;
            const host = document.createElement("div");
            document.body.append(host);
            mount(host, "light", count);
          },
          { count },
        );
        await page.waitForFunction(
          () =>
            document.querySelector('[data-case="fusion"] [data-lenso-glass-fusion]')?.hidden ===
            false,
        );
        const member = page.getByRole("button", { name: "Member 1", exact: true });
        await member.waitFor();
        // Wait for the first committed contour before measuring the interaction;
        // mount work is not part of the press/drag/resize budget.
        await page.waitForFunction(
          () => {
            const edge = document.querySelector('[data-case="fusion"] [data-lenso-glass-outline]');
            if (!(edge instanceof HTMLCanvasElement) || !edge.width || !edge.height) return false;
            const context = edge.getContext("2d", { willReadFrequently: true });
            if (!context) return false;
            // The rim is a continuous hairline around a large transparent field,
            // so a four-pixel stride still crosses painted coverage.
            const pixels = context.getImageData(0, 0, edge.width, edge.height).data;
            for (let index = 3; index < pixels.length; index += 16)
              if (pixels[index] > 0) return true;
            return false;
          },
          null,
          { timeout: 5000, polling: 250 },
        );
        const initial = await page.evaluate(() => {
          const surface = document.querySelector('[data-case="fusion"] [data-lenso-glass-fusion]');
          return {
            compute: surface.getAttribute("data-lenso-fusion-contour-compute"),
            width: parseFloat(surface.style.width),
          };
        });
        const moving = await page.evaluate(async () => {
          const root = document.querySelector('[data-case="fusion"]');
          const edge = root.querySelector("[data-lenso-glass-outline]");
          const members = [...root.querySelectorAll("button")];
          const put = CanvasRenderingContext2D.prototype.putImageData;
          let commits = 0;
          CanvasRenderingContext2D.prototype.putImageData = function (...args) {
            if (this.canvas === edge) {
              commits++;
            }
            return put.apply(this, args);
          };
          try {
            const start = performance.now();
            await new Promise((resolve) => {
              const tick = (now) => {
                if (now - start >= 2000) return resolve();
                const width = 88 + 24 * Math.sin((now - start) / 160);
                for (const member of members) {
                  member.style.transition = "none";
                  member.style.width = `${width}px`;
                }
                requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            });
            return { commits };
          } finally {
            CanvasRenderingContext2D.prototype.putImageData = put;
            for (const member of members) {
              member.style.width = "88px";
              member.style.transition = "width 160ms linear";
            }
          }
        });
        assert.ok(moving.commits > 1, `${name}/${count}: contour froze during continuous motion`);
        console.log(`${name}/${count}: continuous-motion commits=${moving.commits}`);
        await page.evaluate(() => {
          window.__frames = [];
          window.__longTasks = [];
          try {
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) window.__longTasks.push(entry.duration);
            }).observe({ type: "longtask" });
          } catch {
            // WebKit does not expose long tasks; frame gaps remain available.
          }
          let previous = performance.now();
          window.__measuring = true;
          const tick = (now) => {
            window.__frames.push(now - previous);
            previous = now;
            if (window.__measuring) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        const resize = page.getByRole("button", { name: "Resize group", exact: true });
        // Keep geometry moving while the press clarity also changes, then settle.
        for (let index = 0; index < 4; index++) {
          await resize.click();
          await page.waitForTimeout(70);
        }
        const box = await member.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(220);
        await page.mouse.up();
        // Four toggles return the members to their original size. Wait for that
        // layout before comparing the worker bitmap, which may still be older.
        await page.waitForFunction(
          (width) => {
            const root = document.querySelector('[data-case="fusion"]');
            const surface = root?.querySelector("[data-lenso-glass-fusion]");
            const edge = root?.querySelector("[data-lenso-glass-outline]");
            return (
              surface instanceof HTMLElement &&
              edge instanceof HTMLCanvasElement &&
              [...root.querySelectorAll("button")].every(
                (member) => getComputedStyle(member).width === member.style.width,
              ) &&
              parseFloat(surface.style.width) === width &&
              Math.abs(edge.width - Math.ceil((width + 48) * 2)) <= 1
            );
          },
          initial.width,
          { timeout: 5000 },
        );
        const result = await page.evaluate(() => {
          window.__measuring = false;
          const root = document.querySelector('[data-case="fusion"]');
          const surface = root?.querySelector("[data-lenso-glass-fusion]");
          const edge = root?.querySelector("[data-lenso-glass-outline]");
          if (!(surface instanceof HTMLElement) || !(edge instanceof HTMLCanvasElement))
            return { failures: ["missing fusion surface or outline"] };
          const failures = [];
          const planeWidth = parseFloat(surface.style.width);
          const planeHeight = parseFloat(surface.style.height);
          if (!(planeWidth > 0) || !(planeHeight > 0)) failures.push("empty plane");
          if (Math.abs(edge.width - Math.ceil((planeWidth + 48) * 2)) > 1)
            failures.push("stale contour bitmap");
          if (Math.abs(parseFloat(edge.style.width) - (planeWidth + 48)) > 1)
            failures.push("stale contour box");
          if (edge.style.maskImage !== "none") failures.push("group contour mask missing");
          if (surface.hidden) failures.push("hidden surface");
          const context = edge.getContext("2d", { willReadFrequently: true });
          if (!context) failures.push("missing canvas context");
          let painted = 0;
          if (context) {
            const pixels = context.getImageData(0, 0, edge.width, edge.height).data;
            for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) painted++;
          }
          if (painted < 100) failures.push("empty contour");
          const frames = window.__frames.slice(1);
          return {
            failures,
            painted,
            compute: surface.getAttribute("data-lenso-fusion-contour-compute"),
            maxFrame: frames.length ? Math.max(...frames) : 0,
            frames: frames.length,
            longTasks: window.__longTasks.length,
            longTask: window.__longTasks.length ? Math.max(...window.__longTasks) : 0,
            size: [planeWidth, planeHeight],
          };
        });
        assert.deepEqual(result.failures, [], `${name}/${count}: ${JSON.stringify(result)}`);
        assert.equal(result.compute, "worker", `${name}/${count}: main-thread contour`);
        assert.deepEqual(errors, [], `${name}/${count}: ${JSON.stringify(errors)}`);
        console.log(
          `${name}/${count}: size=${result.size.join("x")} painted=${result.painted} ` +
            `compute=${initial.compute}->${result.compute} ` +
            `maxFrame=${result.maxFrame.toFixed(1)}ms frames=${result.frames} ` +
            `longTasks=${result.longTasks}${result.longTasks ? `/${result.longTask.toFixed(1)}ms` : ""}`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server?.close();
}
