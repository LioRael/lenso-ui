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
