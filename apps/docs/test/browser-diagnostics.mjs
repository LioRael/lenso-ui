import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Opt in on CI or during an investigation; ordinary local runs leave no artifacts.
export async function startDiagnostics(page) {
  if (!process.env.BROWSER_ARTIFACTS) return;
  await page.context().tracing.start({ screenshots: true, snapshots: true, sources: true });
}

export async function saveBrowserFailure(browser, label) {
  if (!process.env.BROWSER_ARTIFACTS) return;
  const directory = resolve(process.env.BROWSER_ARTIFACTS, label);
  await mkdir(directory, { recursive: true });
  for (const [index, context] of browser.contexts().entries()) {
    for (const [pageIndex, page] of context.pages().entries()) {
      await page
        .evaluate(() => ({
          url: location.href,
          activeElement: document.activeElement?.outerHTML,
        }))
        .then((state) =>
          writeFile(
            resolve(directory, `${index}-${pageIndex}.json`),
            JSON.stringify(state, null, 2),
          ),
        )
        .catch((error) => console.error("Failure focus state unavailable:", error.message));
      await page
        .screenshot({ path: resolve(directory, `${index}-${pageIndex}.png`) })
        .catch((error) => console.error("Failure screenshot unavailable:", error.message));
    }
    await context.tracing
      .stop({ path: resolve(directory, `${index}-trace.zip`) })
      .catch((error) => console.error("Failure trace unavailable:", error.message));
  }
}
