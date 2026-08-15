"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { boxedControlStyles } from "../shared/boxed-control.stylex.js";
import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./select.stylex.js";

export type SelectPosition = "item-aligned" | "popper";

export const SelectRoot = BaseSelect.Root;
export const SelectLabel = BaseSelect.Label;
export const SelectGroup = BaseSelect.Group;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, BaseSelect.Trigger.Props>(
  function SelectTrigger({ children, className, ...props }, ref) {
    return (
      <BaseSelect.Trigger
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.trigger,
            boxedControlStyles.edge,
            state.disabled && styles.triggerDisabled,
          ).className;
          const custom = typeof className === "function" ? className(state) : className;
          return custom ? `${generated} ${custom}` : generated;
        }}
        data-slot="select-trigger"
        ref={ref}
      >
        {children}
      </BaseSelect.Trigger>
    );
  },
);

export const SelectValue = React.forwardRef<HTMLSpanElement, BaseSelect.Value.Props>(
  function SelectValue({ className, ...props }, ref) {
    return (
      <BaseSelect.Value
        {...props}
        className={mergeClassName(stylex.props(styles.value).className, className)}
        data-slot="select-value"
        ref={ref}
      />
    );
  },
);

export const SelectIcon = React.forwardRef<HTMLSpanElement, BaseSelect.Icon.Props>(
  function SelectIcon({ children, className, ...props }, ref) {
    return (
      <BaseSelect.Icon
        {...props}
        className={mergeClassName(stylex.props(styles.icon).className, className)}
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
  BaseSelect.Positioner.Props,
  "alignItemWithTrigger"
> {
  position?: SelectPosition;
}

export const SelectPositioner = React.forwardRef<HTMLDivElement, SelectPositionerProps>(
  function SelectPositioner(
    { align = "start", alignOffset = 1, className, position = "popper", sideOffset, ...props },
    ref,
  ) {
    return (
      <BaseSelect.Positioner
        {...props}
        align={align}
        alignItemWithTrigger={position === "item-aligned"}
        alignOffset={alignOffset}
        className={mergeClassName(stylex.props(styles.positioner).className, className)}
        data-position={position}
        data-slot="select-positioner"
        ref={ref}
        sideOffset={sideOffset ?? (position === "popper" ? 5 : 0)}
      />
    );
  },
);

export const SelectPopup = React.forwardRef<HTMLDivElement, BaseSelect.Popup.Props>(
  function SelectPopup({ className, ...props }, ref) {
    return (
      <BaseSelect.Popup
        {...props}
        className={mergeClassName(stylex.props(styles.popup).className, className)}
        data-slot="select-popup"
        ref={ref}
      />
    );
  },
);

export const SelectList = React.forwardRef<HTMLDivElement, BaseSelect.List.Props>(
  function SelectList({ className, ...props }, ref) {
    return (
      <BaseSelect.List
        {...props}
        className={mergeClassName(stylex.props(styles.list).className, className)}
        data-slot="select-list"
        ref={ref}
      />
    );
  },
);

export const SelectItem = React.forwardRef<HTMLElement, BaseSelect.Item.Props>(function SelectItem(
  { className, ...props },
  ref,
) {
  return (
    <BaseSelect.Item
      {...props}
      className={(state) => {
        const generated = stylex.props(
          styles.item,
          state.disabled && styles.itemDisabled,
        ).className;
        const custom = typeof className === "function" ? className(state) : className;
        return custom ? `${generated} ${custom}` : generated;
      }}
      data-slot="select-item"
      ref={ref}
    />
  );
});

export const SelectItemText = BaseSelect.ItemText;

export const SelectItemIndicator = React.forwardRef<
  HTMLSpanElement,
  BaseSelect.ItemIndicator.Props
>(function SelectItemIndicator({ children, className, ...props }, ref) {
  return (
    <BaseSelect.ItemIndicator
      {...props}
      className={mergeClassName(stylex.props(styles.itemIndicator).className, className)}
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

export const SelectGroupLabel = React.forwardRef<HTMLDivElement, BaseSelect.GroupLabel.Props>(
  function SelectGroupLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.GroupLabel
        {...props}
        className={mergeClassName(stylex.props(styles.groupLabel).className, className)}
        data-slot="select-group-label"
        ref={ref}
      />
    );
  },
);

export const SelectSeparator = React.forwardRef<HTMLDivElement, BaseSelect.Separator.Props>(
  function SelectSeparator({ className, ...props }, ref) {
    return (
      <BaseSelect.Separator
        {...props}
        className={mergeClassName(stylex.props(styles.separator).className, className)}
        data-slot="select-separator"
        ref={ref}
      />
    );
  },
);

const makeScrollArrow = (BaseArrow: typeof BaseSelect.ScrollUpArrow, slot: string) =>
  React.forwardRef<HTMLDivElement, BaseSelect.ScrollUpArrow.Props>(function SelectScrollArrow(
    { className, ...props },
    ref,
  ) {
    return (
      <BaseArrow
        {...props}
        className={mergeClassName(stylex.props(styles.scrollArrow).className, className)}
        data-slot={slot}
        ref={ref}
      />
    );
  });

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
