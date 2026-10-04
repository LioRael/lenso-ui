// Real production iframes, both themes, pinned source and native workflows.
// node collection-proof.mjs <storybook-static> <absolute-playwright-module> <scratch-output>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
const [directory, playwrightModule, output] = process.argv.slice(2);
assert(
  directory && playwrightModule && output,
  "Supply static build, Playwright module and scratch output",
);
assert.equal(process.versions.node, "26.10.0");
const exec = promisify(execFile);
const expected = {
  table: [
    "Default",
    "SecondaryVariant",
    "EmptyStateDemo",
    "DynamicCollection",
    "DynamicWithSelection",
    "ColumnResizing",
    "AsyncLoading",
    "Virtualization",
    "ExpandableRows",
  ],
  "tag-group": [
    "Default",
    "Sizes",
    "Variants",
    "Disabled",
    "SelectionModes",
    "Controlled",
    "WithErrorMessage",
    "WithPrefix",
    "WithRemoveButton",
    "WithListData",
  ],
};
const hashes = {
  table: "1e1a68f16786847c53b54e3047194fbbe93b2c698f7647e3f104aca6eac75026",
  "tag-group": "35967eda4b84aa36514acd0e66ca2e956973c11bf1c56d2ce38948f01b91515b",
};
const sourceEvidence = [];
for (const [family, names] of Object.entries(expected)) {
  const local = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
  assert.deepEqual(
    [...local.matchAll(/export const (\w+)/g)].map((match) => match[1]),
    names,
  );
  assert(
    !/react-aria|@heroui|@iconify|className=/.test(local),
    "No ordinary RAC/source-runtime/Tailwind adapters",
  );
  const url = `https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/${family}/${family}.stories.tsx`;
  const { stdout } = await exec("curl", ["-fsSL", "--max-time", "30", url]);
  const hash = createHash("sha256").update(stdout).digest("hex");
  assert.equal(hash, hashes[family]);
  assert.deepEqual(
    [...stdout.matchAll(/export const (\w+)/g)].map((match) => match[1]),
    names,
  );
  sourceEvidence.push({ family, url, sha256: hash });
}
assert.equal(Object.values(expected).flat().length, 19);
const root = resolve(directory);
const index = JSON.parse(await readFile(resolve(root, "index.json"), "utf8"));
const entries = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    Object.keys(expected).some((family) => entry.importPath === `./stories/${family}.stories.tsx`),
);
assert.equal(entries.length, 19);
const assets = new Map();
const assetEvidence = [];
await mkdir(resolve(output, "assets"), { recursive: true });
for (const color of ["red", "green", "blue", "purple", "orange", "black"]) {
  const url = `https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${color}.jpg`;
  const cache = resolve(output, "assets", `${color}.jpg`);
  let body;
  try {
    body = await readFile(cache);
  } catch {
    const { stdout } = await exec(
      "curl",
      ["--http1.1", "-fsSL", "--retry", "3", "--retry-all-errors", "--max-time", "30", url],
      { encoding: "buffer", maxBuffer: 8 * 1024 * 1024 },
    );
    body = stdout;
    await writeFile(cache, body);
  }
  assets.set(url, body);
  assetEvidence.push({
    url,
    bytes: body.length,
    sha256: createHash("sha256").update(body).digest("hex"),
  });
}
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
  if (!file.startsWith(root + sep)) return response.writeHead(403).end();
  try {
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const module = await import(pathToFileURL(playwrightModule).href);
const browser = await (module.default ?? module).chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1100, height: 900 },
  ignoreHTTPSErrors: true,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/**", async (route) => {
  const url = route.request().url();
  assert(assets.has(url), `Unexpected source asset ${url}`);
  await route.fulfill({
    status: 200,
    contentType: "image/jpeg",
    body: assets.get(url),
    headers: { "access-control-allow-origin": "*" },
  });
});
await mkdir(output, { recursive: true });
const evidence = [];
const geometry = [];
async function mount(family, name, theme, mobile = false) {
  await page.setViewportSize({ width: mobile ? 390 : 1100, height: 900 });
  const story = entries.find(
    (entry) => entry.importPath === `./stories/${family}.stories.tsx` && entry.exportName === name,
  );
  assert(story);
  await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);
  await page.waitForFunction(() => document.querySelector("#storybook-root")?.children.length > 0);
  assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
  if (await page.locator('[data-slot="avatar"]').count())
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-slot="avatar"]')].every((node) => {
        const image = node.querySelector("img");
        return image?.complete && image.naturalWidth > 0;
      }),
    );
}
const tag = (group, name) =>
  group.getByRole("row").filter({ has: page.getByText(name, { exact: true }) });
async function selected(locator, value) {
  assert.equal(await locator.getAttribute("aria-selected"), String(value));
}
async function workflow(family, name) {
  const checks = [];
  if (family === "table") {
    const table = page.locator('[data-slot="table-content"]');
    assert.equal(await table.count(), 1);
    if (["Default", "SecondaryVariant"].includes(name)) {
      const member = table.getByRole("columnheader", { name: "Member" });
      assert.equal(await member.getAttribute("aria-sort"), "ascending");
      assert.match(await table.locator("tbody").textContent(), /Ava Jackson/);
      await member.focus();
      await page.keyboard.press("Enter");
      assert.equal(await member.getAttribute("aria-sort"), "descending");
      assert.match(await table.locator("tbody tr").first().textContent(), /Sophia Anderson/);
      const checkbox = table.getByRole("checkbox", { name: "Select Sophia Anderson" });
      await checkbox.check();
      assert(await checkbox.isChecked());
      assert(
        await table
          .getByRole("checkbox", { name: "Select all" })
          .evaluate((node) => node.indeterminate),
      );
      assert.equal(
        await checkbox.evaluate(
          (node) => getComputedStyle(node.nextElementSibling.querySelector("svg")).opacity,
        ),
        "1",
      );
      const appearance = await checkbox.evaluate((node) => {
        const box = node.nextElementSibling.getBoundingClientRect();
        return { width: box.width, height: box.height };
      });
      assert.equal(appearance.width, 16);
      assert.equal(appearance.height, 16);
      await checkbox.focus();
      await page.keyboard.press("Space");
      assert(!(await checkbox.isChecked()));
      await page.keyboard.press("Space");
      assert(await checkbox.isChecked());
      assert.equal(
        await checkbox.evaluate((node) => getComputedStyle(node.nextElementSibling).outlineWidth),
        "2px",
      );
      await selected(table.locator("tbody tr").first(), true);
      await table.getByRole("checkbox", { name: "Select all" }).check();
      assert.equal(await table.locator('tbody tr[aria-selected="true"]').count(), 4);
      const cell = table.locator("tbody tr").first().locator("td").nth(1);
      await cell.focus();
      await page.keyboard.press("ArrowRight");
      assert(
        await table
          .locator("tbody tr")
          .first()
          .locator("td")
          .nth(2)
          .evaluate((node) => node === document.activeElement),
      );
      await page.getByRole("button", { name: "Next page" }).click();
      assert.match(
        await page.locator('[data-slot="pagination-summary"]').textContent(),
        /5 to 8 of 12/,
      );
      checks.push(
        "controlled sort changes row order",
        "native row/all selection",
        "16px native checkbox appearance; checked SVG and visible keyboard focus",
        "cell arrow keyboard",
        "pagination",
      );
    }
    if (name === "EmptyStateDemo") {
      assert.equal(await table.getByText("No results found").count(), 1);
      assert.equal(await table.locator("th").count(), 4);
      assert.equal(await table.locator("td").getAttribute("colspan"), "4");
      checks.push("empty state spans four native columns");
    }
    if (["DynamicCollection", "DynamicWithSelection"].includes(name)) {
      assert.equal(await table.locator("tbody tr").count(), 4);
      assert.match(await table.locator("tbody tr").first().textContent(), /Kate Moore/);
      if (name === "DynamicWithSelection") {
        await table.getByRole("checkbox", { name: "Select Kate Moore" }).check();
        await selected(table.locator("tbody tr").first(), true);
        const cell = table.locator("tbody tr").first().locator("td").nth(1);
        await cell.focus();
        await page.keyboard.press("ArrowDown");
        assert(
          await table
            .locator("tbody tr")
            .nth(1)
            .locator("td")
            .nth(1)
            .evaluate((node) => node === document.activeElement),
        );
        checks.push("static selection cells plus dynamic columns", "vertical native keyboard");
      }
      await page.getByRole("button", { name: "Next page" }).click();
      assert.match(await table.locator("tbody tr").first().textContent(), /Emily Davis/);
      await page.getByRole("button", { name: "Previous page" }).click();
      checks.push("dynamic data pagination and back");
    }
    if (name === "ColumnResizing") {
      const handle = table.getByRole("separator", { name: "Resize Name" });
      const column = table.getByRole("columnheader", { name: "Name" });
      const before = (await column.boundingBox()).width;
      await handle.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);
      const after = (await column.boundingBox()).width;
      assert(after > before + 5);
      await page.keyboard.press("Home");
      await page.waitForTimeout(100);
      assert(Math.abs((await column.boundingBox()).width - 160) < 2);
      const box = await handle.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 60, box.y + box.height / 2);
      await page.mouse.up();
      assert((await column.boundingBox()).width > 180);
      checks.push("resizer keyboard width and min clamp", "pointer width drag");
    }
    if (name === "AsyncLoading") {
      assert.equal(await table.locator('[data-slot="table-row"]').count(), 6);
      const scroll = page.locator('[data-slot="table-scroll-container"]');
      await scroll.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await page.waitForFunction(
        () =>
          document.querySelector('[data-slot="table-load-more"]')?.getAttribute("aria-busy") ===
          "true",
      );
      await page.waitForFunction(
        () => document.querySelectorAll('[data-slot="table-row"]').length === 12,
      );
      assert.equal(await table.locator('[data-slot="table-load-more"]').count(), 0);
      checks.push(
        "six-row initial page",
        "intersection-triggered 1500ms loading",
        "all twelve rows and sentinel removed",
      );
    }
    if (name === "Virtualization") {
      assert.equal(await table.getAttribute("aria-rowcount"), "1001");
      assert(Math.abs((await table.locator("thead").boundingBox()).height - 42) < 1);
      const mounted = await table.locator("[data-window-index]").count();
      assert(mounted > 5 && mounted < 40);
      assert(
        Math.abs((await table.locator('[data-window-index="0"]').boundingBox()).height - 42) < 1,
      );
      await table.locator('[data-window-index="0"] td').first().focus();
      await page.keyboard.press("Control+End");
      await page.waitForFunction(
        () => !!document.querySelector('[data-window-index="999"] td:focus'),
      );
      const scroll = page.locator('[data-slot="table-scroll-container"]');
      await scroll.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      await page.waitForFunction(() => !!document.querySelector('[data-window-index="999"]'));
      assert.match(
        await table.locator('[data-window-index="999"]').textContent(),
        /Benjamin Martinez/,
      );
      assert((await table.locator("[data-window-index]").count()) < 40);
      checks.push("1000 logical rows; bounded DOM", "bottom scroll exposes exact source row 1000");
    }
    if (name === "ExpandableRows") {
      const project = table.getByRole("row").filter({ hasText: "Project" });
      assert.equal(await project.getAttribute("aria-level"), "2");
      await project.getByRole("button", { name: "Toggle row" }).click();
      assert.equal(await table.getByText("Weekly Report", { exact: true }).count(), 1);
      assert.equal(
        await table
          .getByRole("row")
          .filter({ hasText: "Weekly Report" })
          .getAttribute("aria-level"),
        "3",
      );
      const cell = project.getByRole("rowheader");
      await cell.focus();
      await page.keyboard.press("ArrowLeft");
      assert.equal(await table.getByText("Weekly Report", { exact: true }).count(), 0);
      const documents = table.getByRole("row").filter({ hasText: "Documents" });
      await documents.getByRole("button", { name: "Toggle row" }).click();
      assert.equal(await table.getByText("Project", { exact: true }).count(), 0);
      checks.push(
        "controlled recursive child expansion",
        "depth semantics",
        "keyboard collapse",
        "parent collapse",
      );
    }
  } else {
    const groups = page.getByRole("grid");
    assert((await groups.count()) > 0);
    if (["Default", "Sizes", "Variants", "WithPrefix"].includes(name)) {
      for (const group of await groups.all()) {
        const rows = group.getByRole("row");
        await rows.first().click();
        await selected(rows.first(), true);
        await page.keyboard.press("ArrowRight");
        assert(await rows.nth(1).evaluate((node) => node === document.activeElement));
        await page.keyboard.press(" ");
        await selected(rows.nth(1), true);
        await selected(rows.first(), false);
      }
      checks.push("single selection and roving ArrowRight/Space in each group");
    }
    if (name === "Disabled") {
      const first = page.getByRole("grid", { name: "Disabled Tags" });
      assert.equal(await tag(first, "News").getAttribute("aria-disabled"), "true");
      await tag(first, "News").click({ force: true });
      await selected(tag(first, "News"), false);
      await tag(first, "Travel").click();
      await page.keyboard.press("Home");
      assert(await tag(first, "Travel").evaluate((node) => node === document.activeElement));
      const second = page.getByRole("grid", { name: "Disabled Keys" });
      await tag(second, "News").click();
      await page.keyboard.press("ArrowRight");
      assert(await tag(second, "Gaming").evaluate((node) => node === document.activeElement));
      checks.push("local disabled blocks selection", "disabledKeys skip in roving keyboard");
    }
    if (name === "SelectionModes") {
      const single = page.getByRole("grid", { name: "Single Selection" });
      const multiple = page.getByRole("grid", { name: "Multiple Selection" });
      await selected(tag(single, "News"), true);
      await tag(single, "Gaming").click();
      await selected(tag(single, "News"), false);
      await selected(tag(single, "Gaming"), true);
      await selected(tag(multiple, "News"), true);
      await selected(tag(multiple, "Travel"), true);
      await tag(multiple, "Gaming").click();
      await selected(tag(multiple, "Gaming"), true);
      await selected(tag(multiple, "News"), true);
      checks.push("controlled single replacement", "controlled multiple additive selection");
    }
    if (name === "Controlled") {
      await tag(groups, "Gaming").click();
      assert.match(
        await page.getByText("Selected:", { exact: false }).textContent(),
        /news, travel, gaming/,
      );
      await tag(groups, "Travel").click();
      await selected(tag(groups, "Travel"), false);
      assert.match(
        await page.getByText("Selected:", { exact: false }).textContent(),
        /news, gaming/,
      );
      checks.push("owner-controlled selection and derived summary");
    }
    if (name === "WithErrorMessage") {
      assert.equal(
        await page.getByText("Please select at least one category", { exact: true }).count(),
        1,
      );
      await tag(groups, "Laundry").click();
      assert.equal(
        await page.getByText("Please select at least one category", { exact: true }).count(),
        0,
      );
      await tag(groups, "Laundry").click();
      assert.equal(
        await page.getByText("Please select at least one category", { exact: true }).count(),
        1,
      );
      checks.push("validation clears and returns with native selection");
    }
    if (name === "WithRemoveButton") {
      const standard = page.getByRole("grid", { name: "Default Remove Button" });
      await standard.getByRole("button", { name: "Remove News" }).click();
      assert.equal(await tag(standard, "News").count(), 0);
      assert(await tag(standard, "Travel").evaluate((node) => node === document.activeElement));
      await page.keyboard.press("Delete");
      assert.equal(await tag(standard, "Travel").count(), 0);
      while (await standard.getByRole("button").count())
        await standard.getByRole("button").first().click();
      assert.equal(await page.getByText("No categories found").count(), 1);
      const render = page.getByRole("grid", { name: "Custom Remove Button (Render Props)" });
      const compound = page.getByRole("grid", {
        name: "Custom Remove Button (Compound Component)",
      });
      await render.getByRole("button", { name: "Remove React" }).click();
      assert.equal(await tag(compound, "React").count(), 0);
      await compound.getByRole("button", { name: "Remove Vue" }).click();
      assert.equal(await tag(render, "Vue").count(), 0);
      checks.push(
        "native remove click and Delete; next-focus restoration",
        "empty state",
        "shared controlled frameworks across both custom patterns",
      );
    }
    if (name === "WithListData") {
      await selected(tag(groups, "Fred"), true);
      await groups.getByRole("button", { name: "Remove Fred" }).click();
      assert.equal(await groups.getByRole("row").filter({ hasText: "Fred" }).count(), 0);
      assert.equal(await page.locator('[data-slot="avatar"]').count(), 6);
      const jane = groups.getByRole("row").filter({ hasText: "Jane" });
      await jane.click();
      await selected(jane, true);
      assert.equal(await page.getByText("Jane", { exact: true }).count(), 2);
      await page.keyboard.press("Backspace");
      assert.equal(await page.getByText("Jane", { exact: true }).count(), 0);
      checks.push(
        "initial controlled team selection",
        "remove clears derived selected user",
        "data selection adds preview",
        "Backspace removes selected user",
      );
    }
  }
  return checks;
}
try {
  for (const theme of ["light", "dark"])
    for (const [family, names] of Object.entries(expected))
      for (const name of names) {
        await mount(family, name, theme);
        await page.screenshot({ path: resolve(output, `${family}-${name}-${theme}.png`) });
        const checks = await workflow(family, name);
        assert(checks.length, `${family}/${name} has workflow evidence`);
        evidence.push({ family, name, theme, checks });
      }
  for (const theme of ["light", "dark"])
    for (const name of expected.table) {
      await mount("table", name, theme, true);
      const value = await page.locator('[data-slot="table-content"]').evaluate((table) => {
        const scroll = table.closest(
          '[data-slot="table-scroll-container"],[data-slot="table-resizable-container"]',
        );
        const bounds = scroll.getBoundingClientRect();
        return {
          tableWidth: table.getBoundingClientRect().width,
          containerWidth: bounds.width,
          containerLeft: bounds.left,
          containerRight: bounds.right,
          viewport: innerWidth,
          overflow: getComputedStyle(scroll).overflowX,
          documentWidth: document.documentElement.scrollWidth,
          columns: [...table.querySelectorAll("th")].map(
            (node) => node.getBoundingClientRect().width,
          ),
        };
      });
      assert(value.tableWidth > 390, `${name} retains source minimum`);
      assert(value.columns.every((width) => width > 0));
      assert.equal(
        value.documentWidth,
        value.viewport,
        `${name} has no document-level mobile overflow`,
      );
      assert(value.containerLeft >= 0 && value.containerRight <= value.viewport);
      assert.equal(value.overflow, "auto");
      const container = page.locator(
        '[data-slot="table-scroll-container"],[data-slot="table-resizable-container"]',
      );
      await container.evaluate((node) => {
        node.scrollLeft = node.scrollWidth;
      });
      const reachesLastColumn = await page
        .locator('[data-slot="table-content"] th')
        .last()
        .evaluate((node) => {
          const column = node.getBoundingClientRect();
          const viewport = node
            .closest('[data-slot="table-scroll-container"],[data-slot="table-resizable-container"]')
            .getBoundingClientRect();
          return column.right <= viewport.right + 1 && column.right > viewport.left;
        });
      assert(
        reachesLastColumn,
        `${name} can scroll to its last column without unreachable clipping`,
      );
      geometry.push({ name, theme, ...value });
      await page.screenshot({ path: resolve(output, `mobile-table-${name}-${theme}.png`) });
    }
  assert.equal(errors.length, 0, errors.join("\n"));
  await writeFile(
    resolve(output, "collection-results.json"),
    JSON.stringify(
      {
        node: process.versions.node,
        sourceEvidence,
        mounts: evidence.length,
        evidence,
        geometry,
        assetEvidence,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    `PASS: ${evidence.length} production both-theme mounts and workflows; ${geometry.length} mobile table geometry samples.`,
  );
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
