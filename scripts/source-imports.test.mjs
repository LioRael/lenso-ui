import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSource,
  runtimeModuleReferenceDetails,
  runtimeModuleReferences,
} from "./source-imports.mjs";

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

test("shared analysis exposes located references and unresolved expressions without changing string callers", () => {
  const source = '\nimport { Button } from "@lenso/react";\nconst lazy = import(moduleName);';
  assert.equal(parseSource(source, "example.tsx").program.body.length, 2);
  const details = runtimeModuleReferenceDetails(source, "example.tsx");
  assert.equal(details[0].module, "@lenso/react");
  assert.equal(details[0].location.line, 2);
  assert.equal(details[1].module, null);
  assert.equal(details[1].location.line, 3);
  assert.deepEqual(runtimeModuleReferences(source, "example.tsx"), ["@lenso/react"]);
});
