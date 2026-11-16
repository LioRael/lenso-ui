import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Resolve the existing docs browser tooling, never add it to the packed consumer.
const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.argv[2];
assert(base, "Pass the isolated consumer preview URL");

for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const started = performance.now();
  const errors = [];
  const browser = await engine.launch().catch((cause) => {
    throw new Error(
      `${name}: run 'bun run --cwd apps/docs playwright install --with-deps chromium webkit' to install browsers`,
      { cause },
    );
  });
  let page;
  try {
    page = await browser.newPage({ reducedMotion: "reduce", colorScheme: "light" });
    page.setDefaultTimeout(10000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("requestfailed", (request) =>
      errors.push(`${request.url()}: ${request.failure()?.errorText}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(base);
    assert.equal(
      await page.getByTestId("installed-glass").evaluate((node) => getComputedStyle(node).width),
      "180px",
      "Installed consumer's extracted dynamic StyleX width must reach the browser",
    );
    await page.getByRole("button", { name: "Open installed modal", exact: true }).click();
    await page.getByRole("dialog", { name: "Installed package dialog" }).waitFor();
    await page.getByRole("button", { name: "Close installed modal", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Installed package dialog" })
      .waitFor({ state: "hidden" });

    // Delay only the entry's execution so the SSR node can be saved before hydration.
    await page.route("**/hydrate.html", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: (await response.text()).replace(
          'type="module"',
          'type="application/installed-hydration"',
        ),
      });
    });
    await page.goto(`${base}/hydrate.html`);
    const serverButton = await page
      .getByRole("button", { name: "Change installed theme" })
      .elementHandle();
    assert(serverButton, "SSR must supply the theme button before JavaScript");
    await page.evaluate(async () => {
      const script = document.querySelector('script[type="application/installed-hydration"]');
      await import(script.src);
    });
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    assert(
      await serverButton.evaluate((node) => node.isConnected),
      "Hydration replaced the SSR button",
    );
    await page.getByRole("button", { name: "Open hydrated modal", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Hydrated package dialog" });
    await dialog.waitFor();
    // Native SDK dialogs remain in their local DOM scope in the top layer.
    // Inspect the visible dialog itself, not ThemeScope's unused portal host.
    assert.equal(
      await dialog.evaluate((node) => node.closest("[data-theme]")?.getAttribute("data-theme")),
      "dark",
    );
    assert.equal(await dialog.evaluate((node) => getComputedStyle(node).colorScheme), "dark");
    assert.equal(
      await dialog.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--installed-theme-probe").trim(),
      ),
      "17px",
    );
    await page.getByRole("button", { name: "Close hydrated modal", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Change installed theme" }).click();
    await page.getByRole("button", { name: "Open hydrated modal", exact: true }).click();
    await dialog.waitFor();
    assert.equal(
      await dialog.evaluate((node) => node.closest("[data-theme]")?.getAttribute("data-theme")),
      "light",
    );
    assert.equal(await dialog.evaluate((node) => getComputedStyle(node).colorScheme), "light");
    assert.equal(
      await dialog.evaluate((node) =>
        getComputedStyle(node).getPropertyValue("--installed-theme-probe").trim(),
      ),
      "29px",
    );
    await page.getByRole("button", { name: "Close hydrated modal", exact: true }).click();
    await dialog.waitFor({ state: "hidden" });
    assert.deepEqual(errors, [], `${name}: production consumer browser errors`);
    console.log(
      `${name}: installed consumer mount, modal, hydration and local dialog theme passed (${Math.round(performance.now() - started)}ms)`,
    );
  } catch (cause) {
    const artifacts = process.env.BROWSER_ARTIFACTS;
    if (artifacts && page) {
      try {
        await mkdir(artifacts, { recursive: true });
        const prefix = join(artifacts, `installed-consumer-${name}`);
        await writeFile(
          `${prefix}.json`,
          JSON.stringify({ url: page.url(), errors, failure: String(cause) }, null, 2),
        );
        await writeFile(`${prefix}.html`, await page.content());
        await page.screenshot({ path: `${prefix}.png`, fullPage: true, timeout: 5000 });
        console.error(`${name}: failure evidence saved to ${prefix}.{json,html,png}`);
      } catch (diagnosticError) {
        console.error(`${name}: could not save failure evidence`, diagnosticError);
      }
    }
    throw new Error(`${name}: installed production consumer failed\n${errors.join("\n")}`, {
      cause,
    });
  } finally {
    await browser.close();
  }
}
