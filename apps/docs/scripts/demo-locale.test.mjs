import assert from "node:assert/strict";
import test from "node:test";
import { resolveDemo } from "../src/lib/demo-locale.ts";

test("Chinese runtime resolution selects Chinese modules and labels English fallback separately", () => {
  const manifest = {
    en: {
      basic: "en/button/basic.tsx",
      missing: "en/button/missing.tsx",
      reuse: "en/button/reuse.tsx",
    },
    cn: { basic: "cn/button/basic.tsx", reuse: "en/button/reuse.tsx" },
  };
  assert.deepEqual(resolveDemo(manifest, "basic", "cn"), {
    file: "cn/button/basic.tsx",
    locale: "cn",
    status: "local-adaptation",
  });
  assert.deepEqual(resolveDemo(manifest, "missing", "cn"), {
    file: "en/button/missing.tsx",
    locale: "en",
    status: "english-fallback",
  });
  assert.equal(resolveDemo(manifest, "reuse", "cn").status, "source-equivalent-reuse");
  assert.equal(resolveDemo(manifest, "absent", "cn"), undefined);
});
