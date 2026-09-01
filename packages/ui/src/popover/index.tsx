"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";

import type { StyleXProps } from "../shared/stylex-props.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./popover.stylex.js";

export const PopoverRoot = BasePopover.Root;
export const PopoverClose = BasePopover.Close;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;
export const PopoverViewport = BasePopover.Viewport;

export function PopoverTrigger<Payload>(
  props: StyleXProps<BasePopover.Trigger.Props<Payload>> & React.RefAttributes<HTMLElement>,
) {
  const { xstyle, ...rest } = props;
  return (
    <BasePopover.Trigger
      {...rest}
      className={stylex.props(styles.trigger, xstyle).className}
      data-slot="popover-trigger"
    />
  );
}

export const PopoverPortal = React.forwardRef<HTMLDivElement, BasePopover.Portal.Props>(
  function PopoverPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BasePopover.Portal
        {...props}
        container={container ?? scopeContainer ?? undefined}
        data-slot="popover-portal"
        ref={ref}
      />
    );
  },
);

export type PopoverPositionerProps = StyleXProps<BasePopover.Positioner.Props>;
export const PopoverPositioner = React.forwardRef<HTMLDivElement, PopoverPositionerProps>(
  function PopoverPositioner({ sideOffset = 8, xstyle, ...props }, ref) {
    return (
      <BasePopover.Positioner
        {...props}
        className={stylex.props(styles.positioner, xstyle).className}
        data-slot="popover-positioner"
        ref={ref}
        sideOffset={sideOffset}
      />
    );
  },
);

export type PopoverPopupProps = StyleXProps<BasePopover.Popup.Props>;
export const PopoverPopup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup({ xstyle, ...props }, ref) {
    return (
      <BasePopover.Popup
        {...props}
        className={stylex.props(styles.popup, xstyle).className}
        data-slot="popover-popup"
        ref={ref}
      />
    );
  },
);

export type PopoverArrowProps = StyleXProps<BasePopover.Arrow.Props>;
export const PopoverArrow = React.forwardRef<HTMLDivElement, PopoverArrowProps>(
  function PopoverArrow({ children, xstyle, ...props }, ref) {
    return (
      <BasePopover.Arrow
        {...props}
        className={stylex.props(styles.arrow, xstyle).className}
        data-slot="popover-arrow"
        ref={ref}
      >
        {children ?? <span aria-hidden="true" {...stylex.props(styles.arrowShape)} />}
      </BasePopover.Arrow>
    );
  },
);

export interface PopoverItemProps extends StyleXProps<useRender.ComponentProps<"button">> {
  tone?: "danger" | "default";
}

export const PopoverItem = React.forwardRef<HTMLElement, PopoverItemProps>(function PopoverItem(
  { render, tone = "default", xstyle, ...props },
  ref,
) {
  return useRender({
    defaultTagName: "button",
    props: {
      ...props,
      className: stylex.props(styles.item, tone === "danger" && styles.itemDanger, xstyle)
        .className,
      "data-slot": "popover-item",
      "data-tone": tone,
      ...(render ? {} : { type: props.type ?? "button" }),
    },
    ref,
    render,
  });
});

export const Popover = {
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Description: PopoverDescription,
  Item: PopoverItem,
  Popup: PopoverPopup,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Root: PopoverRoot,
  Title: PopoverTitle,
  Trigger: PopoverTrigger,
  Viewport: PopoverViewport,
} as const;
