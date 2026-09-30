"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import { Tooltip as Base } from "@base-ui/react/tooltip";
import { tooltipStyles as s } from "@lenso/tokens/tooltip";
import { styledPart } from "../../utils/styled.js";
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
const Trigger = styledPart(Base.Trigger, "tooltip-trigger", s.trigger);
export function TooltipTrigger({
  delay,
  closeDelay,
  ref,
  ...props
}: React.ComponentProps<typeof Trigger>) {
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
  return (
    <Trigger
      {...props}
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
const Positioner = styledPart(Base.Positioner, "tooltip-positioner", s.positioner);
export function TooltipPositioner(props: React.ComponentProps<typeof Positioner>) {
  return <Positioner side="top" sideOffset={3} {...props} />;
}
const Popup = styledPart(Base.Popup, "tooltip-popup", s.popup);
export function TooltipPopup(props: React.ComponentProps<typeof Popup>) {
  return <Popup role="tooltip" {...props} />;
}
const Arrow = styledPart(Base.Arrow, "tooltip-arrow", s.arrow);
export function TooltipArrow({ children, ...props }: React.ComponentProps<typeof Arrow>) {
  return (
    <Arrow {...props}>
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
    </Arrow>
  );
}
export const TooltipViewport = styledPart(Base.Viewport, "tooltip-viewport");
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
