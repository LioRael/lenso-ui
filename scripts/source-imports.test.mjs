import assert from "node:assert/strict";
import test from "node:test";
import { runtimeModuleReferences } from "./source-imports.mjs";

test("runtime boundaries distinguish multiline type imports from value imports and lazy modules", () => {
  const references = runtimeModuleReferences(
    `
    import type {
      DateValue,
    } from "react-aria-components";
    import { type Selection } from "react-stately";
    import { type Key, useListData } from "react-stately/data";
    export type { CalendarProps } from "react-aria-components/Calendar";
    export { useFilter } from "react-aria";
    const lazy = import("react-aria-components");
    const common = require("tailwind-variants");
  `,
    "example.tsx",
  );
  assert.deepEqual(
    new Set(references),
    new Set(["react-stately/data", "react-aria", "react-aria-components", "tailwind-variants"]),
  );
});
