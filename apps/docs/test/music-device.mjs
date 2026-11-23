import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined });
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text) => {
            window.copiedAlbum = text;
          },
        },
      });
    });
    await page.goto(`${base}/en/device-lab?app=music`, { waitUntil: "domcontentloaded" });
    const inner = page.frameLocator('iframe[title="Inner display"]');
    const cover = page.frameLocator('iframe[title="Cover display"]');
    await inner.getByRole("heading", { name: "Home", exact: true }).waitFor({ timeout: 30000 });
    await page.locator("output").waitFor({ state: "hidden" });
    const rail = inner.getByRole("navigation", { name: "Music navigation" });
    assert.equal(
      await rail.getByRole("link", { name: "Home" }).getAttribute("aria-current"),
      "page",
    );
    await rail.locator('[aria-current="page"] [data-tab-bar-fallback]').waitFor();
    const checkRail = async (navigation) => {
      const bounds = await navigation.evaluate((nav) => {
        const main = nav.ownerDocument.querySelector("main").getBoundingClientRect();
        const { left, width, height } = nav.getBoundingClientRect();
        const current = nav.querySelector('[aria-current="page"]');
        const paint = current.querySelector("[data-tab-bar-fallback]").getBoundingClientRect();
        const hit = current.getBoundingClientRect();
        return {
          left,
          width,
          height,
          contentEnd: main.right,
          hitWidth: hit.width,
          hitHeight: hit.height,
          inset: [
            paint.left - hit.left,
            hit.right - paint.right,
            paint.top - hit.top,
            hit.bottom - paint.bottom,
          ],
        };
      });
      assert.ok(
        bounds.left >= bounds.contentEnd - 1 && bounds.height > bounds.width * 4,
        `Duo tabs stack vertically to the right of the content pane: ${JSON.stringify(bounds)}`,
      );
      assert.ok(bounds.hitWidth >= 44 && bounds.hitHeight >= 44);
      assert.ok(
        bounds.inset.every((gap) => gap >= 3.9),
        "Selection leaves space on all four sides",
      );
    };
    await checkRail(rail);
    const mini = inner.getByRole("region", { name: "Mini player" });
    const controls = await mini
      .getByRole("button")
      .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
    assert.deepEqual(controls, [
      "Shuffle",
      "Previous",
      "Play",
      "Next",
      "Repeat: Off",
      "Now Playing: Undertow, Marina Vale",
      "More options",
      "Lyrics",
      "Playing Next",
    ]);
    const miniShuffle = mini.getByRole("button", { name: "Shuffle", exact: true });
    await miniShuffle.click();
    assert.equal(await miniShuffle.getAttribute("aria-pressed"), "true");
    for (const mode of ["Off", "All"]) {
      await mini.getByRole("button", { name: `Repeat: ${mode}`, exact: true }).click();
    }
    if (process.env.MUSIC_SHOTS) {
      await page.mouse.move(20, 20);
      await page.screenshot({ path: `${process.env.MUSIC_SHOTS}-${engine.name()}-mini-modes.png` });
    }
    await mini.getByRole("button", { name: "Repeat: One", exact: true }).click();
    await miniShuffle.click();
    const miniMore = mini.getByRole("button", { name: "More options" });
    await miniMore.click();
    const goToAlbum = inner.getByRole("menuitem", { name: "Go to Album" });
    await goToAlbum.waitFor();
    if (process.env.MUSIC_SHOTS) {
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-mini-menu.png`,
        animations: "disabled",
      });
    }
    await goToAlbum.press("Escape");
    const miniDialog = inner.getByRole("dialog", { name: "Now Playing" });
    const lyrics = mini.getByRole("button", { name: "Lyrics", exact: true });
    await lyrics.click();
    await miniDialog.getByRole("heading", { name: "Lyrics", exact: true }).waitFor();
    await miniDialog.getByText("This instrumental preview has no lyrics.").waitFor();
    if (process.env.MUSIC_SHOTS) {
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-mini-lyrics.png`,
        animations: "disabled",
      });
    }
    await miniDialog.getByRole("button", { name: "Close Now Playing" }).click();
    assert.ok(await lyrics.evaluate((button) => button === button.ownerDocument.activeElement));
    await mini.getByRole("button", { name: "Playing Next", exact: true }).click();
    await miniDialog.getByRole("heading", { name: "Playing Next", exact: true }).waitFor();
    await miniDialog.getByRole("list", { name: "Playing next" }).waitFor();
    if (process.env.MUSIC_SHOTS) {
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-mini-queue.png`,
        animations: "disabled",
      });
    }
    await miniDialog.getByRole("button", { name: "Playing Next", exact: true }).click();
    await miniDialog.getByRole("button", { name: "Close Now Playing" }).click();
    await rail.getByRole("link", { name: "Library" }).click();
    await inner.getByRole("button", { name: "Songs", exact: true }).click();
    await inner.getByRole("heading", { name: "Songs", exact: true }).waitFor();
    await rail.getByRole("link", { name: "Home" }).click();
    await inner.getByRole("heading", { name: "Home", exact: true }).waitFor();
    if (process.env.MUSIC_SHOTS) {
      await inner.getByRole("main").evaluate(async (main) => {
        const images = [...main.querySelectorAll("img")].filter((image) => {
          const box = image.getBoundingClientRect();
          const screen = main.getBoundingClientRect();
          return box.left < screen.right && box.top < screen.bottom;
        });
        await Promise.all(images.map((image) => image.decode()));
      });
      await page.screenshot({ path: `${process.env.MUSIC_SHOTS}-${engine.name()}-home.png` });
    }
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    const coverRail = cover.getByRole("navigation", { name: "Music navigation" });
    await coverRail.getByRole("link", { name: "Home", exact: true }).click({ trial: true });
    await checkRail(coverRail);
    assert.equal(
      await cover.getByRole("region", { name: "Mini player" }).getByRole("button").count(),
      3,
    );
    if (process.env.MUSIC_SHOTS) {
      await page.screenshot({ path: `${process.env.MUSIC_SHOTS}-${engine.name()}-cover-home.png` });
    }
    await coverRail.getByRole("link", { name: "Search", exact: true }).press("Enter");
    await cover.getByRole("searchbox", { name: "Search music" }).waitFor();
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await inner.getByRole("link", { name: "Search" }).click();
    await inner.getByRole("searchbox", { name: "Search music" }).fill("Neon Platform");
    await inner
      .getByRole("button", { name: /Neon Platform.*Kei Moreno/ })
      .first()
      .click();
    await page.waitForFunction(
      () => {
        const audio = document.querySelector("audio");
        return audio && !audio.paused && audio.currentTime > 0;
      },
      undefined,
      { timeout: 10000 },
    );
    const audio = await page.locator("audio").elementHandle();
    assert.equal(await inner.locator("audio").count(), 0);
    assert.equal(await cover.locator("audio").count(), 0);
    await inner.getByRole("button", { name: /^Now Playing: Neon Platform/ }).click();
    const widePlayer = inner.getByRole("dialog", { name: "Now Playing" });
    const wideQueue = widePlayer.getByRole("button", { name: "Playing Next" });
    await wideQueue.click();
    const shuffle = widePlayer.getByRole("button", { name: "Shuffle", exact: true });
    await shuffle.click();
    assert.equal(await shuffle.getAttribute("aria-pressed"), "true");
    await shuffle.click();
    await widePlayer.getByRole("button", { name: "Repeat: Off", exact: true }).click();
    await widePlayer.getByRole("button", { name: "Repeat: All", exact: true }).click();
    await wideQueue.click();
    await shuffle.waitFor({ state: "hidden" });
    if (process.env.MUSIC_SHOTS) {
      await widePlayer.evaluate(async (dialog) => {
        await Promise.all([...dialog.querySelectorAll("img")].map((image) => image.decode()));
        await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
      });
      await page.screenshot({ path: `${process.env.MUSIC_SHOTS}-${engine.name()}-playing.png` });
    }
    const position = inner.getByRole("slider", { name: "Playback position" });
    await position.press("PageUp");
    await page.waitForFunction((node) => !node.seeking && node.currentTime >= 10, audio, {
      timeout: 4000,
    });
    const before = Number(await position.inputValue());
    assert.ok(before >= 10);
    const beforeFold = await audio.evaluate((node) => node.currentTime);
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    const coverPosition = cover.getByRole("slider", { name: "Playback position" });
    await coverPosition.waitFor();
    assert.ok(
      await audio.evaluate(
        (node, time) => node.isConnected && !node.paused && node.currentTime > time,
        beforeFold,
      ),
      "The same audio element advances through the hinge transition",
    );
    const coverQueue = cover.getByRole("button", { name: "Playing Next" });
    await coverQueue.click();
    await cover.getByRole("button", { name: "Repeat: One", exact: true }).click();
    await coverQueue.click();
    await cover
      .getByRole("dialog", { name: "Now Playing" })
      .getByRole("button", { name: "Pause", exact: true })
      .click();
    assert.ok(await audio.evaluate((node) => node.paused));
    await cover
      .getByRole("dialog", { name: "Now Playing" })
      .getByRole("button", { name: "Play", exact: true })
      .click();
    await page.waitForFunction((node) => !node.paused, audio);
    await cover
      .getByRole("dialog", { name: "Now Playing" })
      .getByRole("button", { name: "Pause", exact: true })
      .click();
    assert.ok(Number(await coverPosition.inputValue()) >= before);
    await cover.getByRole("button", { name: "Add to Favorites", exact: true }).click();
    if (process.env.MUSIC_SHOTS) {
      await cover.getByRole("dialog", { name: "Now Playing" }).evaluate(async (dialog) => {
        for (const image of dialog.querySelectorAll("img")) await image.decode();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-cover.png`,
      });
    }
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    await page.locator("output").waitFor({ state: "hidden" });
    await inner.getByRole("button", { name: "Remove from Favorites", exact: true }).waitFor();
    const close = inner.getByRole("button", { name: "Close Now Playing" });
    await close.click({ trial: true });
    await close.press("Escape");
    await close.waitFor({ state: "hidden" });
    await inner.getByRole("searchbox", { name: "Search music" }).waitFor();
    assert.equal(
      await inner.getByRole("searchbox", { name: "Search music" }).inputValue(),
      "Neon Platform",
    );
    await inner.getByRole("link", { name: "Library", exact: true }).click();
    await inner.getByRole("button", { name: "Albums", exact: true }).click();
    const background = (display) =>
      display.getByRole("main").evaluate((main) => {
        const scope = main.closest("[data-theme]");
        const color = getComputedStyle(scope).backgroundColor;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const context = canvas.getContext("2d");
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
      });
    const libraryBackground = await background(inner);
    await inner.getByRole("button", { name: "Night Transit Kei Moreno" }).click();
    await inner.getByRole("heading", { name: "Night Transit", exact: true }).waitFor();
    const nightBackground = await background(inner);
    assert.ok(nightBackground[2] > nightBackground[0], "Night Transit has a cool blue backdrop");
    await inner.getByRole("button", { name: "Back", exact: true }).click();
    await inner.getByRole("heading", { name: "Albums", exact: true }).waitFor();
    assert.deepEqual(await background(inner), libraryBackground, "Back restores the library theme");
    await inner.getByRole("button", { name: "Low Tide Letters Marina Vale" }).click();
    await inner.getByRole("heading", { name: "Low Tide Letters", exact: true }).waitFor();
    const lowTideBackground = await background(inner);
    assert.ok(lowTideBackground[0] > lowTideBackground[2], "Low Tide Letters has a warm backdrop");
    for (const [display, folded] of [
      [inner, false],
      [cover, true],
    ]) {
      if (folded) await page.getByRole("button", { name: "Fold", exact: true }).click();
      const heading = display.getByRole("heading", { name: "Low Tide Letters", exact: true });
      const main = display.getByRole("main");
      const play = main.getByRole("button", { name: "Play", exact: true });
      const shuffleAlbum = main.getByRole("button", { name: "Shuffle", exact: true });
      await shuffleAlbum.click({ trial: true });
      assert.deepEqual(
        await background(display),
        lowTideBackground,
        "Both displays use the same palette",
      );
      const status = display.getByRole("complementary", { name: "Simulated device status" });
      assert.match(await status.locator("time").textContent({ timeout: 3000 }), /^\d{2}:\d{2}$/);
      const shareAlbum = display.getByRole("button", { name: "Share album", exact: true });
      const options = display.getByRole("button", { name: "Album options", exact: true });
      const [clock, back, share, more] = await Promise.all([
        status.boundingBox(),
        display.getByRole("button", { name: "Back", exact: true }).boundingBox(),
        shareAlbum.boundingBox(),
        options.boundingBox(),
      ]);
      const column = [clock, back, share, more];
      assert.ok(column.every((item, index) => index === 0 || item.y > column[index - 1].y));
      assert.ok(
        column.every(({ x, width }) => Math.abs(x + width / 2 - clock.x - clock.width / 2) < 12),
      );
      const [playBox, shuffleBox] = await Promise.all([
        play.boundingBox(),
        shuffleAlbum.boundingBox(),
      ]);
      assert.ok(
        shuffleBox.x + shuffleBox.width < playBox.x && playBox.width > shuffleBox.width * 2,
        "The icon-only Shuffle sits before a wider Play button",
      );
      assert.equal((await shuffleAlbum.textContent()).trim(), "");
      const songs = display.getByRole("list", { name: "Songs" });
      const firstTrack = songs.getByRole("button", { name: /Postcards from the Shore/ });
      const rowHeight = await firstTrack.evaluate(
        (button) => button.getBoundingClientRect().height,
      );
      assert.ok(
        rowHeight >= 44 && rowHeight < 48,
        `Compact track row keeps a 44px hit target: ${rowHeight}`,
      );
      const title = await heading.boundingBox();
      const list = await songs.boundingBox();
      assert.ok(
        folded
          ? list.y > title.y + title.height && list.x < title.x
          : list.x > title.x + title.width && list.y < title.y,
        `Album tracks ${folded ? "stack below" : "sit beside"} the album information`,
      );
      if (process.env.MUSIC_SHOTS) {
        await display
          .getByRole("main")
          .locator("img")
          .first()
          .evaluate((image) => image.decode());
        await page.mouse.move(20, 20);
        await page.screenshot({
          path: `${process.env.MUSIC_SHOTS}-${engine.name()}-${folded ? "cover-album" : "album"}.png`,
        });
      }
      await options.click();
      const libraryAction = display.getByRole("menuitem", { name: "Remove from Library" });
      await libraryAction.waitFor();
      await libraryAction.press("Escape");
      await libraryAction.waitFor({ state: "hidden" });
      await shareAlbum.click();
      const copied = display.getByText("Album details copied", { exact: true });
      await copied.waitFor();
      assert.equal(
        await copied.evaluate(() => window.copiedAlbum),
        "Low Tide Letters · Marina Vale",
      );
      // macOS WebKit uses Option-Tab to include buttons in keyboard navigation.
      await shuffleAlbum.press(
        engine.name() === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab",
      );
      assert.ok(await play.evaluate((button) => button === button.ownerDocument.activeElement));
      await main.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await songs.getByRole("button").last().click({ trial: true });
      await main.evaluate((node) => {
        node.scrollTop = 0;
      });
    }
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    const preview = "**/assets/demo/music/0.mp3";
    await page.route(preview, (route) => route.abort());
    await inner.getByRole("main").getByRole("button", { name: "Play", exact: true }).click();
    await inner.getByRole("button", { name: /^Now Playing: Postcards from the Shore/ }).click();
    const player = inner.getByRole("dialog", { name: "Now Playing" });
    await player.getByText("Couldn’t play preview").waitFor();
    if (process.env.MUSIC_SHOTS)
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-error.png`,
        animations: "disabled",
      });
    await page.unroute(preview);
    await player.getByRole("button", { name: "Play", exact: true }).click();
    await page.waitForFunction((node) => !node.paused && node.currentTime > 0, audio);
    await player.getByRole("button", { name: "Playing Next" }).click();
    await player.getByRole("button", { name: /Salt in the Seams/ }).waitFor();
    if (process.env.MUSIC_SHOTS)
      await page.screenshot({ path: `${process.env.MUSIC_SHOTS}-${engine.name()}-queue.png` });
    await audio.evaluate((node) => {
      node.currentTime = node.duration - 0.25;
    });
    await player.getByText("Salt in the Seams", { exact: true }).waitFor();
    await page.waitForFunction((node) => !node.paused && node.currentSrc.endsWith("/1.mp3"), audio);
    await player.getByRole("button", { name: "Close Now Playing" }).click();
    const activeTrack = inner
      .getByRole("list", { name: "Songs" })
      .getByRole("button", { name: /Salt in the Seams/ });
    assert.equal(await activeTrack.getAttribute("aria-current"), "true");
    assert.equal(await activeTrack.getByText("2", { exact: true }).count(), 0);
    assert.ok(
      await activeTrack.evaluate((row) =>
        row.getAnimations({ subtree: true }).some((animation) => animation.playState === "running"),
      ),
    );
    if (process.env.MUSIC_SHOTS) {
      await inner.locator('dialog[aria-label="Now Playing"]').waitFor({ state: "hidden" });
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-track-playing.png`,
      });
    }
    await inner.getByRole("button", { name: /^Now Playing: Salt in the Seams/ }).click();
    await player.getByRole("button", { name: "Pause", exact: true }).click();
    await player.getByRole("button", { name: "Close Now Playing" }).click();
    assert.equal(await activeTrack.getAttribute("aria-current"), "true");
    assert.ok(
      await activeTrack.evaluate((row) =>
        row
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState !== "running"),
      ),
    );
    await page.getByRole("button", { name: "Fold", exact: true }).click();
    const foldedTrack = cover
      .getByRole("list", { name: "Songs" })
      .getByRole("button", { name: /Salt in the Seams/ });
    await foldedTrack.waitFor();
    assert.equal(await foldedTrack.getAttribute("aria-current"), "true");
    if (process.env.MUSIC_SHOTS) {
      const coverMain = cover.getByRole("main");
      await coverMain.evaluate((main) => {
        main.scrollTop = main.scrollHeight;
      });
      await foldedTrack.click({ trial: true });
      await page.screenshot({
        path: `${process.env.MUSIC_SHOTS}-${engine.name()}-track-paused-cover.png`,
      });
      await coverMain.evaluate((main) => {
        main.scrollTop = 0;
      });
    }
    await page.getByRole("button", { name: "Unfold", exact: true }).click();
    const albumShuffle = inner
      .getByRole("main")
      .getByRole("button", { name: "Shuffle", exact: true });
    await albumShuffle.click({ trial: true });
    await albumShuffle.press("Enter");
    await page.waitForFunction(
      (node) => !node.paused && /\/[0-5]\.mp3$/.test(node.currentSrc),
      audio,
    );
    await inner.getByRole("button", { name: /^Now Playing:/ }).click();
    await player.getByText("From Low Tide Letters", { exact: true }).waitFor();
    assert.equal(
      await player
        .getByRole("button", { name: "Shuffle", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await player.getByRole("button", { name: "Close Now Playing" }).click();
    await inner.getByRole("button", { name: "Back", exact: true }).click();
    await inner.getByRole("heading", { name: "Albums", exact: true }).waitFor();
    await inner.getByRole("button", { name: "Back", exact: true }).click();
    await inner.getByRole("heading", { name: "Library", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(
      `${engine.name()}: album actions, playback, fold handoff, recovery, queue and Back passed`,
    );
  } finally {
    await browser.close();
  }
}
