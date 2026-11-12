import assert from "node:assert/strict";
export async function checkRefresh(page) {
  const root = page.getByTestId("refresh-sample"),
    trigger = page.getByTestId("refresh-sample-trigger"),
    count = page.getByTestId("refresh-count");
  const phase = async (expected) => {
    await page.waitForFunction(
      (v) => document.getElementById("refresh-sample")?.dataset.state === v,
      expected,
    );
  };
  const tally = async () => Number(await count.textContent());
  const status = page.getByTestId("refresh-sample-status");
  const content = page.getByTestId("refresh-sample-content");
  const viewport = page.getByTestId("refresh-sample-viewport");
  await phase("idle");
  assert.equal(await content.evaluate((n) => getComputedStyle(n).transitionDuration), "0.18s");
  assert.equal(await status.getAttribute("role"), "status");
  assert.equal(await status.getAttribute("aria-live"), "polite");
  assert.equal(await status.getAttribute("aria-atomic"), "true");
  assert.equal(await trigger.evaluate((n) => n.tagName), "BUTTON");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await phase("refreshing");
  assert.equal(await tally(), 1);
  assert.equal(await trigger.isDisabled(), true);
  assert.equal(await root.getAttribute("aria-busy"), "true");
  await trigger.evaluate((n) => {
    n.click();
    n.click();
  });
  assert.equal(await tally(), 1);
  assert.equal(await status.textContent(), "Refreshing entries");
  await phase("complete");
  assert.equal(await status.textContent(), "Entries updated");
  assert.equal(await trigger.isDisabled(), false);
  await page.getByTestId("refresh-failure").click();
  await trigger.click();
  await phase("error");
  assert.equal(await tally(), 2);
  assert.equal(await page.getByTestId("refresh-sample-error").isVisible(), true);
  assert.equal(await status.textContent(), "Could not refresh. Try again.");
  await page.getByTestId("refresh-failure").click();
  await page.getByTestId("refresh-manual").click();
  await trigger.evaluate((n) => {
    n.click();
    n.click();
  });
  await phase("refreshing");
  assert.equal(await tally(), 3, "synchronous repeat clicks request one operation");
  await page.getByTestId("refresh-disabled").click();
  await page.getByTestId("refresh-complete").click();
  await phase("complete");
  assert.equal(
    await trigger.isDisabled(),
    true,
    "disabling does not cancel the owner's pending result",
  );
  const disabledCount = await tally();
  await trigger.evaluate((n) => n.click());
  assert.equal(await tally(), disabledCount);
  await page.getByTestId("refresh-disabled").click();
  await phase("idle");
  await page.getByTestId("refresh-rejected").click();
  await trigger.click();
  await phase("idle");
  assert.equal(
    await tally(),
    disabledCount,
    "rejected requests reconcile to controlled operation state",
  );
  await page.getByTestId("refresh-rejected").click();

  const touch = async (type, x, y, options = {}) => {
    return await viewport.evaluate(
      (n, { type, x, y, options }) => {
        const target = options.target
          ? n.querySelector(options.target)
          : n.querySelector('[data-slot="refresh-control-content"]');
        const t = { identifier: 7, target, clientX: x, clientY: y };
        const touches = type === "touchend" || type === "touchcancel" ? [] : [t];
        if (options.multi) touches.push({ identifier: 8, target, clientX: x + 2, clientY: y });
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
          touches: { value: touches },
          changedTouches: { value: [t] },
          targetTouches: { value: touches },
        });
        if (options.prevented) event.preventDefault();
        return target.dispatchEvent(event);
      },
      { type, x, y, options },
    );
  };
  const resetScroll = async () =>
    viewport.evaluate((n) => {
      n.scrollTop = 0;
    });
  await resetScroll();
  await touch("touchstart", 0, 0);
  await touch("touchmove", 0, 60);
  await phase("pulling");
  assert.equal(await status.textContent(), "", "partial pulls do not chatter in the live region");
  assert.equal(await content.evaluate((n) => n.style.transform), "translateY(30px)");
  assert.equal(await content.evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
  await touch("touchmove", 0, 300);
  await phase("armed");
  assert.equal(await content.evaluate((n) => n.style.transform), "translateY(112px)");
  assert.equal(await status.textContent(), "Release to refresh");
  await touch("touchcancel", 0, 300);
  await phase("idle");
  assert.equal(await tally(), disabledCount, "cancel never commits");
  // The trailing native link click must be suppressed before Exact's document router.
  const suppressed = await content.evaluate((n) => {
    const a = document.createElement("a");
    a.href = "#refresh-should-not-navigate";
    n.append(a);
    const result = a.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
    );
    a.remove();
    return result;
  });
  assert.equal(suppressed, false);
  assert.equal(new URL(page.url()).hash, "");
  await touch("touchstart", 0, 0);
  await touch("touchmove", 0, 144);
  await touch("touchend", 0, 144);
  await phase("refreshing");
  assert.equal(await tally(), disabledCount + 1);
  assert.equal(await content.evaluate((n) => n.style.transform), "translateY(56px)");
  await touch("touchstart", 0, 0);
  await touch("touchmove", 0, 200);
  await touch("touchend", 0, 200);
  assert.equal(await tally(), disabledCount + 1, "busy pulls cannot start a second operation");
  await page.getByTestId("refresh-complete").click();
  await phase("complete");
  for (const mode of [
    "horizontal",
    "up",
    "multi",
    "prevented",
    "scrolled",
    "input",
    "list",
    "swipe",
  ]) {
    await resetScroll();
    let options = {};
    if (mode === "scrolled") await viewport.evaluate((n) => (n.scrollTop = 50));
    if (mode === "input") options.target = "input:not([type=hidden])";
    if (["list", "swipe"].includes(mode)) {
      await content.evaluate((n, mode) => {
        const b = document.createElement("button");
        b.id = "refresh-excluded";
        b.dataset.slot = mode === "list" ? "list-reorder" : "swipe-action";
        n.append(b);
      }, mode);
      options.target = "#refresh-excluded";
    }
    await touch("touchstart", 0, 0, options);
    await touch("touchmove", mode === "horizontal" ? 200 : 0, mode === "up" ? -200 : 200, {
      ...options,
      multi: mode === "multi",
      prevented: mode === "prevented",
    });
    await touch("touchend", 0, 200, options);
    assert.notEqual(await root.getAttribute("data-state"), "refreshing", mode);
    assert.equal(await tally(), disabledCount + 1, mode);
    await content
      .locator("#refresh-excluded")
      .evaluateAll((nodes) => nodes.forEach((n) => n.remove()));
  }
  await resetScroll();
  await touch("touchstart", 0, 0);
  await touch("touchmove", 0, 160);
  await phase("armed");
  await page.getByTestId("refresh-disabled").click();
  await phase("idle");
  await touch("touchend", 0, 160);
  assert.equal(await tally(), disabledCount + 1);
  await page.getByTestId("refresh-disabled").click();
  await page.getByTestId("refresh-draft").fill("Preserved across refresh");
  await trigger.click();
  await phase("refreshing");
  assert.equal(await page.getByTestId("refresh-draft").inputValue(), "Preserved across refresh");
  const retired = await viewport.elementHandle();
  await page.getByTestId("refresh-visible").click();
  assert.equal(await root.count(), 0);
  assert.equal(
    await retired.evaluate((n) => {
      // Make a leaked listener eligible; the removed node's old busy state must not mask cleanup failure.
      n.closest('[data-slot="refresh-control"]').dataset.lensoMode = "idle";
      n.scrollTop = 0;
      const t = { identifier: 7, target: n, clientX: 0, clientY: 0 };
      const event = (type, touch) => {
        const e = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(e, {
          touches: { value: [touch] },
          changedTouches: { value: [touch] },
        });
        return e;
      };
      n.dispatchEvent(event("touchstart", t));
      return n.dispatchEvent(event("touchmove", { ...t, clientY: 200 }));
    }),
    true,
    "removed viewport releases its cancelable gesture handler",
  );
  await retired.dispose();
  await page.getByTestId("refresh-visible").click();
  await phase("idle");
  await trigger.click();
  await phase("refreshing");
  await page.getByTestId("refresh-error").click();
  await phase("error");
  await trigger.click();
  await phase("refreshing");
  await page.getByTestId("refresh-complete").click();
  await phase("complete");
  const completedCount = await tally();
  await page.getByTestId("refresh-instant").click();
  await trigger.focus();
  await page.keyboard.press("Space");
  await phase("complete");
  assert.equal(await tally(), completedCount + 1);
  await trigger.click();
  await phase("complete");
  assert.equal(
    await tally(),
    completedCount + 2,
    "generation acknowledges repeated synchronous completion",
  );
  await page.getByTestId("refresh-instant").click();
  await page.getByTestId("refresh-manual").click();
  await trigger.click();
  await phase("refreshing");
  const timedCount = await tally();
  await page.getByTestId("refresh-visible").click();
  await page.getByTestId("refresh-visible").click();
  await phase("idle");
  await page.waitForTimeout(700);
  assert.equal(
    await root.getAttribute("data-state"),
    "idle",
    "owner cancels the old deadline on unmount",
  );
  assert.equal(await tally(), timedCount);
  await page.getByTestId("refresh-manual").click();
  await trigger.click();
  await phase("refreshing");
  await page.getByTestId("refresh-complete").click();
  await phase("complete");
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await content.evaluate((n) => getComputedStyle(n).transitionDuration), "0s");
  return {
    syntheticTouch: "pull, armed, cancel, top, exclusions and lifecycle",
    async: "timed success/failure, retry, busy, rejection, disabled completion",
    manual: true,
  };
}
