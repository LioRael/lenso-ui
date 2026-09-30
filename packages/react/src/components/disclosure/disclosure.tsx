"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { createContext, useContext, type ComponentProps } from "react";
import { disclosureStyles } from "@lenso/tokens/disclosure";
import { styledPart } from "../../utils/styled.js";
import { DisclosureGroupContext } from "../disclosure-group/disclosure-group.js";
const Context = createContext(false);
const Root = styledPart(BaseCollapsible.Root, "disclosure", disclosureStyles.root);
const GroupItem = styledPart(BaseAccordion.Item, "disclosure", disclosureStyles.root);
const Trigger = styledPart(BaseCollapsible.Trigger, "disclosure-trigger", disclosureStyles.trigger);
const GroupTrigger = styledPart(
  BaseAccordion.Trigger,
  "disclosure-trigger",
  disclosureStyles.trigger,
);
const Content = styledPart(BaseCollapsible.Panel, "disclosure-content", disclosureStyles.content);
const GroupContent = styledPart(
  BaseAccordion.Panel,
  "disclosure-content",
  disclosureStyles.content,
);
export const DisclosureHeading = styledPart("h3", "disclosure-heading", disclosureStyles.heading);
export const DisclosureBody = styledPart("div", "disclosure-body", disclosureStyles.body);
const Indicator = styledPart("svg", "disclosure-indicator", disclosureStyles.indicator);
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
