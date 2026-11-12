import { test, expect } from "bun:test";
import {
  descriptionBridge,
  toggleButtonBridge,
  glassToggleBridge,
  toggleGroupItemBridge,
  linkBridge,
  sectionIndexLinkBridge,
  tabBarLinkBridge,
  inputBridge,
  dateSegmentBridge,
  otpInputBridge,
  textareaBridge,
  checkboxBridge,
  radioBridge,
  colorSliderInputBridge,
  autocompleteInputBridge,
  autocompletePartsBridge,
  comboBoxInputBridge,
  comboBoxPartsBridge,
  disclosureBridge,
  tabsListBridge,
  tabBridge,
  tabPanelBridge,
  dialogPartsBridge,
  popoverPartsBridge,
  menuPartsBridge,
  popupButtonMenuBridge,
  colorPickerTriggerBridge,
} from "../scripts/primitive-bridge";

const canonical = await Bun.file(
  new URL("../../primitives-exact/components/field.contract", import.meta.url),
).text();
const license = await Bun.file(new URL("../../primitives-exact/LICENSE", import.meta.url)).text();

const buttons = await Bun.file(
  new URL("../../primitives-exact/components/button.contract", import.meta.url),
).text();
// Field/choice guards do not cover toggle inversion or the native navigation target.
test("button bridges reject activation, state and navigation drift", () => {
  for (const [from, to] of [
    ["press=change(not pressed)", "press=change(pressed)"],
    ["aria-pressed=pressed", "aria-checked=pressed"],
    ["disabled=disabled", "disabled=false"],
  ])
    expect(() => toggleButtonBridge(buttons.replace(from!, to!), license)).toThrow(
      "anatomy changed",
    );
  for (const [from, to] of [
    ["href=href", 'href=""'],
    ["link id=id", "button id=id"],
  ])
    expect(() => linkBridge(buttons.replace(from!, to!), license)).toThrow("anatomy changed");
});
// Ordinary toggle tests do not cover Glass children, group projection or material props.
test("glass toggle bridges preserve primitive activation and the actual native button", () => {
  for (const grouped of [false, true]) {
    const result = glassToggleBridge(buttons, license, grouped).contract;
    expect(result.match(/    button /g)?.length).toBe(1);
    expect(result).toContain("aria-pressed=pressed disabled=disabled press=change(not pressed)");
    expect(result).toContain('data-slot="glass-toggle-button"');
    expect(result).toContain("data-variant=variant");
    expect(result).toContain('data-slot="glass-press-highlight"');
    expect(result).toContain(
      "data-lenso-disabled=disabled data-lenso-tint=tint data-lenso-elastic=elastic",
    );
    expect(result).toContain("Permission is hereby granted");
    expect(() =>
      glassToggleBridge(
        buttons.replace("press=change(not pressed)", "press=change(pressed)"),
        license,
        grouped,
      ),
    ).toThrow("anatomy changed");
  }
});
test("button bridges preserve native slots and explicit UI extensions", () => {
  const toggle = toggleButtonBridge(buttons, license).contract;
  const link = linkBridge(buttons, license).contract;
  expect(toggle).toContain("press=change(not pressed)");
  expect(toggle).toContain('data-lenso-kind="toggle-button"');
  expect(toggle).toContain("      children");
  expect(link).toContain('href=(disabled ? "" : href)');
  expect(link).toContain("target=target");
  expect(link).toContain("tabindex=(disabled ? -1 : 0)");
  for (const output of [toggle, link]) {
    expect(output).toContain("@lenso/primitives-exact/components/button.contract");
    expect(output).toContain("Permission is hereby granted");
  }
});

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

test("color range bridge requires review when canonical range bounds or events change", () => {
  expect(() =>
    colorSliderInputBridge(
      choices.replace("min=min max=max step=step", "min=0 max=max step=step"),
      license,
    ),
  ).toThrow();
  expect(() =>
    colorSliderInputBridge(
      choices.replace(
        "disabled=disabled input=input change=change",
        "disabled=disabled input=change change=input",
      ),
      license,
    ),
  ).toThrow();
});

// Existing Popover checks do not exercise the separately generated picker trigger.
test("picker trigger retains native targeting and rejects canonical invoker drift", async () => {
  const source = await Bun.file(
    new URL("../../primitives-exact/components/popover.contract", import.meta.url),
  ).text();
  const generated = colorPickerTriggerBridge(source, license);
  expect(generated.contract).toContain("component StyledColorPickerTrigger");
  expect(generated.contract).toContain("popovertarget=target");
  expect(generated.contract).toContain('data-lenso-kind="color-picker-trigger"');
  expect(generated.contract).toContain("MIT License");
  expect(() =>
    colorPickerTriggerBridge(source.replace("popovertarget=target", "popovertarget=id"), license),
  ).toThrow("anatomy changed");
});

