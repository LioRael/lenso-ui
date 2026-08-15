"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Select as BaseSelect } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./select.stylex.js";

export type SelectPosition = "item-aligned" | "popper";

const SelectPositionContext = React.createContext<SelectPosition>("popper");

export const SelectRoot = BaseSelect.Root;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, BaseSelect.Trigger.Props>(
  function SelectTrigger({ className, ...props }, ref) {
    return (
      <BaseSelect.Trigger
        {...props}
        className={mergeClassName(stylex.props(styles.trigger).className, className)}
        data-slot="select-trigger"
        ref={ref}
      />
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

export interface SelectIconProps extends BaseSelect.Icon.Props {
  children?: React.ReactNode;
}

export const SelectIcon = React.forwardRef<HTMLSpanElement, SelectIconProps>(function SelectIcon(
  { children, className, ...props },
  ref,
) {
  return (
    <BaseSelect.Icon
      {...props}
      className={mergeClassName(stylex.props(styles.icon).className, className)}
      data-slot="select-icon"
      ref={ref}
    >
      {children ?? <ChevronDownIcon aria-hidden="true" {...stylex.props(styles.iconSvg)} />}
    </BaseSelect.Icon>
  );
});

export const SelectPortal = React.forwardRef<HTMLDivElement, BaseSelect.Portal.Props>(
  function SelectPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseSelect.Portal
        {...props}
        container={container ?? scopeContainer}
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
  function SelectPositioner({ className, position = "popper", sideOffset, ...props }, ref) {
    return (
      <SelectPositionContext.Provider value={position}>
        <BaseSelect.Positioner
          {...props}
          alignItemWithTrigger={position === "item-aligned"}
          className={mergeClassName(stylex.props(styles.positioner).className, className)}
          data-position={position}
          data-slot="select-positioner"
          ref={ref}
          sideOffset={sideOffset ?? (position === "popper" ? 5 : 0)}
        />
      </SelectPositionContext.Provider>
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
  const position = React.useContext(SelectPositionContext);
  return (
    <BaseSelect.Item
      {...props}
      className={(state) => {
        const generated = stylex.props(
          styles.item,
          state.highlighted && styles.itemInteractive,
          state.selected && position === "item-aligned" && styles.itemSelected,
          state.disabled && styles.itemDisabled,
        ).className;
        const custom = typeof className === "function" ? className(state) : className;
        return [generated, custom].filter(Boolean).join(" ");
      }}
      data-slot="select-item"
      ref={ref}
    />
  );
});

export const SelectItemText = React.forwardRef<HTMLDivElement, BaseSelect.ItemText.Props>(
  function SelectItemText({ className, ...props }, ref) {
    return (
      <BaseSelect.ItemText
        {...props}
        className={mergeClassName(stylex.props(styles.itemText).className, className)}
        data-slot="select-item-text"
        ref={ref}
      />
    );
  },
);

export interface SelectItemIndicatorProps extends BaseSelect.ItemIndicator.Props {
  children?: React.ReactNode;
}

export const SelectItemIndicator = React.forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  function SelectItemIndicator({ children, className, ...props }, ref) {
    return (
      <BaseSelect.ItemIndicator
        {...props}
        className={mergeClassName(stylex.props(styles.itemIndicator).className, className)}
        data-slot="select-item-indicator"
        ref={ref}
      >
        {children ?? <CheckIcon aria-hidden="true" {...stylex.props(styles.indicatorSvg)} />}
      </BaseSelect.ItemIndicator>
    );
  },
);

export const SelectGroup = BaseSelect.Group;

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

export const Select = {
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Icon: SelectIcon,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  ItemText: SelectItemText,
  List: SelectList,
  Popup: SelectPopup,
  Portal: SelectPortal,
  Positioner: SelectPositioner,
  Root: SelectRoot,
  Separator: SelectSeparator,
  Trigger: SelectTrigger,
  Value: SelectValue,
} as const;
