"use client";

import * as SdkAccordion from "@ui-sdk/react/accordion";
import { slotRender } from "../../utils/sdk-render.js";
import { createContext, useContext, type ComponentProps } from "react";
import { accordionStyles } from "@lenso/tokens/accordion";
import { groupStyles } from "@lenso/tokens/surface";
import { FieldGroupContext } from "../textfield/group-context.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
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
  Omit<ComponentProps<typeof SdkAccordion.AccordionItem>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkAccordion.AccordionItem>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.item, xstyle);
  return (
    <SdkAccordion.AccordionItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-item"}
      render={slotRender("div", props["data-lenso-slot"] ?? "accordion-item", props.render)}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkAccordion.AccordionTrigger>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkAccordion.AccordionTrigger>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.trigger, xstyle);
  return (
    <SdkAccordion.AccordionTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-trigger"}
      render={slotRender("button", props["data-lenso-slot"] ?? "accordion-trigger", props.render)}
    />
  );
}
export function AccordionHeading({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkAccordion.AccordionHeader>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkAccordion.AccordionHeader>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.heading, xstyle);
  return (
    <SdkAccordion.AccordionHeader
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-heading"}
      render={slotRender("h3", props["data-lenso-slot"] ?? "accordion-heading", props.render)}
    />
  );
}
export function AccordionPanel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<ComponentProps<typeof SdkAccordion.AccordionPanel>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkAccordion.AccordionPanel>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.panel, xstyle);
  return (
    <SdkAccordion.AccordionPanel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-panel"}
      render={slotRender("div", props["data-lenso-slot"] ?? "accordion-panel", props.render)}
    />
  );
}
export function AccordionBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-body"}
    />
  );
}
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"svg">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(accordionStyles.indicator, xstyle);
  return (
    <svg
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "accordion-indicator"}
    />
  );
}
export type AccordionRootProps = StyleXProps<ComponentProps<typeof SdkAccordion.Accordion>> & {
  "data-lenso-slot"?: unknown;
  variant?: "default" | "surface";
  hideSeparator?: boolean;
};
export function AccordionRoot({
  variant = "default",
  hideSeparator = false,
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
        <SdkAccordion.Accordion
          {...props}
          {...compiled}
          style={mergeStyle(compiled.style, style)}
          data-lenso-slot={props["data-lenso-slot"] ?? "accordion"}
          render={slotRender("div", props["data-lenso-slot"] ?? "accordion", props.render)}
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
