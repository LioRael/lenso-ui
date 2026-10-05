import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createHash } from "node:crypto";

const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const output = process.env.LENSO_LOCALE_PROOF_OUTPUT ?? "test-results/docs-locale";
const source: { pages: { locale: string; previews: string[]; slug: string }[] } = JSON.parse(
  await readFile(new URL("../content/source-index.json", import.meta.url), "utf8"),
);
const manifest: Record<string, Record<string, string>> = JSON.parse(
  await readFile(new URL("../src/demos/live-manifest.json", import.meta.url), "utf8"),
);
const scenarios = [
  { name: "button-basic", family: "button" },
  { name: "form-basic", family: "form" },
  { name: "select-default", family: "select" },
  { name: "list-box-default", family: "list-box" },
  { name: "calendar-basic", family: "calendar" },
  { name: "avatar-group-basic", family: "avatar" },
  { name: "pagination-controlled", family: "pagination" },
  { name: "pagination-simple-prev-next", family: "pagination-simple" },
  { name: "scroll-shadow-default", family: "scroll" },
  { name: "scroll-shadow-custom-styles", family: "scroll-activity" },
  { name: "color-slider-vertical", family: "color-slider" },
  { name: "number-field-with-step", family: "number-field" },
  { name: "input-group-with-loading-suffix", family: "input-suffix" },
  { name: "disclosure-basic", family: "disclosure" },
  { name: "disclosure-render-function", family: "disclosure-render" },
  { name: "disclosure-group-basic", family: "disclosure-group" },
  { name: "disclosure-group-controlled", family: "disclosure-group-controlled" },
].filter(
  (scenario) =>
    !process.env.LENSO_LOCALE_SCENARIOS ||
    process.env.LENSO_LOCALE_SCENARIOS.split(",").includes(scenario.name),
);
assert.ok(scenarios.length, "No requested locale-proof scenarios exist");
const report = {
  completeUpstreamRuntimeParity: false,
  scope: scenarios,
  localBuildId: (await readFile(new URL("../.next/BUILD_ID", import.meta.url), "utf8")).trim(),
  manifestSha256: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"),
  cases: [] as {
    locale: string;
    theme: string;
    width: number;
    name: string;
    file: string;
    geometry: { x: number; y: number; width: number; height: number };
    ancestorOpacities: { tag: string; opacity: string }[];
    screenshot: string;
  }[],
  failures: [] as {
    locale: string;
    theme: string;
    width: number;
    error: string;
    clientErrors: string[];
  }[],
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of ["en", "cn"]) {
    const cn = locale === "cn";
    for (const theme of ["light", "dark"] as const) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          permissions: ["clipboard-read", "clipboard-write"],
        });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const page = await context.newPage();
        page.setDefaultTimeout(10_000);
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(String(error)));
        try {
          for (const scenario of scenarios) {
            console.log(`${locale}/${theme}/${width}: ${scenario.name}`);
            const placement = source.pages.find(
              (entry) => entry.locale === locale && entry.previews.includes(scenario.name),
            );
            assert.ok(placement, `No source placement: ${locale}:${scenario.name}`);
            if (scenario.family === "avatar")
              await page.route("**/avatars/**", (route) => route.abort());
            await page.goto(`${base}/${locale}/docs/${placement.slug}`, {
              waitUntil: "domcontentloaded",
            });
            const region = page.locator(`[data-example-name="${scenario.name}"]`).first();
            const file = manifest[locale][scenario.name];
            assert.ok(
              file?.startsWith(`${locale}/`),
              `${scenario.name} is not a locale-specific source module`,
            );
            await region.locator(`[data-example-mounted="${file}"]`).waitFor({ state: "attached" });
            const scene = region.locator("[data-example-scene]");
            if (scenario.family.startsWith("disclosure")) {
              const preview = scene.getByRole("button", {
                name: cn ? "预览 HeroUI Native" : "Preview HeroUI Native",
                exact: true,
              });
              assert.equal(await preview.getAttribute("aria-expanded"), "true");
              await scene.getByAltText(cn ? "Expo Go 二维码" : "Expo Go QR Code").waitFor();
              assert.ok(
                (await scene.textContent())?.includes(
                  cn ? "设备需已安装 Expo。" : "Expo must be installed on your device.",
                ),
              );
              await preview.focus();
              await preview.press("Enter");
              assert.equal(await preview.getAttribute("aria-expanded"), "false");
              await preview.press("Space");
              assert.equal(await preview.getAttribute("aria-expanded"), "true");
              if (scenario.family.startsWith("disclosure-group")) {
                const controlled = scenario.family === "disclosure-group-controlled";
                const download = scene.getByRole("button", {
                  name: cn
                    ? controlled
                      ? "下载 HeroUI Native"
                      : "下载应用"
                    : controlled
                      ? "Download HeroUI Native"
                      : "Download App",
                  exact: true,
                });
                await preview.press("ArrowDown");
                assert.equal(
                  await download.evaluate((node) => node === document.activeElement),
                  true,
                );
                await download.press("Home");
                assert.equal(
                  await preview.evaluate((node) => node === document.activeElement),
                  true,
                );
                await preview.press("End");
                assert.equal(
                  await download.evaluate((node) => node === document.activeElement),
                  true,
                );
                if (controlled) {
                  const next = scene.getByRole("button", {
                    name: cn ? "下一个折叠项" : "Next disclosure",
                    exact: true,
                  });
                  const previous = scene.getByRole("button", {
                    name: cn ? "上一个折叠项" : "Previous disclosure",
                    exact: true,
                  });
                  assert.equal(await previous.isDisabled(), true);
                  await next.click();
                  assert.equal(await download.getAttribute("aria-expanded"), "true");
                  assert.equal(await preview.getAttribute("aria-expanded"), "false");
                  assert.equal(await next.isDisabled(), true);
                  await previous.click();
                  assert.equal(await preview.getAttribute("aria-expanded"), "true");
                  assert.equal(await download.getAttribute("aria-expanded"), "false");
                } else {
                  await download.press("Enter");
                  assert.equal(await download.getAttribute("aria-expanded"), "true");
                  await scene.getByAltText(cn ? "App Store 二维码" : "App Store QR Code").waitFor();
                  assert.ok(
                    (await scene.textContent())?.includes(
                      cn ? "支持 iOS 和 Android 设备。" : "Available on iOS and Android devices.",
                    ),
                  );
                }
              }
              if (scenario.family === "disclosure-render") {
                assert.equal(await scene.locator('[data-custom="foo"]').count(), 1);
                assert.equal(await scene.locator('[data-custom="bar"]').count(), 1);
              }
              const sourceFiles = region.getByRole("button").filter({ hasText: /\.tsx$/ });
              const names = await sourceFiles.allTextContents();
              const moduleName = names.find((name) => name.endsWith(file));
              if (moduleName)
                await region.getByRole("button", { name: moduleName, exact: true }).click();
              const raw = await readFile(new URL(`../src/demos/${file}`, import.meta.url), "utf8");
              await region
                .getByRole("button", { name: "Copy local example source", exact: true })
                .click();
              assert.equal(await page.evaluate(() => navigator.clipboard.readText()), raw);
              // Alt-text attachment does not prove the public QR image decoded.
              await scene.locator("img:visible").evaluateAll(async (images) => {
                for (const image of images) {
                  if (!(image instanceof HTMLImageElement))
                    throw new Error("Reference QR element is not an image");
                  await image.decode();
                  if (!image.naturalWidth) throw new Error("Reference QR image did not decode");
                }
              });
            } else if (scenario.family === "button") {
              const button = scene.getByRole("button", {
                name: cn ? "点我" : "Click me",
                exact: true,
              });
              await button.focus();
              const clicked = page.waitForEvent("console", {
                predicate: (message) => message.text() === "Button pressed",
              });
              await button.press("Enter");
              await clicked;
            } else if (scenario.family === "form") {
              const email = scene.getByRole("textbox", { name: cn ? /^邮箱/ : /^Email/ });
              const password = scene.getByLabel(cn ? /^密码/ : /^Password/);
              await email.fill("locale@example.com");
              await password.fill("ValidPass123");
              const submitted = page.waitForEvent("dialog").then(async (dialog) => {
                const message = dialog.message();
                await dialog.dismiss();
                return message;
              });
              await scene
                .getByRole("button", { name: cn ? "提交" : "Submit", exact: true })
                .click();
              const message = await submitted;
              assert.ok(message.startsWith(cn ? "表单提交数据：" : "Form submitted with:"));
              assert.ok(message.includes('"email": "locale@example.com"'));
              assert.ok(message.includes('"password": "ValidPass123"'));
              await scene.getByRole("button", { name: cn ? "重置" : "Reset", exact: true }).click();
              assert.equal(await email.inputValue(), "");
            } else if (scenario.family === "select") {
              const trigger = scene.getByRole("combobox", {
                name: cn ? "州" : "State",
                exact: true,
              });
              await trigger.focus();
              await trigger.press("Space");
              const option = page.getByRole("option", {
                name: cn ? "加利福尼亚" : "California",
                exact: true,
              });
              await option.click();
              assert.ok((await trigger.textContent())?.includes(cn ? "加利福尼亚" : "California"));
            } else if (scenario.family === "list-box") {
              const collection = scene.getByRole("listbox", {
                name: cn ? "用户" : "Users",
                exact: true,
              });
              const first = collection.getByRole("option").first();
              await first.focus();
              await first.press("Space");
              assert.equal(await first.getAttribute("aria-selected"), "true");
            } else if (scenario.family === "calendar") {
              const calendar = scene.getByRole("application", {
                name: cn ? /^活动日期/ : /^Event date/,
              });
              const heading = calendar.getByRole("heading");
              const before = await heading.textContent();
              await calendar.getByRole("button", { name: "Next", exact: true }).first().click();
              assert.notEqual(await heading.textContent(), before);
              const date = calendar
                .getByRole("gridcell")
                .filter({
                  has: page.locator('[role="button"]:not([aria-disabled="true"])'),
                })
                .first();
              await date.getByRole("button").click();
              assert.equal(await date.getAttribute("aria-selected"), "true");
            } else if (scenario.family === "avatar") {
              await scene.getByText(cn ? "张明" : "JD", { exact: true }).waitFor();
              await scene.getByText(cn ? "李华" : "KW", { exact: true }).waitFor();
            } else if (scenario.family.startsWith("pagination")) {
              const previous = scene.getByRole("button", {
                name: cn ? "上一页" : "Previous page",
                exact: true,
              });
              const next = scene.getByRole("button", {
                name: cn ? "下一页" : "Next page",
                exact: true,
              });
              assert.equal(await previous.isDisabled(), true);
              const initial = (await scene.textContent()) ?? "";
              assert.ok(cn ? initial.includes("共") : initial.includes(" of "));
              const simple = scenario.family === "pagination-simple";
              if (cn) assert.ok(initial.includes(simple ? "张发票" : "条结果"));
              await next.focus();
              await next.press("Enter");
              assert.equal(await previous.isDisabled(), false);
              const after = (await scene.textContent()) ?? "";
              assert.notEqual(after, initial);
              assert.match(after, simple ? /6(?:–| to )10/ : /11(?:–|-)20/);
              await previous.focus();
              await previous.press("Enter");
              assert.equal(await scene.textContent(), initial);
              if (!simple) {
                // Page 1 exposes 1, 2, …, last; page 3 becomes a real control on page 2.
                await next.focus();
                await next.press("Enter");
                await scene.getByRole("button", { name: cn ? "3" : "Page 3", exact: true }).click();
                assert.match((await scene.textContent()) ?? "", /21(?:–|-)30/);
              }
            } else if (scenario.family.startsWith("scroll")) {
              const scroll = scene.getByLabel(
                scenario.family === "scroll" ? "Scrollable sample text" : "Recent activity",
                { exact: true },
              );
              const paragraphs = scroll.locator("p");
              if (scenario.family === "scroll") {
                assert.equal(await paragraphs.count(), 10);
                assert.ok(
                  ((await paragraphs.first().textContent()) ?? "")
                    .trim()
                    .startsWith(cn ? "段落 1" : "Lorem"),
                );
                if (cn) assert.ok((await paragraphs.last().textContent())?.includes("段落 10"));
              } else {
                assert.ok(
                  (await paragraphs.first().textContent())?.includes(
                    cn ? "设计团队" : "design team",
                  ),
                );
              }
              assert.ok(
                await scroll.evaluate((element) => element.scrollHeight > element.clientHeight),
              );
              const before = await scroll.evaluate((element) => element.scrollTop);
              await scroll.focus();
              await scroll.press("ArrowDown");
              await page.waitForFunction(
                (element) => element.scrollTop > 0,
                await scroll.elementHandle(),
              );
              assert.ok((await scroll.evaluate((element) => element.scrollTop)) > before);
            } else if (scenario.family === "color-slider") {
              const slider = scene.getByRole("slider", { name: cn ? "色相" : "hue", exact: true });
              await slider.focus();
              assert.equal(await slider.getAttribute("type"), "range");
              const before = Number(await slider.inputValue());
              const beforeText = await slider.getAttribute("aria-valuetext");
              await slider.press("ArrowUp");
              assert.equal(Number(await slider.inputValue()), before + 1);
              assert.notEqual(await slider.getAttribute("aria-valuetext"), beforeText);
              for (const name of cn ? ["饱和度", "明度"] : ["saturation", "lightness"])
                assert.equal(await scene.getByRole("slider", { name, exact: true }).count(), 1);
            } else if (scenario.family === "number-field") {
              const input = scene.getByRole("textbox", { name: cn ? "步长：5" : "Step: 5" });
              const submitted = scene.locator("input[aria-hidden='true'][name='step5']");
              assert.equal(await submitted.count(), 1);
              await input.focus();
              await input.press("ArrowUp");
              assert.equal(await input.inputValue(), "5");
              assert.equal(await submitted.inputValue(), "5");
              await input.press("ArrowDown");
              assert.equal(await input.inputValue(), "0");
              assert.equal(await submitted.inputValue(), "0");
            } else if (scenario.family === "input-suffix") {
              const input = scene.getByRole("textbox");
              assert.equal(await input.inputValue(), cn ? "发送中…" : "Sending...");
              assert.equal(await input.getAttribute("name"), "status");
              await input.focus();
              await input.fill("model-preserved");
              assert.equal(await input.inputValue(), "model-preserved");
            }
            assert.deepEqual(errors, [], "Locale page emitted client errors");
            assert.ok(
              await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              "Page overflow",
            );
            await scene.evaluate((element) => element.scrollIntoView({ block: "center" }));
            await scene.evaluate(async (element) => {
              await Promise.all(
                element
                  .getAnimations({ subtree: true })
                  .filter(
                    (animation) =>
                      animation.timeline instanceof DocumentTimeline &&
                      animation.playState === "running" &&
                      animation.effect?.getTiming().iterations !== Infinity,
                  )
                  .map((animation) => animation.finished.catch(() => {})),
              );
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              );
            });
            const geometry = await scene.boundingBox();
            assert.ok(geometry && geometry.width > 0 && geometry.height > 0);
            const ancestorOpacities = await scene.evaluate((element) => {
              const ancestors: { tag: string; opacity: string }[] = [];
              for (let node: Element | null = element; node; node = node.parentElement)
                ancestors.push({ tag: node.tagName, opacity: getComputedStyle(node).opacity });
              return ancestors;
            });
            assert.ok(
              ancestorOpacities.every((ancestor) => ancestor.opacity === "1"),
              "Scene ancestors are dimmed by an unrelated disabled control",
            );
            const screenshot = `${locale}-${theme}-${width}-${scenario.name}.png`;
            await scene.screenshot({ path: path.join(output, screenshot), animations: "disabled" });
            report.cases.push({
              locale,
              theme,
              width,
              name: scenario.name,
              file,
              geometry,
              ancestorOpacities,
              screenshot,
            });
          }
        } catch (error) {
          report.failures.push({
            locale,
            theme,
            width,
            error: String(error),
            clientErrors: errors,
          });
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}
console.log(
  `${report.cases.length} targeted EN/CN locale interaction cases; ${report.failures.length} failures. ${output}/report.json`,
);
assert.equal(report.failures.length, 0, "Locale interaction proof failed; inspect report.json");
