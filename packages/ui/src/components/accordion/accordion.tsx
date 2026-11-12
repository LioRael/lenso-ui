"use client";

import * as BaseAccordion from "@ui-sdk/react/accordion";
import { slotRender } from "../../utils/sdk-render.js";
import { createContext, useContext, type ComponentProps } from "react";
import { accordionStyles } from "@lenso/tokens/accordion";
import { groupStyles } from "@lenso/tokens/surface";
import { FieldGroupContext } from "../textfield/group-context.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { navigateAccordion } from "./keyboard.js";
const Context = createContext({
  variant: "default" as "default" | "surface",
  hideSeparator: false,
  grouped: false,
});
function Item({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof BaseAccordion.AccordionItem>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.AccordionItem>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.item, xstyle);
  return (
    <BaseAccordion.AccordionItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-item"}
      render={slotRender("div", props["data-slot"] ?? "accordion-item", props.render)}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof BaseAccordion.AccordionTrigger>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.AccordionTrigger>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.trigger, xstyle);
  return (
    <BaseAccordion.AccordionTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-trigger"}
      render={slotRender("button", props["data-slot"] ?? "accordion-trigger", props.render)}
    />
  );
}
export function AccordionHeading({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof BaseAccordion.AccordionHeader>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.AccordionHeader>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.heading, xstyle);
  return (
    <BaseAccordion.AccordionHeader
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-heading"}
      render={slotRender("h3", props["data-slot"] ?? "accordion-heading", props.render)}
    />
  );
}
export function AccordionPanel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof BaseAccordion.AccordionPanel>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.AccordionPanel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.panel, xstyle);
  return (
    <BaseAccordion.AccordionPanel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "accordion-panel"}
      render={slotRender("div", props["data-slot"] ?? "accordion-panel", props.render)}
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
export type AccordionRootProps = StyleXProps<ComponentProps<typeof BaseAccordion.Accordion>> & {
  "data-slot"?: unknown;
  variant?: "default" | "surface";
  hideSeparator?: boolean;
  orientation?: "horizontal" | "vertical";
  loopFocus?: boolean;
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
  const grouped = useContext(FieldGroupContext);
  const compiled = stylex.props(
    accordionStyles.root,
    variant === "surface" && !grouped && groupStyles.surface,
    grouped && groupStyles.divided,
    xstyle,
  );
  return (
    <Context value={{ variant, hideSeparator, grouped }}>
      <FieldGroupContext value={false}>
        <BaseAccordion.Accordion
          {...props}
          {...compiled}
          style={mergeStyle(compiled.style, style)}
          data-slot={props["data-slot"] ?? "accordion"}
          render={slotRender("div", props["data-slot"] ?? "accordion", props.render)}
          data-orientation={orientation}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            navigateAccordion(event, orientation, loopFocus);
          }}
        />
      </FieldGroupContext>
    </Context>
  );
}
export type AccordionItemProps = ComponentProps<typeof Item> & { hideSeparator?: boolean };
export function AccordionItem({
  hideSeparator: ownSeparator,
  xstyle,
  ...props
}: AccordionItemProps) {
  const { variant, hideSeparator, grouped } = useContext(Context);
  return (
    <Item
      {...props}
      xstyle={[
        (variant === "surface" || grouped) && groupStyles.divided,
        (ownSeparator ?? hideSeparator) && accordionStyles.hideSeparator,
        xstyle,
      ]}
    />
  );
}
export function AccordionTrigger({ xstyle, ...props }: ComponentProps<typeof Trigger>) {
  const { variant, grouped } = useContext(Context);
  return (
    <Trigger
      {...props}
      xstyle={[
        variant === "surface" && !grouped && accordionStyles.surfaceTrigger,
        grouped && groupStyles.row,
        grouped && accordionStyles.formTrigger,
        xstyle,
      ]}
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
