import { expect, test } from "bun:test";
import postcss from "postcss";
import { initialCSS } from "../scripts/initial-css.js";

test("initial selectors preserve atomic declarations, state selectors and nested rule placement", () => {
  const original =
    '@layer components { @media (hover:hover) { .xA:not(#\\#):hover { color: red; content: ".xA" } .xA:is([data-checked] *) { opacity:1 } } } [data-key=".xA"] { color:blue }';
  const css = initialCSS(original, [
    { kind: "button", selector: '[data-lenso-kind="button"]', classes: ["xA"] },
  ]);
  expect(css).toContain(
    ':is(.xA,:where([data-lenso-kind="button"]:not([data-lenso-ready]))):not(#\\#):hover',
  );
  expect(css).toContain(
    ':is([data-checked],:where(:not([data-lenso-ready]))[data-lenso-checked="true"])',
  );
  expect(css).toContain('[data-key=".xA"] { color:blue }');
  const declarations = (source: string) => {
    const entries: string[] = [];
    postcss.parse(source).walkDecls((decl) => {
      entries.push(`${decl.prop}:${decl.value}`);
    });
    return entries;
  };
  expect(declarations(css)).toEqual(declarations(original));
  expect(postcss.parse(css).first?.type).toBe("atrule");
});

test("keyframe steps remain outside selector aliasing", () => {
  const original =
    "@keyframes turn { 0%, 50% { opacity:0 } to { opacity:1 } } .xA { animation: turn 1s }";
  const css = initialCSS(original, [
    { kind: "spinner", selector: '[data-lenso-kind="spinner"]', classes: ["xA"] },
  ]);
  expect(css).toContain("@keyframes turn { 0%, 50% { opacity:0 } to { opacity:1 } }");
  expect(css).toContain(':is(.xA,:where([data-lenso-kind="spinner"]:not([data-lenso-ready])))');
});

test("selector factoring reduces repeated tails without widening diagonal combinations", async () => {
  const { compactSelectors } = await import("../scripts/initial-css.js");
  const rectangle = compactSelectors([
    '[data-kind="button"][data-size="sm"][data-full="true"]',
    '[data-kind="button"][data-size="sm"][data-full="false"]',
    '[data-kind="button"][data-size="lg"][data-full="true"]',
    '[data-kind="button"][data-size="lg"][data-full="false"]',
  ]);
  expect(rectangle).toBe(
    '[data-kind="button"]:is([data-size="sm"],[data-size="lg"]):is([data-full="true"],[data-full="false"])',
  );
  const diagonal = compactSelectors([
    '[data-kind="button"][data-size="sm"][data-full="true"]',
    '[data-kind="button"][data-size="lg"][data-full="false"]',
  ]);
  expect(diagonal).toBe(
    '[data-kind="button"]:is([data-size="sm"][data-full="true"],[data-size="lg"][data-full="false"])',
  );
  expect(compactSelectors(['[data-kind="button"]', '[data-kind="button"][data-size="sm"]'])).toBe(
    '[data-kind="button"]',
  );
  expect(compactSelectors(["[data-a] > [data-b]"])).toBe("[data-a] > [data-b]");
});

test("toggle selected styles use ARIA without claiming Exact's transient press marker", () => {
  const css = initialCSS(".xA:is([data-pressed]) { color: red }", [
    { kind: "toggle-button", selector: '[data-lenso-kind="toggle-button"]', classes: ["xA"] },
  ]);
  expect(css).toContain(
    ':is([data-pressed]:not(:where([data-slot="toggle-button"])),:where([data-slot="toggle-button"])[aria-pressed="true"])',
  );
  expect(css).not.toContain("data-lenso-pressed");
});

test("missing compiled style definitions fail before an unstyled recipe can pass parity", () => {
  expect(() =>
    initialCSS(".present { color:red }", [
      { kind: "button", selector: '[data-lenso-kind="button"]', classes: ["missing"] },
    ]),
  ).toThrow("Missing compiled StyleX CSS for missing");
});

// The tab's selection exists before native boolean markers are connected.
test("selected tab predicates use declared active metadata before hatch initialization", () => {
  const css = initialCSS(".xA:is([data-active]) { anchor-name: --lenso-tabs-active }", [
    { kind: "tabs-tab", selector: '[data-lenso-kind="tabs-tab"]', classes: ["xA"] },
  ]);
  expect(css).toContain(
    ':is([data-active],:where(:not([data-lenso-ready]))[data-lenso-active="true"])',
  );
});

test("pending hover guards use true loading metadata before native markers connect", () => {
  const css = initialCSS(".xA:hover:not([data-pending]) { color:red }", [
    {
      kind: "button-group-item",
      selector: '[data-lenso-kind="button-group-item"]',
      classes: ["xA"],
    },
  ]);
  expect(css).toContain(
    ':is([data-pending],:where(:not([data-lenso-ready]))[data-lenso-loading="true"])',
  );
  expect(css).not.toContain('[data-lenso-loading="false"]');
});
