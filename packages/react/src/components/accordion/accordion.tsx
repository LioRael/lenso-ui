"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext, useContext, type ComponentProps } from "react";
import { accordionStyles } from "@lenso/tokens/accordion";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { navigateDisclosureGroup } from "./keyboard.js";
const Context = createContext({
  variant: "default" as "default" | "surface",
  hideSeparator: false,
});
function Item({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Item.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Item>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.item, xstyle);
  return (
    <BaseAccordion.Item
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-item"}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Trigger.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Trigger>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.trigger, xstyle);
  return (
    <BaseAccordion.Trigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-trigger"}
    />
  );
}
export function AccordionHeading({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Header.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Header>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.heading, xstyle);
  return (
    <BaseAccordion.Header
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-heading"}
    />
  );
}
export function AccordionPanel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Panel.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Panel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.panel, xstyle);
  return (
    <BaseAccordion.Panel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-panel"}
    />
  );
}
export function AccordionBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-body"}
    />
  );
}
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"svg">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.indicator, xstyle);
  return (
    <svg
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-indicator"}
    />
  );
}
export type AccordionRootProps = StyleXProps<ComponentProps<typeof BaseAccordion.Root>> & {
  "data-slot"?: unknown;
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
  style,
  ...props
}: AccordionRootProps) {
  const compiled = stylex.props(
    accordionStyles.root,
    variant === "surface" && accordionStyles.surface,
    xstyle,
  );
  return (
    <Context value={{ variant, hideSeparator }}>
      <BaseAccordion.Root
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "accordion"}
        orientation={orientation}
        loopFocus={loopFocus}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          navigateDisclosureGroup(event, orientation, loopFocus);
        }}
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
