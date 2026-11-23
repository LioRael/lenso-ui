import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:4310";
const shots = process.env.TEMPLATES_SHOTS;
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
      reducedMotion: "reduce",
    });
    page.setDefaultTimeout(45000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/en/docs/react/templates/photos`, { waitUntil: "networkidle" });
    const galleryPath = "/en/docs/react/templates";
    await page
      .getByRole("link", { name: "Templates", exact: true })
      .and(page.locator(`a[href="${galleryPath}"]`))
      .first()
      .click({ timeout: 8000 });
    await page.getByRole("heading", { name: "Templates", exact: true }).waitFor();
    const gallery = page.getByRole("region", { name: "App templates" });
    assert.equal(await gallery.locator("canvas, iframe").count(), 0);
    for (const app of ["Photos", "Music"]) {
      const id = app.toLowerCase();
      assert.equal(
        await gallery.getByRole("link", { name: `Open ${app} on the web` }).getAttribute("href"),
        `/en/${id}`,
      );
      assert.equal(
        await gallery.getByRole("link", { name: `${app} documentation` }).getAttribute("href"),
        `${galleryPath}/${id}`,
      );
    }
    if (shots && engine === chromium) await page.screenshot({ path: `${shots}-overview.png` });
    const preview = page.getByRole("region", { name: "Duo preview" });
    const inner = preview.frameLocator('iframe[title="Inner display"]');
    const cover = preview.frameLocator('iframe[title="Cover display"]');
    const photos = gallery.getByRole("button", { name: "Preview Photos in Duo" });
    const music = gallery.getByRole("button", { name: "Preview Music in Duo" });
    await photos.focus();
    await photos.press("Enter");
    await photos.and(page.locator('[aria-pressed="true"]')).waitFor();
    const fold = preview.getByRole("button", { name: "Fold", exact: true });
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor();
    await fold.click();
    await cover.getByRole("heading", { name: "Library", exact: true }).waitFor();
    await preview.getByRole("button", { name: "Unfold", exact: true }).click();
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor();
    const angle = preview.getByRole("slider", { name: "Hinge angle" });
    assert.equal(await angle.getAttribute("aria-valuetext"), "180°");
    await angle.press("Home");
    await cover.getByRole("heading", { name: "Library", exact: true }).waitFor();
    assert.equal(await angle.getAttribute("aria-valuetext"), "0°");
    await angle.press("ArrowRight");
    assert.equal(await angle.getAttribute("aria-valuetext"), "1°");
    await angle.press("End");
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor();

    const flip = preview.getByRole("button", { name: "Flip device" });
    const reset = preview.getByRole("button", { name: "Reset view" });
    await flip.press("Enter");
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor({ state: "hidden" });
    const coverFrame = preview.locator('iframe[title="Cover display"]');
    assert.equal(
      await coverFrame.evaluate((node) => getComputedStyle(node).visibility),
      "hidden",
      "The cover display sleeps when the open Duo is viewed from the back",
    );
    if (shots && engine === chromium) await preview.screenshot({ path: `${shots}-flipped.png` });
    await flip.click();
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor();

    const screen = preview.locator('iframe[title="Inner display"]');
    const transform = () => screen.evaluate((node) => node.parentElement.style.transform);
    const front = await transform();
    const spin = preview.getByRole("button", { name: "Auto-rotate" });
    await spin.click();
    await spin.and(page.locator('[aria-pressed="true"]')).waitFor();
    await page.waitForFunction(
      (pose) =>
        document.querySelector('iframe[title="Inner display"]').parentElement.style.transform !==
        pose,
      front,
    );
    if (shots && engine === chromium) await preview.screenshot({ path: `${shots}-rotating.png` });
    await spin.click();
    const stopped = await transform();
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(await transform(), stopped, "Turning auto-rotate off stops changing the view");
    await reset.click();
    const matrix = (value) => value.slice(7, -1).split(",").map(Number);
    const original = matrix(front);
    assert.ok(matrix(await transform()).every((value, i) => Math.abs(value - original[i]) < 0.001));
    assert.equal(await angle.getAttribute("aria-valuetext"), "180°");
    const [thumb, readout] = await Promise.all([
      preview.locator('[data-lenso-slot="slider-thumb"]').boundingBox(),
      preview.getByText("180°", { exact: true }).boundingBox(),
    ]);
    assert.ok(
      thumb.x + thumb.width < readout.x,
      "The slider thumb clears the angle readout at 180°",
    );
    if (shots && engine === chromium) await preview.screenshot({ path: `${shots}-controls.png` });
    if (shots && engine === chromium) await page.screenshot({ path: `${shots}-photos.png` });
    await music.click();
    await inner.getByRole("heading", { name: "Home", exact: true }).waitFor();
    await preview.getByRole("button", { name: "Fold", exact: true }).click();
    await cover.getByRole("heading", { name: "Home", exact: true }).waitFor();
    assert.equal(await preview.locator("canvas").count(), 1);
    assert.ok(
      (
        await preview
          .locator("iframe")
          .evaluateAll((frames) => frames.map((frame) => new URL(frame.src).pathname))
      ).every((path) => path === "/en/music"),
    );
    if (shots && engine === chromium) await page.screenshot({ path: `${shots}-music.png` });
    await music.press("Space");
    await preview.locator("canvas, iframe").first().waitFor({ state: "detached" });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/cn/docs/react/templates`, { waitUntil: "networkidle" });
    const chinese = page.getByRole("region", { name: "应用模板" });
    await chinese.getByRole("link", { name: "在网页打开音乐" }).waitFor();
    assert.ok(await chinese.evaluate((node) => node.getBoundingClientRect().right <= innerWidth));
    if (shots && engine === chromium) await page.screenshot({ path: `${shots}-mobile.png` });
    const mobilePreview = chinese.getByRole("region", { name: "Duo 预览" });
    await chinese.getByRole("button", { name: "在 Duo 中体验音乐" }).click();
    const mobileFold = mobilePreview.getByRole("button", { name: "折叠", exact: true });
    await mobileFold.click();
    await mobilePreview
      .frameLocator('iframe[title="Cover display"]')
      .getByRole("heading", { name: "Home", exact: true })
      .waitFor();
    if (shots && engine === chromium)
      await mobilePreview.screenshot({ path: `${shots}-mobile-duo.png` });
    await chinese.getByRole("link", { name: "在网页打开音乐" }).click();
    await page.waitForURL("**/cn/music");
    await page.getByRole("heading", { name: "Home", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(
      `${engine.name()}: Templates navigation, on-demand Duo, app switching and web entry passed`,
    );
  } finally {
    await browser.close();
  }
}
