"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { createContext, useContext, type ComponentProps } from "react";
import { alertStyles, alertColors } from "@lenso/tokens/alert";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
const ColorContext = createContext<keyof typeof alertColors>("default");
const iconPaths = {
  default:
    "M8 13.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m1-9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-.25 3a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0z",
  success:
    "M13.5 8a5.5 5.5 0 1 1-11 0a5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0m-3.9-1.55a.75.75 0 1 0-1.2-.9L7.419 8.858L6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z",
  warning:
    "M7.134 2.994L2.217 11.5a1 1 0 0 0 .866 1.5h9.834a1 1 0 0 0 .866-1.5L8.866 2.993a1 1 0 0 0-1.732 0m3.03-.75c-.962-1.665-3.366-1.665-4.329 0L.918 10.749c-.963 1.666.24 3.751 2.165 3.751h9.834c1.925 0 3.128-2.085 2.164-3.751zM8 5a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 8 5m1 5.75a1 1 0 1 1-2 0a1 1 0 0 1 2 0",
  danger:
    "M8 13.5a5.5 5.5 0 1 0 0-11a5.5 5.5 0 0 0 0 11M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m1-4.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0M8.75 5a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z",
};
export type AlertRootProps = StyleXProps<ComponentProps<"div">> & {
  status?: keyof typeof alertColors;
};
export function AlertRoot({ status = "default", xstyle, style, ...props }: AlertRootProps) {
  const compiled = stylex.props(alertStyles.root, xstyle);
  return (
    <ColorContext.Provider value={status}>
      <div
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-root"}
        {...compiled}
        style={{ ...compiled.style, ...style }}
      />
    </ColorContext.Provider>
  );
}
export function AlertTitle({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const color = useContext(ColorContext);
  const compiled = stylex.props(alertStyles.title, alertColors[color], xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-title"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function AlertIndicator({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<ComponentProps<"div">>) {
  const color = useContext(ColorContext);
  const compiled = stylex.props(alertStyles.indicator, alertColors[color], xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-indicator"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {children ?? (
        <svg
          data-slot="alert-default-icon"
          {...stylex.props(alertStyles.icon)}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={iconPaths[color === "accent" ? "default" : color]}
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}
export function AlertContent({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(alertStyles.content, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-content"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function AlertDescription({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(alertStyles.description, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "alert-description"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const Alert = Object.assign(AlertRoot, {
  Root: AlertRoot,
  Content: AlertContent,
  Indicator: AlertIndicator,
  Title: AlertTitle,
  Description: AlertDescription,
});
export type AlertProps = AlertRootProps;
export type AlertTitleProps = ComponentProps<typeof AlertTitle>;
export type AlertDescriptionProps = ComponentProps<typeof AlertDescription>;
export type AlertContentProps = ComponentProps<typeof AlertContent>;
export type AlertIndicatorProps = ComponentProps<typeof AlertIndicator>;
export type Alert = {
  Props: AlertProps;
  RootProps: AlertRootProps;
  TitleProps: AlertTitleProps;
  DescriptionProps: AlertDescriptionProps;
  ContentProps: AlertContentProps;
  IndicatorProps: AlertIndicatorProps;
};
