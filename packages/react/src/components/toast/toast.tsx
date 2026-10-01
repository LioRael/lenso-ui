"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; Base UI owns the toast queue.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Toast as Base } from "@base-ui/react/toast";
import { toastStyles as s } from "@lenso/tokens/toast";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { Spinner } from "../spinner/spinner.js";

export const ToastProvider = Base.Provider;
type Placement = "bottom" | "bottom-start" | "bottom-end" | "top" | "top-start" | "top-end";
const PlacementContext = React.createContext<Placement>("bottom");
const ExpandedLayoutContext = React.createContext(false);
type Variant = "default" | "accent" | "success" | "warning" | "danger";
const IndicatorContext = React.createContext({ variant: "default" as Variant, loading: false });
export function ToastRoot({
  toast,
  variant,
  style,
  xstyle,
  ...props
}: StyleXProps<Omit<Base.Root.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Root>, "ref"> & {
    variant?: Variant;
  }) {
  const { toasts } = Base.useToastManager();
  const placement = React.useContext(PlacementContext);
  const alwaysExpanded = React.useContext(ExpandedLayoutContext);
  const front = toasts.find((item) => item.transitionStatus !== "ending") ?? toasts[0];
  const appearance = variant ?? (toast.type === "error" ? "danger" : (toast.type ?? "default"));
  const tone =
    appearance === "accent" ||
    appearance === "success" ||
    appearance === "warning" ||
    appearance === "danger"
      ? appearance
      : "default";
  const loading = toast.type === "loading";
  const indicator = React.useMemo<React.ContextType<typeof IndicatorContext>>(
    () => ({ variant: tone, loading }),
    [tone, loading],
  );
  const compiled = stylex.props(s.root, xstyle);
  return (
    <IndicatorContext.Provider value={indicator}>
      <Base.Root
        {...props}
        {...compiled}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast"}
        toast={toast}
        data-frontmost={front?.id === toast.id ? "" : undefined}
        data-layout-expanded={alwaysExpanded ? "" : undefined}
        data-placement={placement}
        data-variant={appearance}
        style={mergeStyle<Base.Root.State>(
          {
            ...compiled.style,
            "--front-height": `${front?.height ?? toast.height ?? 0}px`,
          } as React.CSSProperties,
          style,
        )}
      />
    </IndicatorContext.Provider>
  );
}
export function ToastPortal({
  container,
  ...props
}: React.ComponentPropsWithRef<typeof Base.Portal>) {
  const themed = useThemePortalContainer();
  return (
    <Base.Portal
      {...props}
      container={container === undefined ? (themed ?? undefined) : container}
    />
  );
}
export function ToastViewport({
  placement = "bottom",
  alwaysExpanded = false,
  xstyle,
  children,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref"> & {
    placement?: Placement;
    /** Keeps the layout expanded without replacing Base UI's hover/focus state. */
    alwaysExpanded?: boolean;
  }) {
  const compiled = stylex.props(s.viewport, s[placement], xstyle);
  return (
    <PlacementContext.Provider value={placement}>
      <ExpandedLayoutContext.Provider value={alwaysExpanded}>
        <Base.Viewport
          {...props}
          {...compiled}
          style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
          data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-viewport"}
        >
          {children}
        </Base.Viewport>
      </ExpandedLayoutContext.Provider>
    </PlacementContext.Provider>
  );
}
export function ToastContent({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Content.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Content>, "ref">) {
  const compiled = stylex.props(s.content, xstyle);
  return (
    <Base.Content
      {...props}
      {...compiled}
      style={mergeStyle<Base.Content.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-content"}
    />
  );
}
export function ToastTitle({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Title.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Title>, "ref">) {
  const compiled = stylex.props(s.title, xstyle);
  return (
    <Base.Title
      {...props}
      {...compiled}
      style={mergeStyle<Base.Title.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-title"}
    />
  );
}
export function ToastDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Description.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Description>, "ref">) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <Base.Description
      {...props}
      {...compiled}
      style={mergeStyle<Base.Description.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-description"}
    />
  );
}
export function ToastClose({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Close.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Close>, "ref">) {
  const compiled = stylex.props(s.close, xstyle);
  return (
    <Base.Close
      {...props}
      {...compiled}
      style={mergeStyle<Base.Close.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-close"}
    />
  );
}
export function ToastAction({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Action.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Action>, "ref">) {
  const compiled = stylex.props(s.action, xstyle);
  return (
    <Base.Action
      {...props}
      {...compiled}
      style={mergeStyle<Base.Action.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-action"}
    />
  );
}
export function ToastIndicator({
  children,
  variant,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { variant?: Variant }) {
  const inherited = React.useContext(IndicatorContext);
  const tone = variant ?? inherited.variant;
  const DefaultIcon =
    tone === "success"
      ? SuccessIcon
      : tone === "warning"
        ? WarningIcon
        : tone === "danger"
          ? DangerIcon
          : InfoIcon;
  const content =
    children ??
    (inherited.loading ? (
      <Spinner color="current" size="sm" />
    ) : (
      <DefaultIcon data-slot="toast-default-icon" />
    ));
  const kind = React.isValidElement(content) ? content.type : content;
  const previousKind = React.useRef(kind);
  const [swapped, setSwapped] = React.useState(false);
  React.useLayoutEffect(() => {
    if (previousKind.current !== kind) {
      previousKind.current = kind;
      setSwapped(true);
    }
  }, [kind]);
  const compiled = stylex.props(s.indicator, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      data-swapped={swapped ? "true" : undefined}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-indicator"}
    >
      {content}
    </span>
  );
}
export function ToastPositioner({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const compiled = stylex.props(s.positioner, xstyle);
  return (
    <Base.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-positioner"}
    />
  );
}
export function ToastArrow({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Arrow.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Arrow>, "ref">) {
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <Base.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<Base.Arrow.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "toast-arrow"}
    />
  );
}
export const useToastManager = Base.useToastManager;
export const createToastManager = Base.createToastManager;
export const Toast = Object.assign(ToastRoot, {
  Root: ToastRoot,
  Provider: ToastProvider,
  Portal: ToastPortal,
  Viewport: ToastViewport,
  Content: ToastContent,
  Title: ToastTitle,
  Description: ToastDescription,
  Close: ToastClose,
  Action: ToastAction,
  Indicator: ToastIndicator,
  Positioner: ToastPositioner,
  Arrow: ToastArrow,
  useToastManager,
  createToastManager,
});
