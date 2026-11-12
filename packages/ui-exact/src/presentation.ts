import { calendarPresentation, calendarKinds } from "./calendar-presentation.js";
import { dateFieldPresentation, dateFieldKinds } from "./date-field-presentation.js";
import { magnifierPresentation } from "./glass-magnifier-presentation.js";
import { wheelPickerPresentation, wheelPickerKinds } from "./wheel-picker-presentation.js";
import { navigationBarPresentation, navigationBarKinds } from "./navigation-bar-presentation.js";
import { contextMenuPresentation, contextMenuKinds } from "./context-menu-presentation.js";
import { refreshPresentation, refreshKinds } from "./refresh-control-presentation.js";
import { tabBarPresentation, tabBarKinds } from "./tab-bar-presentation.js";
import { sectionIndexStyles } from "@lenso/tokens/section-index";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import { otpPresentation, otpKinds } from "./input-otp-presentation.js";
import { autocompletePresentation, autocompleteKinds } from "./autocomplete-presentation.js";
import { comboBoxPresentation, comboBoxKinds } from "./combo-box-presentation.js";
import { tagPresentation, tagKinds } from "./tag-presentation.js";
import { listBoxPresentation, listBoxKinds } from "./list-box-presentation.js";
import { colorPickerPresentation, colorPickerKinds } from "./color-picker-presentation.js";
import { colorAreaPresentation, colorAreaKinds } from "./color-area-presentation.js";
import { colorSliderPresentation, colorSliderKinds } from "./color-slider-presentation.js";
import { colorFieldPresentation, colorFieldKinds } from "./color-field-presentation.js";
import { colorPresentation, colorKinds } from "./color-presentation.js";
import { swipePresentation, swipeKinds } from "./swipe-presentation.js";
import { listPresentation, listKinds } from "./list-presentation.js";
import { selectPresentation, selectKinds } from "./select-presentation.js";
import { numberPresentation, numberKinds } from "./number-presentation.js";
import { menuPresentation, menuKinds } from "./menu-presentation.js";
import { tooltipPresentation, tooltipKinds } from "./tooltip-presentation.js";
import { popoverPresentation, popoverKinds } from "./popover-presentation.js";
import { glassContainerPresentation, glassContainerKinds } from "./glass-container-presentation.js";
import { toolbarPresentation, toolbarKinds } from "./toolbar-presentation.js";
import { paginationPresentation, paginationKinds } from "./pagination-presentation.js";
import { searchFieldPresentation, searchFieldKinds } from "./search-field-presentation.js";
import { scrollShadowPresentation, scrollShadowKinds } from "./scroll-shadow-presentation.js";
export { scrollShadowProperties } from "./scroll-shadow-presentation.js";
import { pageControlPresentation, pageControlKinds } from "./page-control-presentation.js";
import { buttonGroupPresentation, buttonGroupKinds } from "./button-group-presentation.js";
import { segmentedPresentation, segmentedKinds } from "./segmented-presentation.js";
import { tabsPresentation, tabsKinds } from "./tabs-presentation.js";
import { sliderPresentation, sliderKinds } from "./slider-presentation.js";
import { switchPresentation, switchKinds } from "./switch-presentation.js";
import { avatarPresentation } from "./avatar-presentation.js";
import { layoutPresentation, layoutKinds } from "./layout-presentation.js";
import { contentPresentation, contentKinds } from "./content-presentation.js";
import type { StyleInput } from "./style-types.js";
import * as stylex from "@stylexjs/stylex";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { glassStyles } from "@lenso/tokens/glass";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { groupStyles, surfaceStyles, surfaceVariants } from "@lenso/tokens/surface";
import { formPresentation, formKinds } from "./forms.js";
import { disclosurePresentation, disclosureKinds } from "./disclosure-presentation.js";

import { navigationPresentation, navigationKinds } from "./navigation-presentation.js";

import { feedbackPresentation, feedbackKinds } from "./feedback-presentation.js";

import { togglePresentation } from "./toggle-presentation.js";

import { alertDialogPresentation, alertDialogKinds } from "./alert-dialog-presentation.js";
import { modalPresentation, modalKinds } from "./modal-presentation.js";

function sizeOf(value: string | undefined) {
  if (value === "sm" || value === "md" || value === "lg") return value;
  throw new RangeError(`Lenso size must be sm, md or lg; received ${value}`);
}

