"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

import { mergeClassName } from "../shared/merge-class-name.js";
import { createStyledPart } from "../shared/styled-part.js";
import { styles } from "./inline-alert.stylex.js";

export type InlineAlertTone = "error" | "info" | "neutral" | "success" | "warning";

interface InlineAlertContextValue {
  tone: InlineAlertTone;
}

const InlineAlertContext = React.createContext<InlineAlertContextValue>({ tone: "info" });

export interface InlineAlertRootProps extends React.ComponentPropsWithoutRef<"div"> {
  tone?: InlineAlertTone;
}

export const InlineAlertRoot = React.forwardRef<HTMLDivElement, InlineAlertRootProps>(
  function InlineAlertRoot({ className, tone = "info", ...props }, ref) {
    const value = React.useMemo(() => ({ tone }), [tone]);
    return (
      <InlineAlertContext.Provider value={value}>
        <div
          {...props}
          className={
            mergeClassName(stylex.props(styles.root, styles[tone]).className, className) as string
          }
          data-slot="inline-alert"
          data-tone={tone}
          ref={ref}
        />
      </InlineAlertContext.Provider>
    );
  },
);

function DefaultIcon({ tone }: { tone: InlineAlertTone }) {
  const Icon =
    tone === "error"
      ? CircleAlertIcon
      : tone === "success"
        ? CircleCheckIcon
        : tone === "warning"
          ? TriangleAlertIcon
          : InfoIcon;
  return <Icon size={14} strokeWidth={1.5} />;
}

export const InlineAlertIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function InlineAlertIcon({ children, className, ...props }, ref) {
  const { tone } = React.useContext(InlineAlertContext);
  return (
    <span
      {...props}
      aria-hidden="true"
      className={mergeClassName(stylex.props(styles.icon).className, className) as string}
      data-slot="inline-alert-icon"
      ref={ref}
    >
      {children ?? <DefaultIcon tone={tone} />}
    </span>
  );
});

export const InlineAlertContent = createStyledPart("div", "inline-alert-content", styles.content);

export type InlineAlertTitleElement = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface InlineAlertTitleProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: InlineAlertTitleElement;
}

export const InlineAlertTitle = React.forwardRef<HTMLElement, InlineAlertTitleProps>(
  function InlineAlertTitle({ as = "div", className, ...props }, ref) {
    const Component: React.ElementType = as;
    return React.createElement(Component, {
      ...props,
      className: mergeClassName(stylex.props(styles.title).className, className),
      "data-slot": "inline-alert-title",
      ref,
    });
  },
);

export const InlineAlertDescription = createStyledPart(
  "p",
  "inline-alert-description",
  styles.description,
);
export const InlineAlertActions = createStyledPart("div", "inline-alert-actions", styles.actions);

export const InlineAlert = {
  Actions: InlineAlertActions,
  Content: InlineAlertContent,
  Description: InlineAlertDescription,
  Icon: InlineAlertIcon,
  Root: InlineAlertRoot,
  Title: InlineAlertTitle,
} as const;
