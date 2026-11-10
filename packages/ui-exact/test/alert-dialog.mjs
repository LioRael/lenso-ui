import assert from "node:assert/strict";
import path from "node:path";

export async function checkAlertDialog(page, engine) {
  const dialog = page.getByTestId("delete-alert");
  const popup = page.getByTestId("delete-alert-popup");
  const trigger = page.getByTestId("alert-trigger");
  const cancel = page.getByTestId("alert-cancel");
  const editor = page.getByTestId("alert-confirmation");
  const open = async () => {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => {
      const root = document.querySelector('[data-testid="delete-alert"]');
      const popup = root.querySelector('[data-slot="alert-dialog-popup"]');
      return (
        root.open &&
        !popup.hasAttribute("data-starting-style") &&
        getComputedStyle(popup).opacity === "1"
      );
    });
    await page.evaluate(() =>
      Promise.all(
        document
          .querySelector('[data-testid="delete-alert-popup"]')
          .getAnimations()
          .map((a) => a.finished.catch(() => {})),
      ),
    );
    assert.equal(await dialog.evaluate((n) => n.matches(":modal")), true);
  };
  const closed = async () => {
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="delete-alert"]')).display === "none",
    );
    assert.equal(await dialog.evaluate((n) => n.open), false);
  };
  await page.setViewportSize({ width: 820, height: 844 });
  await open();
  assert.equal(
    await page.getByRole("alertdialog", { name: "Delete workspace?", exact: true }).count(),
    1,
  );
  assert.equal(await dialog.getAttribute("aria-describedby"), "delete-description");
  assert.equal(await dialog.evaluate((n) => getComputedStyle(n, "::before").content), "none");
  assert.equal(await editor.evaluate((n) => n.getBoundingClientRect().height), 52);
  assert.equal(await cancel.evaluate((n) => n === document.activeElement), true);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "hidden");
  await editor.focus();
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.getByTestId("alert-close-icon").evaluate((n) => n === document.activeElement),
    true,
  );
  await page.keyboard.press("Tab");
  assert.equal(await editor.evaluate((n) => n === document.activeElement), true);
  const lens = popup.locator("[data-material-lens]");
  assert.equal(await lens.getAttribute("aria-hidden"), "true");
  assert.equal(
    await lens.evaluate((n) =>
      getComputedStyle(n).getPropertyValue("--apple-material-profile").trim(),
    ),
    "medium",
  );
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="delete-alert-popup"] [data-material-lens]')
        .childElementCount > 0,
  );
  await page.mouse.click(2, 2);
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await page.getByTestId("alert-delete").click();
  assert.equal(await dialog.evaluate((n) => n.open), true);
  assert.equal(await page.getByTestId("alert-error").textContent(), "Type DELETE to confirm.");
  await editor.fill("DELETE");
  await page.getByTestId("alert-delete").click();
  await closed();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="delete-alert-popup"] [data-material-lens]')
        .childElementCount === 0,
  );
  assert.equal(await page.getByTestId("alert-result").textContent(), "Workspace deleted");
  assert.equal(await trigger.evaluate((n) => n === document.activeElement), true);
  await open();
  assert.equal(await editor.inputValue(), "DELETE");
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(await trigger.evaluate((n) => n === document.activeElement), true);
  for (const [size, width] of [
    ["lg", 512],
    ["xs", 280],
    ["sm", 300],
    ["cover", 480],
    ["md", 300],
  ]) {
    await page.getByTestId("alert-size").click();
    await open();
    assert.equal(await popup.getAttribute("data-size"), size);
    assert.ok(Math.abs((await popup.boundingBox()).width - width) < 1);
    await cancel.click();
    await closed();
  }
  for (const placement of ["top", "bottom", "auto", "center"]) {
    await page.getByTestId("alert-placement").click();
    await open();
    const rect = await popup.boundingBox();
    if (placement === "top") assert.ok(Math.abs(rect.y - 16) < 1);
    else if (placement === "bottom") assert.ok(Math.abs(rect.y + rect.height - 828) < 1);
    else assert.ok(Math.abs(rect.y + rect.height / 2 - 422) < 1);
    await cancel.click();
    await closed();
  }
  for (const variant of ["blur", "transparent", "opaque"]) {
    await page.getByTestId("alert-backdrop").click();
    await open();
    assert.equal(
      await dialog
        .locator('[data-slot="alert-dialog-backdrop"]')
        .getAttribute("data-lenso-variant"),
      variant,
    );
    const filter = await dialog
      .locator('[data-slot="alert-dialog-backdrop"]')
      .evaluate((n) => getComputedStyle(n).backdropFilter);
    assert.equal(filter, variant === "blur" ? "blur(4px)" : "none");
    await cancel.click();
    await closed();
  }
  for (const variant of ["success", "warning", "accent", "default", "danger"]) {
    await page.getByTestId("alert-tone").click();
    await open();
    const icon = popup.locator('[data-slot="alert-dialog-icon"]');
    assert.equal(await icon.getAttribute("data-lenso-variant"), variant);
    assert.equal(await icon.locator("svg path").count(), 1);
    assert.equal(
      await icon.locator("svg").evaluate((n) => getComputedStyle(n).fillRule),
      "evenodd",
    );
    assert.deepEqual(
      await icon.evaluate((n) => ({
        width: getComputedStyle(n).width,
        height: getComputedStyle(n).height,
      })),
      { width: "40px", height: "40px" },
    );
    await cancel.click();
    await closed();
  }
  for (const [layout, direction] of [
    ["stacked", "column"],
    ["side-by-side", "row"],
    ["auto", "row"],
  ]) {
    await page.getByTestId("alert-layout").click();
    await open();
    const footer = popup.locator('[data-slot="alert-dialog-footer"]');
    assert.equal(await footer.getAttribute("data-layout"), layout);
    assert.equal(await footer.evaluate((n) => getComputedStyle(n).flexDirection), direction);
    await cancel.click();
    await closed();
  }
  await page.getByTestId("alert-third").click();
  await open();
  assert.equal(
    await popup
      .locator('[data-slot="alert-dialog-footer"]')
      .evaluate((n) => getComputedStyle(n).flexDirection),
    "column",
  );
  await page.getByTestId("alert-third-action").click();
  assert.equal(await dialog.count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "");
  await page.getByTestId("alert-mount").click();
  await page.getByTestId("alert-third").click();
  await open();
  await popup.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() =>
    document
      .querySelector('[data-testid="delete-alert-popup"]')
      .hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await popup.evaluate((n) => n.removeAttribute("data-contrast"));
  await page.waitForFunction(
    () =>
      !document
        .querySelector('[data-testid="delete-alert-popup"]')
        .hasAttribute("data-material-opaque"),
  );
  assert.notEqual(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document
      .querySelector('[data-testid="delete-alert-popup"]')
      .hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await cancel.click();
  await closed();
  await open();
  assert.equal(await popup.evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
  await cancel.click();
  await closed();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByTestId("alert-disable").click();
  await trigger.evaluate((n) => n.click());
  assert.equal(await dialog.evaluate((n) => n.open), false);
  await page.getByTestId("alert-disable").click();
  await page.getByTestId("alert-open").click();
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await page.getByTestId("alert-close-icon").click();
  await closed();
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
        await page.getByTestId("theme").click();
      await open();
      assert.ok((await popup.boundingBox()).width <= width - 32);
      await page.screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-alert-dialog-${appearance}-${width}.png`,
        ),
      });
      await cancel.click();
      await closed();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const motion = await page.evaluate(async () => {
    const root = document.querySelector('[data-testid="delete-alert"]');
    const popup = document.querySelector('[data-testid="delete-alert-popup"]');
    const host = document.getElementById("alert-dialog-examples");
    const original = host.getAttribute("style");
    const sample = async (duration, settle = false) => {
      const frames = [];
      const start = performance.now();
      await new Promise((resolve) => {
        const next = () => {
          const rect = root.getBoundingClientRect();
          frames.push({
            t: performance.now() - start,
            open: root.open,
            modal: root.matches(":modal"),
            display: getComputedStyle(root).display,
            opacity: Number(getComputedStyle(popup).opacity),
            x: rect.x,
            y: rect.y,
          });
          const elapsed = performance.now() - start;
          const running = [...root.getAnimations(), ...popup.getAnimations()].some(
            (a) => a.playState === "running",
          );
          if (
            (elapsed >= duration &&
              (!settle || (!running && !popup.hasAttribute("data-starting-style")))) ||
            elapsed > duration + 2000
          )
            resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      });
      return frames;
    };
    host.style.transform = "translateZ(0)";
    host.style.overflow = "hidden";
    try {
      root.showModal();
      const enter = await sample(360, true);
      root.close();
      const exit = await sample(320, true);
      root.showModal();
      await sample(90);
      root.close();
      await sample(50);
      root.showModal();
      const reversal = await sample(360, true);
      root.close();
      await sample(320);
      return { enter, exit, reversal, overlayTransitions: CSS.supports("overlay", "auto") };
    } finally {
      if (root.open) root.close();
      if (original === null) host.removeAttribute("style");
      else host.setAttribute("style", original);
    }
  });
  const animated = (frames) =>
    frames.some((f) => f.display !== "none" && f.opacity > 0 && f.opacity < 0.99);
  assert.equal(animated(motion.enter), true);
  assert.equal(motion.enter.at(-1).opacity, 1);
  assert.equal(animated(motion.exit), motion.overlayTransitions);
  assert.equal(motion.exit.at(-1).display, "none");
  assert.equal(motion.reversal.at(-1).modal, true);
  assert.equal(motion.reversal.at(-1).opacity, 1);
  for (const frame of [...motion.enter, ...motion.exit, ...motion.reversal].filter(
    (f) => f.display !== "none",
  )) {
    assert.ok(
      Math.abs(frame.x) < 1 && Math.abs(frame.y) < 1,
      "native top layer survives transformed clipping ancestors",
    );
  }
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-alert-dialog-motion.json`),
    JSON.stringify(motion, null, 2) + "\n",
  );
  return {
    enterAnimated: animated(motion.enter),
    exitAnimated: animated(motion.exit),
    overlayTransitions: motion.overlayTransitions,
  };
}