// Existing menu and input checks do not exercise the combo-specific semantic projections.
test("combo bridges retain canonical controls and reject native event/command drift", async () => {
  const popover = await Bun.file(
    new URL("../../primitives-exact/components/popover.contract", import.meta.url),
  ).text();
  expect(comboBoxInputBridge(canonical, license).contract).toContain('role="combobox"');
  expect(comboBoxInputBridge(canonical, license).contract).not.toContain(
    "data-lenso-required=required",
  );
  expect(comboBoxInputBridge(canonical, license).contract).not.toContain("submit=submit");
  const parts = comboBoxPartsBridge(popover, license).contract;
  expect(parts).toContain('role="option"');
  expect(parts).not.toContain('command="hide-popover"');
  expect(parts).toContain("MIT License");
  expect(() =>
    comboBoxPartsBridge(popover.replaceAll('command="hide-popover"', 'command="close"'), license),
  ).toThrow("anatomy changed");
  expect(() =>
    comboBoxInputBridge(canonical.replace("submit=submit", "submit=change"), license),
  ).toThrow("anatomy changed");
});

// Popup-search composition needs a tabbable outer trigger without altering option activation.
test("autocomplete derives native controls with an independent search and tabbable trigger", () => {
  const input = autocompleteInputBridge(canonical, license).contract;
  const parts = autocompletePartsBridge(popovers, license).contract;
  expect(input).toContain('data-slot="autocomplete-input" role="combobox"');
  expect(input).not.toContain("submit=submit");
  expect(parts).toContain('tabindex=0 aria-haspopup="listbox"');
  expect(parts).toContain('data-lenso-kind="autocomplete-trigger" aria-labelledby=labelledBy');
  expect(parts).toContain('data-slot="autocomplete-item"');
  expect(() =>
    autocompleteInputBridge(
      canonical.replace("input=input change=change", "input=change change=input"),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    autocompletePartsBridge(
      popovers.replaceAll('command="hide-popover"', 'command="toggle-popover"'),
      license,
    ),
  ).toThrow("anatomy changed");
});

// OTP's real editors must retain canonical disabled, readonly and live input contracts.
test("OTP slot derivatives retain canonical input and reject editing drift", () => {
  const output = otpInputBridge(canonical, license).contract;
  expect(output).toContain('data-slot="input-otp-slot" data-lenso-index=index');
  expect(output).toContain("input=input change=change");
  expect(output).not.toContain("submit=submit");
  expect(output).not.toContain("data-lenso-required=required");
  expect(output).toContain("Permission is hereby granted");
  for (const [from, to] of [
    ["readonly=readOnly", "readonly=false"],
    ["input=input change=change", "input=change change=input"],
  ])
    expect(() => otpInputBridge(canonical.replace(from!, to!), license)).toThrow("anatomy changed");
});

// Popup presentation must preserve the canonical native menu command instead of opening a second state owner.
test("popup button menu trigger preserves native targeting and ordinary presentation", () => {
  const output = popupButtonMenuBridge(popovers, license).contract;
  expect(output).toContain("popovertarget=target disabled=disabled");
  expect(output).toContain('data-lenso-kind="menu-trigger"');
  expect(output).toContain('data-lenso-presentation="popup-button"');
  expect(output).toContain('aria-haspopup="menu"');
  expect(output).toContain("Permission is hereby granted");
  expect(() =>
    popupButtonMenuBridge(
      popovers.replace("popovertarget=target", 'popovertarget="other"'),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Navigation index styling must not replace the canonical anchor or its href semantics.
test("section index derives native links with controlled location and roving metadata", () => {
  const output = sectionIndexLinkBridge(buttons, license).contract;
  expect(output).toContain('link id=id testId=id aria-label=label href=(disabled ? "" : href)');
  expect(output).toContain('aria-current=(current ? "location" : "false")');
  expect(output).toContain("tabindex=(tabStop ? 0 : -1)");
  expect(output).toContain("data-lenso-value=value");
  expect(output).toContain("Permission is hereby granted");
  expect(() => sectionIndexLinkBridge(buttons.replace("href=href", 'href=""'), license)).toThrow(
    "anatomy changed",
  );
});

// TabBar destinations are links, not in-page tabs; disabled routing remains canonical.
test("tab bar link derivatives preserve native destinations and page-current intent", () => {
  const output = tabBarLinkBridge(buttons, license).contract;
  expect(output).toContain('link id=id testId=id aria-label=label href=(disabled ? "" : href)');
  expect(output).toContain('aria-current=(current ? "page" : "false")');
  expect(output).toContain('data-tab-bar-destination=""');
  expect(output).not.toContain('role="tab"');
  expect(output).toContain("Permission is hereby granted");
  expect(() => tabBarLinkBridge(buttons.replace("link id=id", "button id=id"), license)).toThrow(
    "anatomy changed",
  );
});

// Group keyboard tests cannot detect a future generator losing canonical Toggle semantics.
test("toggle group item derives canonical bool inversion without a wrapper", () => {
  const output = toggleGroupItemBridge(buttons, license).contract;
  expect(output).toContain("component StyledToggleButtonGroupItem");
  expect(output).toContain("aria-pressed=pressed disabled=disabled press=change(not pressed)");
  expect(output).toContain("tabindex=(disabled ? -1 : 0)");
  expect(output).toContain('data-lenso-kind="toggle-button-group-item"');
  expect(output).toContain("data-orientation=orientation data-lenso-detached=detached");
  expect(output).toContain("Permission is hereby granted");
  expect(output.match(/    button /g)).toHaveLength(1);
  expect(output).not.toContain("    box ");
  expect(() =>
    toggleGroupItemBridge(
      buttons.replace("press=change(not pressed)", "press=change(pressed)"),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Feedback live-region drift is outside the button/field bridge guards.
test("refresh status retains the canonical polite atomic text status", async () => {
  const { refreshStatusBridge } = await import("../scripts/primitive-bridge");
  const feedback = await Bun.file(
    new URL("../../primitives-exact/components/feedback.contract", import.meta.url),
  ).text();
  const output = refreshStatusBridge(feedback, license).contract;
  expect(output).toContain('role="status" aria-live="polite" aria-atomic=true');
  expect(output).toContain('data-slot="refresh-control-status"');
  expect(output).toContain("Permission is hereby granted");
  expect(() =>
    refreshStatusBridge(feedback.replace('aria-live="polite"', 'aria-live="assertive"'), license),
  ).toThrow("anatomy changed");
});

// The context root must retain canonical Menu top-layer semantics independently of its point anchor.
test("context menu positioner retains the canonical native menu root", async () => {
  const { contextMenuPositionerBridge } = await import("../scripts/primitive-bridge");
  const result = contextMenuPositionerBridge(popovers, license).contract;
  expect(result).toContain('popover="auto" role="menu"');
  expect(result).toContain('data-lenso-context-menu="true"');
  expect(result).toContain('data-lenso-kind="menu-positioner"');
  expect(result).not.toContain("component StyledMenuItem");
  expect(result).toContain("Permission is hereby granted");
  expect(() =>
    contextMenuPositionerBridge(popovers.replace('role="menu"', 'role="dialog"'), license),
  ).toThrow("anatomy changed");
});

// Compact actions need the same native command and disabled semantics as ordinary Menu items.
test("context bar derivatives preserve canonical item activation and explicit expand intent", async () => {
  const { contextMenuBarItemBridge } = await import("../scripts/primitive-bridge");
  const output = contextMenuBarItemBridge(popovers, license).contract;
  expect(output).toContain("component StyledContextMenuBarItem");
  expect(output).toContain("component StyledContextMenuExpand");
  expect(output).toContain('data-lenso-presentation="context-bar"');
  expect(output).toContain('data-lenso-context-expand=""');
  expect(output).toContain('popovertarget=(closeOnClick ? target : "")');
  expect(output).toContain("disabled=disabled press=press");
  expect(output).toContain("Permission is hereby granted");
  expect(() =>
    contextMenuBarItemBridge(
      popovers.replace("disabled=disabled press=press", "disabled=false press=press"),
      license,
    ),
  ).toThrow("anatomy changed");
});

// The generic Input guard does not verify proxy-only required validation or native Enter delegation.
test("date segments retain primitive editing without duplicate form constraints", () => {
  const result = dateSegmentBridge(canonical, license).contract;
  expect(result).toContain('role="spinbutton"');
  expect(result).toContain("readonly=readOnly");
  expect(result).toContain("input=input change=change");
  expect(result).toContain("aria-required=required");
  expect(result).not.toContain("data-lenso-required=required");
  expect(result).not.toContain("submit=submit");
  expect(result).toContain("Permission is hereby granted");
});

// Calendar activation still needs canonical Toggle inversion and native disabled behavior.
test("calendar days derive the native toggle while preserving date identity", async () => {
  const { calendarDayBridge } = await import("../scripts/primitive-bridge");
  const result = calendarDayBridge(buttons, license).contract;
  expect(result).toContain("press=change(not pressed)");
  expect(result).toContain("disabled=disabled");
  expect(result).toContain("data-calendar-date=date");
  expect(result).toContain('data-slot="calendar-cell"');
  expect(result).toContain("Permission is hereby granted");
  expect(() =>
    calendarDayBridge(
      buttons.replace("press=change(not pressed)", "press=change(pressed)"),
      license,
    ),
  ).toThrow("anatomy changed");
});

// Year visibility and focused-year navigation are separate from day selection and must retain native Toggle contracts.
test("year picker bridges retain canonical toggles and separate year identities", async () => {
  const { calendarYearTriggerBridge, calendarYearCellBridge } =
    await import("../scripts/primitive-bridge");
  const trigger = calendarYearTriggerBridge(buttons, license).contract,
    cell = calendarYearCellBridge(buttons, license).contract;
  expect(trigger).toContain("aria-expanded=pressed aria-controls=target");
  expect(trigger).toContain("press=change(not pressed)");
  expect(cell).toContain("data-lenso-year-date=date");
  expect(cell).not.toContain("data-calendar-date=date");
  expect(cell).toContain("disabled=disabled");
  expect(() =>
    calendarYearTriggerBridge(
      buttons.replace("press=change(not pressed)", "press=change(pressed)"),
      license,
    ),
  ).toThrow("anatomy changed");
  expect(() =>
    calendarYearCellBridge(buttons.replace("disabled=disabled", "disabled=false"), license),
  ).toThrow("anatomy changed");
});
