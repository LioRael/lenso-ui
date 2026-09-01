"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./tooltip.stylex.js";

export const TooltipProvider = BaseTooltip.Provider;

const TooltipContext = React.createContext<string | null>(null);

export function TooltipRoot<Payload>(props: BaseTooltip.Root.Props<Payload>) {
  const popupId = React.useId();
  return (
    <TooltipContext.Provider value={popupId}>
      <BaseTooltip.Root {...props} />
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger<Payload>(
  props: BaseTooltip.Trigger.Props<Payload> & React.RefAttributes<HTMLElement>,
) {
  const popupId = React.useContext(TooltipContext);
  return <BaseTooltip.Trigger aria-describedby={popupId ?? undefined} {...props} />;
}

export const TooltipPortal = React.forwardRef<HTMLDivElement, BaseTooltip.Portal.Props>(
  function TooltipPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseTooltip.Portal
        {...props}
        container={container ?? scopeContainer ?? undefined}
        data-slot="tooltip-portal"
        ref={ref}
      />
    );
  },
);

export const TooltipPositioner = React.forwardRef<HTMLDivElement, BaseTooltip.Positioner.Props>(
  function TooltipPositioner({ className, sideOffset = 8, ...props }, ref) {
    return (
      <BaseTooltip.Positioner
        {...props}
        className={mergeClassName(stylex.props(styles.positioner).className, className)}
        data-slot="tooltip-positioner"
        ref={ref}
        sideOffset={sideOffset}
      />
    );
  },
);

export const TooltipPopup = React.forwardRef<HTMLDivElement, BaseTooltip.Popup.Props>(
  function TooltipPopup({ className, ...props }, ref) {
    const popupId = React.useContext(TooltipContext);
    return (
      <BaseTooltip.Popup
        {...props}
        className={mergeClassName(stylex.props(styles.popup).className, className)}
        data-slot="tooltip-popup"
        id={props.id ?? popupId ?? undefined}
        ref={ref}
        role={props.role ?? "tooltip"}
      />
    );
  },
);

export const TooltipShortcut = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"kbd">>(
  function TooltipShortcut({ className, ...props }, ref) {
    return (
      <kbd
        {...props}
        aria-hidden="true"
        className={mergeClassName(stylex.props(styles.shortcut).className, className) as string}
        data-slot="tooltip-shortcut"
        ref={ref}
      />
    );
  },
);

export const Tooltip = {
  Popup: TooltipPopup,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Shortcut: TooltipShortcut,
  Trigger: TooltipTrigger,
} as const;
