"use client";

import * as BaseCollapsible from "@ui-sdk/react/collapsible";
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
  Omit<React.ComponentProps<typeof BaseCollapsible.Collapsible>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.Collapsible>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.root, xstyle);
  return (
    <BaseCollapsible.Collapsible
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure"}
      render={slotRender("div", props["data-slot"] ?? "disclosure", props.render)}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof BaseCollapsible.CollapsibleTrigger>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.CollapsibleTrigger>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.trigger, xstyle);
  return (
    <BaseCollapsible.CollapsibleTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-trigger"}
      render={slotRender("button", props["data-slot"] ?? "disclosure-trigger", props.render)}
    />
  );
}
function Content({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof BaseCollapsible.CollapsiblePanel>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.CollapsiblePanel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.content, xstyle);
  return (
    <BaseCollapsible.CollapsiblePanel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-content"}
      render={slotRender("div", props["data-slot"] ?? "disclosure-content", props.render)}
    />
  );
}
export function DisclosureHeading({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"h3">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.heading, xstyle);
  return (
    <h3
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-heading"}
    >
      {children}
    </h3>
  );
}
export function DisclosureBody({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.body, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-body"}
    />
  );
}
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"svg">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.indicator, xstyle);
  return (
    <svg
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-indicator"}
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