/** Used by both the hatch and build-time attribute selectors. No DOM is needed. */
function basePresentation(data: DOMStringMap, inputGroup = false): StyleInput {
  const { lensoKind: kind, lensoVariant: variant } = data;
  switch (kind) {
    case "section-index":
      return [
        sectionIndexStyles.root,
        data["lensoDisabled"] === "true" && sectionIndexStyles.disabled,
      ];
    case "section-index-item":
      return [sectionIndexStyles.item];
    case "popup-button":
      return [popupButtonStyles.root];
    case "popup-button-indicator":
      return [popupButtonStyles.indicator];
    case "surface":
      if (
        variant !== "default" &&
        variant !== "secondary" &&
        variant !== "tertiary" &&
        variant !== "transparent"
      )
        throw new RangeError(`Unknown Lenso Surface variant: ${variant}`);
      return [
        surfaceStyles.root,
        variant === "default" && groupStyles.surface,
        surfaceVariants[variant],
      ];
    case "glass":
      return [glassStyles.root, glassStyles.optics, glassStyles.foreground];
    case "button":
      if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
        throw new RangeError(`Unknown Lenso Button variant: ${variant}`);
      return [buttonStyles.root, buttonSizes[sizeOf(data["lensoSize"])], buttonVariants[variant]];
    case "glass-button":
      if (variant !== "default" && variant !== "prominent")
        throw new RangeError(`Unknown Lenso GlassButton variant: ${variant}`);
      return [
        glassButtonStyles.root,
        liquidMaterialStyles.small,
        glassButtonStyles.backdrop,
        glassButtonSizes[sizeOf(data["lensoSize"])],
        glassButtonVariants[variant],
        glassButtonStyles.interaction,
      ];
    default: {
      const result =
        kind &&
        (calendarPresentation(kind, data) ??
          dateFieldPresentation(kind, data) ??
          magnifierPresentation(kind, data) ??
          wheelPickerPresentation(kind, data) ??
          navigationBarPresentation(kind, data) ??
          contextMenuPresentation(kind, data) ??
          refreshPresentation(kind) ??
          tabBarPresentation(kind, data) ??
          otpPresentation(kind, data) ??
          autocompletePresentation(kind, data) ??
          comboBoxPresentation(kind, data) ??
          tagPresentation(kind, data) ??
          listBoxPresentation(kind, data) ??
          colorPickerPresentation(kind, data) ??
          colorAreaPresentation(kind, data) ??
          colorSliderPresentation(kind, data) ??
          colorFieldPresentation(kind, data) ??
          colorPresentation(kind, data) ??
          selectPresentation(kind, data) ??
          numberPresentation(kind, data) ??
          formPresentation(kind, data, inputGroup) ??
          disclosurePresentation(kind, data) ??
          navigationPresentation(kind, data) ??
          feedbackPresentation(kind, data) ??
          togglePresentation(kind, data) ??
          modalPresentation(kind, data) ??
          alertDialogPresentation(kind, data) ??
          swipePresentation(kind, data) ??
          listPresentation(kind, data) ??
          contentPresentation(kind, data) ??
          layoutPresentation(kind, data) ??
          avatarPresentation(kind, data) ??
          switchPresentation(kind, data) ??
          sliderPresentation(kind) ??
          tabsPresentation(kind, data) ??
          segmentedPresentation(kind, data) ??
          buttonGroupPresentation(kind, data) ??
          pageControlPresentation(kind, data) ??
          scrollShadowPresentation(kind, data) ??
          searchFieldPresentation(kind, data) ??
          paginationPresentation(kind, data) ??
          toolbarPresentation(kind, data) ??
          glassContainerPresentation(kind, data) ??
          popoverPresentation(kind, data) ??
          tooltipPresentation(kind, data) ??
          menuPresentation(kind, data));
      if (!result) throw new RangeError(`Unknown Lenso component: ${kind}`);
      return result;
    }
  }
}

export interface PresentationRule {
  kind: string;
  /** A stable Exact testId; omitted rules apply to all instances of the kind. */
  testId?: string;
  xstyle: StyleInput;
}

/** Compose caller maps last so StyleX can remove conflicting base properties. */
export function presentation(data: DOMStringMap, inputGroup = false, xstyle?: StyleInput) {
  return stylex.props(basePresentation(data, inputGroup), xstyle);
}

function cssString(value: string) {
  let escaped = "";
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code === 0) throw new TypeError("A style target cannot contain a null character");
    escaped +=
      code < 32 || code === 127 || character === '"' || character === "\\"
        ? `\\${code.toString(16)} `
        : character;
  }
  return `"${escaped}"`;
}

