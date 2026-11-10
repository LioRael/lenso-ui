import assert from "node:assert/strict";
import path from "node:path";

export async function checkModal(page, engine) {
  const dialog = page.getByTestId("settings-modal");
  const popup = page.getByTestId("settings-modal-popup");
  const body = page.getByTestId("settings-modal-body");
  const trigger = page.getByTestId("modal-trigger");
  const editor = page.getByTestId("modal-name");
  const canceled = page.getByTestId("modal-cancel");
  const lock = await page.evaluate(() => ({
    value: document.documentElement.style.getPropertyValue("overflow"),
    priority: document.documentElement.style.getPropertyPriority("overflow"),
  }));
  const closed = async () => {
    assert.equal(await dialog.evaluate((n) => n.open), false);
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector('[data-testid="settings-modal"]')).display ===
        "none",
    );
  };
  const settle = () =>
    page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime))
          .map((a) => a.finished.catch(() => {})),
      ),
    );
  const open = async () => {
    await trigger.focus();
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => document.querySelector('[data-testid="settings-modal"]').open);
    await page.waitForFunction(() => {
      const root = document.querySelector('[data-testid="settings-modal"]');
      const style = getComputedStyle(
        document.querySelector('[data-testid="settings-modal-popup"]'),
      );
      return (
        !root.querySelector("[data-starting-style]") &&
        style.opacity === "1" &&
        (style.transform === "none" || style.transform === "matrix(1, 0, 0, 1, 0, 0)")
      );
    });
    await settle();
    assert.equal(await dialog.evaluate((n) => n.matches(":modal")), true);
    assert.equal(await dialog.evaluate((n) => n.inert), false);
  };
  await closed();
  await open();
  assert.equal(
    await page.getByRole("dialog", { name: "Profile settings", exact: true }).count(),
    1,
  );
  assert.equal(await dialog.getAttribute("aria-labelledby"), "settings-modal-title");
  assert.equal(await dialog.getAttribute("aria-describedby"), "settings-modal-description");
  assert.equal(await editor.evaluate((n) => document.activeElement === n), true);
  assert.equal(
    await page.getByTestId("modal-close-icon").evaluate((n) => n.getBoundingClientRect().width),
    36,
  );
  assert.equal(
    await page.evaluate(() => document.documentElement.style.getPropertyValue("overflow")),
    "hidden",
  );
  assert.equal(
    await dialog.evaluate((n) => getComputedStyle(n, "::backdrop").backgroundColor),
    "rgba(0, 0, 0, 0)",
  );
  for (let index = 0; index < 14; index++) {
    await page.keyboard.press("Tab");
    assert.equal(
      await dialog.evaluate((n) => n.contains(document.activeElement)),
      true,
      "native Tab stays inside the modal",
    );
  }
  await editor.focus();
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.getByTestId("modal-close-icon").evaluate((n) => document.activeElement === n),
    true,
  );
  await popup.evaluate((node) => {
    const hidden = document.createElement("button");
    hidden.id = "modal-hidden-edge";
    hidden.style.display = "none";
    const disabled = document.createElement("button");
    disabled.id = "modal-disabled-edge";
    disabled.disabled = true;
    const first = document.createElement("input");
    first.id = "modal-radio-first";
    first.type = "radio";
    first.name = "modal-focus-edge";
    first.checked = true;
    const second = document.createElement("input");
    second.id = "modal-radio-second";
    second.type = "radio";
    second.name = "modal-focus-edge";
    for (const element of [hidden, disabled, first, second]) {
      element.dataset.modalFocusProbe = "";
      node.append(element);
    }
    first.focus();
  });
  await page.keyboard.press("Tab");
  assert.equal(
    await editor.evaluate((n) => document.activeElement === n),
    true,
    "radio groups contribute their checked member to the edge",
  );
  await popup.evaluate((node) =>
    node.querySelectorAll("[data-modal-focus-probe]").forEach((probe) => probe.remove()),
  );
  await page.getByTestId("action").evaluate((n) => n.focus());
  assert.equal(
    await dialog.evaluate((n) => n.contains(document.activeElement)),
    true,
    "background focus is inert",
  );
  const top = await page.evaluate(() => scrollY);
  await page.mouse.move(5, 5);
  await page.mouse.wheel(0, 500);
  assert.equal(await page.evaluate(() => scrollY), top);
  await editor.fill("x");
  await page.getByTestId("modal-save").click();
  assert.equal(await dialog.evaluate((n) => n.open), true);
  assert.equal(
    await page.getByTestId("modal-error").textContent(),
    "Enter at least two characters.",
  );
  await editor.fill("Updated Lenso");
  await page.getByTestId("modal-save").click();
  await closed();
  assert.equal(await page.getByTestId("modal-saved").textContent(), "Updated Lenso");
  assert.equal(await trigger.evaluate((n) => document.activeElement === n), true);
  await open();
  assert.equal(await editor.inputValue(), "Updated Lenso");
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(await trigger.evaluate((n) => document.activeElement === n), true);

  await page.getByTestId("modal-dismiss").click(); // any
  await open();
  await page.mouse.click(4, 4);
  await closed();
  await page.getByTestId("modal-dismiss").click(); // none
  await open();
  await page.keyboard.press("Escape");
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await page.mouse.click(4, 4);
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await canceled.click();
  await closed();
  await page.getByTestId("modal-dismiss").click(); // close request
  await open();
  await page.mouse.click(4, 4);
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await page.getByTestId("modal-close-icon").click();
  await closed();

  await open();
  await page.getByTestId("modal-nested-trigger").focus();
  await page.keyboard.press("Enter");
  const nested = page.getByTestId("nested-modal");
  await page.waitForFunction(() => document.querySelector('[data-testid="nested-modal"]').open);
  assert.equal(await nested.evaluate((n) => n.contains(document.activeElement)), true);
  assert.deepEqual(
    await nested.locator("[data-slot=modal-icon]").evaluate((n) => ({
      width: parseFloat(getComputedStyle(n).width),
      height: parseFloat(getComputedStyle(n).height),
    })),
    { width: 40, height: 40 },
  );
  await page.getByTestId("nested-close").click();
  assert.equal(await nested.evaluate((n) => n.open), false);
  assert.equal(await dialog.evaluate((n) => n.open), true);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), "hidden");
  assert.equal(
    await page.getByTestId("modal-nested-trigger").evaluate((n) => document.activeElement === n),
    true,
  );
  await canceled.click();
  await closed();

  for (const [width, size] of [
    [820, "lg"],
    [820, "xs"],
    [820, "sm"],
    [820, "cover"],
    [820, "full"],
    [820, "md"],
  ]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByTestId("modal-size").click();
    await open();
    assert.equal(await popup.getAttribute("data-size"), size);
    const bounds = await popup.boundingBox();
    const expected = { lg: 512, xs: 320, sm: 384, cover: 740, full: 820, md: 448 }[size];
    assert.ok(Math.abs(bounds.width - expected) < 1, `${size}: width ${bounds.width}`);
    await canceled.click();
    await closed();
  }
  for (const placement of ["top", "center", "bottom", "auto"]) {
    await page.getByTestId("modal-placement").click();
    await open();
    assert.equal(await popup.getAttribute("data-placement"), placement);
    const bounds = await popup.boundingBox();
    if (placement === "top") assert.equal(Math.round(bounds.y), 40);
    else if (placement === "bottom") assert.equal(Math.round(bounds.y + bounds.height), 804);
    else assert.ok(Math.abs(bounds.y + bounds.height / 2 - 422) < 1);
    await canceled.click();
    await closed();
  }
  for (const variant of ["blur", "transparent", "opaque"]) {
    await page.getByTestId("modal-backdrop").click();
    await open();
    const paint = await dialog.locator(':scope > [data-slot="modal-backdrop"]').evaluate((n) => ({
      bg: getComputedStyle(n).backgroundColor,
      blur: getComputedStyle(n).backdropFilter,
    }));
    if (variant === "transparent") assert.equal(paint.bg, "rgba(0, 0, 0, 0)");
    if (variant === "blur") assert.equal(paint.blur, "blur(12px)");
    await canceled.click();
    await closed();
  }
  await open();
  await page.getByTestId("modal-tall").click();
  assert.equal(await body.evaluate((n) => n.scrollHeight > n.clientHeight), true);
  await body.evaluate((n) => {
    n.scrollTop = n.scrollHeight;
  });
  assert.ok(await body.evaluate((n) => n.scrollTop > 0));
  await page.getByTestId("modal-scroll").click();
  const viewport = dialog.locator(':scope > [data-slot="modal-viewport"]');
  assert.equal(await viewport.evaluate((n) => n.scrollHeight > n.clientHeight), true);
  assert.equal(await body.evaluate((n) => getComputedStyle(n).overflowY), "visible");
  await page.getByTestId("modal-scroll").click();
  await page.getByTestId("modal-tall").click();
  await canceled.click();
  await closed();
  await page.setViewportSize({ width: 390, height: 844 });
  await open();
  const narrow = await popup.boundingBox();
  assert.equal(Math.round(narrow.y + narrow.height), 828);
  assert.equal(Math.round(narrow.width), 358);
  await page.getByTestId("modal-remove").click();
  assert.equal(await dialog.count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), lock.value);
  assert.equal(await trigger.evaluate((n) => document.activeElement === n), true);
  await page.getByTestId("modal-mount").click();
  await page.getByTestId("modal-open-action").click();
  assert.equal(await dialog.evaluate((n) => n.open), true);
  await canceled.click();
  await closed();
  await page.getByTestId("modal-disable").click();
  assert.equal(await trigger.isDisabled(), true);
  await trigger.evaluate((n) => n.click());
  assert.equal(await dialog.evaluate((n) => n.open), false);
  await page.getByTestId("modal-disable").click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open();
  assert.equal(await popup.evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
  assert.equal(await popup.evaluate((n) => n.getAnimations().length), 0);
  await canceled.click();
  await closed();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: 844 });
    for (const appearance of ["light", "dark"]) {
      if (!(await page.locator(`[data-theme="${appearance}"]`).count()))
        await page.getByTestId("theme").click();
      await open();
      await page.screenshot({
        path: path.resolve(
          import.meta.dirname,
          `../.cache/example/${engine}-modal-${appearance}-${width}.png`,
        ),
      });
      await canceled.click();
      await closed();
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const motion = await page.evaluate(async () => {
    const dialog = document.querySelector('[data-testid="settings-modal"]');
    const popup = document.querySelector('[data-testid="settings-modal-popup"]');
    const host = document.querySelector("#modal-examples");
    const original = host.getAttribute("style");
    host.style.transform = "translateZ(0)";
    host.style.overflow = "hidden";
    const sample = (duration, settle = false) =>
      new Promise((resolve) => {
        const start = performance.now();
        const frames = [];
        const frame = () => {
          const rect = dialog.getBoundingClientRect();
          frames.push({
            t: performance.now() - start,
            open: dialog.open,
            modal: dialog.matches(":modal"),
            display: getComputedStyle(dialog).display,
            opacity: Number(getComputedStyle(popup).opacity),
            starting: popup.hasAttribute("data-starting-style"),
            root: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          });
          const elapsed = performance.now() - start;
          const running = [...dialog.getAnimations(), ...popup.getAnimations()].some(
            (animation) => animation.playState === "running",
          );
          if (
            (elapsed >= duration &&
              (!settle || (!running && !popup.hasAttribute("data-starting-style")))) ||
            elapsed > duration + 2000
          )
            resolve(frames);
          else requestAnimationFrame(frame);
        };
        frame();
      });
    try {
      dialog.showModal();
      const enter = await sample(340, true);
      dialog.close();
      const exit = await sample(180, true);
      dialog.showModal();
      await sample(340, true);
      dialog.close();
      await sample(40);
      dialog.showModal();
      const reopen = await sample(340, true);
      dialog.close();
      await sample(180);
      return { overlay: CSS.supports("overlay", "auto"), enter, exit, reopen };
    } finally {
      if (dialog.open) dialog.close();
      if (original === null) host.removeAttribute("style");
      else host.setAttribute("style", original);
    }
  });
  await Bun.write(
    path.resolve(import.meta.dirname, `../.cache/example/${engine}-modal-motion.json`),
    JSON.stringify(motion, null, 2),
  );
  const enterAnimated = motion.enter.some((frame) => frame.opacity > 0 && frame.opacity < 1);
  const exitAnimated = motion.exit.some(
    (frame) => frame.display !== "none" && frame.opacity > 0 && frame.opacity < 1,
  );
  assert.equal(enterAnimated, true);
  assert.equal(motion.enter.at(-1).opacity, 1);
  assert.equal(motion.exit.at(-1).display, "none");
  assert.equal(motion.reopen.at(-1).open, true);
  assert.equal(motion.reopen.at(-1).opacity, 1);
  assert.equal(
    exitAnimated,
    motion.overlay,
    "exit only retains a native top layer when overlay transitions are supported",
  );
  for (const frame of motion.exit.filter((frame) => frame.display !== "none")) {
    assert.ok(
      Math.abs(frame.root.x) < 1 && Math.abs(frame.root.y) < 1,
      "exit stays in viewport coordinates under a transformed clipping ancestor",
    );
  }
  assert.equal(
    await page.evaluate(() => document.documentElement.style.getPropertyPriority("overflow")),
    lock.priority,
  );
  return {
    enterAnimated,
    exitAnimated,
    overlayTransitions: motion.overlay,
    entrySampleMs: motion.enter.at(-1).t,
    timingAcceptance: "not-qualified-performance-benchmark",
  };
}
