import assert from "node:assert/strict";
import path from "node:path";
import { createHash } from "node:crypto";
export const fileHash = async (file: string) =>
  createHash("sha256")
    .update(new Uint8Array(await Bun.file(file).arrayBuffer()))
    .digest("hex");
export function serveCohort(dist: string) {
  dist = path.resolve(dist);
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const pathname = new URL(request.url).pathname;
      const file = path.resolve(dist, pathname === "/" ? "index.html" : pathname.slice(1));
      if (!file.startsWith(dist + path.sep)) return new Response("Forbidden", { status: 403 });
      return (await Bun.file(file).exists())
        ? new Response(Bun.file(file))
        : new Response("Not found", { status: 404 });
    },
  });
  return { url: server.url.href, dist, stop: () => server.stop(true) };
}
interface ScriptResponse {
  url(): string;
  status(): number;
  body(): Promise<Uint8Array>;
}
interface CohortPage {
  waitForResponse(predicate: (response: ScriptResponse) => boolean): Promise<ScriptResponse>;
  goto(url: string): Promise<unknown>;
  evaluate<T>(expression: () => T): Promise<T>;
}
export async function loadCohort(page: CohortPage, cohort: ReturnType<typeof serveCohort>) {
  const scriptURL = new URL("app.js", cohort.url).href;
  const loaded = page.waitForResponse((response) => response.url() === scriptURL);
  await page.goto(cohort.url);
  const response = await loaded;
  assert.equal(response.status(), 200);
  const bytes = await response.body();
  const digest = createHash("sha256").update(bytes).digest("hex");
  assert.equal(
    digest,
    await fileHash(path.join(cohort.dist, "app.js")),
    "The page must load this cohort’s actual application script",
  );
  assert.equal(
    await page.evaluate(() => new URL(document.baseURI).origin),
    new URL(cohort.url).origin,
  );
  return { url: cohort.url, scriptURL, scriptSHA256: digest };
}
