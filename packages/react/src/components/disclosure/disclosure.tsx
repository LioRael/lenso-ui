"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext, useContext, type ComponentProps } from "react";
import { disclosureStyles } from "@lenso/tokens/disclosure";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { DisclosureGroupContext } from "../disclosure-group/disclosure-group.js";
const Context = createContext(false);
function Root({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseCollapsible.Root.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.Root>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.root, xstyle);
  return (
    <BaseCollapsible.Root
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure"}
    />
  );
}
function GroupItem({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Item.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Item>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.root, xstyle);
  return (
    <BaseAccordion.Item
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure"}
    />
  );
}
function Trigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseCollapsible.Trigger.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.Trigger>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.trigger, xstyle);
  return (
    <BaseCollapsible.Trigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-trigger"}
    />
  );
}
function GroupTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Trigger.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Trigger>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.trigger, xstyle);
  return (
    <BaseAccordion.Trigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-trigger"}
    />
  );
}
function Content({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseCollapsible.Panel.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCollapsible.Panel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.content, xstyle);
  return (
    <BaseCollapsible.Panel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-content"}
    />
  );
}
function GroupContent({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseAccordion.Panel.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseAccordion.Panel>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(disclosureStyles.content, xstyle);
  return (
    <BaseAccordion.Panel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "disclosure-content"}
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
/** Standalone disclosure uses Collapsible; grouped disclosure uses Accordion.Item's native value. */
export type DisclosureRootProps = ComponentProps<typeof Root> | ComponentProps<typeof GroupItem>;
export function DisclosureRoot(props: DisclosureRootProps) {
  const grouped = useContext(DisclosureGroupContext);
  return (
    <DisclosureGroupContext value={false}>
      <Context value={grouped}>
        {grouped ? (
          <GroupItem
            {...(props as ComponentProps<typeof GroupItem>)}
            data-disclosure-group-item=""
          />
        ) : (
          <Root {...(props as ComponentProps<typeof Root>)} />
        )}
      </Context>
    </DisclosureGroupContext>
  );
}
export type DisclosureTriggerProps =
  | ComponentProps<typeof Trigger>
  | ComponentProps<typeof GroupTrigger>;
export function DisclosureTrigger(props: DisclosureTriggerProps) {
  return useContext(Context) ? (
    <GroupTrigger {...(props as ComponentProps<typeof GroupTrigger>)} />
  ) : (
    <Trigger {...(props as ComponentProps<typeof Trigger>)} />
  );
}
export type DisclosureContentProps = ComponentProps<typeof Content>;
export function DisclosureContent({ xstyle, ...props }: DisclosureContentProps) {
  return useContext(Context) ? (
    <GroupContent {...props} xstyle={[disclosureStyles.groupContent, xstyle]} />
  ) : (
    <Content {...props} xstyle={xstyle} />
  );
}
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
