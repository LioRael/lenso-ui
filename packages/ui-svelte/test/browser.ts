import { verifyAdapterParity } from "../../../tests/consumer/adapter-parity.ts";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { createAgent } from "@ui-sdk/svelte/agent";
import { chromium, webkit, type Page } from "playwright";

const directory = process.cwd();
const require = createRequire(join(directory, "package.json"));
const { createServer, preview } = (await import(require.resolve("vite"))) as typeof import("vite");
const { renderApp } = await import(pathToFileURL(join(directory, "out/server/server.js")).href);
const template = await readFile(join(directory, "out/client/index.html"), "utf8");
const html = template.replace("<!--ssr-->", renderApp());
assert.match(html, /aria-checked="true"/);
assert.match(html, /data-lenso-slot="button"/);
await writeFile(join(directory, "out/client/index.html"), html);

async function verify(page: Page, url: string) {
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(45_000);
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "warning" && /hydrat/i.test(message.text()))
      problems.push(message.text());
  });

  await page.goto(url);
  await page.waitForFunction(() => "agent" in window, undefined, { timeout: 45_000 });
  const save = page.getByRole("button", { name: "Save preferences" });
  const presentation = await save.evaluate((button) => ({
    className: button.className,
    background: getComputedStyle(button).backgroundColor,
    radius: getComputedStyle(button).borderRadius,
    inlineStyle: button.getAttribute("style"),
  }));
  assert.match(presentation.className, /save-action/);
  assert.ok(parseFloat(presentation.radius) > 0, JSON.stringify(presentation));
  assert.match(presentation.inlineStyle ?? "", /#7357dd/);
  assert.notEqual(presentation.background, "rgba(0, 0, 0, 0)");

  const output = page.getByLabel("Current preferences");
  await page.getByRole("textbox", { name: "Email" }).fill("user@example.test");
  await page.getByRole("checkbox", { name: "Product updates" }).press("Space");
  await page.getByRole("switch", { name: "Notifications" }).click();
  await save.click();
  await output.getByText("user@example.test|false|true|asia|false|user@example.test").waitFor();

  const region = page.getByRole("combobox", { name: "Region" });
  await region.press("ArrowDown");
  await page.getByRole("option", { name: "Asia" }).waitFor();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await output.getByText("user@example.test|false|true|europe|false|user@example.test").waitFor();

  const trigger = page.getByRole("button", { name: "Open preferences" });
  await trigger.click();
  await page.getByRole("dialog", { name: "Preferences" }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog", { name: "Preferences" }).waitFor({ state: "hidden" });
  assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);

  const saving = page.getByRole("button", { name: "Save changes" });
  await saving.focus();
  assert.equal(await saving.getAttribute("aria-busy"), "true");
  await saving.press("Enter");
  assert.equal(await page.getByLabel("Save count").textContent(), "0");
  await page.getByRole("button", { name: "Finish saving" }).click();
  await saving.press("Enter");
  assert.equal(await page.getByLabel("Save count").textContent(), "1");
  const grouped = page.getByRole("button", { name: "Grouped action" });
  assert.equal(await grouped.isDisabled(), true);
  assert.equal(await grouped.getAttribute("data-variant"), "prominent");
  assert.equal(await grouped.evaluate((button) => button.closest("fieldset")?.disabled), true);
  const agentResult = await page.evaluate(async () => {
    const agent = (window as Window & { agent?: ReturnType<typeof createAgent> }).agent!;
    const labels = agent.snapshot().map((entry) => entry.label);
    const result = await agent.act({
      steps: [{ ref: "Email", action: "setValue", args: ["agent@example.test"] }],
    });
    return { labels, result };
  });
  for (const label of ["Email", "Product updates", "Notifications", "Region", "Save preferences"]) {
    assert.ok(agentResult.labels.includes(label), JSON.stringify(agentResult));
  }
  await output.getByText("agent@example.test|false|true|europe|false|user@example.test").waitFor();
  await page.evaluate(async () => {
    const agent = (window as Window & { agent: ReturnType<typeof createAgent> }).agent;
    await agent.act({
      steps: [{ ref: "Email", action: "setValue", args: ["blocked@example.test"] }],
    });
  });
  assert.equal(
    await page.getByRole("textbox", { name: "Email" }).inputValue(),
    "agent@example.test",
  );

  const more = page.getByRole("button", { name: "More sections" });
  try {
    await more.click();
  } catch (error) {
    const geometry = await page.locator("#compact-tabs").evaluate((host) => ({
      width: host.clientWidth,
      nodes: [...host.querySelectorAll("[data-lenso-slot]")].map((node) => ({
        slot: node.getAttribute("data-lenso-slot"),
        display: getComputedStyle(node).display,
        width: node.getBoundingClientRect().width,
        overflow: node.hasAttribute("data-tabs-overflow"),
      })),
    }));
    throw new Error(JSON.stringify({ geometry, problems }), { cause: error });
  }
  await page.getByRole("menuitem", { name: "Advanced settings" }).click();
  await page.getByRole("tabpanel", { name: "Advanced settings" }).waitFor();
  const tab = page.getByRole("tab", { name: "Advanced settings" });
  assert.equal(await tab.getAttribute("aria-selected"), "true");

  const nameColumn = page
    .getByRole("table", { name: "Members" })
    .getByRole("columnheader", { name: "Name", exact: true });
  await nameColumn.press("Enter");
  assert.equal(await nameColumn.getAttribute("aria-sort"), "ascending");
  const all = page.getByRole("checkbox", { name: "Select all" });
  await page.getByRole("checkbox", { name: "Select Alice" }).check();
  assert.equal(await all.evaluate((node: HTMLInputElement) => node.indeterminate), true);
  await all.click();
  assert.equal(await page.getByRole("checkbox", { name: "Select Bo" }).isChecked(), true);
  await page.getByRole("button", { name: "Expand row" }).click();
  await page.getByRole("cell", { name: "Member details" }).waitFor();
  const resizer = page.getByRole("separator", { name: "Resize actions" });
  await resizer.press("ArrowRight");
  assert.equal(await resizer.getAttribute("aria-valuenow"), "110");

  await page.getByRole("checkbox", { name: "Select Review" }).press("Space");
  await page.getByLabel("Task selection").getByText("string:review").waitFor();

  await page.getByRole("button", { name: "Expand navigation" }).click();
  const current = page.getByRole("link", { name: "Workspace home" });
  assert.equal(await current.evaluate((node) => node === document.activeElement), true);

  const glass = page.getByRole("button", { name: "Glass action" });
  await glass.scrollIntoViewIfNeeded();
  const bounds = (await glass.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  try {
    await glass.locator("xpath=self::*[@data-lenso-pressed]").waitFor();
  } finally {
    await page.mouse.up();
  }

  await page.getByRole("button", { name: "Page 1 of 12" }).press("End");
  const last = page.getByRole("button", { name: "Page 12 of 12" });
  assert.equal(await last.getAttribute("aria-current"), "page");
  assert.equal(await last.evaluate((node) => node === document.activeElement), true);

  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.getByText("Refresh count 1").waitFor();
  await page.getByRole("status").filter({ hasText: "Refresh complete" }).waitFor();

  await verifyAdapterParity(page, "Dismiss upload");
  await verifyTabBar(page);
  assert.deepEqual(problems, []);
}

async function verifyTabBar(page: Page) {
  const bar = page.getByRole("navigation", { name: "Workspace" });
  const group = bar.locator("[data-tab-bar-group]");
  await page.waitForFunction(() =>
    document
      .querySelector('[aria-label="Workspace"] [data-tab-bar-group]')
      ?.hasAttribute("data-indicator-ready"),
  );
  assert.ok(await group.locator('[data-lenso-slot="tab-bar-indicator"]').count());
  assert.ok(await group.locator("[data-material-lens]").count());
  await page.waitForFunction(
    () =>
      document
        .querySelector<HTMLElement>('[aria-label="Workspace"] [data-tab-bar-group]')
        ?.style.getPropertyValue("--tab-bar-collapse") === "0",
  );
  const workspace = bar.getByRole("link", { name: "Workspace home" });
  const library = bar.getByRole("link", { name: "Library" });
  await workspace.scrollIntoViewIfNeeded();
  const from = (await workspace.boundingBox())!;
  const to = (await library.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  try {
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    assert.equal(await group.getAttribute("data-highlight-active"), "");
    assert.equal(await workspace.getAttribute("aria-current"), "page");
  } finally {
    await page.mouse.up();
  }
  await page.waitForFunction(
    () =>
      document
        .querySelector('[aria-label="Workspace"] a[href="#library"]')
        ?.getAttribute("aria-current") === "page",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Toggle workspace navigation" }).click();
  assert.equal(
    await group.evaluate((node) => node.style.getPropertyValue("--tab-bar-collapse")),
    "1",
  );
  await bar.getByRole("button", { name: "Expand navigation" }).press("Enter");
  assert.equal(await library.evaluate((node) => document.activeElement === node), true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
}

const devTemplate = await readFile(join(directory, "index.html"), "utf8");
const dev = await createServer({
  root: directory,
  server: { host: "127.0.0.1", port: 0 },
  plugins: [
    {
      name: "fixture-ssr",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url !== "/") return next();
          try {
            const template = await server.transformIndexHtml("/", devTemplate);
            const { renderApp } = await server.ssrLoadModule("/server.ts");
            response.setHeader("Content-Type", "text/html");
            response.end(template.replace("<!--ssr-->", renderApp()));
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
});
try {
  await dev.listen();
  const address = dev.httpServer?.address();
  assert(address && typeof address !== "string");
  const browser = await chromium.launch();
  try {
    await verify(await browser.newPage(), `http://127.0.0.1:${address.port}/`);
  } finally {
    await browser.close();
  }
} finally {
  await dev.close();
}

const production = await preview({
  root: directory,
  build: { outDir: "out/client" },
  preview: { host: "127.0.0.1", port: 0 },
});
try {
  const address = production.httpServer.address();
  assert(address && typeof address !== "string");
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      await verify(await browser.newPage(), `http://127.0.0.1:${address.port}/`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await production.close();
}
