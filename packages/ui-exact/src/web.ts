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

const owners = new WeakMap<HTMLElement | SVGElement, () => void>();

/** Decorate the existing node; Exact keeps ownership of its events and state. */
export function element(handle: ExactElement, options?: { xstyle?: StyleInput }) {
  if (handle.hatch !== "lenso-ui") return;
  const node = handle.element;
  const { lensoKind: kind, lensoVariant: variant } = handle.data;
  const compiled = presentation(
    handle.data,
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
    ((kind === "glass-button" || kind === "glass-button-group-item") && !node.matches(":disabled"));
  const profileKey =
    kind === "glass-button" || kind === "glass-button-group-item"
      ? variant === "prominent"
        ? "prominent"
        : "default"
      : "glass-small";

  owners.get(node)?.();
  const disconnectNative = connectNative(node, handle.data);
  const disconnectAccordion = connectAccordion(node, handle.data);
  const classes =
    compiled.className?.split(" ").filter((name) => name && !node.classList.contains(name)) ?? [];
  node.classList.add(...classes);
  let stop: (() => void) | undefined;
  if (optics) {
    if (!(node instanceof HTMLElement)) throw new TypeError("Lenso Glass requires an HTML element");
    stop = attachGlass(node, {
      profileKey:
        kind === "switch-knob-lens" || kind === "slider-knob-lens" || kind === "tabs-knob-lens"
          ? undefined
          : profileKey,
      liveBackdrop:
        kind !== "switch-knob-lens" && kind !== "slider-knob-lens" && kind !== "tabs-knob-lens",
    });
  }
  owners.set(node, () => {
    stop?.();
    disconnectNative();
    disconnectAccordion?.();
    node.classList.remove(...classes);
  });
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
  updateModal(node, handle.data);
  updateMaterial(node, handle.data);
  node.setAttribute("data-lenso-ready", "");
}

/** Called before Exact removes or recycles a node. */
export function elementEnded(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
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
  endModal(handle.element);
  endMaterial(handle.element);
  owners.get(handle.element)?.();
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
