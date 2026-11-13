"use client";

import * as SdkCollapsible from "@ui-sdk/react/collapsible";
import { slotRender } from "../../utils/sdk-render.js";
import { type ComponentProps } from "react";
import { disclosureStyles } from "@lenso/tokens/disclosure";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
function Root({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkCollapsible.Collapsible>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCollapsible.Collapsible>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.root, xstyle);
  return (
    <SdkCollapsible.Collapsible
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure"}
      render={slotRender("div", props["data-lenso-slot"] ?? "disclosure", props.render)}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkCollapsible.CollapsibleTrigger>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCollapsible.CollapsibleTrigger>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.trigger, xstyle);
  return (
    <SdkCollapsible.CollapsibleTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure-trigger"}
      render={slotRender("button", props["data-lenso-slot"] ?? "disclosure-trigger", props.render)}
    />
  );
}
function Content({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkCollapsible.CollapsiblePanel>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCollapsible.CollapsiblePanel>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.content, xstyle);
  return (
    <SdkCollapsible.CollapsiblePanel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure-content"}
      render={slotRender("div", props["data-lenso-slot"] ?? "disclosure-content", props.render)}
    />
  );
}
export function DisclosureHeading({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"h3">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.heading, xstyle);
  return (
    <h3
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure-heading"}
    >
      {children}
    </h3>
  );
}
export function DisclosureBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure-body"}
    />
  );
}
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"svg">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.indicator, xstyle);
  return (
    <svg
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "disclosure-indicator"}
    />
  );
}
export type DisclosureRootProps = ComponentProps<typeof Root>;
export const DisclosureRoot = Root;
export type DisclosureTriggerProps = ComponentProps<typeof Trigger>;
export const DisclosureTrigger = Trigger;
export type DisclosureContentProps = ComponentProps<typeof Content>;
export const DisclosureContent = Content;
export function DisclosureIndicator({ children, ...props }: ComponentProps<typeof Indicator>) {
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
export const Disclosure = Object.assign(DisclosureRoot, {
  Root: DisclosureRoot,
  Heading: DisclosureHeading,
  Trigger: DisclosureTrigger,
  Content: DisclosureContent,
  Body: DisclosureBody,
  Indicator: DisclosureIndicator,
});
