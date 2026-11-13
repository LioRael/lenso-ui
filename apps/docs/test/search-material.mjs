import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";

async function detailVariation(page, target) {
  const png = (await target.screenshot()).toString("base64");
  return page.evaluate(async (encoded) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(300, 43, 200, 10).data;
    const values = [];
    for (let i = 0; i < pixels.length; i += 4)
      values.push((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  }, png);
}

// Colour alone also passes for an invisible face. Check that the real action
// retains a raised backing after optics settle, over coloured and neutral scenes.
async function assertActionBackdrop(page, dialog, appearance) {
  await page.waitForFunction(() => {
    const action = document.querySelector('[data-slot="command-action"]');
    return (
      action?.hasAttribute("data-material-filter") || action?.hasAttribute("data-material-paints")
    );
  });
  const action = dialog.locator('[data-slot="command-action"]');
  const box = await action.boundingBox();
  const panel = await dialog.boundingBox();
  for (const background of appearance === "dark"
    ? ["rgb(30 100 210)", "rgb(28 28 30)"]
    : ["rgb(30 100 210)"]) {
    await dialog.evaluate((element, background) => {
      const backdrop = document.createElement("div");
      backdrop.setAttribute("data-search-action-backdrop", "");
      Object.assign(backdrop.style, {
        position: "fixed",
        inset: "0",
        zIndex: "45",
        background,
        pointerEvents: "none",
      });
      element.before(backdrop);
    }, background);
    const png = (await dialog.screenshot()).toString("base64");
    const sample = await page.evaluate(
      async ({ png, box, panel }) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const sx = image.width / panel.width,
          sy = image.height / panel.height;
        const pixel = (x, y) => [...context.getImageData(x * sx, y * sy, 1, 1).data];
        const luma = (rgb) => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        const left = box.x - panel.x,
          top = box.y - panel.y;
        const values = [];
        // Lower-quartile interior pixels ignore the label and the bright rim.
        for (let y = 6; y < box.height - 6; y += 2)
          for (let x = 8; x < box.width - 8; x += 2) values.push(luma(pixel(left + x, top + y)));
        values.sort((a, b) => a - b);
        return {
          colour: pixel(left + box.width / 2, top + box.height - 5),
          face: values[Math.floor(values.length / 4)],
          panel: luma(pixel(left - 12, top + box.height / 2)),
        };
      },
      { png, box, panel },
    );
    if (background === "rgb(30 100 210)")
      assert.ok(
        sample.colour[2] - sample.colour[0] > 15,
        `Search action lost its blue backdrop: ${sample.colour}`,
      );
    if (appearance === "dark")
      assert.ok(
        sample.face > sample.panel + 8,
        `Search action lost its raised glass backing over ${background}: ${JSON.stringify(sample)}`,
      );
    await page.locator("[data-search-action-backdrop]").evaluate((element) => element.remove());
  }
}

// Flat docs backgrounds hide backdrop-ownership failures; exercise the home
// image and a high-frequency source, with a native blur control for the backend.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    for (const colorScheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme });
      for (const path of ["/cn", "/cn/docs/react/getting-started"]) {
        await page.goto(`${base}${path}`);
        await page.waitForLoadState("networkidle");
        await page
          .getByRole("button", { name: "搜索文档", exact: true })
          .filter({ visible: true })
          .click();
        const dialog = page.getByRole("dialog");
        await dialog.getByRole("option").first().waitFor();
        const boundary = await dialog.boundingBox();
        const command = await dialog.locator("[data-docs-search-glass]").boundingBox();
        assert.ok(boundary && command && boundary.width > 0 && boundary.height > 0);
        for (const edge of ["x", "y", "width", "height"])
          assert.ok(
            Math.abs(boundary[edge] - command[edge]) < 1,
            `Search Dialog must enclose the visible Command: ${edge}`,
          );

        await page.waitForFunction(() => {
          const glass = document.querySelector("[data-docs-search-glass]");
          return (
            glass?.hasAttribute("data-material-filter") ||
            glass?.hasAttribute("data-material-paints")
          );
        });
        const ownership = await dialog.evaluate((element) => {
          const glass = document.querySelector("[data-docs-search-glass]");
          const paintId = glass.getAttribute("data-material-paints");
          const paint = paintId
            ? document.querySelector(`[data-material-local-paints="${paintId}"]`)
            : null;
          let isolated = false;
          for (let node = glass; node && node !== element; node = node.parentElement) {
            const parent = node.parentElement;
            if (parent && getComputedStyle(parent).isolation === "isolate") isolated = true;
          }
          return {
            isolated,
            liveScene: Boolean(glass.parentElement.closest('[data-lenso-backdrop="live"]')),
            paintInsidePanel: paint ? element.contains(paint) : false,
          };
        });
        assert.equal(
          ownership.isolated,
          false,
          "An isolated child cannot sample the complete page backdrop",
        );
        assert.equal(
          ownership.liveScene,
          true,
          "Search must not sample an unrelated local image source",
        );
        assert.equal(
          ownership.paintInsidePanel,
          false,
          "Fallback paint must remain outside the panel's backdrop root",
        );
        await assertActionBackdrop(page, dialog, colorScheme);
        await dialog.evaluate((element) => {
          const backdrop = document.createElement("div");
          Object.assign(backdrop.style, {
            position: "fixed",
            inset: "0",
            zIndex: "45",
            background: "repeating-linear-gradient(90deg, black 0px 6px, white 6px 12px)",
            pointerEvents: "none",
          });
          element.before(backdrop);
        });
        const deviation = await detailVariation(page, dialog);
        await dialog.evaluate((element) => {
          const reference = document.createElement("div");
          reference.setAttribute("data-native-blur-reference", "");
          const box = element.getBoundingClientRect();
          Object.assign(reference.style, {
            position: "fixed",
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
            zIndex: "51",
            backdropFilter: "blur(15.3px)",
            background: "rgb(255 255 255 / 0.01)",
          });
          element.before(reference);
        });
        const reference = await detailVariation(page, page.locator("[data-native-blur-reference]"));
        if (reference < 25) {
          assert.ok(
            deviation < 25,
            `${name} ${colorScheme} ${path}: sharp backdrop detail survived (${deviation.toFixed(2)})`,
          );
          console.log(name, colorScheme, path, "ownership and material pixels passed");
        } else {
          console.log(
            name,
            colorScheme,
            path,
            "ownership passed; native blur reference is not painted by this backend",
          );
        }
        await page.locator("[data-native-blur-reference]").evaluate((element) => element.remove());
        const input = dialog.getByRole("combobox");
        const selected = await input.getAttribute("aria-activedescendant");
        await page.keyboard.press("ArrowDown");
        assert.notEqual(await input.getAttribute("aria-activedescendant"), selected);
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        await page.waitForFunction(
          () => document.activeElement?.getAttribute("aria-label") === "搜索文档",
        );
      }
    }
  } finally {
    await browser.close();
  }
}
