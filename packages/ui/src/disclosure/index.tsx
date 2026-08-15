"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./disclosure.stylex.js";

const chevronUrl =
  "data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjQuNzU3NyIgaGVpZ2h0PSI1LjM4NTQ4IiB2aWV3Qm94PSIwIDAgNC43NTc3IDUuMzg1NDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGlkPSJHcm91cCI+CjxwYXRoIGlkPSJWZWN0b3IiIGQ9Ik0wLjc1MTk0IDUuMzE2NjNDMC40MTg2MSA1LjUxMTAzIDAgNS4yNzA2MyAwIDQuODg0NzNWMC41MDA3NTRDMCAwLjExNDg1NCAwLjQxODYxIC0wLjEyNTU3NiAwLjc1MTk0IDAuMDY4ODY0TDQuNTA5NiAyLjI2MDg0QzQuODQwNCAyLjQ1Mzc4IDQuODQwNCAyLjkzMTY4IDQuNTA5NiAzLjEyNDYyTDAuNzUxOTQgNS4zMTY2M1oiIGZpbGw9IiMzMzMzMzMiLz4KPC9nPgo8L3N2Zz4K";

export const DisclosureRoot = React.forwardRef<HTMLDivElement, BaseAccordion.Root.Props>(
  function DisclosureRoot({ className, ...props }, ref) {
    return (
      <BaseAccordion.Root
        {...props}
        className={mergeClassName(stylex.props(styles.root).className, className)}
        data-slot="disclosure-root"
        ref={ref}
      />
    );
  },
);

export const DisclosureItem = React.forwardRef<HTMLDivElement, BaseAccordion.Item.Props>(
  function DisclosureItem({ className, ...props }, ref) {
    return (
      <BaseAccordion.Item
        {...props}
        className={mergeClassName(stylex.props(styles.item).className, className)}
        data-slot="disclosure-item"
        ref={ref}
      />
    );
  },
);

export const DisclosureHeader = React.forwardRef<HTMLHeadingElement, BaseAccordion.Header.Props>(
  function DisclosureHeader({ className, ...props }, ref) {
    return (
      <BaseAccordion.Header
        {...props}
        className={mergeClassName(stylex.props(styles.header).className, className)}
        data-slot="disclosure-header"
        ref={ref}
      />
    );
  },
);

export const DisclosureTrigger = React.forwardRef<HTMLElement, BaseAccordion.Trigger.Props>(
  function DisclosureTrigger({ className, style, ...props }, ref) {
    return (
      <BaseAccordion.Trigger
        {...props}
        className={mergeClassName(stylex.props(styles.trigger).className, className)}
        data-slot="disclosure-trigger"
        ref={ref}
        style={(state) => ({
          ...(typeof style === "function" ? style(state) : style),
          "--disclosure-icon-rotation": state.open ? "90deg" : "0deg",
        })}
      />
    );
  },
);

export const DisclosureIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function DisclosureIcon({ children, className, ...props }, ref) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={[stylex.props(styles.icon).className, className].filter(Boolean).join(" ")}
      data-slot="disclosure-icon"
      ref={ref}
    >
      {children ?? (
        <span style={{ maskImage: `url(${chevronUrl})` }} {...stylex.props(styles.iconGlyph)} />
      )}
    </span>
  );
});

export interface DisclosurePanelProps extends BaseAccordion.Panel.Props {
  layout?: "auto" | "list" | "text";
}

export const DisclosurePanel = React.forwardRef<HTMLDivElement, DisclosurePanelProps>(
  function DisclosurePanel({ className, layout = "text", ...props }, ref) {
    return (
      <BaseAccordion.Panel
        {...props}
        className={mergeClassName(
          stylex.props(
            styles.panel,
            layout === "text" && styles.panelText,
            layout === "list" && styles.panelList,
          ).className,
          className,
        )}
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
