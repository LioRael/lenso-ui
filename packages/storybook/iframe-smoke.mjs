import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [directory, playwrightModule, ...options] = process.argv.slice(2);
const replayAssets = options.includes("--replay-source-assets");
const familyFilter = options.find((option) => option !== "--replay-source-assets");
assert(
  directory && playwrightModule,
  "Usage: node iframe-smoke.mjs <storybook-static> <playwright/index.mjs>",
);
const root = resolve(directory);
const { chromium } = await import(pathToFileURL(resolve(playwrightModule)).href);
const mime = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".html": "text/html",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const path = resolve(root, `.${pathname}`);
    assert(path.startsWith(`${root}/`));
    const data = await readFile(path);
    response.setHeader("Content-Type", mime[extname(path)] ?? "application/octet-stream");
    response.end(data);
  } catch {
    response.statusCode = 404;
    response.end();
  }
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const expectedSourceFailures = [];
const sourceAssets = new Map();
page.setDefaultNavigationTimeout(60000);
async function captureAsset(url) {
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      assert(response.ok, `${response.status}: ${url}`);
      const contentType = response.headers.get("content-type") ?? "";
      assert(contentType.startsWith("image/"), `Not a source image: ${url} (${contentType})`);
      const body = Buffer.from(await response.arrayBuffer());
      assert(body.length > 0 && body.length < 8 * 1024 * 1024, `Invalid image size: ${url}`);
      console.log("SOURCE_ASSET", url, createHash("sha256").update(body).digest("hex"));
      return { body, contentType };
    } catch (error) {
      failure = error;
      if (attempt < 2) await new Promise((ready) => setTimeout(ready, 250 * (attempt + 1)));
    }
  }
  throw new Error(`Source asset unavailable: ${url}`, { cause: failure });
}
if (replayAssets) {
  await page.route(
    /^https:\/\/(?:img\.heroui\.chat|heroui-assets\.nyc3\.cdn\.digitaloceanspaces\.com|app\.requestly\.io)\//,
    async (route) => {
      const url = route.request().url();
      try {
        if (!sourceAssets.has(url)) sourceAssets.set(url, captureAsset(url));
        const asset = await sourceAssets.get(url);
        const delay = /\/delay\/(\d+)\//.exec(url)?.[1];
        if (delay) await new Promise((ready) => setTimeout(ready, Number(delay)));
        await route.fulfill({ status: 200, contentType: asset.contentType, body: asset.body });
      } catch (error) {
        errors.push(error.message);
        await route.abort();
      }
    },
  );
}
let activeStory;
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() !== "error") return;
  if (
    activeStory === "components-media-avatar--fallback" &&
    message.location().url === "https://invalid-url-to-show-fallback.com/image.jpg"
  ) {
    expectedSourceFailures.push(message.text());
    return;
  }
  errors.push(`${message.text()} (${message.location().url})`);
});
const slots = {
  Alert: "alert-root",
  Avatar: "avatar",
  AvatarGroup: "avatar-group",
  Badge: "badge",
  Button: "button",
  Card: "card",
  Checkbox: "checkbox",
  Chip: "chip",
  Fieldset: "fieldset",
  Input: "input",
  InputGroup: "input-group",
  Kbd: "kbd",
  Meter: "meter",
  ProgressBar: "progress-bar",
  ProgressCircle: "progress-circle",
  Skeleton: "skeleton",
  Separator: "separator",
  Spinner: "spinner",
  Surface: "surface",
  Switch: "switch",
  TextField: "text-field",
  Textarea: "textarea",
  Typography: "typography",
  ScrollShadow: "scroll-shadow",
};
let mounted = 0;
try {
  const index = await (await fetch(`${base}/index.json`)).json();
  const selectedFamilies = familyFilter?.split(",");
  const stories = Object.values(index.entries).filter(
    (entry) =>
      entry.type === "story" &&
      (!selectedFamilies || selectedFamilies.includes(entry.title.split("/").at(-1))),
  );
  assert(stories.length > 0, "No stories selected");
  for (const story of stories) {
    for (const theme of ["light", "dark"]) {
      const before = errors.length;
      activeStory = story.id;
      await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`, {
        waitUntil: "networkidle",
      });
      const slot =
        story.id === "components-typography--prose-block"
          ? "prose"
          : slots[story.title.split("/").at(-1)];
      assert(slot, `Add a mount assertion for ${story.title}`);
      assert.equal(errors.length, before, `${story.id}: ${errors.slice(before).join("\n")}`);
      await page.locator(`[data-slot="${slot}"]`).first().waitFor({ state: "attached" });
      assert.equal(await page.locator("html").getAttribute("data-theme"), theme, story.id);
      assert.equal(errors.length, before, `${story.id}: ${errors.slice(before).join("\n")}`);
      assert.equal(await page.locator(".sb-errordisplay").isVisible(), false, story.id);

      if (story.id === "components-feedback-meter--custom-value") {
        const meter = page.getByRole("meter");
        assert.equal(await meter.getAttribute("aria-valuenow"), "750");
        assert.equal(await meter.getAttribute("aria-valuemax"), "1000");
        assert.match(await page.locator('[data-slot="meter-output"]').innerText(), /750/);
      }
      if (story.id === "components-feedback-progresscircle--indeterminate") {
        assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"), null);
      }
      if (story.id === "components-forms-input--variants") {
        assert.equal(await page.getByRole("textbox").count(), 2);
      }
      if (story.id === "components-forms-textarea--variants") {
        assert.equal(await page.locator("textarea").count(), 2);
      }
      if (story.id === "components-feedback-spinner--sizes") {
        const widths = await page
          .locator('[data-slot="spinner"]')
          .evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().width),
          );
        assert(widths.every((width, index) => index === 0 || width > widths[index - 1]));
      }
      if (story.id === "components-forms-input--full-width") {
        const widths = await page
          .locator("input")
          .evaluateAll((elements) =>
            elements.map((element) => element.getBoundingClientRect().width),
          );
        assert(widths[0] > 350, JSON.stringify(widths));
      }
      if (story.id === "components-forms-textfield--controlled") {
        await page.getByRole("textbox", { name: "Your name" }).fill("John");
        await page.getByRole("textbox", { name: "Your bio" }).fill("Biography");
        assert(await page.getByText("Character count: 4", { exact: true }).isVisible());
        assert(await page.getByText("Character count: 9 / 500", { exact: true }).isVisible());
      }
      if (story.id === "components-forms-inputgroup--password-with-toggle") {
        const input = page.locator("input");
        assert.equal(await input.getAttribute("type"), "password");
        await page.getByRole("button", { name: "Show password" }).click();
        assert.equal(await input.getAttribute("type"), "text");
        assert.equal(await input.inputValue(), "87$2h.3diua");
        await page.getByRole("button", { name: "Hide password" }).click();
        assert.equal(await input.getAttribute("type"), "password");
      }
      if (story.id === "components-forms-inputgroup--with-text-area") {
        const textarea = page.getByRole("textbox", { name: "Prompt input" });
        const send = page.getByRole("button", { name: "Send prompt" });
        assert(await send.isDisabled());
        await textarea.fill("Assign a task");
        assert(await send.isEnabled());
        await send.click();
        await page.locator('[data-slot="spinner"]').waitFor();
        await page.waitForFunction(() => document.querySelector("textarea")?.value === "");
        assert(await send.isDisabled());
      }
      if (story.id === "components-forms-textfield--with-validation") {
        await page.getByRole("textbox", { name: /Username/ }).fill("ab");
        await page.getByRole("textbox", { name: /Bio/ }).fill("short");
        assert(await page.getByText("Username must be at least 3 characters").isVisible());
        assert(await page.getByText("Bio must be at least 20 characters").isVisible());
        await page.getByRole("textbox", { name: /Username/ }).fill("john_doe");
        await page
          .getByRole("textbox", { name: /Bio/ })
          .fill("A biography longer than twenty characters");
        assert.equal(await page.getByText("Username must be at least 3 characters").count(), 0);
        assert.equal(await page.getByText("Bio must be at least 20 characters").count(), 0);
      }
      if (story.id === "components-media-avatargroup--overlap-playground") {
        const optical = page.getByRole("checkbox", { name: /^Optically center/ });
        await page.getByRole("checkbox", { name: /^Clip/ }).click();
        assert(await optical.isDisabled());
        await page.getByRole("checkbox", { name: /^Clip/ }).click();
        assert(await optical.isEnabled());
        await optical.click();
        assert.equal(
          await page.locator('[data-slot="avatar-group"][data-optical="false"]').count(),
          2,
        );
      }
      if (story.id === "components-media-avatar--fallback") {
        await page.getByText("NA", { exact: true }).waitFor({ state: "visible" });
      }
      if (story.id === "components-media-avatar--default") {
        assert.equal(await page.locator('[data-slot="avatar"]').count(), 13);
        assert.equal(await page.locator('[data-slot="avatar-image"]').count(), 9);
      }
      if (story.id === "components-media-avatar--with-delay") {
        await page.locator('img[src*="/delay/300/"]').waitFor({ state: "visible" });
      }
      if (story.id === "components-utilities-scrollshadow--visibility-change") {
        const vertical = page.locator('[data-slot="scroll-shadow"][data-orientation="vertical"]');
        await vertical.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        await page.getByText("Vertical Shadow State: top", { exact: true }).waitFor();
      }
      assert.equal(errors.length, before, `${story.id}: ${errors.slice(before).join("\n")}`);
      mounted++;
      console.log("MOUNT", story.id, theme);
    }
  }
  console.log(
    `PASS ${mounted} iframe mounts; ${stories.length} stories; no unexpected errors; ${expectedSourceFailures.length} expected source fallback-image failures`,
  );
} finally {
  await browser.close();
  server.close();
}
