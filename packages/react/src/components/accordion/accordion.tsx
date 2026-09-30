"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext, useContext, type ComponentProps } from "react";
import { accordionStyles } from "@lenso/tokens/accordion";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { navigateDisclosureGroup } from "./keyboard.js";
const Context = createContext({
  variant: "default" as "default" | "surface",
  hideSeparator: false,
});
const Root = styledPart(BaseAccordion.Root, "accordion", accordionStyles.root);
const Item = styledPart(BaseAccordion.Item, "accordion-item", accordionStyles.item);
const Trigger = styledPart(BaseAccordion.Trigger, "accordion-trigger", accordionStyles.trigger);
export const AccordionHeading = styledPart(
  BaseAccordion.Header,
  "accordion-heading",
  accordionStyles.heading,
);
export const AccordionPanel = styledPart(
  BaseAccordion.Panel,
  "accordion-panel",
  accordionStyles.panel,
);
export const AccordionBody = styledPart("div", "accordion-body", accordionStyles.body);
const Indicator = styledPart("svg", "accordion-indicator", accordionStyles.indicator);
export type AccordionRootProps = StyleXProps<ComponentProps<typeof BaseAccordion.Root>> & {
  variant?: "default" | "surface";
  hideSeparator?: boolean;
};
export function AccordionRoot({
  variant = "default",
  hideSeparator = false,
  orientation = "vertical",
  loopFocus = true,
  onKeyDown,
  xstyle,
  ...props
}: AccordionRootProps) {
  return (
    <Context value={{ variant, hideSeparator }}>
      <Root
        {...props}
        orientation={orientation}
        loopFocus={loopFocus}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          navigateDisclosureGroup(event, orientation, loopFocus);
        }}
        xstyle={[variant === "surface" && accordionStyles.surface, xstyle]}
      />
    </Context>
  );
}
export type AccordionItemProps = ComponentProps<typeof Item> & { hideSeparator?: boolean };
export function AccordionItem({
  hideSeparator: ownSeparator,
  xstyle,
  ...props
}: AccordionItemProps) {
  const { variant, hideSeparator } = useContext(Context);
  return (
    <Item
      {...props}
      xstyle={[
        variant === "surface" && accordionStyles.surfaceItem,
        (ownSeparator ?? hideSeparator) && accordionStyles.hideSeparator,
        xstyle,
      ]}
    />
  );
}
export function AccordionTrigger({ xstyle, ...props }: ComponentProps<typeof Trigger>) {
  const { variant } = useContext(Context);
  return (
    <Trigger
      {...props}
      xstyle={[variant === "surface" && accordionStyles.surfaceTrigger, xstyle]}
    />
  );
}
export function AccordionIndicator({ children, ...props }: ComponentProps<typeof Indicator>) {
  return (
    <Indicator viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      {children ?? (
        <path
          d="m4 6 4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Indicator>
  );
}
export const Accordion = Object.assign(AccordionRoot, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Heading: AccordionHeading,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
  Body: AccordionBody,
  Indicator: AccordionIndicator,
});
