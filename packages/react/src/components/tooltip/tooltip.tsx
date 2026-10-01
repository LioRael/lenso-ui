"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tooltip as Base } from "@base-ui/react/tooltip";
import { tooltipStyles as s } from "@lenso/tokens/tooltip";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

export function TooltipRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
const TimingContext = React.createContext<Pick<Base.Provider.Props, "delay" | "closeDelay">>({});
export function TooltipProvider({ delay, closeDelay, ...props }: Base.Provider.Props) {
  const inherited = React.useContext(TimingContext);
  const timing = React.useMemo(
    () => ({ delay: delay ?? inherited.delay, closeDelay: closeDelay ?? inherited.closeDelay }),
    [delay, closeDelay, inherited],
  );
  return (
    <TimingContext.Provider value={timing}>
      <Base.Provider {...props} delay={timing.delay} closeDelay={timing.closeDelay} />
    </TimingContext.Provider>
  );
}
export function TooltipTrigger({
  delay,
  closeDelay,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const timing = React.useContext(TimingContext);
  const localRef = React.useRef<HTMLElement | null>(null);
  const attachRef = React.useCallback((element: HTMLElement | null) => {
    localRef.current = element;
  }, []);
  React.useImperativeHandle(ref, () => localRef.current!);
  const [delays, setDelays] = React.useState({ open: 1500, close: 500 });
  React.useLayoutEffect(() => {
    const refresh = () => {
      const styles = getComputedStyle(localRef.current ?? document.documentElement);
      const time = (name: string, fallback: number) => {
        const raw = styles.getPropertyValue(name).trim();
        const value = Number.parseFloat(raw);
        return Number.isFinite(value)
          ? Math.max(0, value * (raw.endsWith("ms") ? 1 : 1000))
          : fallback;
      };
      const open = time("--tooltip-delay", 1500);
      const close = time("--tooltip-close-delay", 500);
      setDelays((previous) =>
        previous.open === open && previous.close === close ? previous : { open, close },
      );
    };
    refresh();
    // Delays inherit from the trigger's ancestors, including portalled theme scopes.
    const observer = new MutationObserver(refresh);
    for (let element = localRef.current; element; element = element.parentElement) {
      observer.observe(element, { attributes: true });
    }
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", refresh);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
    };
  }, []);
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tooltip-trigger"}
      ref={attachRef}
      delay={delay ?? timing.delay ?? delays.open}
      closeDelay={closeDelay ?? timing.closeDelay ?? delays.close}
    />
  );
}
export function TooltipPortal({
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
export function TooltipPositioner({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const compiled = stylex.props(s.positioner, xstyle);
  return (
    <Base.Positioner
      side="top"
      sideOffset={3}
      {...props}
      {...compiled}
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tooltip-positioner"}
    />
  );
}
export function TooltipPopup({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const compiled = stylex.props(s.popup, xstyle);
  return (
    <Base.Popup
      role="tooltip"
      {...props}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tooltip-popup"}
    />
  );
}
export function TooltipArrow({
  children,
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tooltip-arrow"}
    >
      {children ?? (
        <svg
          data-slot="overlay-arrow"
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 0C5.48483 8 6.5 8 12 0Z" />
        </svg>
      )}
    </Base.Arrow>
  );
}
export function TooltipViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tooltip-viewport"}
    />
  );
}
export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  Viewport: TooltipViewport,
});
