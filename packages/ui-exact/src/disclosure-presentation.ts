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

const presentations = new Map([
  ["disclosure", stylex.props(disclosureStyles.root)],
  ["disclosure-heading", stylex.props(disclosureStyles.heading)],
  ["disclosure-trigger", stylex.props(disclosureStyles.trigger)],
  ["disclosure-indicator", stylex.props(disclosureStyles.indicator)],
  ["disclosure-content", stylex.props(disclosureStyles.content, initialStyles.closed)],
  ["disclosure-body", stylex.props(disclosureStyles.body)],
  ["accordion-heading", stylex.props(accordionStyles.heading)],
  ["accordion-indicator", stylex.props(accordionStyles.indicator)],
  ["accordion-panel", stylex.props(accordionStyles.panel, initialStyles.closed)],
  ["accordion-body", stylex.props(accordionStyles.body)],
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
    return stylex.props(accordionStyles.root, variantOf(data) === "surface" && groupStyles.surface);
  }
  if (kind === "accordion-trigger")
    return stylex.props(
      accordionStyles.trigger,
      variantOf(data) === "surface" && accordionStyles.surfaceTrigger,
    );
  if (kind === "accordion-item")
    return stylex.props(
      accordionStyles.item,
      data["lensoHideSeparator"] === "true" && accordionStyles.hideSeparator,
    );
  return presentations.get(kind);
}

export const disclosureKinds = [...presentations.keys()];
