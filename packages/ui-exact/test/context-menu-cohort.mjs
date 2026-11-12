import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import { loadCohort, fileHash } from "./cohort-server.ts";
// Contract app.js stays identical when only a Web controller changes; fingerprint the runtime too.
export async function loadContextCohort(page, cohort) {
  const runtimeURL = new URL("modules/lenso-ui/web.js", cohort.url).href;
  const response = page.waitForResponse((r) => r.url() === runtimeURL);
  const application = await loadCohort(page, cohort),
    runtime = await response;
  assert.equal(runtime.status(), 200);
  const runtimeSHA256 = createHash("sha256")
    .update(await runtime.body())
    .digest("hex");
  assert.equal(runtimeSHA256, await fileHash(path.join(cohort.dist, "modules/lenso-ui/web.js")));
  return { ...application, runtimeURL, runtimeSHA256 };
}
