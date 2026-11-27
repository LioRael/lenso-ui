import { checkFrameworkParity } from "./framework-parity.mjs";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { test } from "bun:test";
import { chromium, webkit } from "playwright";
import { preview } from "vite";

const workspace = resolve(import.meta.dirname, "../..");
const adapter = join(workspace, "packages/ui-vue");
const run = promisify(execFile);

test("installed Vue adapter preserves StyleX, scoped slots, hydration and SDK interactions", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-vue-consumer-"));
  try {
    await cp(join(adapter, "test/fixture"), directory, { recursive: true });
    const packages: Record<string, string> = {};
    for (const name of ["tokens", "glass", "primitives", "ui-vue"]) {
      const cwd = join(workspace, "packages", name);
      const { version } = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
      await run("bun", ["pm", "pack", "--destination", directory, "--ignore-scripts"], { cwd });
      packages[`@lenso/${name}`] = `file:./lenso-${name}-${version}.tgz`;
    }
    const { dependencies, devDependencies } = JSON.parse(
      await readFile(join(adapter, "package.json"), "utf8"),
    );
    const { workspaces } = JSON.parse(await readFile(join(workspace, "package.json"), "utf8"));
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        overrides: packages,
        dependencies: {
          ...packages,
          vue: devDependencies.vue,
          "@ui-sdk/core": dependencies["@ui-sdk/core"],
          "@ui-sdk/vue": dependencies["@ui-sdk/vue"],
          "@stylexjs/stylex": workspaces.catalog["@stylexjs/stylex"],
        },
        devDependencies: {
          "@stylexjs/unplugin": workspaces.catalog["@stylexjs/unplugin"],
          "@vitejs/plugin-vue": devDependencies["@vitejs/plugin-vue"],
          "@types/node": workspaces.catalog["@types/node"],
          typescript: "6.0.3",
          vite: workspaces.catalog.vite,
          "vue-tsc": devDependencies["vue-tsc"],
        },
      }),
    );

    const commands = { cwd: directory };
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], commands);
    await run("node", ["node_modules/vue-tsc/bin/vue-tsc.js", "--noEmit"], commands);
    const vite = join(directory, "node_modules/vite/bin/vite.js");
    await run("node", [vite, "build", "--outDir", "out/client"], commands);
    await run("node", [vite, "build", "--ssr", "server.ts", "--outDir", "out/server"], commands);

    const templatePath = join(directory, "out/client/index.html");
    const { renderPage } = await import(
      pathToFileURL(join(directory, "out/server/server.js")).href
    );
    const html: string = await renderPage(await readFile(templatePath, "utf8"));
    assert.match(html, /data-lenso-slot="button-group"/);
    assert.match(html, /aria-label="Saved name">Mira</);
    await writeFile(templatePath, html);

    const server = await preview({
      configFile: false,
      root: directory,
      build: { outDir: "out/client" },
      preview: { host: "127.0.0.1", port: 0 },
    });

    try {
      const address = server.httpServer.address();
      assert(address && typeof address !== "string");
      for (const engine of [chromium, webkit]) {
        const browser = await engine.launch();
        try {
          const page = await browser.newPage();
          page.setDefaultTimeout(8000);
          const errors: string[] = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => {
            if (message.type() === "error" || /hydration/i.test(message.text()))
              errors.push(message.text());
          });
          await page.goto(`http://127.0.0.1:${address.port}/`);
          await page.waitForFunction(() => "agent" in window);

          await checkFrameworkParity(page);
          const group = page.getByRole("group", { name: "Bulk actions" });
          const apply = group.getByRole("button", { name: "Apply" });
          assert.equal(await apply.isDisabled(), true);
          assert.equal(await apply.getAttribute("data-variant"), "prominent");
          await page.getByRole("button", { name: "Toggle group" }).click();
          await apply.click();
          assert.equal(await page.getByLabel("Applied count").textContent(), "1");

          const glass = page.getByRole("group", { name: "Glass actions" });
          const paint = glass.locator("[data-lenso-glass-fusion]");
          await paint.waitFor({ state: "visible" });
          await page.getByRole("button", { name: "Toggle glass grouping" }).click();
          await paint.waitFor({ state: "hidden" });
          await page.getByRole("button", { name: "Show glass detail" }).press("Space");
          assert.equal(await page.getByLabel("Glass detail enabled").textContent(), "true");

          const name = page.getByRole("textbox", { name: "Name", exact: true });
          await name.fill("Lin");
          assert.equal(await page.getByLabel("Saved name").textContent(), "Lin");
          assert.equal(
            await name.evaluate((element) => getComputedStyle(element).borderRadius),
            "26px",
          );
          await page.getByRole("switch", { name: "Alerts" }).press("Space");
          assert.equal(await page.getByLabel("Alerts enabled").textContent(), "true");
          assert.equal(
            await page.getByRole("link", { name: "Read details" }).getAttribute("href"),
            "#details",
          );

          const email = page.getByRole("checkbox", { name: "Email reminders" });
          await email.press("Space");
          assert.equal(await page.getByLabel("Reminder channels").textContent(), "email");
          await email.locator('[data-lenso-slot="checkbox-indicator"] svg').first().waitFor();

          await page.getByRole("combobox", { name: "Role" }).click();
          await page.getByRole("option", { name: "Editor" }).click();
          assert.equal(await page.getByLabel("Selected role").textContent(), "editor");

          assert.equal(
            await page
              .locator('svg[data-lenso-slot="accordion-indicator"][aria-hidden="true"] > path')
              .count(),
            1,
          );
          assert.equal(
            await page
              .locator('svg[data-lenso-slot="disclosure-indicator"] > circle:only-child')
              .count(),
            1,
          );
          const trigger = page.getByRole("button", { name: "Open settings" });
          await trigger.press("Enter");
          await page.getByRole("dialog", { name: "Settings" }).waitFor();
          const settings = page.getByRole("dialog", { name: "Settings" });
          assert.equal(
            await settings.getByRole("button", { name: "Done" }).getAttribute("aria-label"),
            null,
          );
          const bareClose = settings.getByRole("button", { name: "Close", exact: true });
          assert.equal(await bareClose.locator("svg path").count(), 1);
          await bareClose.click();
          await settings.waitFor({ state: "hidden" });
          await trigger.press("Enter");
          await settings.waitFor();
          await page.keyboard.press("Escape");
          await page.getByRole("dialog", { name: "Settings" }).waitFor({ state: "hidden" });
          await page.waitForFunction(() => document.activeElement?.textContent === "Open settings");

          const search = page.getByRole("searchbox", { name: "Search records" });
          await search.fill("weekly");
          await page.getByRole("button", { name: "Clear record search" }).click();
          assert.equal(await search.inputValue(), "");

          const command = page.getByRole("combobox", { name: "Run command" });
          await command.fill("Rename");
          await command.press("ArrowDown");
          await command.press("Enter");
          assert.equal(await page.getByLabel("Selected command").textContent(), "rename");

          await page.getByRole("button", { name: "Edit accent" }).click();
          assert.equal(await page.getByLabel("Accent popup open").textContent(), "true");
          const accent = page.getByRole("textbox", { name: "Accent color" });
          await accent.fill("#00ff00");
          await accent.press("Enter");
          await page.waitForFunction(
            () => document.querySelector('[aria-label="Hue value"]')?.textContent === "120",
          );
          const preview = page.getByRole("img", { name: "Accent preview" });
          assert.match(
            await preview.evaluate((node) => getComputedStyle(node).backgroundImage),
            /rgb\(0, 255, 0\)/,
          );
          await page.keyboard.press("Escape");
          assert.equal(await page.getByLabel("Accent popup open").textContent(), "false");

          await page.getByRole("tab", { name: "Overview" }).press("ArrowRight");
          assert.equal(
            await page.getByRole("tab", { name: "Activity" }).getAttribute("aria-selected"),
            "true",
          );
          await page.getByRole("tabpanel", { name: "Activity" }).waitFor();

          const grid = page
            .locator('[data-lenso-slot="calendar-grid"]')
            .filter({ visible: true })
            .first();
          const positions = await grid
            .getByRole("columnheader")
            .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().x));
          assert.equal(new Set(positions).size, 7);
          const day = grid.locator('[data-value="2025-05-12"]');
          const fill = await day.evaluate((element) => getComputedStyle(element).backgroundColor);
          await day.press("Enter");
          assert.equal(await page.getByLabel("Selected day").textContent(), "2025-05-12");
          assert.notEqual(
            await day.evaluate((element) => getComputedStyle(element).backgroundColor),
            fill,
          );

          const dateTrigger = page.getByRole("button", { name: "Choose due date" });
          const datePopup = page.locator('[data-lenso-slot="date-picker-content"]');
          await dateTrigger.click();
          await datePopup.getByRole("button", { name: "Close" }).click();
          await datePopup.waitFor({ state: "hidden" });
          await dateTrigger.click();
          await datePopup.locator('[data-value="2025-05-13"]').press("Enter");
          assert.equal(await page.getByLabel("Due date value").textContent(), "2025-05-13");
          await datePopup.waitFor({ state: "hidden" });
          const range = page.locator('[aria-label="Vacation range"]');
          await range.locator('[data-value="2025-05-10"]').press("Enter");
          await range.locator('[data-value="2025-05-12"]').press("Enter");
          assert.equal(
            await page.getByLabel("Vacation value").textContent(),
            "2025-05-10 to 2025-05-12",
          );
          assert.equal(
            await page.getByRole("link", { name: "Next review page" }).getAttribute("href"),
            "#section-c",
          );

          const agentText = await page.evaluate(async () => {
            const agent = (
              window as Window & {
                agent?: {
                  act(input: {
                    steps: { ref: string; action: string; args: unknown[] }[];
                  }): Promise<unknown>;
                };
              }
            ).agent!;
            return agent.act({ steps: [{ ref: "Name", action: "setValue", args: ["Nora"] }] });
          });
          assert.equal(
            await page.getByLabel("Saved name").textContent(),
            "Nora",
            JSON.stringify(agentText),
          );
          const progress = page.getByRole("progressbar", { name: "Export progress" });
          assert.equal(await progress.getAttribute("aria-valuenow"), "30");
          const fillCircle = progress.locator('[data-lenso-slot="progress-circle-fill-circle"]');
          const offset = Number(await fillCircle.getAttribute("stroke-dashoffset"));
          assert.ok(Math.abs(offset - 16 * Math.PI) < 0.001, String(offset));

          const notes = page.getByRole("list", { name: "Notes" });
          const firstNote = notes.getByRole("checkbox", { name: "Select First note" });
          await firstNote.press("Space");
          assert.equal(await page.getByLabel("Selected notes").textContent(), "string:First note");
          assert.equal(
            await notes.getByText("First note", { exact: true }).getAttribute("data-selected"),
            "true",
          );
          const reorder = notes.getByRole("button", { name: "Reorder First note" });
          await reorder.press("Space");
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Space");
          const noteTitles = await notes
            .locator('[data-lenso-slot="list-title"]')
            .allTextContents();
          assert.deepEqual(noteTitles, ["Second note", "First note", "Third note"]);

          await page.getByRole("button", { name: "Show trailing actions" }).press("Enter");
          assert.equal(await page.getByLabel("Open swipe side").textContent(), "end");
          await page.getByRole("button", { name: "Archive note" }).press("Enter");
          assert.equal(await page.getByLabel("Archived notes").textContent(), "1");
          assert.equal(await page.getByLabel("Open swipe side").textContent(), "");

          const swipeBody = page.locator('[data-lenso-slot="swipe-actions-body"]');
          await swipeBody.scrollIntoViewIfNeeded();
          const swipeBox = await swipeBody.boundingBox();
          assert(swipeBox);
          const swipeY = swipeBox.y + swipeBox.height / 2;
          await page.mouse.move(swipeBox.x + swipeBox.width - 18, swipeY);
          await page.mouse.down();
          await page.mouse.move(swipeBox.x + 6, swipeY, { steps: 8 });
          await page.mouse.up();
          await page.waitForFunction(
            () => document.querySelector('[aria-label="Archived notes"]')?.textContent === "2",
          );

          await page.getByRole("button", { name: "Refresh", exact: true }).press("Enter");
          await page.waitForFunction(
            () => document.querySelector('[aria-label="Refresh count"]')?.textContent === "1",
          );
          await page.locator('[data-lenso-slot="refresh-control-viewport"]').evaluate((node) => {
            const touch = (clientY: number) => ({ identifier: 1, clientX: 30, clientY });
            for (const [type, position] of [
              ["touchstart", 10],
              ["touchmove", 110],
              ["touchend", 110],
            ] as const) {
              const event = new Event(type, { bubbles: true, cancelable: true });
              Object.defineProperties(event, {
                touches: { value: type === "touchend" ? [] : [touch(position)] },
                changedTouches: { value: [touch(position)] },
              });
              node.dispatchEvent(event);
            }
          });
          await page.waitForFunction(
            () => document.querySelector('[aria-label="Refresh count"]')?.textContent === "2",
          );

          const wheel = page.getByRole("listbox", { name: "Priority wheel" });
          const wheelAgent = await page.evaluate(async () => {
            const agent = (
              window as Window & {
                agent?: {
                  act(options: {
                    steps: { ref: string; action: string; args: string[] }[];
                  }): Promise<unknown>;
                };
              }
            ).agent!;
            return agent.act({
              steps: [{ ref: "Priority wheel", action: "setValue", args: ["high"] }],
            });
          });
          assert.equal(
            await page.getByLabel("Priority value").textContent(),
            "high",
            JSON.stringify(wheelAgent),
          );
          await wheel.getByRole("option", { name: "High", exact: true }).press("ArrowUp");
          assert.equal(await page.getByLabel("Priority value").textContent(), "low");
          const priority = page.getByRole("form", { name: "Priority form" });
          assert.equal(
            await priority.evaluate((node) =>
              new FormData(node as HTMLFormElement).get("priority"),
            ),
            "low",
          );

          const slides = page.getByRole("navigation", { name: "Review slides" });
          await slides
            .getByRole("button", { name: "Page 5 of 20", exact: true })
            .press("ArrowLeft");
          assert.equal(await page.getByLabel("Current slide").textContent(), "5");
          await page.keyboard.press("End");
          assert.equal(await page.getByLabel("Current slide").textContent(), "19");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "Page 20 of 20",
          );
          assert.equal(await slides.getByRole("button").count(), 9);

          const moreTabs = page.getByRole("button", { name: "More settings tabs" });
          await moreTabs.press("Enter");
          const overflowMenu = page.getByRole("menu", { name: "More settings tabs" });
          await overflowMenu.getByRole("menuitem", { name: "Privacy controls" }).press("Enter");
          await page.getByRole("tabpanel", { name: "Privacy controls" }).waitFor();
          await page.waitForFunction(
            () => document.activeElement?.textContent === "Privacy controls",
          );
          assert.equal(
            await page.getByRole("tab", { name: "Privacy controls" }).getAttribute("aria-selected"),
            "true",
          );

          await page.getByText("File options", { exact: true }).click({ button: "right" });
          await page.getByRole("menuitem", { name: "Quick action" }).waitFor();
          await page.locator("[data-context-preview-motion]").waitFor({ state: "attached" });
          await page.getByRole("menuitem", { name: "More actions" }).click();
          const details = page.getByRole("menuitemcheckbox", { name: "Show details" });
          await details.press("Space");
          assert.equal(await page.getByLabel("File details enabled").textContent(), "true");
          await page.getByRole("menuitem", { name: "Move file" }).press("ArrowRight");
          await page.getByRole("menuitem", { name: "Archive file" }).waitFor();
          await page.keyboard.press("Escape");
          await page.keyboard.press("Escape");
          await page.locator("[data-context-preview-motion]").waitFor({ state: "detached" });

          await page.getByRole("button", { name: "Show pill" }).click();
          const pill = page.locator('[data-lenso-slot="toast"][data-variant="pill"]');
          await pill.getByText("Sending", { exact: true }).waitFor();
          const closeToast = pill.getByRole("button", { name: "Close toast" });
          const originalClose = await closeToast.elementHandle();
          await page.waitForFunction(() => {
            const toast = document.querySelector<HTMLElement>(
              '[data-lenso-slot="toast"][data-variant="pill"]',
            );
            return parseFloat(toast?.style.getPropertyValue("--toast-pill-width") ?? "") > 0;
          });
          const originalWidth = await pill.evaluate((node) =>
            parseFloat(node.style.getPropertyValue("--toast-pill-width")),
          );
          await page.getByRole("button", { name: "Update pill" }).click();
          await pill.getByText("The report was sent to all recipients").waitFor();
          await pill.getByRole("button", { name: "View" }).waitFor();
          assert.equal(
            await closeToast.evaluate((node, original) => node === original, originalClose),
            true,
          );
          await originalClose?.dispose();
          await page.waitForFunction((width) => {
            const toast = document.querySelector<HTMLElement>(
              '[data-lenso-slot="toast"][data-variant="pill"]',
            );
            return parseFloat(toast?.style.getPropertyValue("--toast-pill-width") ?? "") > width;
          }, originalWidth);
          await closeToast.click();
          await pill.waitFor({ state: "hidden" });

          const topics = page.getByRole("grid", { name: "Topics" });
          const alpha = topics.getByRole("row", { name: "Alpha" });
          const beta = topics.getByRole("row", { name: "Beta" });
          await alpha.press("ArrowRight");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "Beta",
          );
          await beta.press("Space");
          assert.equal(await beta.getAttribute("aria-selected"), "true");
          assert.equal(await beta.locator("[aria-current]").getAttribute("aria-current"), "true");
          await beta.press("Delete");
          assert.equal(await beta.count(), 1);
          await page.getByRole("button", { name: "Allow tag removal" }).click();
          await beta.press("Delete");
          await beta.waitFor({ state: "detached" });
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "Gamma",
          );

          const yearTrigger = page.getByRole("button", { name: "May 2025, year selector" });
          await yearTrigger.click();
          const years = page.getByRole("group", { name: "Years" });
          await years.waitFor();
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("data-year") === "2025",
          );
          await page.keyboard.press("ArrowLeft");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("data-year") === "2024",
          );
          await page.keyboard.press("Enter");
          assert.equal(await page.getByLabel("Selected month").textContent(), "2025-05");
          assert.equal(await page.getByLabel("Year picker open").textContent(), "true");
          await page.keyboard.press("Escape");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "May 2025, year selector",
          );
          await page.getByRole("button", { name: "Allow 2024" }).click();
          await yearTrigger.click();
          await years.getByRole("button", { name: "2024" }).click();
          assert.equal(await page.getByLabel("Selected month").textContent(), "2024-05");
          await years.waitFor({ state: "hidden" });

          const navigation = page.getByRole("navigation", { name: "Section navigation" });
          const summary = navigation.getByRole("link", { name: "Summary destination" });
          const records = navigation.getByRole("link", { name: "Records destination" });
          await summary.focus();
          await page
            .getByRole("button", { name: "Minimize section navigation" })
            .evaluate((node) => (node as HTMLButtonElement).click());
          const expand = navigation.getByRole("button", { name: "Expand navigation" });
          await expand.waitFor();
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("aria-label") === "Expand navigation",
          );
          await expand.press("Enter");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("href") === "#summary",
          );
          const scroller = page.getByLabel("Navigation scroll area");
          await scroller.evaluate((element) => {
            element.scrollTop = 64;
          });
          await expand.waitFor();
          await scroller.evaluate((element) => {
            element.scrollTop = 0;
          });
          await expand.waitFor({ state: "hidden" });

          await navigation
            .locator("[data-tab-bar-group][data-indicator-ready]:not([data-minimize-moving])")
            .waitFor();
          await summary.scrollIntoViewIfNeeded();
          const from = await summary.boundingBox();
          const to = await records.boundingBox();
          assert(from && to);
          await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
          await page.mouse.down();
          try {
            await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
            assert.equal(
              await navigation
                .locator("[data-tab-bar-group]")
                .getAttribute("data-highlight-active"),
              "",
            );
          } finally {
            await page.mouse.up();
          }
          await navigation.locator('a[href="#records"][aria-current="page"]').waitFor();

          const windowed = page.getByRole("table", { name: "Windowed records" });
          const first = windowed.getByRole("cell", { name: "Record 1", exact: true });
          assert.ok((await windowed.getByRole("row").count()) < 15);
          await first.press("Control+a");
          assert.equal(await page.getByLabel("Window selection").textContent(), "99");
          await first.press("Control+End");
          await page.waitForFunction(() => document.activeElement?.textContent === "Record 100");
          await page.keyboard.press("ArrowUp");
          await page.waitForFunction(() => document.activeElement?.textContent === "Record 98");
          assert.equal(await windowed.getAttribute("aria-rowcount"), "101");

          const folders = page.getByRole("treegrid", { name: "Folders" });
          const parent = folders.getByRole("gridcell", { name: /Parent row/ });
          const child = folders.getByRole("gridcell", { name: "Child row" });
          await parent.press("ArrowRight");
          assert.equal(
            await folders.getByRole("row", { name: "Child row" }).getAttribute("aria-level"),
            "2",
          );
          await parent.press("ArrowRight");
          await page.waitForFunction(() => document.activeElement?.textContent === "Child row");
          await child.press("ArrowLeft");
          assert.equal(await parent.evaluate((node) => document.activeElement === node), true);
          await parent.press("ArrowLeft");
          await child.waitFor({ state: "detached" });
          await folders.getByRole("button", { name: "Drag parent" }).press("Enter");
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");
          assert.equal(await page.getByLabel("Last drop").textContent(), "parent before peer");
          await folders.evaluate((table) => {
            const rows = [...table.querySelectorAll<HTMLTableRowElement>("tbody tr")];
            const source = rows.find((row) => row.textContent?.includes("Parent row"))!;
            const target = rows.find((row) => row.textContent === "Peer row")!;
            const dataTransfer = new DataTransfer();
            source.dispatchEvent(
              new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }),
            );
            target.dispatchEvent(
              new DragEvent("drop", {
                bubbles: true,
                cancelable: true,
                dataTransfer,
                clientY: target.getBoundingClientRect().bottom - 1,
              }),
            );
            source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer }));
          });
          assert.equal(await page.getByLabel("Last drop").textContent(), "parent after peer");

          const accounts = page.getByRole("table", { name: "Accounts" });
          const nameColumn = accounts.getByRole("columnheader", { name: /Name/ });
          await nameColumn.press("Enter");
          assert.equal(await nameColumn.getAttribute("aria-sort"), "ascending");
          await nameColumn.press("Space");
          assert.equal(await nameColumn.getAttribute("aria-sort"), "descending");
          const resizer = accounts.getByRole("separator", { name: "Resize name column" });
          await resizer.press("ArrowRight");
          assert.equal(await resizer.getAttribute("aria-valuenow"), "100");
          await resizer.scrollIntoViewIfNeeded();
          const resizerBox = await resizer.boundingBox();
          assert(resizerBox);
          await page.mouse.move(
            resizerBox.x + resizerBox.width / 2,
            resizerBox.y + resizerBox.height / 2,
          );
          await page.mouse.down();
          await page.mouse.move(
            resizerBox.x + resizerBox.width / 2 + 35,
            resizerBox.y + resizerBox.height / 2,
          );
          await page.mouse.up();

          await page.waitForFunction(
            () =>
              document
                .querySelector('[aria-label="Resize name column"]')
                ?.getAttribute("aria-valuenow") === "135",
          );
          await accounts.getByText("Load more accounts").scrollIntoViewIfNeeded();
          await page.waitForFunction(
            () => document.querySelector('[aria-label="Account loads"]')?.textContent === "1",
          );

          const sections = page.getByRole("navigation", { name: "Section index" });
          const theme = page.locator('[data-lenso-slot="theme-scope"][data-theme="dark"]');
          assert.equal(await theme.getAttribute("data-theme"), "dark");
          assert.equal(await sections.evaluate((node) => getComputedStyle(node).direction), "rtl");
          assert.equal(await page.getByLabel("Mounted").textContent(), "true");
          await sections.getByRole("link", { name: "A", exact: true }).press("ArrowDown");
          await page.waitForFunction(
            () => document.activeElement?.getAttribute("href") === "#section-c",
          );
          await page.keyboard.press("Enter");
          assert.equal(await page.getByLabel("Current section").textContent(), "c");
          await theme.locator('[data-lenso-slot="scroll-edge"][data-scroll-active]').waitFor();
          assert.deepEqual(errors, [], engine.name());
        } finally {
          await browser.close();
        }
      }
    } finally {
      await server.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
