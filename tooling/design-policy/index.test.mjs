import assert from "node:assert/strict";
import test from "node:test";
import { checkDesignPolicy } from "./index.mjs";

const check = (
  source,
  mode = "library",
  filename = "packages/react/src/components/button/button.tsx",
) => checkDesignPolicy({ files: [{ filename, source }], mode });

test("located runtime rules ignore type-only imports and preserve consumer React Aria", () => {
  const source =
    'import type { CalendarProps } from "react-aria-components";\nimport {Button} from "react-aria-components";';
  const result = check(source);
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].line, 2);
  assert.equal(result.diagnostics[0].ruleId, "lenso/react-aria-family");
  assert.deepEqual(check(source, "consumer").diagnostics, []);
  assert.deepEqual(
    check(source, "library", "packages/react/src/components/date-picker/date-picker.tsx")
      .diagnostics,
    [],
  );
});

test("lazy, CommonJS and re-export imports use the existing runtime import authority", () => {
  const result = check(
    'export * from "@lenso/design-lint"; const x = import("tailwindcss"); require("tailwind-variants");',
  );
  assert.deepEqual(
    result.diagnostics.map((item) => item.ruleId),
    ["lenso/no-legacy-import", "lenso/no-tailwind-runtime", "lenso/no-tailwind-runtime"],
  );
});

test("full StyleX output and caller overrides pass; provable output loss and order fail", () => {
  const prefix = 'import sx from "@stylexjs/stylex";';
  assert.deepEqual(check(`${prefix}const good = sx.props(styles.base, xstyle);`).diagnostics, []);
  const result = check(
    `${prefix}function Button({xstyle}) { return <button className={sx.props(xstyle, styles.base).className}/>; }`,
  );
  assert.deepEqual(
    new Set(result.diagnostics.map((item) => item.ruleId)),
    new Set(["lenso/stylex-output", "lenso/xstyle-last"]),
  );
  assert.deepEqual(check("const bad = unrelated.props(xstyle, base).className;").diagnostics, []);
  assert.deepEqual(
    check(`${prefix}const buildOnly = sx.props(styles.base).className.split(" ");`).diagnostics,
    [],
  );
});

test("unresolved source and shadowed StyleX bindings are skipped, never autofixed", () => {
  assert.equal(check("const =").skipped.length, 1);
  assert.equal(check("const lazy = import(moduleName);").skipped[0].ruleId, "lenso/runtime-import");
  const result = check(
    'import sx from "@stylexjs/stylex"; function f(sx) { return sx.props(xstyle, base).className; }',
  );
  assert.equal(result.skipped.length, 1);
  assert.deepEqual(result.diagnostics, []);
  assert.equal("fix" in result.skipped[0], false);
  assert.deepEqual(
    check(
      'import * as sx from "@stylexjs/stylex"; function f(resolve: () => sx.StyleXStyles) { return sx.props(resolve()); }',
    ).skipped,
    [],
  );
});

test("caller interface rejects unspecified modes and invalid file data", () => {
  assert.throws(() => checkDesignPolicy({ files: [] }), /mode/);
  assert.throws(
    () => checkDesignPolicy({ files: [{ filename: "a.ts" }], mode: "consumer" }),
    /source/,
  );
});

test("active UI and tokens namespaces are not confused with removed folder names", () => {
  assert.deepEqual(
    check(
      'import { Button } from "@lenso/ui"; import {buttonVariants} from "@lenso/tokens/button"; import "@lenso/tokens/styles.css";',
    ).diagnostics,
    [],
  );
});

test("RAC state callbacks preserve className and runtime styles without a false namespace shadow", () => {
  const source = `
    import { createElement } from "react";
    import * as stylex from "@stylexjs/stylex";
    export function racPart<C extends ElementType, State>(
      Component: C, slot: string,
      resolve: (state: State) => stylex.StyleXStyles<Record<string, unknown>>,
    ) {
      return function Part({ xstyle, style, ...props }: StyleXProps<ComponentPropsWithRef<C>>) {
        const compiled = (state: State) => stylex.props(resolve(state), xstyle);
        return createElement(Component, {
          ...props,
          "data-slot": (props as { "data-slot"?: string })["data-slot"] ?? slot,
          className: (state: State) => compiled(state).className,
          style: (state: State & { defaultStyle?: CSSProperties }) => ({
            ...state.defaultStyle,
            ...compiled(state).style,
            ...(typeof style === "function" ? style(state) : style),
          }),
        });
      };
    }`;
  assert.deepEqual(check(source), { diagnostics: [], skipped: [] });
});
