import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { checkFinanceTables } from "./theme-builder-finances.browser.mjs";

const require = createRequire(import.meta.url);
const examples = ["Dashboard", "Mail", "Chat", "Finances"];

async function checkDashboard(page) {
  await page.getByRole("tab", { name: "Dashboard", exact: true }).click();
  const dashboard = page.getByRole("region", { name: "dashboard local example", exact: true });
  const report = dashboard.getByRole("tabpanel", { name: "Overview", exact: true });
  const overview = dashboard.getByRole("tab", { name: "Overview", exact: true });
  assert.equal(await overview.getAttribute("aria-controls"), await report.getAttribute("id"));
  const reportTabs = dashboard.getByRole("tablist", { name: "Report mode", exact: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const positions = await reportTabs.getByRole("tab").evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { left: rect.left, top: rect.top, right: rect.right };
      }),
    );
    assert.ok(
      positions.every((position) => Math.abs(position.top - positions[0].top) < 1),
      `Dashboard report tabs must remain horizontal at ${width}px`,
    );
    assert.ok(
      positions[1].left >= positions[0].right - 1 && positions[2].left >= positions[1].right - 1,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  const salesTab = dashboard.getByRole("tab", { name: "Sales", exact: true });
  assert.equal(await salesTab.evaluate((node) => node === document.activeElement), true);
  await overview.click();
  const before = await report.locator("figcaption").first().textContent();
  await dashboard.getByRole("combobox", { name: "Reporting range", exact: true }).click();
  await page.getByRole("option", { name: "Weekly", exact: true }).click();
  assert.notEqual(await report.locator("figcaption").first().textContent(), before);
  const metrics = report.locator("dl").first();
  await metrics.getByText("$12,600", { exact: true }).waitFor();
  await metrics.getByText("$6,250", { exact: true }).waitFor();
  await metrics.getByText("$6,350", { exact: true }).waitFor();
  assert.ok(
    await report
      .locator("svg desc")
      .first()
      .textContent()
      .then((text) => text.includes("Total $12,600")),
  );
  await dashboard.getByRole("searchbox", { name: "Search employees", exact: true }).fill("Alex");
  assert.equal(await dashboard.locator("tbody tr").count(), 1);
  await dashboard.getByRole("button", { name: "Tasks", exact: true }).click();
  const tasks = page.getByRole("dialog", { name: "Team tasks", exact: true });
  await tasks.waitFor();
  const task = tasks.getByRole("checkbox", { name: "Review monthly sales report", exact: true });
  const checked = await task.getAttribute("aria-checked");
  await task.focus();
  await page.keyboard.press("Space");
  assert.notEqual(await task.getAttribute("aria-checked"), checked);
  await page.keyboard.press("Escape");
  await tasks.waitFor({ state: "hidden" });
  const search = dashboard.getByRole("searchbox", { name: "Search employees", exact: true });
  await search.fill("");
  await dashboard.getByRole("tab", { name: "Sales", exact: true }).focus();
  await page.keyboard.press("Enter");
  const sales = dashboard.getByRole("tabpanel", { name: "Sales", exact: true });
  await sales.waitFor();
  assert.ok((await sales.locator("svg desc").first().textContent()).includes("Total 126"));
  await overview.click();
  const table = dashboard.getByRole("table", { name: "Employees", exact: true });
  const employeeColumn = table.getByRole("columnheader", { name: /Employee/ });
  assert.equal(await employeeColumn.getAttribute("aria-sort"), "ascending");
  await employeeColumn.click();
  assert.equal(await employeeColumn.getAttribute("aria-sort"), "descending");
  assert.ok((await table.locator("tbody tr").first().textContent()).includes("Sam Rivera"));
  await employeeColumn.click();
  await table.locator("tbody td").first().focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await table
      .locator("tbody td")
      .nth(1)
      .evaluate((node) => node === document.activeElement),
    true,
  );
  const invite = dashboard.getByRole("button", { name: "Invite", exact: true });
  await invite.click();
  const form = page.getByRole("dialog", { name: "Invite employee", exact: true });
  await form.waitFor();
  await form.getByRole("textbox", { name: "Name", exact: true }).fill("=Sample employee");
  await form.getByRole("textbox", { name: "Email", exact: true }).fill("sample@example.com");
  await form.getByRole("textbox", { name: "Role", exact: true }).fill("Designer");
  await form.getByRole("button", { name: "Add employee", exact: true }).click();
  await form.waitFor({ state: "hidden" });
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await invite.elementHandle(),
  );
  await search.fill("=Sample employee");
  assert.equal(await dashboard.locator("tbody tr").count(), 1);
  const downloaded = page.waitForEvent("download");
  await dashboard.getByRole("button", { name: "Download CSV", exact: true }).click();
  const csv = await readFile(await (await downloaded).path(), "utf8");
  assert.ok(
    csv.includes('"\'=Sample employee"'),
    "User-controlled CSV formulas must be neutralized.",
  );
  await dashboard.getByRole("button", { name: "Edit =Sample employee", exact: true }).click();
  const edit = page.getByRole("dialog", { name: "Edit employee · =Sample employee", exact: true });
  await edit.getByRole("textbox", { name: "Name", exact: true }).fill("Renamed employee");
  await edit.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
  const team = dashboard.getByRole("heading", { name: /Employees/ });
  await page.waitForFunction((node) => node === document.activeElement, await team.elementHandle());
  await search.fill("Renamed employee");
  assert.equal(await dashboard.locator("tbody tr").count(), 1);
  await dashboard.getByRole("button", { name: "Remove Renamed employee", exact: true }).click();
  const removal = page.getByRole("dialog", {
    name: "Remove employee · Renamed employee",
    exact: true,
  });
  await removal.getByRole("button", { name: "Remove employee", exact: true }).click();
  await removal.waitFor({ state: "hidden" });
  await dashboard.getByText("No employees match your filters.", { exact: true }).waitFor();
  await search.fill("");
}

