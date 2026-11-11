import { updateNumberField, endNumberField } from "./number-field.js";
import { updateMenuBar, endMenuBar } from "./menu-bar.js";
import { updateMenu, endMenu } from "./menu.js";
import { updateTooltip, endTooltip } from "./tooltip.js";
import { updatePopoverHover, endPopoverHover } from "./popover-hover.js";
import { updatePopover, endPopover } from "./popover.js";
import { trackPressHighlight } from "@lenso/glass/fusion";
import {
  updateGlassContainer,
  updateFusionMember,
  refreshFusionMember,
  endGlassContainer,
} from "./glass-container.js";
import { updateToolbar, endToolbar, updateToolbarFusion, endToolbarFusion } from "./toolbar.js";
import { updateSearchField, endSearchField } from "./search-field.js";
import { scrollShadowData, updateScrollShadow, endScrollShadow } from "./scroll-shadow.js";
import { updatePageControl, endPageControl } from "./page-control.js";
import { updateSegmented, endSegmented } from "./segmented-control.js";
import { updateTabsMotion, endTabsMotion } from "./tabs-motion.js";
import { updateTabs, endTabs } from "./tabs.js";
import { updateSliderLift, endSliderLift } from "./slider-lift.js";
import { updateSlider, endSlider } from "./slider.js";
import { updateSwitchForm, endSwitchForm } from "./switch-form.js";
import { updateSwitch, endSwitch } from "./switch.js";
import { updateAvatar, endAvatar } from "./avatar.js";
import { updateMaterial, endMaterial } from "./material.js";
import { updateModal, endModal } from "./modal.js";
import { updateToggleGroup, endToggleGroup } from "./toggle-group.js";
import { attachGlass } from "@lenso/glass";
import type { StyleInput } from "./style-types.js";
import { presentationCases, type PresentationRule } from "./presentation.js";
import { presentation } from "./presentation.js";
import { connectNative } from "./native.js";
import { connectAccordion, endPanel, updatePanel } from "./disclosure.js";

/** The subset of Exact's Web element handle used by these components. */
export interface ExactElement {
  hatch: string;
  element: HTMLElement | SVGElement;
  data: DOMStringMap;
}

interface Owner {
  readonly classes: string[];
  readonly opticsKey?: string;
  readonly opticsStop?: () => void;
  readonly lightStop?: () => void;
  release(removeClasses: boolean, preserveOptics?: boolean): void;
}
const owners = new WeakMap<HTMLElement | SVGElement, Owner>();

/** Keep viewport geometry present while replacing only the owned class set. */
function replaceClasses(
  node: HTMLElement | SVGElement,
  previous: string[],
  next: string | undefined,
) {
  const owned = new Set(previous);
  const foreign = [...node.classList].filter((name) => !owned.has(name));
  const retained = new Set(foreign);
  const classes = next?.split(" ").filter((name) => name && !retained.has(name)) ?? [];
  const value = [...foreign, ...classes].join(" ");
  if ((node.getAttribute("class") ?? "") !== value) node.setAttribute("class", value);
  return classes;
}

