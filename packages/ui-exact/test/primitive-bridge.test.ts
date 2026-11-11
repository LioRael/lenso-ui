import { test, expect } from "bun:test";
import {
  descriptionBridge,
  inputBridge,
  textareaBridge,
  checkboxBridge,
  radioBridge,
  disclosureBridge,
  tabsListBridge,
  tabBridge,
  tabPanelBridge,
  dialogPartsBridge,
  popoverPartsBridge,
  menuPartsBridge,
} from "../scripts/primitive-bridge";

const canonical = await Bun.file(
  new URL("../../primitives-exact/components/field.contract", import.meta.url),
).text();
const license = await Bun.file(new URL("../../primitives-exact/LICENSE", import.meta.url)).text();

// Contract import checks do not catch a generator silently styling the wrong node after source drift.
test("description bridge rejects a changed native node before generating styled output", () => {
  const changed = canonical.replace("text message id=id testId=id", "box id=id testId=id");
  expect(() => descriptionBridge(changed, license)).toThrow("anatomy changed");
  expect(() =>
    descriptionBridge(
      canonical.replace("component FieldDescription", "component RenamedDescription"),
      license,
    ),
  ).toThrow("Missing canonical");
});
test("generated description retains MIT provenance and responds to canonical source updates", () => {
  const first = descriptionBridge(canonical, license);
  const changed = descriptionBridge(canonical + "\n// Source revision\n", license);
  expect(first.contract).toContain("Copyright (c) 2026 Lenso contributors");
  expect(first.contract).toContain("Permission is hereby granted");
  expect(first.sourceSHA256).not.toBe(changed.sourceSHA256);
  expect(descriptionBridge(canonical, license)).toEqual(first);
});

// Description drift checks do not guard Textarea's independent native event contract.
test("textarea bridge rejects canonical editing or readonly changes pending review", () => {
  expect(() =>
    textareaBridge(
      canonical.replace(
        "readonly=readOnly input=input change=change",
        "readonly=readOnly input=change change=input",
      ),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    textareaBridge(canonical.replace("component Textarea", "component RenamedTextarea"), license),
  ).toThrow("Missing canonical");
});

const choices = await Bun.file(
  new URL("../../primitives-exact/components/choice.contract", import.meta.url),
).text();
// Field bridge checks cannot catch a changed boolean payload or selected-value model in choice primitives.
test("choice bridges require review when canonical checked/change semantics drift", () => {
  expect(() =>
    checkboxBridge(
      choices.replace(
        "checked=checked disabled=disabled change=change",
        "checked=checked disabled=disabled input=change",
      ),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    radioBridge(
      choices.replace("checked=(selected == value)", "checked=(selected != value)"),
      license,
    ),
  ).toThrow("anatomy changed");
});

const disclosure = await Bun.file(
  new URL("../../primitives-exact/components/disclosure.contract", import.meta.url),
).text();
// Choice/input tests do not cover overlay target edges or disclosure activation wiring.
test("disclosure bridge rejects changed activation and panel-target contracts", () => {
  expect(() =>
    disclosureBridge(
      disclosure.replace("press=change(not state.open)", "press=change(state.open)"),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    disclosureBridge(
      disclosure.replace("aria-controls=`${item.id}-panel`", "aria-controls=`${item.id}-changed`"),
      license,
    ),
  ).toThrow("anatomy changed");
});

const tabs = await Bun.file(
  new URL("../../primitives-exact/components/tabs.contract", import.meta.url),
).text();
// Disclosure activation guards do not protect tablist semantics or layout ownership.
test("tabs list bridge rejects canonical role/orientation anatomy drift", () => {
  expect(() => tabsListBridge(tabs.replace('role="tablist"', 'role="group"'), license)).toThrow(
    "anatomy changed",
  );
  expect(() =>
    tabsListBridge(
      tabs.replace("aria-orientation=orientation", 'aria-orientation="horizontal"'),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Textarea drift checks do not cover Input's enum/type mapping or independent submit event.
test("input bridge requires review for canonical submit/type changes", () => {
  expect(() =>
    inputBridge(
      canonical.replace("input=input change=change submit=submit", "input=input change=change"),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    inputBridge(
      canonical.replace('type == "password" ? "password"', 'type == "password" ? "text"'),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Native-node guards alone would miss a new enum mode with a non-identity canonical default.
test("input projection rejects enum expansion before widening the styled API", () => {
  expect(() =>
    inputBridge(canonical.replace('"password">', '"password", "number">'), license),
  ).toThrow("type contract changed");
});

// Tablist guards do not cover activation payloads or panel relationships/visibility.
test("tab and panel bridges reject canonical behavior drift", () => {
  expect(() =>
    tabBridge(tabs.replace("press=change(value)", "press=change(selected)"), license),
  ).toThrow("anatomy changed");
  expect(() =>
    tabPanelBridge(tabs.replace("aria-labelledby=tab", 'aria-label="Panel"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    tabPanelBridge(tabs.replace("inert=(selected != value)", "inert=false"), license),
  ).toThrow("anatomy changed");
});

const dialogs = await Bun.file(
  new URL("../../primitives-exact/components/dialog.contract", import.meta.url),
).text();
// Tab guards do not protect show-modal/close commands or native dialog semantics.
test("dialog bridge rejects command and root semantics drift", () => {
  expect(() =>
    dialogPartsBridge(dialogs.replace('command="show-modal"', 'command="show-popover"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    dialogPartsBridge(dialogs.replace('command="close"', 'command="hide-popover"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    dialogPartsBridge(dialogs.replace('role="alertdialog"', 'role="dialog"'), license),
  ).toThrow("anatomy changed");
});

const popovers = await Bun.file(
  new URL("../../primitives-exact/components/popover.contract", import.meta.url),
).text();
// Modal command checks do not cover native popover invokers or auto top-layer behavior.
test("popover bridge rejects canonical invoker/top-layer behavior drift", () => {
  expect(() =>
    popoverPartsBridge(popovers.replace('popover="auto"', 'popover="manual"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    popoverPartsBridge(popovers.replace("popovertarget=target", 'popovertarget="other"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    popoverPartsBridge(
      popovers.replace('command="hide-popover"', 'command="toggle-popover"'),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Popover tests do not guard menu item activation, roles or submenu targets.
test("menu bridge rejects item/root/submenu semantic drift", () => {
  expect(() => menuPartsBridge(popovers.replace('role="menu"', 'role="dialog"'), license)).toThrow(
    "anatomy changed",
  );
  expect(() =>
    menuPartsBridge(
      popovers.replace("disabled=disabled press=press", "disabled=disabled press=press()"),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    menuPartsBridge(
      popovers.replace(
        'role="menuitem" aria-label=label popovertarget=target',
        'role="menuitem" aria-label=label popovertarget="other"',
      ),
      license,
    ),
  ).toThrow("anatomy changed");
});
