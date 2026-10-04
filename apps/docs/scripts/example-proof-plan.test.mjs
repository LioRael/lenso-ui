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
  const projection = {
    sourceFamilyMapping: { dropdown: "menu" },
    pages: source.pages.map((page) => ({
      locale: page.locale,
      slug: page.slug,
      examples: page.previews.map((name) => ({ name, file: `${page.locale}/button/${name}.tsx` })),
    })),
  };
  const manifests = { en: { basic: "en/button/basic.tsx" } };
  const en = createExamplePlan(source, projection, manifests, { locale: "en" });
  assert.equal(en.requested, 2);
  assert.deepEqual(
    en.missing.map((entry) => entry.name),
    ["advanced"],
  );
  assert.equal(en.pages[0].cases.length, 1);
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "cn" }).missing.length,
    1,
  );
});

// Archive-only release placements previously stranded the Chip palette proof.
test("uses canonical authored placements for archive release and renamed Menu scenarios", () => {
  const source = {
    examples: {
      en: {
        "chip-palette": { source: "apps/docs/src/demos/en/chip/palette.tsx" },
        "dropdown-basic": { source: "apps/docs/src/demos/en/dropdown/basic.tsx" },
      },
    },
    pages: [{ locale: "en", slug: "react/releases/v3", previews: ["chip-palette"] }],
  };
  const manifests = {
    en: { "chip-palette": "en/chip/palette.tsx", "menu-basic": "en/menu/basic.tsx" },
  };
  const projection = {
    sourceFamilyMapping: { dropdown: "menu" },
    pages: [
      {
        locale: "en",
        slug: "react/components/chip",
        examples: [{ name: "chip-palette", file: manifests.en["chip-palette"] }],
      },
      {
        locale: "en",
        slug: "react/components/menu",
        examples: [{ name: "menu-basic", file: manifests.en["menu-basic"] }],
      },
    ],
  };
  const complete = createExamplePlan(source, projection, manifests, { locale: "en" });
  assert.deepEqual(complete.missing, []);
  assert.equal(complete.requested, 2);
  assert.equal(complete.pages[1].cases[0].name, "menu-basic");
  assert.deepEqual(
    complete.pages.map((page) => page.slug),
    ["react/components/chip", "react/components/menu"],
  );
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "en", families: ["menu"] })
      .requested,
    1,
  );
  projection.pages[1].slug = "react/migration/dropdown";
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "en" }).missing[0].reason,
    "Noncanonical authored public placement",
  );
});

test("refuses a missing placement, duplicate placement or stale runnable-file mapping", () => {
  const source = {
    examples: { en: { basic: { source: "apps/docs/src/demos/en/button/basic.tsx" } } },
  };
  const manifests = { en: { basic: "en/button/basic.tsx" } };
  const page = {
    locale: "en",
    slug: "react/components/button",
    examples: [{ name: "basic", file: "en/button/basic.tsx" }],
  };
  const projection = { sourceFamilyMapping: {}, pages: [] };
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "en" }).missing[0].reason,
    "No authored public placement",
  );
  projection.pages = [page, page];
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "en" }).missing[0].reason,
    "Ambiguous authored public placement",
  );
  projection.pages = [{ ...page, examples: [{ name: "basic", file: "en/button/other.tsx" }] }];
  assert.equal(
    createExamplePlan(source, projection, manifests, { locale: "en" }).missing[0].reason,
    "Authored placement differs from runnable module",
  );
});

test("does not collapse two raw inventory references into one passing canonical scenario", () => {
  const source = {
    examples: {
      en: {
        "dropdown-basic": { source: "apps/docs/src/demos/en/dropdown/basic.tsx" },
        "menu-basic": { source: "apps/docs/src/demos/en/menu/basic.tsx" },
      },
    },
  };
  const projection = {
    sourceFamilyMapping: { dropdown: "menu" },
    pages: [
      {
        locale: "en",
        slug: "react/components/menu",
        examples: [{ name: "menu-basic", file: "en/menu/basic.tsx" }],
      },
    ],
  };
  const plan = createExamplePlan(
    source,
    projection,
    { en: { "menu-basic": "en/menu/basic.tsx" } },
    { locale: "en" },
  );
  assert.equal(plan.requested, 2);
  assert.equal(plan.missing.length, 2);
  assert.ok(plan.missing.every((entry) => entry.reason === "Canonical example name collision"));
});
