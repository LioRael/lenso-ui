import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

// Resting material checks do not catch the native moving renderer dropping
// preferences, or a portal losing them during close/reopen.
const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [engine, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await type.launch(
    engine === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    for (const theme of ["light", "dark"])
      for (const kind of [
        "icon",
        "text",
        "menu-anchored",
        "select",
        "select-anchored",
        "cascade",
      ]) {
        const select = kind.startsWith("select");
        const page = await browser.newPage({
          viewport: { width: 1000, height: 900 },
          colorScheme: theme,
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${base}/cn/docs/react/components/menu`);
        await page.getByRole("button", { name: "Actions", exact: true }).waitFor();
        await page.evaluate(
          async ({ kind, theme }) => {
            const { mount } = await import("/test/menu-close-fixture.tsx");
            for (const child of document.body.children)
              if (child instanceof HTMLElement) child.hidden = true;
            const host = document.createElement("div");
            host.id = "moving-glass-preferences";
            document.body.append(host);
            mount(host, kind, theme);
          },
          { kind, theme },
        );
        const trigger = page.getByRole(select ? "combobox" : "button", {
          name: select ? "Case select" : "Case menu",
          exact: true,
        });
        await trigger.waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.clock.install({ time: new Date(0) });
        await page.clock.pauseAt(new Date(1000));
        await trigger.evaluate((e) => e.click());
        await page.clock.runFor(64);
        if (kind === "cascade") {
          await page.clock.runFor(600);
          await page.getByRole("menuitem", { name: "Nested actions", exact: true }).focus();
          await page.keyboard.press("ArrowRight");
          await page.clock.runFor(32);
        }
        const surface = page.locator(
          kind === "cascade"
            ? '[data-menu-motion="cascade"] [data-lenso-slot="menu-surface"]'
            : '[data-lenso-slot="menu-surface"], [data-lenso-slot="select-surface"]',
        );
        const read = () =>
          surface.evaluate((surface) => {
            const lens = surface.querySelector("[data-material-lens]");
            const style = getComputedStyle(lens);
            const id = lens.getAttribute("data-material-paints");
            let host = lens;
            while (host.parentElement && host.parentElement !== document.body) {
              if (["fixed", "sticky"].includes(getComputedStyle(host).position)) break;
              host = host.parentElement;
            }
            const paints = id
              ? document.querySelector(`[data-material-local-paints="${id}"]`)
              : (host.querySelector(":scope > [data-material-live-paints]") ??
                host.previousElementSibling);
            const layers = paints?.matches(
              "[data-material-local-paints], [data-material-live-paints]",
            )
              ? [...paints.children].filter((e) => getComputedStyle(e).display !== "none")
              : [];
            const blur = layers
              .map((e) => getComputedStyle(e).backdropFilter)
              .find((value) => value.includes("blur("));
            const rim = lens.querySelector("[data-lenso-live-rim]");
            const box = surface.getBoundingClientRect();
            return {
              moving: !surface.hasAttribute("data-material-resting"),
              opaque: lens.hasAttribute("data-lenso-glass-opaque"),
              background: style.backgroundImage,
              backdrop: style.backdropFilter,
              blur: parseFloat(blur?.match(/blur\(([.0-9]+)/)?.[1] ?? "0"),
              layers: layers.length,
              rim: !!rim && lens.hasAttribute("data-material-live-rim"),
              rimWidth: rim?.width / 2 - 2,
              rimHeight: rim?.height / 2 - 2,
              width: box.width,
              height: box.height,
              coverage: rim
                ? rim
                    .getContext("2d")
                    .getImageData(0, 0, rim.width, rim.height)
                    .data.some((value, i) => i % 4 === 3 && value > 0)
                : false,
            };
          });
        const assertContour = (state) => {
          assert.equal(state.rim, true, `${engine}/${theme}/${kind}: missing live foreground`);
          assert.equal(state.coverage, true, `${engine}/${theme}/${kind}: empty foreground`);
          assert.ok(Math.abs(state.rimWidth - state.width) <= 1, JSON.stringify(state));
          assert.ok(Math.abs(state.rimHeight - state.height) <= 1, JSON.stringify(state));
        };
        assertContour(await read());
        const set = async (amount, tint) => {
          await page.locator("#moving-glass-preferences > [data-theme]").evaluate(
            (scope, [amount, tint]) => {
              scope.style.setProperty("--lenso-glass-transparency", String(amount));
              scope.style.setProperty("--lenso-glass-tint-amount", String(tint));
            },
            [amount, tint],
          );
          await page.clock.runFor(16);
        };
        await set(0, 0.5);
        let state = await read();
        assert.equal(state.moving, true);
        assert.equal(state.opaque, true);
        assert.equal(state.layers, 0);
        assert.equal(state.backdrop, "none");
        assert.equal(state.rim, false);
        await set(0.4, 0);
        state = await read();
        assert.equal(state.opaque, false);
        assert.ok(Math.abs(state.blur - 1.3) < 0.001, JSON.stringify(state));
        assert.ok(state.background.includes("0.6"));
        assertContour(state);
        await set(1, 1);
        state = await read();
        assert.equal(state.blur, 15.3);
        assert.ok(state.background.includes(theme === "dark" ? "0.95" : "0.96"));
        assertContour(state);
        await page.keyboard.press("Escape");
        await page.clock.runFor(32);
        state = await read();
        assert.equal(state.moving, true);
        assert.ok(state.background.includes(theme === "dark" ? "0.95" : "0.96"));
        assertContour(state);
        if (kind !== "cascade") {
          await trigger.evaluate((e) => e.click());
          await page.clock.runFor(64);
          await set(1, 0);
          state = await read();
          assert.ok(Math.abs(state.blur - 1.3) < 0.001, JSON.stringify(state));
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.waitForTimeout(100);
          await page.clock.runFor(32);
          assert.equal((await read()).moving, false);
          assertContour(await read());
        }
        await page.keyboard.press("Escape");
        await page.clock.runFor(1000);
        assert.equal(await trigger.evaluate((e) => document.activeElement === e), true);
        assert.equal(
          await page
            .locator("[data-material-local-paints], [data-material-live-paints]")
            .evaluateAll((nodes) => nodes.filter((e) => e.getClientRects().length > 0).length),
          0,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`PASS ${engine} ${theme} ${kind}: moving preferences, closing and focus`);
      }
  } finally {
    await browser.close();
  }
}