/** Decorate the existing node; Exact keeps ownership of its events and state. */
export function element(handle: ExactElement, options?: { xstyle?: StyleInput }) {
  if (handle.hatch !== "lenso-ui") return;
  const node = handle.element;
  const { lensoKind: kind, lensoVariant: variant } = handle.data;
  const compiled = presentation(
    scrollShadowData(node, handle.data),
    node.closest('[data-slot="input-group"]') !== null,
    options?.xstyle,
  );
  if (compiled.style && Object.keys(compiled.style).length)
    throw new Error("Lenso caller styles need a declarative adapter for inline values");
  const optics =
    kind === "tabs-knob-lens" ||
    kind === "slider-knob-lens" ||
    kind === "switch-knob-lens" ||
    kind === "glass" ||
    kind === "glass-container-item" ||
    (kind === "toolbar" && handle.data["lensoAttached"] === "true") ||
    (kind === "toolbar-group" &&
      handle.data["lensoGlass"] === "true" &&
      handle.data["lensoSurface"] !== "true") ||
    (kind === "toolbar-button" && handle.data["lensoGlass"] === "true" && variant !== "plain") ||
    kind === "search-field-group" ||
    kind === "number-field-group" ||
    (kind === "page-control-track" && variant === "prominent") ||
    ((kind === "glass-button" || kind === "glass-button-group-item" || kind === "menu-trigger") &&
      !node.matches(":disabled"));
  const profileKey =
    kind === "glass-button" || kind === "glass-button-group-item"
      ? variant === "prominent"
        ? "prominent"
        : "default"
      : "glass-small";

  const previousOwner = owners.get(node);
  const opticsKey = optics
    ? [
        kind,
        profileKey,
        ...[
          "lensoSize",
          "lensoVariant",
          "orientation",
          "lensoGlass",
          "lensoDetachable",
          "lensoTint",
          "lensoDestructive",
          "lensoDisabled",
          "lensoLoading",
        ].map((key) => handle.data[key] ?? ""),
      ].join("|")
    : undefined;
  // Detachment changes motion ownership, not the member's optical recipe.
  // Keep the shared field and the existing member lens alive through reversals.
  const preserveOptics =
    kind === "toolbar-button" &&
    handle.data["lensoDetachable"] === "true" &&
    Boolean(opticsKey && previousOwner?.opticsKey === opticsKey);
  if (!preserveOptics) refreshFusionMember(node);
  previousOwner?.release(false, preserveOptics);
  const disconnectNative = connectNative(node, handle.data);
  const disconnectAccordion = connectAccordion(node, handle.data);
  let classes = replaceClasses(node, previousOwner?.classes ?? [], compiled.className);
  let stop: (() => void) | undefined = preserveOptics ? previousOwner?.opticsStop : undefined;
  let stopLight: (() => void) | undefined = preserveOptics ? previousOwner?.lightStop : undefined;
  if (optics && !preserveOptics) {
    if (!(node instanceof HTMLElement)) throw new TypeError("Lenso Glass requires an HTML element");
    stop = attachGlass(node, {
      profileKey:
        kind === "switch-knob-lens" || kind === "slider-knob-lens" || kind === "tabs-knob-lens"
          ? undefined
          : profileKey,
      liveGeometry: kind === "toolbar-button" && handle.data["lensoDetachable"] === "true",
      liveBackdrop:
        kind !== "switch-knob-lens" && kind !== "slider-knob-lens" && kind !== "tabs-knob-lens",
    });
  }
  if (
    optics &&
    !preserveOptics &&
    node instanceof HTMLElement &&
    !["tabs-knob-lens", "slider-knob-lens", "switch-knob-lens"].includes(kind ?? "")
  )
    stopLight = trackPressHighlight(node);
  owners.set(node, {
    opticsKey,
    opticsStop: stop,
    lightStop: stopLight,
    get classes() {
      return classes;
    },
    release(removeClasses, preserveOptics = false) {
      if (!preserveOptics) {
        stopLight?.();
        stop?.();
      }
      disconnectNative();
      disconnectAccordion?.();
      if (removeClasses) node.classList.remove(...classes);
    },
  });
  updateScrollShadow(node, handle.data, (status) => {
    const next = presentation(
      { ...handle.data, ...status },
      node.closest('[data-slot="input-group"]') !== null,
      options?.xstyle,
    );
    if (next.style && Object.keys(next.style).length)
      throw new Error("Lenso caller styles need a declarative adapter for inline values");
    classes = replaceClasses(node, classes, next.className);
  });
  updateToolbarFusion(node, handle.data);
  updateGlassContainer(node, handle.data);
  updateFusionMember(
    node,
    Boolean(
      optics && !["tabs-knob-lens", "slider-knob-lens", "switch-knob-lens"].includes(kind ?? ""),
    ),
  );
  updateToolbar(node, handle.data);
  updateSearchField(node, handle.data);
  updateNumberField(node, handle.data);
  updatePageControl(node, handle.data);
  updateSegmented(node, handle.data);
  updateTabs(node, handle.data);
  updateTabsMotion(node, handle.data);
  updateSlider(node, handle.data);
  updateSliderLift(node, handle.data);
  updateSwitchForm(node, handle.data);
  updateSwitch(node, handle.data);
  updateAvatar(node, handle.data);
  updatePanel(node, handle.data);
  updateToggleGroup(node, handle.data);
  updatePopoverHover(node, handle.data);
  updatePopover(node, handle.data);
  updateTooltip(node, handle.data);
  updateMenuBar(node, handle.data);
  updateMenu(node, handle.data);
  updateModal(node, handle.data);
  updateMaterial(node, handle.data);
  node.setAttribute("data-lenso-ready", "");
}

/** Called before Exact removes or recycles a node. */
export function elementEnded(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
  endGlassContainer(handle.element);
  endToolbarFusion(handle.element);
  endToolbar(handle.element);
  endSearchField(handle.element);
  endNumberField(handle.element);
  endScrollShadow(handle.element);
  endPageControl(handle.element);
  endSegmented(handle.element);
  endTabsMotion(handle.element);
  endTabs(handle.element);
  endSlider(handle.element);
  endSliderLift(handle.element);
  endSwitchForm(handle.element);
  endSwitch(handle.element);
  endAvatar(handle.element);
  endPanel(handle.element);
  endToggleGroup(handle.element);
  endPopoverHover(handle.element);
  endPopover(handle.element);
  endTooltip(handle.element);
  endMenuBar(handle.element);
  endMenu(handle.element);
  endModal(handle.element);
  endMaterial(handle.element);
  owners.get(handle.element)?.release(true);
  owners.delete(handle.element);
  handle.element.removeAttribute("data-lenso-ready");
}

/** Use the same compiled rules supplied to styleWeb at build time. */
export function createWebHatch(rules: readonly PresentationRule[]) {
  presentationCases(rules);
  return {
    element(handle: ExactElement) {
      if (handle.hatch !== "lenso-ui") return;
      const xstyle = rules
        .filter(
          (rule) =>
            rule.kind === handle.data["lensoKind"] &&
            (rule.testId === undefined ||
              rule.testId === handle.element.getAttribute("data-testid")),
        )
        .map((rule) => rule.xstyle);
      element(handle, { xstyle });
    },
    elementEnded,
  };
}
