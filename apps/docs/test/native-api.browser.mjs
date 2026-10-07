import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let cases = 0;

try {
  for (const locale of ["en", "cn"]) {
    for (const family of ["button", "date-picker"]) {
      for (const theme of ["light", "dark"]) {
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 900 });
          const url = `${base}/${locale}/docs/react/components/${family}`;
          await page.goto(url, { waitUntil: "networkidle" });
          await page.evaluate((value) => localStorage.setItem("theme", value), theme);
          await page.reload({ waitUntil: "networkidle" });
          await page.waitForFunction(
            (value) => document.documentElement.classList.contains(value),
            theme,
          );
          const references = page.getByRole("navigation", { name: "Component references" });
          assert.equal(await references.count(), 1);
          for (const label of ["Source", "Styles"]) {
            const link = references.getByRole("link", { name: label, exact: true });
            assert.match(
              await link.getAttribute("href"),
              /^https:\/\/github\.com\/.+\/blob\/main\//,
            );
          }
          assert.equal(
            await references
              .getByRole("link", {
                name: family === "button" ? "Base UI" : "React Aria",
                exact: true,
              })
              .count(),
            1,
          );
          assert.ok(
            await references.evaluate((element) => {
              const article = document.querySelector("#nd-page");
              const example = article?.querySelector("section[data-example-name]");
              return (
                article?.contains(element) &&
                example &&
                Boolean(element.compareDocumentPosition(example) & Node.DOCUMENT_POSITION_FOLLOWING)
              );
            }),
            "Component references must remain inside the article, before its live examples.",
          );
          const api = page.locator(`section[aria-labelledby="native-api-${family}"]`);
          assert.equal(await api.count(), 1);
          assert.equal(await api.locator("h2").count(), 1);
          const labels = await api
            .locator("section[aria-label]")
            .evaluateAll((elements) =>
              elements.map((element) => element.getAttribute("aria-label")),
            );
          assert.equal(new Set(labels).size, labels.length);
          const names = await api.locator("tbody th[scope='row'] code").allTextContents();
          if (family === "button") {
            for (const name of ["disabled", "onClick", "render", "style", "ref"]) {
              assert.ok(names.includes(name), `${locale}/${theme}/${width} missing ${name}`);
            }
            assert.ok(!names.includes("isDisabled") && !names.includes("onPress"));
          } else {
            assert.match(await api.innerText(), /<T extends DateValue>/);
            assert.match(await api.innerText(), /MappedDateValue<T>/);
          }
          await page.getByRole("button", { name: "Copy Markdown", exact: true }).click();
          const copied = await page.evaluate(() => navigator.clipboard.readText());
          const title = locale === "cn" ? "## API 参考" : "## API Reference";
          const start = copied.lastIndexOf(title);
          assert.ok(start >= 0);
          const copiedApi = copied.slice(start);
          if (family === "button") {
            for (const name of ["disabled", "onClick", "render", "style", "ref"]) {
              assert.ok(copiedApi.includes(`| \` ${name} \` |`), `clipboard missing ${name}`);
            }
            assert.ok(!copiedApi.includes("| ` isDisabled ` |"));
            assert.ok(!copiedApi.includes("| ` onPress ` |"));
          } else {
            assert.match(copiedApi, /<T extends DateValue>/);
            assert.match(copiedApi, /MappedDateValue<T>/);
          }
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
            ),
            `${url} overflows at ${width}px`,
          );
          cases++;
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log(`Native API display and clipboard: ${cases} production browser cases passed.`);
} finally {
  await context.close();
  await browser.close();
}
