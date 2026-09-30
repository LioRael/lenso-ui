import assert from "node:assert/strict";
import test from "node:test";
import { createExamplePlan } from "./example-proof-plan.mjs";

// Page-level smoke tests cannot detect a source scenario missing from runtime registration.
test("reports missing scenarios and missing locale implementations rather than passing a basic-only page", () => {
  const source = {
    examples: {
      en: {
        basic: { source: "apps/docs/src/demos/en/button/basic.tsx" },
        advanced: { source: "apps/docs/src/demos/en/button/advanced.tsx" },
      },
      cn: { basic: { source: "apps/docs/src/demos/cn/button/basic.tsx" } },
    },
    pages: [
      { locale: "en", slug: "react/components/button", previews: ["basic", "advanced"] },
      { locale: "cn", slug: "react/components/button", previews: ["basic"] },
    ],
  };
  const manifests = { en: { basic: "en/button/basic.tsx" } };
  const en = createExamplePlan(source, manifests, { locale: "en" });
  assert.equal(en.requested, 2);
  assert.deepEqual(
    en.missing.map((entry) => entry.name),
    ["advanced"],
  );
  assert.equal(en.pages[0].cases.length, 1);
  assert.equal(createExamplePlan(source, manifests, { locale: "cn" }).missing.length, 1);
});
