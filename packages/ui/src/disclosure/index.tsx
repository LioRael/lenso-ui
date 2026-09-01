"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { ChevronRightIcon } from "lucide-react";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./disclosure.stylex.js";

export type DisclosureRootProps = StyleXProps<BaseAccordion.Root.Props>;
export const DisclosureRoot = React.forwardRef<HTMLDivElement, DisclosureRootProps>(
  function DisclosureRoot({ xstyle, ...props }, ref) {
    return (
      <BaseAccordion.Root
        {...props}
        className={stylex.props(styles.root, xstyle).className}
        data-slot="disclosure-root"
        ref={ref}
      />
    );
  },
);

export type DisclosureItemProps = StyleXProps<BaseAccordion.Item.Props>;
export const DisclosureItem = React.forwardRef<HTMLDivElement, DisclosureItemProps>(
  function DisclosureItem({ xstyle, ...props }, ref) {
    return (
      <BaseAccordion.Item
        {...props}
        className={stylex.props(styles.item, xstyle).className}
        data-slot="disclosure-item"
        ref={ref}
      />
    );
  },
);

export type DisclosureHeaderProps = StyleXProps<BaseAccordion.Header.Props>;
export const DisclosureHeader = React.forwardRef<HTMLHeadingElement, DisclosureHeaderProps>(
  function DisclosureHeader({ xstyle, ...props }, ref) {
    return (
      <BaseAccordion.Header
        {...props}
        className={stylex.props(styles.header, xstyle).className}
        data-slot="disclosure-header"
        ref={ref}
      />
    );
  },
);

export type DisclosureTriggerProps = StyleXProps<BaseAccordion.Trigger.Props>;
export const DisclosureTrigger = React.forwardRef<HTMLElement, DisclosureTriggerProps>(
  function DisclosureTrigger({ xstyle, ...props }, ref) {
    return (
      <BaseAccordion.Trigger
        {...props}
        className={stylex.props(styles.trigger, xstyle).className}
        data-slot="disclosure-trigger"
        ref={ref}
      />
    );
  },
);

export type DisclosureIconProps = StyleXProps<React.ComponentPropsWithoutRef<"span">>;
export const DisclosureIcon = React.forwardRef<HTMLSpanElement, DisclosureIconProps>(
  function DisclosureIcon({ children, xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        aria-hidden="true"
        className={stylex.props(styles.icon, xstyle).className}
        data-slot="disclosure-icon"
        ref={ref}
      >
        {children ?? <ChevronRightIcon size={12} strokeWidth={1.5} />}
      </span>
    );
  },
);

export interface DisclosurePanelProps extends StyleXProps<BaseAccordion.Panel.Props> {
  layout?: "auto" | "list" | "text";
}

export const DisclosurePanel = React.forwardRef<HTMLDivElement, DisclosurePanelProps>(
  function DisclosurePanel({ layout = "text", xstyle, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        {...props}
        className={stylex.props(styles.panel, xstyle).className}
        data-layout={layout}
        data-slot="disclosure-panel"
        ref={ref}
      />
    );
  },
);

export const Disclosure = {
  Header: DisclosureHeader,
  Icon: DisclosureIcon,
  Item: DisclosureItem,
  Panel: DisclosurePanel,
  Root: DisclosureRoot,
  Trigger: DisclosureTrigger,
} as const;
