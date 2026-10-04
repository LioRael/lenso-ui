import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { checkExamplePage } from "./examples-browser-check.mjs";
import { createExamplePlan } from "./example-proof-plan.mjs";

// Run in an owned copy of the original built fixture; never rebuild that fixture.
const base = process.env.LENSO_DOCS_TEST_URL ?? "http://127.0.0.1:59149";
assert.ok(process.env.LENSO_NAVIGATION_REPORT, "Provide the read-only original report path");
const original = JSON.parse(await readFile(process.env.LENSO_NAVIGATION_REPORT, "utf8"));
const projection = JSON.parse(
  await readFile(new URL("../src/generated/lenso-docs-index.json", import.meta.url), "utf8"),
);
const source = JSON.parse(
  await readFile(new URL("../content/source-index.json", import.meta.url), "utf8"),
);
const manifests = JSON.parse(
  await readFile(new URL("../src/demos/live-manifest.json", import.meta.url), "utf8"),
);
const plans = ["en", "cn"].map((locale) =>
  createExamplePlan(source, projection, manifests, { locale }),
);
const output = process.env.LENSO_NAVIGATION_OUTPUT ?? "test-results/navigation-readiness";
await mkdir(output, { recursive: true });
const evidence = { browser: "", baseline: [], targeted: [], negatives: [] };
const report = {
  completeRequestedScope: false,
  missing: plans.flatMap((plan) => plan.missing),
  cases: [],
  failures: [],
};
const browser = await chromium.launch();
evidence.browser = browser.version();
const sceneMode = ({ locale, theme, width, height, direction, reducedMotion }) => ({
  locale,
  theme,
  width,
  height,
  direction,
  reducedMotion,
});
const placementFor = ({ locale, slug }) => {
  const page = plans
    .find((plan) => plan.locale === locale)
    ?.pages.find((page) => page.slug === slug);
  assert.ok(page, `Missing original placement ${locale}/${slug}`);
  return page;
};
async function open(mode) {
  const context = await browser.newContext({
    viewport: { width: mode.width, height: mode.height },
    colorScheme: mode.theme,
    reducedMotion: mode.reducedMotion,
  });
  await context.addInitScript(({ theme, direction }) => {
    localStorage.setItem("theme", theme);
    new MutationObserver(() => {
      if (document.documentElement) document.documentElement.dir = direction;
    }).observe(document, { childList: true });
  }, mode);
  return { context, page: await context.newPage() };
}
try {
  assert.deepEqual(report.missing, []);
  assert.equal(original.failures.length, 6);
  assert.equal(original.cases.length, 5411);
  const expectedMissing = original.failures.reduce(
    (sum, mode) => sum + placementFor(mode).cases.length,
    0,
  );
  assert.equal(expectedMissing, 45);
  // Preserve original failure order. Baseline timings are observations, not proof
  // that the historical timeout had any particular request as its cause.
  for (let round = 0; round < 2; round++) {
    for (const mode of original.failures) {
      const { context, page } = await open(mode);
      const pending = new Map();
      const errors = [];
      const requests = [];
      const session = await context.newCDPSession(page);
      await session.send("Performance.enable");
      const start = Date.now();
      page.on("request", (request) =>
        pending.set(request, {
          url: request.url(),
          type: request.resourceType(),
        }),
      );
      page.on("request", (request) =>
        requests.push({
          url: request.url(),
          type: request.resourceType(),
          event: "request",
          ms: Date.now() - start,
        }),
      );
      page.on("requestfinished", (request) =>
        requests.push({
          url: request.url(),
          type: request.resourceType(),
          event: "finished",
          ms: Date.now() - start,
        }),
      );
      page.on("requestfailed", (request) =>
        requests.push({
          url: request.url(),
          type: request.resourceType(),
          event: "failed",
          failure: request.failure(),
          ms: Date.now() - start,
        }),
      );
      page.on("requestfinished", (request) => pending.delete(request));
      page.on("requestfailed", (request) => pending.delete(request));
      page.on("pageerror", (error) => errors.push(String(error)));
      let navigationError;
      try {
        await page.goto(`${base}/${mode.locale}/docs/${mode.slug}`, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
      } catch (error) {
        navigationError = String(error);
      }
      evidence.baseline.push({
        round,
        locale: mode.locale,
        slug: mode.slug,
        theme: mode.theme,
        width: mode.width,
        ms: Date.now() - start,
        navigationError,
        errors,
        pending: [...pending.values()],
        requests,
        cpu: (await session.send("Performance.getMetrics")).metrics,
        state: await page.evaluate(() => ({
          mounts: document.querySelectorAll("[data-example-mounted]").length,
          theme: document.documentElement.className,
        })),
      });
      await context.close();
    }
  }
  for (const mode of original.failures) {
    const placement = placementFor(mode);
    const { context, page } = await open(mode);
    await checkExamplePage(
      page,
      `${base}/${mode.locale}/docs/${mode.slug}`,
      placement,
      sceneMode(mode),
      report,
    );
    evidence.targeted.push({
      ...mode,
      error: undefined,
      clientErrors: undefined,
      mounts: placement.cases.length,
    });
    await context.close();
  }
  assert.equal(report.cases.length, 45);
  assert.deepEqual(report.failures, []);
  await writeFile(path.join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  const mode = original.failures[0];
  const placement = placementFor(mode);
  const url = `${base}/${mode.locale}/docs/${mode.slug}`;
  for (const mutation of [
    "absent",
    "unmounted",
    "empty",
    "geometry",
    "hydration",
    "client-error",
    "axe-invalid",
    "overflow",
    "geometry-after-ready",
    "empty-after-ready",
  ]) {
    const { context, page } = await open(mode);
    if (mutation === "hydration") {
      await page.route("**/_next/static/chunks/**", (route) => route.abort());
    } else if (mutation.endsWith("-after-ready")) {
      const wait = page.waitForFunction.bind(page);
      page.waitForFunction = async (...args) => {
        const result = await wait(...args);
        await page.evaluate((mutation) => {
          const scene = document.querySelector("[data-example-scene]");
          if (mutation === "geometry-after-ready") scene.style.display = "none";
          else {
            scene.style.minHeight = "40px";
            scene.replaceChildren(...scene.querySelectorAll("[data-example-mounted]"));
          }
        }, mutation);
        return result;
      };
    } else {
      await context.addInitScript((mutation) => {
        if (mutation === "client-error") {
          document.addEventListener("DOMContentLoaded", () => {
            throw new Error("navigation negative client error");
          });
          return;
        }
        if (mutation === "axe-invalid" || mutation === "overflow") {
          document.addEventListener("DOMContentLoaded", () => {
            const element = document.createElement(mutation === "axe-invalid" ? "button" : "div");
            element.style.cssText =
              mutation === "axe-invalid"
                ? "position:fixed;left:0;top:0;width:30px;height:30px"
                : "width:5000px;height:1px";
            document.body.append(element);
          });
          return;
        }
        const remove = () => {
          if (mutation === "absent")
            document.querySelectorAll("[data-example-name]").forEach((e) => e.remove());
          if (mutation === "unmounted")
            document.querySelectorAll("[data-example-mounted]").forEach((e) => e.remove());
          if (mutation === "empty")
            document.querySelectorAll("[data-example-scene]").forEach((e) => e.replaceChildren());
          if (mutation === "geometry")
            document.querySelectorAll("[data-example-scene]").forEach((e) => {
              e.style.display = "none";
            });
        };
        new MutationObserver(remove).observe(document, { childList: true, subtree: true });
      }, mutation);
    }
    const expectedError =
      mutation === "client-error"
        ? /Example page emitted client errors/
        : mutation === "axe-invalid"
          ? /Example page accessibility semantics/
          : mutation === "overflow"
            ? /Example page overflows the viewport/
            : mutation === "geometry-after-ready"
              ? /has no measurable scene/
              : mutation === "empty-after-ready"
                ? /rendered an empty scene/
                : /Timeout/;
    await assert.rejects(
      checkExamplePage(
        page,
        url,
        placement,
        mode,
        { cases: [] },
        {
          timeout: expectedError.source === "Timeout" ? 1500 : 10000,
        },
      ),
      expectedError,
    );
    if (mutation === "hydration") {
      assert.equal(
        await page.locator("[data-example-mounted]").count(),
        0,
        "Client mount markers must not be present in the unhydrated document",
      );
    }
    evidence.negatives.push({ mutation, rejected: true });
    await context.close();
  }
  // Hold one real Next prefetch request, not a demo module or document. This is
  // a deterministic counterexample to global-idle readiness, not historical attribution.
  {
    const { context, page } = await open(mode);
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    let observed = false;
    await page.route("**/*", async (route) => {
      if (new URL(route.request().url()).searchParams.has("_rsc")) {
        observed = true;
        await held;
      }
      await route.continue().catch(() => {});
    });
    try {
      await checkExamplePage(page, url, placement, mode, { cases: [] });
      await assert.rejects(page.waitForLoadState("networkidle", { timeout: 1500 }));
      assert.ok(observed, "Counterexample must hold an actual route prefetch");
      evidence.negatives.push({
        mutation: "held-prefetch",
        readinessPassed: true,
        networkidleRejected: true,
      });
    } finally {
      release();
      await context.close();
    }
  }
} finally {
  await writeFile(
    path.join(output, "navigation-evidence.json"),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  await browser.close();
}
console.log(
  `${report.cases.length} example mounts checked; ${report.missing.length} unimplemented references; ${report.failures.length} failures (six original navigation modes only)`,
);
console.log(JSON.stringify(evidence.negatives));
