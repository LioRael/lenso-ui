import type { StyleInput } from "./style-types.js";
import * as stylex from "@stylexjs/stylex";
import { disclosureStyles } from "@lenso/tokens/disclosure";
import { accordionStyles } from "@lenso/tokens/accordion";
import { groupStyles } from "@lenso/tokens/surface";

const initialStyles = stylex.create({
  closed: {
    height: { default: null, ':not([data-lenso-ready])[data-lenso-open="false"]': 0 },
    opacity: { default: null, ':not([data-lenso-ready])[data-lenso-open="false"]': 0 },
  },
});

const presentations = new Map<string, StyleInput>([
  ["disclosure", [disclosureStyles.root]],
  ["disclosure-heading", [disclosureStyles.heading]],
  ["disclosure-trigger", [disclosureStyles.trigger]],
  ["disclosure-indicator", [disclosureStyles.indicator]],
  ["disclosure-content", [disclosureStyles.content, initialStyles.closed]],
  ["disclosure-body", [disclosureStyles.body]],
  ["accordion-heading", [accordionStyles.heading]],
  ["accordion-indicator", [accordionStyles.indicator]],
  ["accordion-panel", [accordionStyles.panel, initialStyles.closed]],
  ["accordion-body", [accordionStyles.body]],
]);

function variantOf(data: DOMStringMap) {
  const variant = data["lensoVariant"];
  if (variant === "default" || variant === "surface") return variant;
  throw new RangeError(`Unknown Lenso Accordion variant: ${variant}`);
}

export function disclosurePresentation(kind: string, data: DOMStringMap) {
  if (kind === "accordion") {
    if (data["orientation"] !== "vertical" && data["orientation"] !== "horizontal")
      throw new RangeError("Lenso Accordion orientation must be vertical or horizontal");
    return [accordionStyles.root, variantOf(data) === "surface" && groupStyles.surface];
  }
  if (kind === "accordion-trigger")
    return [
      accordionStyles.trigger,
      variantOf(data) === "surface" && accordionStyles.surfaceTrigger,
    ];
  if (kind === "accordion-item")
    return [
      accordionStyles.item,
      data["lensoHideSeparator"] === "true" && accordionStyles.hideSeparator,
    ];
  return presentations.get(kind);
}

export const disclosureKinds = [...presentations.keys()];
