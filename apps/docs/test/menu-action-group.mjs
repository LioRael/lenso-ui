import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
const out = process.env.MENU_ACTION_OUTPUT;
if (out) await mkdir(out, { recursive: true });
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
      await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
      await page.evaluate(async () => {
        const { mount } = await import("/test/menu-action-group-fixture.tsx");
        for (const e of document.body.children) if (e instanceof HTMLElement) e.hidden = true;
        const host = document.createElement("div");
        document.body.append(host);
        mount(host);
      });
      for (const [kind, label] of [
        ["default", "Menu"],
        ["photos", "Photo options"],
      ]) {
        const trigger = page
          .locator(`[data-action-case=${kind}]`)
          .getByRole("button", { name: label, exact: true });
        await trigger.click();
        const popup = page.locator("[data-lenso-slot=menu-popup][data-open]");
        await popup.waitFor();
        await page.waitForTimeout(600);
        const geometry = await popup.evaluate((e) => {
          const group = e.querySelector("[data-lenso-slot=menu-action-group]"),
            items = [...group.querySelectorAll("[data-lenso-slot=menu-action]")];
          const p = e.getBoundingClientRect(),
            g = group.getBoundingClientRect();
          return {
            panel: p.toJSON(),
            group: g.toJSON(),
            items: items.map((x) => {
              const b = x.getBoundingClientRect(),
                s = getComputedStyle(x);
              return {
                box: b.toJSON(),
                padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft],
                icon: x.querySelector("svg")?.getBoundingClientRect().toJSON(),
              };
            }),
            left: items[0].getBoundingClientRect().left - p.left,
            right: p.right - items.at(-1).getBoundingClientRect().right,
          };
        });
        if (out) {
          await writeFile(
            `${out}/${engine}-${width}-${kind}.json`,
            JSON.stringify(geometry, null, 2),
          );
          await page.screenshot({ path: `${out}/${engine}-${width}-${kind}.png` });
        }
        console.log(engine, width, kind, {
          left: geometry.left,
          right: geometry.right,
          widths: geometry.items.map((item) => item.box.width),
        });
        assert.ok(
          Math.abs(geometry.left - 10) < 0.1 && Math.abs(geometry.right - 10) < 0.1,
          "quick actions must retain the source 10px inline inset",
        );
        for (let i = 0; i < geometry.items.length; i++) {
          const item = geometry.items[i];
          assert.equal(item.box.height, 56);
          assert.deepEqual(item.padding, ["6px", "4px", "6px", "4px"]);
          if (i) assert.ok(Math.abs(item.box.x - geometry.items[i - 1].box.right - 6) < 0.1);
        }
        // A nested quick action and a normal row have different offset parents.
        for (const key of ["Home", "End", "Home"]) {
          await page.keyboard.press(key);
          await page.waitForTimeout(140);
          const error = await popup.evaluate((e) => {
            const row = e.querySelector("[data-highlighted]");
            const plate = e.querySelector('[data-lenso-slot="menu-plate"]');
            if (!row || !plate) return Infinity;
            const a = row.getBoundingClientRect(),
              b = plate.getBoundingClientRect();
            return Math.max(...["x", "y", "width", "height"].map((k) => Math.abs(a[k] - b[k])));
          });
          assert.ok(error < 1, `Menu highlight drift after ${key}: ${error}px`);
        }
        await page.keyboard.press("Enter");
        await popup.waitFor({ state: "hidden" });
        await page.waitForFunction(
          (e) => document.activeElement === e,
          await trigger.elementHandle(),
        );
        if (kind === "default") await page.getByText("已新建", { exact: true }).waitFor();
        else assert.equal(await page.locator("[data-copied]").textContent(), "1");
      }
      assert.deepEqual(errors, []);
      console.log("PASS", engine, width, "quick action inset, row geometry, keyboard and focus");
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
