"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0; Base UI owns the toast queue.
import * as React from "react";
import { Toast as Base } from "@base-ui/react/toast";
import { toastStyles as s } from "@lenso/tokens/toast";
import { styledPart } from "../../utils/styled.js";
import { mergeStyle } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";
import { Spinner } from "../spinner/spinner.js";

export const ToastProvider = Base.Provider;
type Placement = "bottom" | "bottom-start" | "bottom-end" | "top" | "top-start" | "top-end";
const PlacementContext = React.createContext<Placement>("bottom");
const ExpandedLayoutContext = React.createContext(false);
type Variant = "default" | "accent" | "success" | "warning" | "danger";
const IndicatorContext = React.createContext({ variant: "default" as Variant, loading: false });
const Root = styledPart(Base.Root, "toast", s.root);
export function ToastRoot({
  toast,
  variant,
  style,
  ...props
}: React.ComponentProps<typeof Root> & {
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
  return (
    <IndicatorContext.Provider value={indicator}>
      <Root
        {...props}
        toast={toast}
        data-frontmost={front?.id === toast.id ? "" : undefined}
        data-layout-expanded={alwaysExpanded ? "" : undefined}
        data-placement={placement}
        data-variant={appearance}
        style={mergeStyle(
          { "--front-height": `${front?.height ?? toast.height ?? 0}px` } as React.CSSProperties,
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
const Viewport = styledPart(Base.Viewport, "toast-viewport", s.viewport);
export function ToastViewport({
  placement = "bottom",
  alwaysExpanded = false,
  xstyle,
  children,
  ...props
}: React.ComponentProps<typeof Viewport> & {
  placement?: Placement;
  /** Keeps the layout expanded without replacing Base UI's hover/focus state. */
  alwaysExpanded?: boolean;
}) {
  return (
    <PlacementContext.Provider value={placement}>
      <ExpandedLayoutContext.Provider value={alwaysExpanded}>
        <Viewport {...props} xstyle={[s[placement], xstyle]}>
          {children}
        </Viewport>
      </ExpandedLayoutContext.Provider>
    </PlacementContext.Provider>
  );
}
export const ToastContent = styledPart(Base.Content, "toast-content", s.content);
export const ToastTitle = styledPart(Base.Title, "toast-title", s.title);
export const ToastDescription = styledPart(Base.Description, "toast-description", s.description);
export const ToastClose = styledPart(Base.Close, "toast-close", s.close);
export const ToastAction = styledPart(Base.Action, "toast-action", s.action);
const Indicator = styledPart("span", "toast-indicator", s.indicator);
export function ToastIndicator({
  children,
  variant,
  ...props
}: React.ComponentProps<typeof Indicator> & { variant?: Variant }) {
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
  return (
    <Indicator aria-hidden="true" {...props} data-swapped={swapped ? "true" : undefined}>
      {content}
    </Indicator>
  );
}
export const ToastPositioner = styledPart(Base.Positioner, "toast-positioner", s.positioner);
export const ToastArrow = styledPart(Base.Arrow, "toast-arrow", s.arrow);
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