async function checkChat(page) {
  await page.getByRole("tab", { name: "Chat", exact: true }).click();
  const chat = page.getByRole("region", { name: "chat local example", exact: true });
  const history = chat.getByLabel("Message history", { exact: true });
  await page.waitForFunction(
    (node) => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop) < 2,
    await history.elementHandle(),
  );
  await history.evaluate((node) => {
    node.scrollTop = 0;
  });
  await page.getByRole("button", { name: "Light theme", exact: true }).click();
  assert.equal(
    await history.evaluate((node) => node.scrollTop),
    0,
    "Theme edits must not move the reader.",
  );
  await page.setViewportSize({ width: 390, height: 1000 });
  assert.equal(
    await history.evaluate((node) => node.scrollTop),
    0,
    "Resizing must not jump to the latest answer.",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  const message = chat.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("Keep this design draft.");
  await chat.getByRole("option", { name: "Check keyboard navigation", exact: true }).click();
  assert.equal(await message.inputValue(), "");
  await chat.getByRole("option", { name: "Review a dashboard layout", exact: true }).click();
  assert.equal(await message.inputValue(), "Keep this design draft.");
  const attachment = chat.locator('input[type="file"]');
  await attachment.setInputFiles({
    name: "review.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("Keep the compact header.\n<script>This stays literal text.</script>"),
  });
  await page.waitForFunction(
    (node) => node.value.includes("This stays literal text."),
    await message.elementHandle(),
  );
  const importedDraft = await message.inputValue();
  await attachment.setInputFiles({
    name: "too-large.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(65537, "x"),
  });
  await chat.getByRole("alert").waitFor();
  assert.equal(
    await message.inputValue(),
    importedDraft,
    "Rejected imports must not replace the draft.",
  );
  await page.evaluate(() => {
    const readText = Blob.prototype.text;
    window.restoreChatFileRead = () => {
      Blob.prototype.text = readText;
    };
    Blob.prototype.text = function () {
      if (!(this instanceof File) || this.name !== "delayed.txt") return readText.call(this);
      return new Promise((resolve) => {
        window.releaseChatFileRead = async () => {
          resolve(await readText.call(this));
        };
      });
    };
  });
  await attachment.setInputFiles({
    name: "delayed.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("A delayed note for the original conversation."),
  });
  await page.waitForFunction(() => typeof window.releaseChatFileRead === "function");
  const otherConversation = chat.getByRole("option", {
    name: "Check keyboard navigation",
    exact: true,
  });
  await otherConversation.click();
  await page.evaluate(() => window.releaseChatFileRead());
  assert.equal(
    await otherConversation.evaluate((node) => node === document.activeElement),
    true,
    "A completed import must not steal focus into the newly selected conversation.",
  );
  assert.equal(await message.inputValue(), "");
  await chat.getByRole("option", { name: "Review a dashboard layout", exact: true }).click();
  assert.ok((await message.inputValue()).includes("A delayed note for the original conversation."));
  await page.evaluate(() => {
    window.restoreChatFileRead();
    delete window.restoreChatFileRead;
    delete window.releaseChatFileRead;
  });
  await message.fill("Local theme review at 14:00.");
  await chat.getByRole("button", { name: "Send message", exact: true }).focus();
  await page.keyboard.press("Enter");
  await chat.getByText("Local theme review at 14:00.").waitFor();
  assert.equal(await message.inputValue(), "");
  await page.getByRole("tab", { name: "Dashboard", exact: true }).click();
  await page.getByRole("tab", { name: "Chat", exact: true }).click();
  assert.equal(await chat.getByText("Local theme review at 14:00.").count(), 1);
  const downloaded = page.waitForEvent("download");
  await chat.getByRole("button", { name: "Export transcript", exact: true }).click();
  const transcript = await readFile(await (await downloaded).path(), "utf8");
  assert.ok(transcript.includes("Local theme review at 14:00."));
  assert.equal(
    await page.getByRole("searchbox", { name: "Search messages", exact: true }).count(),
    0,
  );
  const searchTrigger = chat.getByRole("button", { name: "Search messages", exact: true });
  await searchTrigger.click();
  const messageSearch = page.getByRole("searchbox", { name: "Search messages", exact: true });
  await messageSearch.fill("14:00");
  assert.equal(await chat.getByText("Local theme review at 14:00.").count(), 1);
  await messageSearch.fill("");
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await searchTrigger.elementHandle(),
  );
  await chat.getByRole("button", { name: "New conversation", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New conversation", exact: true });
  await dialog
    .getByRole("textbox", { name: "Conversation title", exact: true })
    .fill("Theme review");
  await dialog.getByRole("button", { name: "Create conversation", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await message.fill("A separate local conversation.");
  await chat.getByRole("button", { name: "Send message", exact: true }).click();
  await chat.getByText("A separate local conversation.").waitFor();
  await chat.getByRole("option", { name: "Review a dashboard layout", exact: true }).click();
  assert.equal(await chat.getByText("A separate local conversation.").count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  const navigation = chat.getByRole("button", { name: "Conversations", exact: true });
  await navigation.click();
  await page.getByRole("button", { name: "New conversation", exact: true }).click();
  await dialog.waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "New conversation", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await navigation.elementHandle(),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
}

async function checkMail(page) {
  await page.getByRole("tab", { name: "Mail", exact: true }).click();
  const mail = page.getByRole("region", { name: "mail local example", exact: true });
  const compose = mail.getByRole("button", { name: "Compose", exact: true });
  await compose.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "New message", exact: true });
  await dialog.waitFor();
  const accent = await page
    .getByTestId("theme-builder")
    .evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim());
  assert.equal(
    await dialog.evaluate((node) => getComputedStyle(node).getPropertyValue("--accent").trim()),
    accent,
    "The local mail portal must keep the edited theme.",
  );
  await dialog.getByRole("textbox", { name: "To", exact: true }).fill("review@example.com");
  await dialog.getByRole("textbox", { name: "Subject", exact: true }).fill("Theme review");
  await dialog
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("This message stays in the local example.");
  await dialog.getByRole("button", { name: "Send locally", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await compose.elementHandle(),
  );
  const replyTrigger = mail.getByRole("button", { name: "Reply", exact: true });
  await replyTrigger.click();
  const reply = page.getByRole("dialog", { name: "Reply to message", exact: true });
  await reply.getByRole("textbox", { name: "Message", exact: true }).fill("Local review reply.");
  await reply.getByRole("button", { name: "Send locally", exact: true }).click();
  await reply.waitFor({ state: "hidden" });
  await mail.getByText("Local review reply.", { exact: true }).waitFor();
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await replyTrigger.elementHandle(),
  );
}

async function checkFinances(page) {
  await page.getByRole("tab", { name: "Finances", exact: true }).click();
  const finances = page.getByRole("region", { name: "finances local example", exact: true });
  await finances.getByRole("combobox", { name: "Month", exact: true }).click();
  await page.getByRole("option", { name: "April 2026", exact: true }).click();
  await finances.locator("dl").getByText("$4,853.50", { exact: true }).waitFor();
  const categories = finances.getByRole("table", { name: "Expense categories", exact: true });
  assert.equal(await categories.getByRole("row").count(), 6);
  const categoryHeights = await categories
    .locator("tbody tr")
    .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
  assert.ok(
    categoryHeights.every((height) => height === 40),
    "The native category table must retain compact rows.",
  );
  const categoryHeader = categories.getByRole("columnheader", { name: "Category", exact: true });
  const headingBounds = await categoryHeader.boundingBox();
  assert.ok(
    headingBounds.height > 12 && headingBounds.width > 24,
    "Focusable native headers must not be clipped.",
  );
  await categories.getByRole("cell").first().focus();
  await page.keyboard.press("ArrowUp");
  assert.equal(await categoryHeader.evaluate((node) => node === document.activeElement), true);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await categories
      .getByRole("cell")
      .nth(1)
      .evaluate((node) => node === document.activeElement),
    true,
  );
  const rent = categories.getByRole("button", { name: "Filter Rent transactions", exact: true });
  await rent.click();
  assert.equal(await rent.getAttribute("aria-pressed"), "true");
  const transactions = finances.getByRole("table", {
    name: "Recent transactions · April 2026",
    exact: true,
  });
  const typeCell = transactions
    .getByRole("cell")
    .filter({ hasText: /^Expense$/ })
    .first();
  assert.ok(
    await typeCell.evaluate((node) => {
      const cell = node.getBoundingClientRect();
      const label = node.firstElementChild.getBoundingClientRect();
      return (
        label.left >= cell.left &&
        label.right <= cell.right &&
        label.top >= cell.top &&
        label.bottom <= cell.bottom
      );
    }),
    "The transaction type component must remain inside its table cell.",
  );
  assert.equal(await transactions.locator("tbody tr").count(), 1);
  assert.ok((await transactions.locator("tbody tr").textContent()).includes("Studio rent"));
  await finances.getByRole("button", { name: "View all transactions", exact: true }).click();
  assert.equal(await transactions.locator("tbody tr").count(), 7);
  const amountColumn = transactions.getByRole("columnheader", { name: "Amount", exact: true });
  await amountColumn.click();
  assert.equal(await amountColumn.getAttribute("aria-sort"), "ascending");
  assert.ok((await transactions.locator("tbody tr").first().textContent()).includes("Studio rent"));
  await amountColumn.focus();
  await page.keyboard.press("Enter");
  assert.equal(await amountColumn.getAttribute("aria-sort"), "descending");
  assert.ok(
    (await transactions.locator("tbody tr").first().textContent()).includes(
      "Brand identity project",
    ),
  );
  const add = finances.getByRole("button", { name: "Add transaction", exact: true });
  await add.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Add transaction", exact: true });
  await dialog.waitFor();
  await dialog
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Theme demo purchase");
  await dialog.getByLabel("Amount (USD)", { exact: true }).fill("12.345");
  await dialog.getByRole("button", { name: "Save transaction", exact: true }).click();
  await dialog.getByRole("alert").waitFor();
  assert.equal(
    await dialog.getByLabel("Amount (USD)", { exact: true }).getAttribute("aria-invalid"),
    "true",
  );
  await dialog.getByLabel("Amount (USD)", { exact: true }).fill("12.34");
  await dialog.getByRole("button", { name: "Save transaction", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await finances.getByText("Theme demo purchase", { exact: true }).waitFor();
  await finances.locator("dl").getByText("$4,841.16", { exact: true }).waitFor();
  assert.ok((await finances.locator("svg desc").textContent()).includes("Apr 30: $4,841.16"));
  await page.waitForFunction((node) => node === document.activeElement, await add.elementHandle());
  await finances
    .getByRole("searchbox", { name: "Search transactions", exact: true })
    .fill("Theme demo purchase");
  assert.equal(await transactions.locator("tbody tr").count(), 1);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole("tab", { name: "Mail", exact: true }).click();
  const mail = page.getByRole("region", { name: "mail local example", exact: true });
  await mail.getByRole("searchbox", { name: "Search mail", exact: true }).fill("onboarding");
  const candidate = mail.getByRole("option", {
    name: "Oliver Grant: What we heard in the onboarding interviews",
    exact: true,
  });
  await candidate.click();
  await mail
    .getByRole("heading", { name: "What we heard in the onboarding interviews", exact: true })
    .waitFor();
  await mail.getByRole("button", { name: "Back to list", exact: true }).click();
  await page.waitForFunction(
    (node) => node === document.activeElement,
    await candidate.elementHandle(),
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
}

// The old remote-frame protocol proved neither local component behavior nor
// responsive theme inheritance. Exercise every local application in situ.
export async function checkThemeBuilderExamples(page, base) {
  const remoteRequests = [];
  const onRequest = (request) => {
    if (new URL(request.url()).hostname === "heroui.pro") remoteRequests.push(request.url());
  };
  page.on("request", onRequest);
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/en/theme-builder?hue=145&radius=large`);
    await page.getByRole("tab", { name: "Dashboard", exact: true }).waitFor();
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    for (const mode of ["Light", "Dark"]) {
      await page.getByRole("button", { name: `${mode} theme`, exact: true }).click();
      for (const name of examples) {
        const tab = page.getByRole("tab", { name, exact: true });
        await tab.click();
        const panel = page.getByRole("tabpanel", { name, exact: true });
        await panel.waitFor();
        assert.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"));
        assert.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"));
        const region = page.getByRole("region", {
          name: `${name.toLowerCase()} local example`,
          exact: true,
        });
        await region.waitFor();
        assert.equal(await page.locator("iframe").count(), 0);
        const scopeFont = await page
          .getByTestId("theme-builder")
          .evaluate((node) => getComputedStyle(node).fontFamily);
        assert.equal(await region.evaluate((node) => getComputedStyle(node).fontFamily), scopeFont);
        const audit = await region.evaluate(async (node) =>
          window.axe.run(node, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
            rules: { "color-contrast": { enabled: false } },
          }),
        );
        assert.deepEqual(
          audit.violations.map((violation) => violation.id),
          [],
          `${name}/${mode} accessibility`,
        );
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 1000 });
          if (name === "Dashboard" && width <= 390) {
            const activeReport = region.getByRole("tabpanel");
            await page.waitForFunction(
              (node) =>
                [...node.querySelectorAll("svg[role=img]")].every(
                  (plot) =>
                    Math.abs(plot.getBoundingClientRect().width / plot.viewBox.baseVal.width - 1) <
                      0.02 &&
                    Math.abs(
                      plot.getBoundingClientRect().height / plot.viewBox.baseVal.height - 1,
                    ) < 0.02,
                ),
              await activeReport.elementHandle(),
            );
            const cards = await activeReport
              .locator("dl > div")
              .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
            assert.equal(cards.length, 4);
            assert.ok(
              cards.every((card) => Math.abs(card.x - cards[0].x) < 1 && card.height === 100),
              "Narrow Dashboard metrics must form one full-width column.",
            );
            assert.ok(cards[1].top >= cards[0].bottom + 11);
            const plots = await activeReport.locator("svg[role=img]").evaluateAll((nodes) =>
              nodes.map((node) => ({
                scaleX: node.getBoundingClientRect().width / node.viewBox.baseVal.width,
                scaleY: node.getBoundingClientRect().height / node.viewBox.baseVal.height,
              })),
            );
            assert.ok(
              plots.every(
                (plot) => Math.abs(plot.scaleX - 1) < 0.02 && Math.abs(plot.scaleY - 1) < 0.02,
              ),
              "Chart text must keep its rendered size rather than shrinking with a fixed SVG viewport.",
            );
          }
          if (name === "Chat") {
            const send = await region
              .getByRole("button", { name: "Send message", exact: true })
              .boundingBox();
            assert.equal(send.width, 36);
            assert.equal(send.height, 36);
            assert.ok(
              await region
                .getByRole("button", { name: "Send message", exact: true })
                .evaluate(
                  (node) =>
                    parseFloat(getComputedStyle(node).borderTopLeftRadius) >= node.clientWidth / 2,
                ),
              "The compact send action must be circular, not square.",
            );
            assert.equal(
              await page.getByRole("searchbox", { name: "Search messages", exact: true }).count(),
              0,
            );
          }
          for (const direction of ["ltr", "rtl"]) {
            await page.evaluate((dir) => {
              document.documentElement.dir = dir;
            }, direction);
            assert.ok(
              await region.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
              `${name}/${mode}/${width}/${direction} local example overflows`,
            );
            assert.ok(
              await page.evaluate(
                () =>
                  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
              ),
              `${name}/${width} document overflows`,
            );
          }
        }
        await page.evaluate(() => {
          document.documentElement.dir = "ltr";
        });
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
    }
    await checkDashboard(page);
    await checkChat(page);
    await checkMail(page);
    await checkFinances(page);
    await checkFinanceTables(page, base);
    assert.deepEqual(
      remoteRequests,
      [],
      "Local application previews must never request HeroUI Pro.",
    );
  } finally {
    page.off("request", onRequest);
  }
}