export function presentationCases(rules: readonly PresentationRule[] = []) {
  const cases: Array<{
    kind: string;
    selector: string;
    classes: string[];
    data: DOMStringMap;
    inputGroup: boolean;
    attributes?: Record<string, string>;
  }> = [];
  const add = (kind: string, data: DOMStringMap = {}, suffix = "", inputGroup = false) => {
    const compiled = presentation({ ...data, lensoKind: kind }, inputGroup);
    if (compiled.style && Object.keys(compiled.style).length)
      throw new Error(`Lenso ${kind} needs a declarative adapter for its inline values`);
    // Initial aliases use :where to preserve atomic specificity; replacement recipes need disjoint cases.
    const replacementScope =
      kind === "menu-popup" && data["lensoMode"] !== "compact"
        ? ':not([data-lenso-mode="compact"])'
        : kind === "menu-item" && data["lensoPresentation"] !== "context-bar"
          ? ':not([data-lenso-presentation="context-bar"])'
          : "";
    cases.push({
      kind,
      selector: `[data-lenso-kind="${kind}"]${suffix}${replacementScope}`,
      classes: compiled.className?.split(" ").filter(Boolean) ?? [],
      data: { ...data, lensoKind: kind },
      inputGroup,
    });
  };
  add("menu-bar", { lensoElastic: "false" }, '[data-lenso-elastic="false"]');
  add("menu-bar", { lensoElastic: "true" }, '[data-lenso-elastic="true"]');
  for (const fullWidth of ["false", "true"]) {
    add("number-field", { lensoFullWidth: fullWidth }, `[data-lenso-full-width="${fullWidth}"]`);
    for (const variant of ["primary", "secondary"])
      add(
        "number-field-group",
        { lensoFullWidth: fullWidth, lensoVariant: variant },
        `[data-lenso-full-width="${fullWidth}"][data-lenso-variant="${variant}"]`,
      );
  }
  for (const fullWidth of ["false", "true"]) {
    add("select-root", { lensoFullWidth: fullWidth }, `[data-lenso-full-width="${fullWidth}"]`);
    for (const variant of ["primary", "secondary"])
      add(
        "select-trigger",
        { lensoFullWidth: fullWidth, lensoVariant: variant },
        `[data-lenso-full-width="${fullWidth}"][data-lenso-variant="${variant}"]`,
      );
  }
  for (const variant of ["primary", "secondary"])
    add("select-item", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const variant of ["grouped", "plain"])
    add("list-root", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const height of ["regular", "tall"])
    add("list-item", { lensoHeight: height }, `[data-lenso-height="${height}"]`);
  for (const disabled of ["false", "true"])
    for (const dots of ["false", "true"])
      add(
        "color-area",
        { lensoDisabled: disabled, lensoDots: dots },
        `[data-lenso-disabled="${disabled}"][data-lenso-dots="${dots}"]`,
      );
  for (const orientation of ["horizontal", "vertical"]) {
    add("color-slider-track", { orientation }, `[data-orientation="${orientation}"]`);
    add("color-slider-thumb", { orientation }, `[data-orientation="${orientation}"]`);
    for (const disabled of ["false", "true"])
      add(
        "color-slider",
        { orientation, lensoDisabled: disabled },
        `[data-orientation="${orientation}"][data-lenso-disabled="${disabled}"]`,
      );
  }
  for (const full of ["false", "true"]) {
    add("color-field", { lensoFullWidth: full }, `[data-lenso-full-width="${full}"]`);
    for (const variant of ["primary", "secondary"])
      for (const disabled of ["false", "true"])
        for (const invalid of ["false", "true"])
          add(
            "color-input-group",
            {
              lensoFullWidth: full,
              lensoVariant: variant,
              lensoDisabled: disabled,
              lensoInvalid: invalid,
            },
            `[data-lenso-full-width="${full}"][data-lenso-variant="${variant}"][data-lenso-disabled="${disabled}"][data-lenso-invalid="${invalid}"]`,
          );
  }
  for (const variant of ["primary", "secondary"])
    for (const full of ["true", "false"])
      for (const chips of ["true", "false"])
        for (const kind of [
          "autocomplete-root",
          "autocomplete-input-group",
          "autocomplete-trigger",
        ])
          add(
            kind,
            { lensoVariant: variant, lensoFullWidth: full, lensoChips: chips },
            `[data-lenso-variant="${variant}"][data-lenso-full-width="${full}"][data-lenso-chips="${chips}"]`,
          );
  for (const variant of ["primary", "secondary"])
    for (const glass of ["true", "false"])
      add(
        "input-otp-slot",
        { lensoVariant: variant, lensoGlass: glass },
        `[data-lenso-variant="${variant}"][data-lenso-glass="${glass}"]`,
      );
  add(
    "menu-trigger",
    { lensoPresentation: "popup-button" },
    '[data-lenso-presentation="popup-button"]',
  );
  for (const disabled of ["true", "false"])
    add("section-index", { lensoDisabled: disabled }, `[data-lenso-disabled="${disabled}"]`);
  for (const layout of ["phone", "tablet"]) {
    for (const kind of ["tab-bar", "tab-bar-material", "tab-bar-fallback"])
      add(kind, { layout }, `[data-layout="${layout}"]`);
    for (const separate of ["true", "false"]) {
      for (const kind of ["tab-bar-list", "tab-bar-item-container"])
        add(
          kind,
          { layout, lensoSeparate: separate },
          `[data-layout="${layout}"][data-lenso-separate="${separate}"]`,
        );
      for (const elastic of ["true", "false"])
        add(
          "tab-bar-group",
          { layout, lensoSeparate: separate, lensoElastic: elastic },
          `[data-layout="${layout}"][data-lenso-separate="${separate}"][data-lenso-elastic="${elastic}"]`,
        );
    }
    for (const iconOnly of ["true", "false"]) {
      for (const kind of ["tab-bar-icon", "tab-bar-button"])
        add(
          kind,
          { layout, lensoIconOnly: iconOnly },
          `[data-layout="${layout}"][data-lenso-icon-only="${iconOnly}"]`,
        );
      for (const current of ["true", "false"])
        add(
          "tab-bar-link",
          { layout, lensoIconOnly: iconOnly, lensoCurrent: current },
          `[data-layout="${layout}"][data-lenso-icon-only="${iconOnly}"][data-lenso-current="${current}"]`,
        );
    }
  }
  for (const iconOnly of ["true", "false"])
    add("tab-bar-label", { lensoIconOnly: iconOnly }, `[data-lenso-icon-only="${iconOnly}"]`);
  for (const size of ["xs", "sm", "md", "lg", "xl"])
    for (const shape of ["circle", "square"]) {
      add(
        "color-swatch",
        { lensoSize: size, lensoVariant: shape },
        `[data-lenso-size="${size}"][data-lenso-variant="${shape}"]`,
      );
      for (const variant of ["primary", "secondary"]) {
        add("combo-box-input", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
        for (const full of ["true", "false"]) {
          for (const kind of ["combo-box-root", "combo-box-input-group"])
            add(
              kind,
              { lensoVariant: variant, lensoFullWidth: full },
              `[data-lenso-variant="${variant}"][data-lenso-full-width="${full}"]`,
            );
        }
      }
      for (const size of ["sm", "md", "lg"])
        for (const variant of ["default", "surface"])
          for (const checked of ["true", "false"])
            for (const disabled of ["true", "false"])
              add(
                "tag",
                {
                  lensoSize: size,
                  lensoVariant: variant,
                  lensoChecked: checked,
                  lensoDisabled: disabled,
                },
                `[data-lenso-size="${size}"][data-lenso-variant="${variant}"][data-lenso-checked="${checked}"][data-lenso-disabled="${disabled}"]`,
              );
      for (const variant of ["default", "danger"]) {
        add("list-box-indicator", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
        for (const disabled of ["true", "false"])
          add(
            "list-box-item",
            { lensoVariant: variant, lensoDisabled: disabled },
            `[data-lenso-variant="${variant}"][data-lenso-disabled="${disabled}"]`,
          );
      }
      for (const layout of ["grid", "stack", "palette"])
        for (const disabled of ["false", "true"])
          for (const active of ["false", "true"])
            add(
              "color-swatch-picker-item",
              {
                lensoSize: size,
                lensoVariant: shape,
                lensoLayout: layout,
                lensoDisabled: disabled,
                lensoActive: active,
              },
              `[data-lenso-size="${size}"][data-lenso-variant="${shape}"][data-lenso-layout="${layout}"][data-lenso-disabled="${disabled}"][data-lenso-active="${active}"]`,
            );
    }
  for (const layout of ["grid", "stack", "palette"]) {
    add("color-swatch-picker", { lensoLayout: layout }, `[data-lenso-layout="${layout}"]`);
    add("color-swatch-picker-swatch", { lensoLayout: layout }, `[data-lenso-layout="${layout}"]`);
  }
  for (const side of ["start", "end"])
    add("swipe-actions", { lensoSide: side }, `[data-lenso-side="${side}"]`);
  for (const variant of ["default", "danger", "tint"])
    add("swipe-action", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const layout of ["vertical", "horizontal"])
    for (const align of ["leading", "trailing"])
      add(
        "context-menu-layout",
        { lensoLayout: layout, lensoAlignment: align },
        `[data-lenso-layout="${layout}"][data-lenso-alignment="${align}"]`,
      );
  add("menu-popup", { lensoMode: "compact" }, '[data-lenso-mode="compact"]');
  for (const variant of ["default", "danger"])
    add(
      "menu-item",
      { lensoVariant: variant, lensoPresentation: "context-bar" },
      `[data-lenso-variant="${variant}"][data-lenso-presentation="context-bar"]`,
    );
  for (const kind of [
    "section-index-item",
    "popup-button",
    "popup-button-indicator",
    ...contextMenuKinds,
    ...refreshKinds,
    ...tabBarKinds,
    ...otpKinds,
    ...autocompleteKinds,
    ...comboBoxKinds,
    ...tagKinds,
    ...listBoxKinds,
    ...colorPickerKinds,
    ...colorAreaKinds,
    ...colorSliderKinds,
    ...colorFieldKinds,
    ...colorKinds,
    ...swipeKinds,
    ...listKinds,
    ...selectKinds,
    ...numberKinds,
    ...menuKinds,
    ...tooltipKinds,
    ...popoverKinds,
    ...glassContainerKinds,
    ...toolbarKinds,
    ...navigationBarKinds,
    ...wheelPickerKinds,
    ...dateFieldKinds,
    ...calendarKinds,
    ...paginationKinds,
    ...searchFieldKinds,
    ...formKinds,
    ...disclosureKinds,
    ...navigationKinds,
    ...feedbackKinds,
    ...modalKinds,
    ...alertDialogKinds,
    ...contentKinds,
    ...layoutKinds,
    ...switchKinds,
    ...sliderKinds,
    ...tabsKinds,
    ...segmentedKinds,
    ...buttonGroupKinds,
    ...pageControlKinds,
    ...scrollShadowKinds,
    "glass",
  ])
    add(kind);
  for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"])
    for (const align of ["start", "center", "end"])
      for (const direction of ["ltr", "rtl"])
        add(
          "popover-positioner",
          { lensoSide: side, lensoAlign: align, lensoDirection: direction },
          `[data-lenso-side="${side}"][data-lenso-align="${align}"][data-lenso-direction="${direction}"]`,
        );
  for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"])
    for (const align of ["start", "center", "end"])
      for (const direction of ["ltr", "rtl"])
        add(
          "tooltip-positioner",
          { lensoSide: side, lensoAlign: align, lensoDirection: direction },
          `[data-lenso-side="${side}"][data-lenso-align="${align}"][data-lenso-direction="${direction}"]`,
        );
  for (const side of ["top", "bottom", "left", "right", "inline-start", "inline-end"])
    for (const align of ["start", "center", "end"])
      for (const direction of ["ltr", "rtl"])
        add(
          "menu-positioner",
          { lensoSide: side, lensoAlign: align, lensoDirection: direction },
          `[data-lenso-side="${side}"][data-lenso-align="${align}"][data-lenso-direction="${direction}"]`,
        );
  for (const iconOnly of ["true", "false"])
    add("menu-trigger", { lensoIconOnly: iconOnly }, `[data-lenso-icon-only="${iconOnly}"]`);
  for (const kind of ["menu-item", "menu-action"])
    for (const variant of ["default", "danger"])
      add(kind, { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const kind of ["popover-trigger", "popover-close"])
    for (const size of ["sm", "md", "lg"])
      for (const variant of ["prominent", "bordered", "borderless"])
        add(
          kind,
          { lensoSize: size, lensoVariant: variant },
          `[data-lenso-size="${size}"][data-lenso-variant="${variant}"]`,
        );
  for (const elastic of [false, true])
    add(
      "glass-container-item",
      { lensoElastic: String(elastic) },
      `[data-lenso-elastic="${elastic}"]`,
    );
  for (const open of [false, true])
    for (const kind of ["calendar-year-picker-grid", "calendar-year-picker-indicator"])
      add(kind, { lensoOpen: String(open) }, `[data-lenso-open="${open}"]`);
  for (const selected of [false, true])
    add(
      "calendar-year-picker-cell",
      { lensoSelected: String(selected) },
      `[data-lenso-selected="${selected}"]`,
    );
  for (const direction of ["ltr", "rtl"])
    add(
      "calendar-nav-icon",
      { lensoDirection: direction },
      `[data-lenso-direction="${direction}"]`,
    );
  for (const selected of [false, true])
    for (const today of [false, true])
      for (const outside of [false, true])
        for (const disabled of [false, true])
          for (const unavailable of [false, true])
            add(
              "calendar-cell",
              {
                lensoSelected: String(selected),
                lensoToday: String(today),
                lensoOutside: String(outside),
                lensoDisabled: String(disabled),
                lensoUnavailable: String(unavailable),
              },
              `[data-lenso-selected="${selected}"][data-lenso-today="${today}"][data-lenso-outside="${outside}"][data-lenso-disabled="${disabled}"][data-lenso-unavailable="${unavailable}"]`,
            );
  for (const full of [false, true])
    for (const kind of ["date-field", "time-field"])
      add(kind, { lensoFullWidth: String(full) }, `[data-lenso-full-width="${full}"]`);
  for (const invalid of [false, true]) {
    add(
      "date-field-description",
      { lensoInvalid: String(invalid) },
      `[data-lenso-invalid="${invalid}"]`,
    );
    add(
      "date-input-segment",
      { lensoInvalid: String(invalid) },
      `[data-lenso-invalid="${invalid}"]`,
    );
    for (const disabled of [false, true])
      for (const full of [false, true])
        for (const variant of ["primary", "secondary"])
          add(
            "date-input-group",
            {
              lensoInvalid: String(invalid),
              lensoDisabled: String(disabled),
              lensoFullWidth: String(full),
              lensoVariant: variant,
            },
            `[data-lenso-invalid="${invalid}"][data-lenso-disabled="${disabled}"][data-lenso-full-width="${full}"][data-lenso-variant="${variant}"]`,
          );
  }
  for (const draggable of [false, true])
    for (const animated of [false, true])
      for (const elastic of [false, true])
        add(
          "glass-magnifier",
          {
            lensoDraggable: String(draggable),
            lensoAnimated: String(animated),
            lensoElastic: String(elastic),
          },
          `[data-lenso-draggable="${draggable}"][data-lenso-animated="${animated}"][data-lenso-elastic="${elastic}"]`,
        );
  for (const disabled of [false, true])
    for (const kind of ["wheel-picker", "wheel-picker-viewport"])
      add(kind, { lensoDisabled: String(disabled) }, `[data-lenso-disabled="${disabled}"]`);
  add("wheel-picker-option", { lensoVariant: "default" }, '[data-lenso-variant="default"]');
  for (const attached of [false, true])
    add(
      "navigation-bar",
      { orientation: "horizontal", lensoAttached: String(attached) },
      `[data-orientation="horizontal"][data-lenso-attached="${attached}"]`,
    );
  for (const large of [false, true])
    add("navigation-bar-title", { lensoLarge: String(large) }, `[data-lenso-large="${large}"]`);
  for (const direction of ["ltr", "rtl"])
    add(
      "navigation-bar-back-icon",
      { lensoDirection: direction },
      `[data-lenso-direction="${direction}"]`,
    );
  for (const variant of ["uniform", "soft"])
    add("navigation-bar-edge", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const band of ["0", "1", "2", "3", "4", "5", "tint"])
    add("navigation-bar-soft-band", { lensoBand: band }, `[data-lenso-band="${band}"]`);
  for (const orientation of ["horizontal", "vertical"]) {
    add("toolbar-separator", { orientation }, `[data-orientation="${orientation}"]`);
    for (const attached of [false, true])
      add(
        "toolbar",
        { orientation, lensoAttached: String(attached) },
        `[data-orientation="${orientation}"][data-lenso-attached="${attached}"]`,
      );
    for (const surface of [false, true]) {
      add(
        "toolbar-fusion-group",
        { orientation, lensoSurface: String(surface) },
        `[data-orientation="${orientation}"][data-lenso-surface="${surface}"]`,
      );
      for (const glass of [false, true])
        add(
          "toolbar-group",
          { orientation, lensoSurface: String(surface), lensoGlass: String(glass) },
          `[data-orientation="${orientation}"][data-lenso-surface="${surface}"][data-lenso-glass="${glass}"]`,
        );
      for (const detachable of [false, true])
        for (const size of ["sm", "md", "lg"])
          for (const variant of ["glass", "filled", "plain"])
            for (const glass of [false, true])
              for (const icon of [false, true])
                for (const destructive of [false, true])
                  for (const tinted of [false, true])
                    add(
                      "toolbar-button",
                      {
                        orientation,
                        lensoSurface: String(surface),
                        lensoDetachable: String(detachable),
                        lensoSize: size,
                        lensoVariant: variant,
                        lensoGlass: String(glass),
                        lensoIconOnly: String(icon),
                        lensoDestructive: String(destructive),
                        lensoTinted: String(tinted),
                      },
                      `[data-orientation="${orientation}"][data-lenso-surface="${surface}"][data-lenso-detachable="${detachable}"][data-lenso-size="${size}"][data-lenso-variant="${variant}"][data-lenso-glass="${glass}"][data-lenso-icon-only="${icon}"][data-lenso-destructive="${destructive}"][data-lenso-tinted="${tinted}"]`,
                    );
    }
  }
  for (const size of ["sm", "md", "lg"]) {
    for (const kind of ["pagination-summary", "pagination-ellipsis"])
      add(kind, { lensoSize: size }, `[data-lenso-size="${size}"]`);
    for (const kind of ["pagination-link", "pagination-previous", "pagination-next"])
      for (const active of [false, true])
        add(
          kind,
          { lensoSize: size, lensoActive: String(active) },
          `[data-lenso-size="${size}"][data-lenso-active="${active}"]`,
        );
  }
  for (const full of [false, true]) {
    add("search-field", { lensoFullWidth: String(full) }, `[data-lenso-full-width="${full}"]`);
    for (const variant of ["primary", "secondary"])
      add(
        "search-field-group",
        { lensoFullWidth: String(full), lensoVariant: variant },
        `[data-lenso-full-width="${full}"][data-lenso-variant="${variant}"]`,
      );
  }
  for (const orientation of ["horizontal", "vertical"]) {
    add("button-group-separator", { orientation }, `[data-orientation="${orientation}"]`);
    for (const full of [false, true])
      for (const detached of [false, true]) {
        const layout = {
          orientation,
          lensoFullWidth: String(full),
          lensoDetached: String(detached),
        };
        const suffix = `[data-orientation="${orientation}"][data-lenso-full-width="${full}"][data-lenso-detached="${detached}"]`;
        add("button-group", layout, suffix);
        for (const kind of ["button-group-item", "glass-button-group-item"])
          for (const size of ["sm", "md", "lg"])
            for (const variant of kind === "button-group-item"
              ? ["prominent", "bordered", "borderless", "default"]
              : ["default", "prominent", "bordered", "borderless"])
              for (const icon of [false, true])
                for (const destructive of [false, true])
                  for (const tinted of [false, true])
                    add(
                      kind,
                      {
                        ...layout,
                        lensoSize: size,
                        lensoVariant: variant,
                        lensoIconOnly: String(icon),
                        lensoDestructive: String(destructive),
                        lensoTinted: String(tinted),
                      },
                      `${suffix}[data-lenso-size="${size}"][data-lenso-variant="${variant}"][data-lenso-icon-only="${icon}"][data-lenso-destructive="${destructive}"][data-lenso-tinted="${tinted}"]`,
                    );
      }
  }
  for (const count of ["7", "other"]) {
    const selector = count === "7" ? '[data-lenso-count="7"]' : ':not([data-lenso-count="7"])';
    for (const variant of ["prominent", "plain"])
      add(
        "page-control-track",
        { lensoCount: count, lensoVariant: variant },
        `${selector}[data-lenso-variant="${variant}"]`,
      );
    for (const edge of [false, true])
      add(
        "page-control-item",
        { lensoCount: count, lensoEdge: String(edge) },
        `${selector}[data-lenso-edge="${edge}"]`,
      );
  }
  for (const active of [false, true])
    for (const overflow of [false, true])
      add(
        "page-control-dot",
        { lensoActive: String(active), lensoOverflow: String(overflow) },
        `[data-lenso-active="${active}"][data-lenso-overflow="${overflow}"]`,
      );
  for (const orientation of ["vertical", "horizontal"])
    for (const direction of ["ltr", "rtl"])
      for (const hidden of [false, true])
        for (const visibility of ["auto", "both", "top", "bottom", "left", "right", "none"])
          for (const enabled of [false, true]) {
            const automatic = enabled && visibility === "auto";
            const states = automatic
              ? [false, true].flatMap((before) =>
                  [false, true].flatMap((after) =>
                    ["unknown", "true", "false"].map((overflow) => ({ before, after, overflow })),
                  ),
                )
              : [
                  {
                    before:
                      visibility === "both" ||
                      visibility === (orientation === "vertical" ? "top" : "left"),
                    after:
                      visibility === "both" ||
                      visibility === (orientation === "vertical" ? "bottom" : "right"),
                    overflow: "unknown",
                  },
                ];
            for (const state of states)
              add(
                "scroll-shadow",
                {
                  orientation,
                  lensoDirection: direction,
                  lensoHideScrollbar: String(hidden),
                  lensoVisibility: visibility,
                  lensoEnabled: String(enabled),
                  lensoScrollBefore: String(state.before),
                  lensoScrollAfter: String(state.after),
                  lensoScrollOverflow: state.overflow,
                },
                `[data-orientation="${orientation}"][data-lenso-direction="${direction}"][data-lenso-hide-scrollbar="${hidden}"][data-lenso-visibility="${visibility}"][data-lenso-enabled="${enabled}"][data-lenso-scroll-before="${state.before}"][data-lenso-scroll-after="${state.after}"][data-lenso-scroll-overflow="${state.overflow}"]`,
              );
          }
  for (const kind of ["switch", "switch-control", "switch-thumb"])
    for (const size of ["sm", "md", "lg"])
      add(kind, { lensoSize: size }, `[data-lenso-size="${size}"]`);
  for (const glass of [false, true])
    add("tabs-glass", { lensoGlass: String(glass) }, `[data-lenso-glass="${glass}"]`);
  for (const orientation of ["horizontal", "vertical"]) {
    for (const kind of [
      "tabs",
      "tabs-list-container",
      "tabs-panel",
      "tabs-separator",
      "tabs-copy-row",
    ])
      add(kind, { orientation }, `[data-orientation="${orientation}"]`);
    for (const align of ["start", "center", "end"])
      add(
        "tabs-tab",
        { orientation, lensoAlign: align },
        `[data-orientation="${orientation}"][data-lenso-align="${align}"]`,
      );
    for (const size of ["sm", "lg"])
      for (const glass of [false, true])
        for (const elastic of [false, true])
          add(
            "tabs-list",
            {
              orientation,
              lensoSize: size,
              lensoGlass: String(glass),
              lensoElastic: String(elastic),
            },
            `[data-orientation="${orientation}"][data-lenso-size="${size}"][data-lenso-glass="${glass}"][data-lenso-elastic="${elastic}"]`,
          );
  }
  for (const size of ["sm", "lg"])
    for (const glass of [false, true])
      for (const elastic of [false, true])
        add(
          "segmented-control",
          { lensoSize: size, lensoGlass: String(glass), lensoElastic: String(elastic) },
          `[data-lenso-size="${size}"][data-lenso-glass="${glass}"][data-lenso-elastic="${elastic}"]`,
        );
  add("avatar-image");
  for (const grid of [false, true])
    add("avatar-group", { lensoGrid: String(grid) }, `[data-lenso-grid="${grid}"]`);
  for (const overlap of [false, true])
    for (const ring of [false, true])
      for (const clipped of [false, true])
        for (const size of ["sm", "md", "lg"])
          add(
            "avatar-group-item",
            {
              lensoSize: size,
              lensoOverlap: String(overlap),
              lensoRing: String(ring),
              lensoClipped: String(clipped),
            },
            `[data-lenso-size="${size}"][data-lenso-overlap="${overlap}"][data-lenso-ring="${ring}"][data-lenso-clipped="${clipped}"]`,
          );
  for (const kind of ["avatar", "avatar-fallback"])
    for (const size of ["sm", "md", "lg"])
      for (const color of ["default", "accent", "success", "warning", "danger"])
        for (const variant of ["default", "soft"])
          for (const clipped of [false, true])
            add(
              kind,
              {
                lensoSize: size,
                lensoColor: color,
                lensoVariant: variant,
                lensoClipped: String(clipped),
              },
              `[data-lenso-size="${size}"][data-lenso-color="${color}"][data-lenso-variant="${variant}"]${kind === "avatar-fallback" ? `[data-lenso-clipped="${clipped}"]` : ""}`,
            );
  for (const kind of ["button", "glass-button"])
    for (const size of ["sm", "md", "lg"])
      for (const variant of kind === "button"
        ? ["prominent", "bordered", "borderless"]
        : ["default", "prominent"])
        add(
          kind,
          { lensoSize: size, lensoVariant: variant },
          `[data-lenso-size="${size}"][data-lenso-variant="${variant}"]`,
        );
  for (const variant of ["default", "secondary", "tertiary", "transparent"])
    add("surface", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const kind of ["input", "textarea", "input-group"])
    for (const variant of ["primary", "secondary"])
      for (const grouped of kind === "input-group" ? [false] : [false, true])
        for (const single of kind === "textarea" ? [false, true] : [false]) {
          const context =
            kind === "input-group"
              ? ""
              : grouped
                ? ':where([data-slot="input-group"] *)'
                : ':not(:where([data-slot="input-group"] *))';
          const rows =
            kind === "textarea"
              ? single
                ? '[data-lenso-rows="1"]'
                : ':not([data-lenso-rows="1"])'
              : "";
          add(
            kind,
            { lensoVariant: variant, lensoRows: single ? "1" : "3" },
            `[data-lenso-variant="${variant}"]${context}${rows}`,
            grouped,
          );
        }
  for (const required of [false, true])
    add("label", { lensoRequired: String(required) }, `[data-lenso-required="${required}"]`);
  for (const kind of ["accordion", "accordion-trigger"])
    for (const variant of ["default", "surface"])
      add(
        kind,
        { lensoVariant: variant, orientation: "vertical" },
        `[data-lenso-variant="${variant}"]`,
      );
  for (const hidden of [false, true])
    add(
      "accordion-item",
      { lensoHideSeparator: String(hidden) },
      `[data-lenso-hide-separator="${hidden}"]`,
    );
  for (const current of [false, true])
    add("breadcrumbs-link", { lensoCurrent: String(current) }, `[data-lenso-current="${current}"]`);
  for (const orientation of ["horizontal", "vertical"])
    for (const variant of ["default", "secondary", "tertiary"])
      add(
        "separator",
        { orientation, lensoVariant: variant },
        `[data-orientation="${orientation}"][data-lenso-variant="${variant}"]`,
      );
  for (const kind of ["progress-bar", "meter", "progress-circle"])
    for (const color of ["default", "accent", "success", "warning", "danger"])
      add(kind, { lensoColor: color }, `[data-lenso-color="${color}"]`);
  for (const kind of [
    "progress-bar-track",
    "progress-bar-fill",
    "meter-track",
    "meter-fill",
    "progress-circle-track",
  ])
    for (const size of ["sm", "md", "lg"])
      for (const indeterminate of kind === "progress-bar-fill" || kind === "progress-circle-track"
        ? [false, true]
        : [false]) {
        const state =
          kind === "progress-bar-fill" || kind === "progress-circle-track"
            ? `[data-lenso-indeterminate="${indeterminate}"]`
            : "";
        add(
          kind,
          { lensoSize: size, lensoIndeterminate: String(indeterminate) },
          `[data-lenso-size="${size}"]${state}`,
        );
      }
  for (const size of ["sm", "md", "lg", "xl"])
    for (const color of ["secondary", "current", "accent", "success", "warning", "danger"])
      add(
        "spinner",
        { lensoSize: size, lensoColor: color },
        `[data-lenso-size="${size}"][data-lenso-color="${color}"]`,
      );
  for (const animation of ["none", "pulse", "shimmer"])
    add("skeleton", { skeletonAnimation: animation }, `[data-skeleton-animation="${animation}"]`);
  // Exact allows id/testId on SVG leaves, but no hatches or data words.
  // Their shared token styles remain declarative through these owned suffixes.
  for (const [kind, suffix] of [
    ["progress-circle-track-circle", "track"],
    ["progress-circle-fill-circle", "fill"],
  ]) {
    if (!kind || !suffix) continue;
    add(kind);
    const entry = cases.at(-1);
    if (!entry) throw new Error("Missing SVG circle presentation");
    entry.selector = `circle[id$="--lenso-progress-${suffix}"]`;
    entry.attributes = { id: `sample--lenso-progress-${suffix}` };
  }
  add("glass-toggle-button-icon");
  for (const size of ["sm", "md", "lg"])
    for (const variant of ["default", "prominent"])
      for (const iconOnly of [false, true])
        for (const fullWidth of [false, true]) {
          const common = {
            lensoSize: size,
            lensoVariant: variant,
            lensoIconOnly: String(iconOnly),
            lensoFullWidth: String(fullWidth),
          };
          const suffix = `[data-lenso-size="${size}"][data-lenso-variant="${variant}"][data-lenso-icon-only="${iconOnly}"][data-lenso-full-width="${fullWidth}"]`;
          add("glass-toggle-button", common, suffix);
          for (const orientation of ["horizontal", "vertical"])
            for (const detached of [false, true])
              add(
                "glass-toggle-button-group-item",
                { ...common, orientation, lensoDetached: String(detached), lensoGroupItem: "" },
                `${suffix}[data-orientation="${orientation}"][data-lenso-detached="${detached}"]`,
              );
        }
  add("toggle-button-icon");
  for (const orientation of ["horizontal", "vertical"])
    for (const detached of [false, true]) {
      add(
        "toggle-button-group-separator",
        { orientation, lensoDetached: String(detached) },
        `[data-orientation="${orientation}"][data-lenso-detached="${detached}"]`,
      );
      for (const fullWidth of [false, true])
        add(
          "toggle-button-group",
          { orientation, lensoDetached: String(detached), lensoFullWidth: String(fullWidth) },
          `[data-orientation="${orientation}"][data-lenso-detached="${detached}"][data-lenso-full-width="${fullWidth}"]`,
        );
    }
  for (const size of ["sm", "md", "lg"])
    for (const variant of ["prominent", "bordered", "borderless", "default", "ghost"])
      for (const iconOnly of [false, true])
        for (const fullWidth of [false, true]) {
          const common = {
            lensoSize: size,
            lensoVariant: variant,
            lensoIconOnly: String(iconOnly),
            lensoFullWidth: String(fullWidth),
          };
          const suffix = `[data-lenso-size="${size}"][data-lenso-variant="${variant}"][data-lenso-icon-only="${iconOnly}"][data-lenso-full-width="${fullWidth}"]`;
          add("toggle-button", common, suffix);
          for (const orientation of ["horizontal", "vertical"])
            for (const detached of [false, true])
              add(
                "toggle-button-group-item",
                { ...common, orientation, lensoDetached: String(detached), lensoGroupItem: "" },
                `${suffix}[data-orientation="${orientation}"][data-lenso-detached="${detached}"]`,
              );
        }
  for (const dismiss of ["any", "closerequest", "none"])
    add("modal", { lensoDismiss: dismiss }, `[data-lenso-dismiss="${dismiss}"]`);
  for (const variant of ["transparent", "opaque", "blur"])
    add("modal-backdrop", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const scroll of ["inside", "outside"])
    add("modal-body", { lensoScroll: scroll }, `[data-lenso-scroll="${scroll}"]`);
  for (const size of ["xs", "sm", "md", "lg", "cover", "full"])
    for (const scroll of ["inside", "outside"])
      for (const placement of ["auto", "top", "center", "bottom"])
        add(
          "modal-popup",
          { size, lensoScroll: scroll, placement },
          `[data-size="${size}"][data-lenso-scroll="${scroll}"][data-placement="${placement}"]`,
        );
  for (const kind of ["modal-trigger", "modal-close", "modal-action"])
    for (const size of ["sm", "md", "lg"])
      for (const variant of ["prominent", "bordered", "borderless"])
        add(
          kind,
          { lensoSize: size, lensoVariant: variant },
          `[data-lenso-size="${size}"][data-lenso-variant="${variant}"]`,
        );
  for (const variant of ["transparent", "opaque", "blur"])
    add("alert-dialog-backdrop", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const size of ["xs", "sm", "md", "lg", "cover"])
    for (const placement of ["auto", "top", "center", "bottom"])
      add(
        "alert-dialog-popup",
        { size, placement },
        `[data-size="${size}"][data-placement="${placement}"]`,
      );
  for (const layout of ["auto", "side-by-side", "stacked"])
    add("alert-dialog-footer", { layout }, `[data-layout="${layout}"]`);
  for (const variant of ["default", "accent", "success", "warning", "danger"])
    add("alert-dialog-icon", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const variant of ["default", "cancel", "destructive"])
    add("alert-dialog-action", { variant }, `[data-variant="${variant}"]`);
  for (const size of ["sm", "md", "lg"])
    for (const variant of ["prominent", "bordered", "borderless"])
      add(
        "alert-dialog-trigger",
        { lensoSize: size, lensoVariant: variant },
        `[data-lenso-size="${size}"][data-lenso-variant="${variant}"]`,
      );
  for (const color of ["default", "accent", "success", "warning", "danger"]) {
    for (const kind of ["alert", "alert-title", "alert-indicator"])
      add(kind, { lensoColor: color }, `[data-lenso-color="${color}"]`);
    for (const size of ["sm", "md", "lg"]) {
      for (const variant of ["primary", "secondary", "soft", "tertiary"]) {
        const data = { lensoSize: size, lensoColor: color, lensoVariant: variant };
        const suffix = `[data-lenso-size="${size}"][data-lenso-color="${color}"][data-lenso-variant="${variant}"]`;
        add("chip", data, suffix);
        if (variant !== "tertiary")
          for (const placement of ["top-left", "top-right", "bottom-left", "bottom-right"])
            add("badge", { ...data, placement }, `${suffix}[data-placement="${placement}"]`);
      }
    }
  }
  for (const loading of [false, true])
    for (const destructive of [false, true])
      add(
        "close-button",
        { lensoLoading: String(loading), lensoDestructive: String(destructive) },
        `[data-lenso-loading="${loading}"][data-lenso-destructive="${destructive}"]`,
      );
  for (const variant of ["default", "secondary", "tertiary", "transparent", "glass"])
    add("card", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const variant of ["symbol", "circle"])
    add("empty-state-icon", { variant }, `[data-variant="${variant}"]`);
  const kinds = new Set(cases.map((entry) => entry.kind));
  for (const rule of rules) {
    if (!kinds.has(rule.kind)) throw new RangeError(`Unknown Lenso style kind: ${rule.kind}`);
    if (rule.testId !== undefined) cssString(rule.testId);
  }
  if (!rules.length) return cases;
  return cases.flatMap((entry) => {
    const applicable = rules.filter((rule) => rule.kind === entry.kind);
    if (!applicable.length) return [entry];
    const targets = [
      ...new Set(applicable.flatMap((rule) => (rule.testId === undefined ? [] : [rule.testId]))),
    ];
    return [undefined, ...targets].map((target) => {
      const styles = applicable
        .filter((rule) => rule.testId === undefined || rule.testId === target)
        .map((rule) => rule.xstyle);
      const compiled = presentation(entry.data, entry.inputGroup, styles);
      if (compiled.style && Object.keys(compiled.style).length)
        throw new Error(
          `Lenso ${entry.kind} caller styles need a declarative adapter for inline values`,
        );
      const attributes = { ...entry.attributes };
      if (target !== undefined) attributes["data-testid"] = target;
      const condition =
        target === undefined
          ? targets.length
            ? `:not(:where(${targets.map((id) => `[data-testid=${cssString(id)}]`).join(",")}))`
            : ""
          : `[data-testid=${cssString(target)}]`;
      return {
        ...entry,
        attributes,
        selector: entry.selector + condition,
        classes: compiled.className?.split(" ").filter(Boolean) ?? [],
      };
    });
  });
}
