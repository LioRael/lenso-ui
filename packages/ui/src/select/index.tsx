"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { boxedControlStyles } from "../shared/boxed-control.stylex.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./select.stylex.js";

export type SelectPosition = "item-aligned" | "popper";

export const SelectRoot = BaseSelect.Root;
export const SelectLabel = BaseSelect.Label;
export const SelectGroup = BaseSelect.Group;

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  StyleXProps<BaseSelect.Trigger.Props>
>(function SelectTrigger({ children, xstyle, ...props }, ref) {
  return (
    <BaseSelect.Trigger
      {...props}
      className={(state) => {
        const generated = stylex.props(
          styles.trigger,
          boxedControlStyles.edge,
          styles.triggerSurface,
          state.disabled && styles.triggerDisabled,
          xstyle,
        ).className;
        return generated;
      }}
      data-slot="select-trigger"
      ref={ref}
    >
      {children}
    </BaseSelect.Trigger>
  );
});

export const SelectValue = React.forwardRef<HTMLSpanElement, StyleXProps<BaseSelect.Value.Props>>(
  function SelectValue({ xstyle, ...props }, ref) {
    return (
      <BaseSelect.Value
        {...props}
        className={stylex.props(styles.value, xstyle).className}
        data-slot="select-value"
        ref={ref}
      />
    );
  },
);

export const SelectIcon = React.forwardRef<HTMLSpanElement, StyleXProps<BaseSelect.Icon.Props>>(
  function SelectIcon({ children, xstyle, ...props }, ref) {
    return (
      <BaseSelect.Icon
        {...props}
        className={stylex.props(styles.icon, xstyle).className}
        data-slot="select-icon"
        ref={ref}
      >
        {children === undefined ? (
          <ChevronDownIcon aria-hidden="true" {...stylex.props(styles.iconSvg)} />
        ) : (
          children
        )}
      </BaseSelect.Icon>
    );
  },
);

export const SelectPortal = React.forwardRef<HTMLDivElement, BaseSelect.Portal.Props>(
  function SelectPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseSelect.Portal
        {...props}
        container={container ?? scopeContainer ?? undefined}
        data-slot="select-portal"
        ref={ref}
      />
    );
  },
);

export interface SelectPositionerProps extends Omit<
  StyleXProps<BaseSelect.Positioner.Props>,
  "alignItemWithTrigger"
> {
  position?: SelectPosition;
}

export const SelectPositioner = React.forwardRef<HTMLDivElement, SelectPositionerProps>(
  function SelectPositioner(
    { align = "start", alignOffset = 1, position = "popper", sideOffset, xstyle, ...props },
    ref,
  ) {
    return (
      <BaseSelect.Positioner
        {...props}
        align={align}
        alignItemWithTrigger={position === "item-aligned"}
        alignOffset={alignOffset}
        className={stylex.props(styles.positioner, xstyle).className}
        data-position={position}
        data-slot="select-positioner"
        ref={ref}
        sideOffset={sideOffset ?? (position === "popper" ? 5 : 0)}
      />
    );
  },
);

export const SelectPopup = React.forwardRef<HTMLDivElement, StyleXProps<BaseSelect.Popup.Props>>(
  function SelectPopup({ xstyle, ...props }, ref) {
    return (
      <BaseSelect.Popup
        {...props}
        className={stylex.props(styles.popup, xstyle).className}
        data-slot="select-popup"
        ref={ref}
      />
    );
  },
);

export const SelectList = React.forwardRef<HTMLDivElement, StyleXProps<BaseSelect.List.Props>>(
  function SelectList({ xstyle, ...props }, ref) {
    return (
      <BaseSelect.List
        {...props}
        className={stylex.props(styles.list, xstyle).className}
        data-slot="select-list"
        ref={ref}
      />
    );
  },
);

export const SelectItem = React.forwardRef<HTMLElement, StyleXProps<BaseSelect.Item.Props>>(
  function SelectItem({ onPointerLeave, onPointerMove, xstyle, ...props }, ref) {
    const [pointerHovered, setPointerHovered] = React.useState(false);

    return (
      <BaseSelect.Item
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.item,
            state.disabled && styles.itemDisabled,
            xstyle,
          ).className;
          return generated;
        }}
        data-pointer-hovered={pointerHovered ? "" : undefined}
        data-slot="select-item"
        onPointerLeave={(event) => {
          setPointerHovered(false);
          onPointerLeave?.(event);
        }}
        onPointerMove={(event) => {
          setPointerHovered(true);
          onPointerMove?.(event);
        }}
        ref={ref}
      />
    );
  },
);

export const SelectItemText = BaseSelect.ItemText;

export const SelectItemIndicator = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<BaseSelect.ItemIndicator.Props>
>(function SelectItemIndicator({ children, xstyle, ...props }, ref) {
  return (
    <BaseSelect.ItemIndicator
      {...props}
      className={stylex.props(styles.itemIndicator, xstyle).className}
      data-slot="select-item-indicator"
      ref={ref}
    >
      {children === undefined ? (
        <CheckIcon aria-hidden="true" {...stylex.props(styles.indicatorSvg)} />
      ) : (
        children
      )}
    </BaseSelect.ItemIndicator>
  );
});

export const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseSelect.GroupLabel.Props>
>(function SelectGroupLabel({ xstyle, ...props }, ref) {
  return (
    <BaseSelect.GroupLabel
      {...props}
      className={stylex.props(styles.groupLabel, xstyle).className}
      data-slot="select-group-label"
      ref={ref}
    />
  );
});

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseSelect.Separator.Props>
>(function SelectSeparator({ xstyle, ...props }, ref) {
  return (
    <BaseSelect.Separator
      {...props}
      className={stylex.props(styles.separator, xstyle).className}
      data-slot="select-separator"
      ref={ref}
    />
  );
});

const makeScrollArrow = (BaseArrow: typeof BaseSelect.ScrollUpArrow, slot: string) =>
  React.forwardRef<HTMLDivElement, StyleXProps<BaseSelect.ScrollUpArrow.Props>>(
    function SelectScrollArrow({ xstyle, ...props }, ref) {
      return (
        <BaseArrow
          {...props}
          className={stylex.props(styles.scrollArrow, xstyle).className}
          data-slot={slot}
          ref={ref}
        />
      );
    },
  );

export const SelectScrollUpArrow = makeScrollArrow(
  BaseSelect.ScrollUpArrow,
  "select-scroll-up-arrow",
);
export const SelectScrollDownArrow = makeScrollArrow(
  BaseSelect.ScrollDownArrow,
  "select-scroll-down-arrow",
);

export const Select = {
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Icon: SelectIcon,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  Label: SelectLabel,
  List: SelectList,
  Popup: SelectPopup,
  Portal: SelectPortal,
  Positioner: SelectPositioner,
  Root: SelectRoot,
  ScrollDownArrow: SelectScrollDownArrow,
  ScrollUpArrow: SelectScrollUpArrow,
  Separator: SelectSeparator,
  Trigger: SelectTrigger,
  Value: SelectValue,
} as const;
