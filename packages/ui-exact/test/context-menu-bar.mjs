import assert from "node:assert/strict";
export async function checkContextBar(page) {
  const root = page.getByTestId("context-bar"),
    popup = page.getByTestId("context-bar-popup"),
    target = page.getByTestId("context-bar-target"),
    copy = page.getByTestId("context-bar-copy"),
    expand = page.getByTestId("context-bar-expand");
  const ready = () =>
    page.waitForFunction(
      () =>
        document.getElementById("context-bar")?.matches(":popover-open") &&
        !document.getElementById("context-bar-popup")?.hasAttribute("data-starting-style"),
    );
  const focused = (id) => page.waitForFunction((id) => document.activeElement?.id === id, id);
  const open = async () => {
    await target.focus();
    await page.keyboard.press("Shift+F10");
    await ready();
    await focused("context-bar-copy");
    await popup.evaluate(async (n) => {
      await Promise.all(
        n
          .getAnimations({ subtree: true })
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => {})),
      );
    });
  };
  await open();
  assert.equal(await root.getAttribute("aria-orientation"), "horizontal");
  const compact = await popup.boundingBox();
  assert.equal(compact.height, 44);
  assert.equal(await page.getByTestId("context-bar-locked").isDisabled(), true);
  await page.keyboard.press("ArrowRight");
  await focused("context-bar-expand");
  await page.keyboard.press("ArrowRight");
  await focused("context-bar-copy");
  await page.keyboard.press("ArrowDown");
  await focused("context-bar-copy");
  await page.keyboard.press("End");
  await focused("context-bar-expand");
  const sample = page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const popup = document.getElementById("context-bar-popup"),
          rows = [];
        let saw = false,
          frames = 0;
        const tick = () => {
          const rect = popup.getBoundingClientRect(),
            active = popup.hasAttribute("data-context-expanding"),
            mode = popup.querySelector('[data-slot="context-menu-bar-owner"]').dataset.lensoMode;
          saw ||= active;
          rows.push({
            height: rect.height,
            width: rect.width,
            active,
            mode,
            transform: popup.style.transform,
          });
          if (saw && !active && mode === "full") resolve(rows);
          else if (++frames > 240) reject(new Error("Context expansion did not settle"));
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
  await page.keyboard.press("Enter");
  const frames = await sample;
  await focused("context-bar-full-copy");
  assert.equal(await root.getAttribute("aria-orientation"), "vertical");
  assert.equal(await copy.count(), 0, "the compact branch unmounts on expansion");
  const full = await popup.boundingBox();
  assert.ok(full.height > 100);
  assert.ok(
    frames.some((f) => f.active && f.height > compact.height + 1 && f.height < full.height - 1),
    "the source expansion has intermediate geometry",
  );
  const first = frames.find((f) => f.active);
  assert.ok(Math.abs(first.height - compact.height) < 2, JSON.stringify(first));
  assert.equal(await popup.evaluate((n) => n.style.transform), "");
  assert.equal(await popup.evaluate((n) => n.style.transition), "");
  await page.keyboard.press("ArrowDown");
  await focused("context-bar-share");
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => !document.getElementById("context-bar").matches(":popover-open"),
  );
  assert.equal(await page.getByTestId("context-bar-count").textContent(), "1");
  await open();
  assert.equal(
    await root.getAttribute("aria-orientation"),
    "horizontal",
    "every open resets the compact branch",
  );
  await page.keyboard.press("Escape");
  await page.getByTestId("context-bar-direction").click();
  await open();
  await page.keyboard.press("ArrowLeft");
  await focused("context-bar-expand");
  await page.keyboard.press("ArrowRight");
  await focused("context-bar-copy");
  await page.keyboard.press("Escape");
  await page.getByTestId("context-bar-rejected").click();
  await open();
  await expand.click();
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))),
      ),
  );
  assert.equal(await root.getAttribute("aria-orientation"), "horizontal");
  assert.equal(await page.getByTestId("context-bar-full-copy").count(), 0);
  assert.equal(await popup.getAttribute("data-context-expanding"), null);
  await page.keyboard.press("Escape");
  await page.getByTestId("context-bar-rejected").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open();
  await expand.click();
  await page.getByTestId("context-bar-full-copy").waitFor();
  await focused("context-bar-full-copy");
  assert.equal(await popup.getAttribute("data-context-expanding"), null);
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await open();
  const watch = page.waitForFunction(() =>
    document.getElementById("context-bar-popup").hasAttribute("data-context-expanding"),
  );
  await expand.click();
  await watch;
  const retired = await popup.elementHandle();
  await page.getByTestId("context-bar-mounted").click();
  assert.equal(await root.count(), 0);
  assert.equal(await retired.evaluate((n) => n.hasAttribute("data-context-expanding")), false);
  assert.equal(await retired.evaluate((n) => n.style.transform), "");
  await retired.dispose();
  await page.getByTestId("context-bar-mounted").click();
  await open();
  await page.keyboard.press("Escape");
  return {
    frames,
    compact,
    full,
    keyboard: true,
    rejection: true,
    reducedMotion: true,
    reset: true,
    cleanup: true,
  };
}
