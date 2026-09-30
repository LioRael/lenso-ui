"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { createContext, useContext, type ComponentProps } from "react";
import { alertStyles, alertColors } from "@lenso/tokens/alert";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const ColorContext = createContext<keyof typeof alertColors>("default");
const Root = styledPart("div", "alert-root", alertStyles.root);
const Title = styledPart("div", "alert-title", alertStyles.title);
const Indicator = styledPart("div", "alert-indicator", alertStyles.indicator);
const Icon = styledPart("svg", "alert-default-icon", alertStyles.icon);
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
export function AlertRoot({ status = "default", ...props }: AlertRootProps) {
  return (
    <ColorContext.Provider value={status}>
      <Root {...props} />
    </ColorContext.Provider>
  );
}
export function AlertTitle({ xstyle, ...props }: ComponentProps<typeof Title>) {
  const color = useContext(ColorContext);
  return <Title {...props} xstyle={[alertColors[color], xstyle]} />;
}
export function AlertIndicator({ xstyle, children, ...props }: ComponentProps<typeof Indicator>) {
  const color = useContext(ColorContext);
  return (
    <Indicator {...props} xstyle={[alertColors[color], xstyle]}>
      {children ?? (
        <Icon viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d={iconPaths[color === "accent" ? "default" : color]}
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </Icon>
      )}
    </Indicator>
  );
}
export const AlertContent = styledPart("div", "alert-content", alertStyles.content);
export const AlertDescription = styledPart("div", "alert-description", alertStyles.description);
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
