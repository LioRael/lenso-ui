import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Workspace symlinks cannot prove that shipped TSX, assets and templates work
// in an independently installed project, or that content changes reach a browser.
const repository = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = await mkdtemp(path.join(tmpdir(), "lenso-docs-package-"));
let browser;
let preview;
let dev;
const commands = (args, cwd) => execFileSync("pnpm", args, { cwd, stdio: "inherit" });
const artifacts = process.env.LENSO_DOCS_PROOF_DIR ?? process.env.DELTA_SCRATCH_DIR;

async function stop(child) {
  if (!child || child.exitCode !== null) return;
  const exit = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  const timer = setTimeout(() => child.kill("SIGKILL"), 10000);
  await exit;
  clearTimeout(timer);
}

async function availablePort() {
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

async function eventually(check, description, timeout = 90000) {
  const end = Date.now() + timeout;
  let last;
  while (Date.now() < end) {
    try {
      await check();
      return;
    } catch (error) {
      last = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`${description}: ${last?.message}`);
}

try {
  const packs = path.join(fixture, "packs");
  await mkdir(packs);
  for (const [folder, name] of [
    ["styles", "tokens"],
    ["docs", "docs"],
    ["create-docs", "create"],
  ])
    commands(
      ["pack", "--silent", "--out", path.join(packs, `${name}.tgz`)],
      path.join(repository, "packages", folder),
    );
  const unpacked = path.join(fixture, "initializer");
  await mkdir(unpacked);
  execFileSync("tar", ["-xzf", path.join(packs, "create.tgz"), "-C", unpacked]);
  const project = path.join(fixture, "field-notes");
  execFileSync(process.execPath, [path.join(unpacked, "package", "src", "cli.mjs"), project], {
    cwd: fixture,
    stdio: "inherit",
  });
  const manifest = JSON.parse(await readFile(path.join(project, "package.json"), "utf8"));
  manifest.dependencies["@lenso/docs"] = `file:${path.join(packs, "docs.tgz")}`;
  await writeFile(path.join(project, "package.json"), JSON.stringify(manifest));
  await writeFile(
    path.join(project, "pnpm-workspace.yaml"),
    `overrides:\n  "@lenso/tokens": ${JSON.stringify(`file:${path.join(packs, "tokens.tgz")}`)}\n`,
  );
  commands(
    [
      "install",
      "--ignore-scripts",
      ...(process.env.LENSO_DOCS_OFFLINE === "1" ? ["--offline"] : []),
    ],
    project,
  );
  const configFile = path.join(project, "docs.config.ts");
  const config = (await readFile(configFile, "utf8"))
    .replace(/contentDir:\s*(['"])content\1,/, 'contentDir: "content",\n  basePath: "/manual",')
    .replace(/GitHub:\s*(['"])https:\/\/github\.com\/\1/, 'GitHub: "/guides/"');
  await writeFile(configFile, config);
  await writeFile(
    path.join(project, "content", "draft.mdx"),
    "---\ntitle: Draft\ndraft: true\n---\nSecret draft phrase.",
  );
  const homeFile = path.join(project, "content", "index.mdx");
  const homeSource = await readFile(homeFile, "utf8");
  await writeFile(
    homeFile,
    `${homeSource}\n\n[Read the guide](/guides/)\n\n## A small example\n\nDuplicate heading.\n`,
  );
  commands(["build"], project);
  assert.equal(
    await readFile(path.join(project, "out", "_lenso", "markdown", "index.md"), "utf8"),
    await readFile(homeFile, "utf8"),
  );
  const sitemap = await readFile(path.join(project, "out", "sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/docs\.example\.com\/manual\/guides\/content\//);
  assert.doesNotMatch(sitemap, /draft/);
  const search = await readFile(path.join(project, "out", "_lenso", "search.json"), "utf8");
  assert.doesNotMatch(search, /Secret draft phrase/);
  const port = await availablePort();
  const cli = path.join(project, "node_modules", "@lenso", "docs", "src", "cli.mjs");
  preview = spawn(process.execPath, [cli, "preview", "--port", String(port)], {
    cwd: project,
    stdio: "inherit",
  });
  const origin = `http://127.0.0.1:${port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await eventually(async () => {
    const response = await page.goto(`${origin}/manual/`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
  }, "packed preview server");
  assert.equal(await page.getByRole("main").count(), 1);
  assert.equal(
    await page
      .getByRole("link", { name: "Field Notes on GitHub", exact: true })
      .getAttribute("href"),
    "/manual/guides/",
  );
  await page.evaluate(() => document.fonts.ready);
  const geometry = await page.evaluate(() => {
    const metric = (selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      const css = getComputedStyle(element);
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        font: css.fontFamily,
        fontSize: css.fontSize,
        lineHeight: css.lineHeight,
        padding: css.padding,
        weight: css.fontWeight,
      };
    };
    return {
      header: metric("#nd-subnav"),
      main: metric("main"),
      article: metric("#nd-page"),
      sidebar: metric("#nd-sidebar"),
      title: metric("h1"),
      paragraph: metric(".lenso-prose p"),
      code: metric("pre"),
      cell: metric("th"),
    };
  });
  assert.equal(geometry.header.height, 100);
  assert.equal(geometry.sidebar.width, 220);
  assert.equal(geometry.main.x, 240);
  assert.equal(geometry.main.padding, "32px 48px 24px");
  assert.equal(geometry.article.x, 288);
  assert.equal(geometry.article.width, 816);
  assert.match(geometry.paragraph.font, /Lenso Inter/);
  assert.equal(geometry.paragraph.fontSize, "14px");
  assert.equal(geometry.title.fontSize, "28px");
  assert.equal(geometry.title.lineHeight, "42px");
  assert.equal(geometry.code.fontSize, "13px");
  assert.equal(geometry.code.padding, "14px 24px");
  assert.equal(geometry.cell.padding, "10px");
  if (artifacts)
    await writeFile(
      path.join(artifacts, "docs-framework-geometry.json"),
      JSON.stringify(geometry, null, 2),
    );
  assert.equal(
    await page.locator('link[rel="canonical"]').getAttribute("href"),
    "https://docs.example.com/manual/",
  );
  await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.ok(await page.getByRole("main").evaluate((element) => element === document.activeElement));
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator('h2[id="a-small-example"]').count(), 1);
  assert.equal(await page.locator('h2[id="a-small-example-1"]').count(), 1);
  assert.equal(
    await page.getByRole("link", { name: "Read the guide", exact: true }).getAttribute("href"),
    "/manual/guides/",
  );
  assert.equal(await page.locator('a[href*="/manual/manual/"]').count(), 0);
  assert.equal(await page.getByRole("tab").count(), 2);
  await page.getByRole("tab", { name: "Markdown", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await eventually(
    async () => {
      assert.ok(
        await page
          .getByRole("tab", { name: "MDX", exact: true })
          .evaluate((element) => element === document.activeElement),
      );
    },
    "native tab keyboard focus",
    10000,
  );
  await page.keyboard.press("Enter");
  await eventually(async () => {
    assert.equal(
      await page.getByRole("tab", { name: "MDX", exact: true }).getAttribute("aria-selected"),
      "true",
    );
  }, "native tab keyboard activation");
  assert.ok(await page.locator("pre code span").count(), "code block is syntax highlighted");
  if (artifacts)
    await page.screenshot({
      path: path.join(artifacts, "docs-framework-desktop.png"),
      fullPage: true,
    });
  const copy = page.getByRole("button", { name: "Copy Markdown", exact: true });
  await copy.click();
  await eventually(async () => {
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      await readFile(homeFile, "utf8"),
    );
  }, "exact Markdown clipboard copy");
  await page.getByRole("button", { name: "Copy code", exact: true }).click();
  const fence = homeSource.match(/```ts\n([\s\S]*?)\n```/)[1] + "\n";
  await eventually(
    async () => assert.equal(await page.evaluate(() => navigator.clipboard.readText()), fence),
    "code copy excludes displayed line numbers",
  );
  const options = page.getByRole("button", { name: "Page source options", exact: true });
  await options.click();
  const sourceLink = page.getByRole("menuitem", { name: "View page source", exact: true });
  assert.equal(await sourceLink.getAttribute("href"), "/manual/_lenso/markdown/index.md");
  await page.keyboard.press("Escape");
  const searchTrigger = page.getByRole("button", { name: /search/i }).first();
  await searchTrigger.focus();
  await page.keyboard.press("Enter");
  const input = page.getByRole("dialog").getByRole("textbox", { name: "Search documentation" });
  await input.fill("conventions");
  try {
    await eventually(
      async () => {
        assert.ok(
          await page
            .getByRole("dialog")
            .getByRole("button", { name: /Content conventions/i })
            .count(),
        );
      },
      "static search results",
      15000,
    );
  } catch (error) {
    console.log(await page.getByRole("dialog").ariaSnapshot());
    if (artifacts)
      await page.screenshot({ path: path.join(artifacts, "docs-framework-search.png") });
    throw error;
  }
  await page.keyboard.press("Escape");
  await eventually(
    async () => {
      assert.equal(await page.getByRole("dialog").count(), 0);
      assert.ok(
        await searchTrigger.evaluate((element) => element === document.activeElement),
        "search restores focus",
      );
    },
    "search dismissal and focus restoration",
    10000,
  );
  await searchTrigger.click();
  await page.getByRole("dialog").waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Escape");
  await eventually(
    async () => {
      assert.equal(await page.getByRole("dialog").count(), 0);
      assert.ok(
        await page
          .getByRole("button", { name: "Search documentation", exact: true })
          .evaluate((element) => element === document.activeElement),
      );
    },
    "search focus restoration across a breakpoint",
    10000,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await searchTrigger.click();
  await page.getByRole("textbox", { name: "Search documentation" }).fill("conventions");
  await eventually(
    async () =>
      assert.ok(
        await page
          .getByRole("dialog")
          .getByRole("button", { name: /Content conventions/i })
          .count(),
      ),
    "search selection",
    10000,
  );
  await page.keyboard.press("Enter");
  await page.waitForURL("**/manual/guides/content/");
  await page.goto(`${origin}/manual/`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Read the guide", exact: true }).click();
  await page.waitForURL("**/manual/guides/");
  await page.getByRole("link", { name: "Writing reference" }).click();
  await page.waitForURL("**/manual/guides/content/");
  assert.ok(
    await page
      .getByText("Local components can be imported directly from MDX.", { exact: true })
      .isVisible(),
  );
  assert.equal((await page.goto(`${origin}/manual/missing/`)).status(), 404);
  await page.goto(`${origin}/manual/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await eventually(
    async () =>
      assert.ok(
        await page.locator("html").evaluate((element) => element.classList.contains("dark")),
      ),
    "theme switch",
  );
  if (artifacts)
    await page.screenshot({
      path: path.join(artifacts, "docs-framework-dark.png"),
      fullPage: true,
    });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    "mobile has no horizontal overflow",
  );
  if (artifacts)
    await page.screenshot({
      path: path.join(artifacts, "docs-framework-mobile.png"),
      fullPage: true,
    });
  const navigation = page.getByRole("button", { name: "Browse documentation", exact: true });
  await navigation.click();
  const drawer = page.getByRole("dialog", { name: "Browse documentation", exact: true });
  await drawer.getByRole("link", { name: "Your first guide", exact: true }).waitFor();
  assert.equal(
    await drawer.getByRole("link", { name: "GitHub", exact: true }).getAttribute("href"),
    "/manual/guides/",
  );
  await page.keyboard.press("Escape");
  await eventually(
    async () => {
      assert.equal(await drawer.count(), 0);
      assert.ok(await navigation.evaluate((element) => element === document.activeElement));
    },
    "mobile navigation dismissal",
    10000,
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/manual/components/counter/`, { waitUntil: "networkidle" });
  assert.ok(
    await page
      .getByLabel("Documentation edition")
      .getByText("Starter", { exact: true })
      .isVisible(),
  );
  assert.ok(await page.getByText("component", { exact: true }).isVisible());
  const counter = page.getByRole("region", { name: "Counter example", exact: true });
  await counter.getByRole("button", { name: "Count: 0", exact: true }).focus();
  await page.keyboard.press("Enter");
  await counter.getByRole("button", { name: "Count: 1", exact: true }).waitFor();
  const properties = page.getByRole("table", { name: "Counter properties", exact: true });
  assert.equal(
    await properties.getByRole("rowheader", { name: "initialCount", exact: true }).count(),
    1,
  );
  assert.equal(await properties.getByRole("cell", { name: "No", exact: true }).count(), 1);
  await page.goto(`${origin}/manual/api/messages/`, { waitUntil: "networkidle" });
  assert.ok(await page.getByText("api", { exact: true }).isVisible());
  assert.ok(await page.getByText("API integrators", { exact: true }).isVisible());
  assert.ok(await page.getByRole("region", { name: "GET /messages", exact: true }).isVisible());
  assert.ok(await page.getByRole("table", { name: "Query parameters", exact: true }).isVisible());
  assert.ok(await page.getByRole("region", { name: "Response 200", exact: true }).isVisible());
  await page.getByRole("button", { name: "Copy Markdown", exact: true }).click();
  await eventually(
    async () =>
      assert.equal(
        await page.evaluate(() => navigator.clipboard.readText()),
        await readFile(path.join(project, "content", "api", "messages.mdx"), "utf8"),
      ),
    "API-kind exact Markdown copy",
  );
  assert.deepEqual(errors, [], "no runtime or hydration errors");
  await context.close();

  await stop(preview);
  preview = undefined;
  dev = spawn(process.execPath, [cli, "dev", "--port", String(port)], {
    cwd: project,
    stdio: "inherit",
  });
  const live = await browser.newPage();
  await eventually(async () => {
    const response = await live.goto(`${origin}/manual/`);
    assert.equal(response.status(), 200);
    assert.equal(await live.locator("h1").innerText(), "Welcome");
  }, "packed development server");
  await writeFile(
    homeFile,
    `${await readFile(homeFile, "utf8")}\n\n## Live update\n\nEdited while running.\n`,
  );
  await eventually(async () => {
    await live.reload();
    assert.ok(await live.getByText("Edited while running.", { exact: true }).isVisible());
  }, "MDX hot reload");
  await writeFile(
    configFile,
    config.replace(/title:\s*(['"])Field Notes\1/, 'title: "Updated Notes"'),
  );
  await eventually(async () => {
    await live.reload();
    assert.ok(
      await live.getByRole("link", { name: "Updated Notes", exact: true }).first().isVisible(),
    );
  }, "configuration reload");
  await stop(dev);
  dev = undefined;
  await browser.close();
  browser = undefined;
  console.log(
    "Packed standalone docs proof passed: build, base path, Markdown, search, keyboard, themes, mobile and live edits.",
  );
} finally {
  await stop(dev);
  await stop(preview);
  if (browser) await browser.close();
  await rm(fixture, { recursive: true, force: true });
}
