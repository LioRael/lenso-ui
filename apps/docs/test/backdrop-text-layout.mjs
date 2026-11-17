import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, webkit } from "playwright";

const server = process.env.DOCS_URL
  ? undefined
  : await createServer({
      configFile: new URL("../vite.config.ts", import.meta.url).pathname,
      server: { port: 0, strictPort: false },
      logLevel: "warn",
    });
await server?.listen();
const base = process.env.DOCS_URL ?? server.resolvedUrls.local[0];
const moduleUrl =
  "/@fs" + new URL("../../../packages/glass/src/backdrop.ts", import.meta.url).pathname;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await engine.launch();
    try {
      for (const display of ["flex", "grid"]) {
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route(base + "/__backdrop-text-layout", (route) =>
          route.fulfill({
            contentType: "text/html",
            body: `<!doctype html><style>
            #source { width:400px; height:300px }
            .row { display:${display}; width:180px; grid-template-columns:140px 40px; align-items:stretch }
            .text { width:140px; flex:none; line-height:20px }
            .sibling { width:40px; background:red }
            .lens { position:absolute; left:30px; top:30px; width:80px; height:40px; --lg-blur:3px }
          </style><div id="source" data-lenso-backdrop><div class="row"><div class="text">short</div><div class="sibling"></div></div></div><div class="lens"></div>`,
          }),
        );
        await page.goto(base + "/__backdrop-text-layout");
        await page.evaluate(async (url) => {
          const { copyBackdrop } = await import(url);
          const source = document.querySelector("#source");
          window.__stopCopy = copyBackdrop(document.querySelector(".lens"), source);
          window.__clones = 0;
          const clone = source.cloneNode;
          source.cloneNode = function (...args) {
            window.__clones++;
            return clone.apply(this, args);
          };
        }, moduleUrl);
        await page.waitForFunction(() => document.querySelector(".lens").hasAttribute("data-copy"));
        await page.evaluate(() => {
          window.__clones = 0;
        });
        const heights = () =>
          page.evaluate(() => {
            const source = document.querySelector("#source");
            const copy = document.querySelector(".lens").previousElementSibling;
            return {
              original: source.querySelector(".sibling").getBoundingClientRect().height,
              copy: copy.querySelector(".sibling").getBoundingClientRect().height,
              clones: window.__clones,
            };
          });
        assert.deepEqual(await heights(), { original: 20, copy: 20, clones: 0 });
        for (const text of ["word ".repeat(35), "short"]) {
          await page.evaluate((text) => {
            document.querySelector("#source .text").firstChild.data = text;
          }, text);
          // A fixed source does not resize when the row grows. The text path
          // itself must refresh the sibling, without an unrelated style update.
          await page.waitForFunction(
            () => {
              const source = document.querySelector("#source .sibling");
              const copy = document
                .querySelector(".lens")
                .previousElementSibling.querySelector(".sibling");
              return source.getBoundingClientRect().height === copy.getBoundingClientRect().height;
            },
            null,
            { timeout: 3000 },
          );
          const result = await heights();
          if (text === "short") assert.equal(result.original, 20);
          else assert.ok(result.original > 20, "the fixture must wrap its text");
          assert.equal(result.copy, result.original);
          assert.equal(result.clones, 0, "layout refresh must reuse the copied tree");
          console.log(`${name}/${display}: ${JSON.stringify(result)}`);
        }
        await page.evaluate(() => window.__stopCopy());
        assert.deepEqual(errors, []);
        await page.close();
      }
      const page = await browser.newPage();
      await page.route(base + "/__backdrop-capture-text", (route) =>
        route.fulfill({
          contentType: "text/html",
          body: '<!doctype html><div id="source" style="position:relative;width:400px;height:300px;background:white"> </div>',
        }),
      );
      await page.goto(base + "/__backdrop-capture-text");
      const capture = await page.evaluate(async (moduleUrl) => {
        const { BackdropPaint } = await import(moduleUrl.replace("backdrop.ts", "gpu-capture.ts"));
        const { BackdropReads } = await import(
          moduleUrl.replace("backdrop.ts", "backdrop-scheduler.ts")
        );
        const source = document.querySelector("#source");
        const text = source.firstChild;
        const paint = new BackdropPaint(source);
        const change = {
          content: false,
          styles: false,
          animated: new Map(),
          texts: new Set([text]),
        };
        const initial = !!paint.read({ ...change, styles: true }, new BackdropReads());
        text.data = "visible text";
        const withText = !!paint.read(change, new BackdropReads());
        text.data = " ";
        const cleared = !!paint.read(change, new BackdropReads());
        return { initial, withText, cleared };
      }, moduleUrl);
      assert.deepEqual(
        capture,
        { initial: true, withText: false, cleared: true },
        `${name}: text must invalidate shared capture eligibility`,
      );
      console.log(`${name}/capture: ${JSON.stringify(capture)}`);
      await page.close();
    } finally {
      await browser.close();
    }
  }
} finally {
  await server?.close();
}
