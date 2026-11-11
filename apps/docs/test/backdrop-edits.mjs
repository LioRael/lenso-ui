import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// Changing a native field's value emits no DOM mutation. Check three independent
// optical copies, including a replacement that is still waiting to decode.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
const moduleUrl =
  "/@fs" + new URL("../../../packages/glass/src/backdrop.ts", import.meta.url).pathname;
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    await page.route(base + "/__backdrop-edits", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><style>
        #source { position:relative; width:400px; height:160px }
        .lens { position:absolute; top:10px; left:10px; width:84px; height:40px }
        .label { color:rgb(12, 45, 89) !important }
        #source .label { border-radius:11px 7px 5px 3px; --ink-note:"x;y" }
      </style><form id="owner"><div id="source" data-lenso-backdrop>
        <input class="field" value="initial"><textarea>initial area</textarea><span class="label">A</span>
      </div></form><div class="lens"></div><div class="lens" style="left:120px"></div><div class="lens" style="left:220px"></div>`,
      }),
    );
    await page.goto(base + "/__backdrop-edits");
    await page.evaluate(async (moduleUrl) => {
      const { copyBackdrop } = await import(moduleUrl);
      const source = document.querySelector("#source");
      for (const lens of document.querySelectorAll(".lens")) copyBackdrop(lens, source);
      source.querySelector("input").addEventListener("input", (event) => {
        event.target.value = event.target.value.toUpperCase();
      });
    }, moduleUrl);
    const copies = page.locator("[inert] .field");
    await page.waitForFunction(() => document.querySelectorAll("[inert] .field").length === 3);
    assert.deepEqual(
      await page
        .locator("[inert] .label")
        .evaluateAll((nodes) =>
          nodes.map((n) => [
            getComputedStyle(n).borderTopLeftRadius,
            getComputedStyle(n).borderBottomRightRadius,
            n.style.getPropertyValue("--ink-note").trim(),
          ]),
        ),
      [
        ["11px", "5px", '"x;y"'],
        ["11px", "5px", '"x;y"'],
        ["11px", "5px", '"x;y"'],
      ],
    );
    // Named WAAPI reads share a batch with full computed-style reads.
    await page.evaluate(() => {
      window.effect = document.querySelector("#source .label").animate(
        [
          { opacity: 1, letterSpacing: "0px" },
          { opacity: 0.2, letterSpacing: "4px" },
        ],
        { duration: 1000, fill: "both" },
      );
      window.effect.pause();
    });
    for (const time of [250, 750, null]) {
      await page.evaluate((time) => {
        if (time === null) window.effect.cancel();
        else window.effect.currentTime = time;
      }, time);
      await page.waitForFunction((time) => {
        const source = getComputedStyle(document.querySelector("#source .label"));
        if (Math.abs(Number(source.opacity) - (time === null ? 1 : 1 - time * 0.0008)) > 0.01)
          return false;
        return [...document.querySelectorAll("[inert] .label")].every((node) => {
          const style = getComputedStyle(node);
          return style.opacity === source.opacity && style.letterSpacing === source.letterSpacing;
        });
      }, time);
    }
    await copies.evaluateAll((nodes) => {
      window.initialCopies = nodes;
    });
    await page.locator("#source input").fill("edited");
    await page.locator("#source textarea").fill("line one\nline two");
    await page.waitForFunction(
      () =>
        window.initialCopies.every((n) => n.value === "EDITED") &&
        [...document.querySelectorAll("[inert] textarea")].every(
          (n) => n.value === "line one\nline two",
        ),
    );
    assert.equal(
      await page.locator("#source textarea").evaluate((n) => document.activeElement === n),
      true,
    );
    await page.evaluate(() => document.querySelector("form").reset());
    await page.waitForFunction(
      () =>
        window.initialCopies.every((n) => n.value === "initial") &&
        [...document.querySelectorAll("[inert] textarea")].every((n) => n.value === "initial area"),
    );
    assert.ok(
      await copies.evaluateAll((nodes) => nodes.every((n, i) => n === window.initialCopies[i])),
    );

    await page.locator("#source input").fill("Optical text ".repeat(20));
    await page.locator("#source textarea").fill("Line of text\n".repeat(16));
    await page.evaluate(() => {
      document.querySelector("#source input").scrollLeft = 103;
      document.querySelector("#source textarea").scrollTop = 62;
    });
    await page.waitForFunction(() => {
      const left = document.querySelector("#source input").scrollLeft;
      const top = document.querySelector("#source textarea").scrollTop;
      return (
        left > 0 &&
        top > 0 &&
        window.initialCopies.every((n) => n.scrollLeft === left) &&
        [...document.querySelectorAll("[inert] textarea")].every((n) => n.scrollTop === top)
      );
    });
    await page.evaluate(() => {
      const decode = HTMLImageElement.prototype.decode;
      window.waiting = [];
      HTMLImageElement.prototype.decode = async function () {
        await decode.call(this);
        if (this.classList.contains("held"))
          await new Promise((resolve) => window.waiting.push(resolve));
      };
      const image = new Image();
      image.className = "held";
      image.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'/%3E";
      document.querySelector("#source").append(image);
    });
    await page.waitForFunction(() => window.waiting.length >= 3);
    await page.locator("#source input").fill("while decoding");
    await page.evaluate(() => window.waiting.splice(0).forEach((resolve) => resolve()));
    await page.waitForFunction(
      () =>
        document.querySelectorAll("[inert] img.held").length === 3 &&
        [...document.querySelectorAll("[inert] .field")].every((n) => n.value === "WHILE DECODING"),
    );
    await page.evaluate(() => {
      const image = document.querySelector("#source img");
      image.replaceWith(image.cloneNode());
    });
    await page.waitForFunction(() => window.waiting.length >= 3);
    await page.evaluate(() => {
      document.querySelector("#source img").remove();
      const label = document.querySelector("#source .label");
      label.textContent = "B";
      label.style.setProperty("color", "rgb(90, 65, 20)", "important");
    });
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll("[inert] .label")].every(
          (n) => n.textContent === "B" && getComputedStyle(n).color === "rgb(90, 65, 20)",
        ) && document.querySelectorAll("[inert] img.held").length === 0,
    );
    // A slower image from the previous revision must not replace the newer text.
    await page.evaluate(async () => {
      window.waiting.splice(0).forEach((resolve) => resolve());
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    assert.equal(await page.locator("[inert] img.held").count(), 0);
    assert.deepEqual(await page.locator("[inert] .label").allTextContents(), ["B", "B", "B"]);
    console.log(
      engine.name(),
      "passed shared text edits, controlled values, reset, image replacement and restyling",
    );
  } finally {
    await browser.close();
  }
}
