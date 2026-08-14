"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";

import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./popover.stylex.js";

export const PopoverRoot = BasePopover.Root;
export const PopoverClose = BasePopover.Close;
export const PopoverTitle = BasePopover.Title;
export const PopoverDescription = BasePopover.Description;
export const PopoverViewport = BasePopover.Viewport;

export function PopoverTrigger<Payload>(
  props: BasePopover.Trigger.Props<Payload> & React.RefAttributes<HTMLElement>,
) {
  const { className, ...rest } = props;
  return (
    <BasePopover.Trigger
      {...rest}
      className={mergeClassName(stylex.props(styles.trigger).className, className)}
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

export const PopoverPositioner = React.forwardRef<HTMLDivElement, BasePopover.Positioner.Props>(
  function PopoverPositioner({ className, sideOffset = 8, ...props }, ref) {
    return (
      <BasePopover.Positioner
        {...props}
        className={mergeClassName(stylex.props(styles.positioner).className, className)}
        data-slot="popover-positioner"
        ref={ref}
        sideOffset={sideOffset}
      />
    );
  },
);

export const PopoverPopup = React.forwardRef<HTMLDivElement, BasePopover.Popup.Props>(
  function PopoverPopup({ className, ...props }, ref) {
    return (
      <BasePopover.Popup
        {...props}
        className={mergeClassName(stylex.props(styles.popup).className, className)}
        data-slot="popover-popup"
        ref={ref}
      />
    );
  },
);

export const PopoverArrow = React.forwardRef<HTMLDivElement, BasePopover.Arrow.Props>(
  function PopoverArrow({ children, className, ...props }, ref) {
    return (
      <BasePopover.Arrow
        {...props}
        className={mergeClassName(stylex.props(styles.arrow).className, className)}
        data-slot="popover-arrow"
        ref={ref}
      >
        {children ?? <span aria-hidden="true" {...stylex.props(styles.arrowShape)} />}
      </BasePopover.Arrow>
    );
  },
);

export interface PopoverItemProps extends useRender.ComponentProps<"button"> {
  tone?: "danger" | "default";
}

export const PopoverItem = React.forwardRef<HTMLElement, PopoverItemProps>(function PopoverItem(
  { className, render, tone = "default", ...props },
  ref,
) {
  return useRender({
    defaultTagName: "button",
    props: {
      ...props,
      className: mergeClassName(
        stylex.props(styles.item, tone === "danger" && styles.itemDanger).className,
        className,
      ),
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
