"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CheckIcon, XIcon } from "lucide-react";

import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./combobox.stylex.js";

type SpanProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "className"> & { className?: string };

export const ComboboxRoot = BaseCombobox.Root;
export const ComboboxLabel = BaseCombobox.Label;
export const ComboboxGroup = BaseCombobox.Group;
export const ComboboxCollection = BaseCombobox.Collection;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxRow = BaseCombobox.Row;

export const ComboboxInputGroup = React.forwardRef<HTMLDivElement, BaseCombobox.InputGroup.Props>(
  function ComboboxInputGroup({ className, ...props }, ref) {
    return (
      <BaseCombobox.InputGroup
        {...props}
        className={mergeClassName(stylex.props(styles.inputGroup).className, className)}
        data-slot="combobox-input-group"
        ref={ref}
      />
    );
  },
);

export const ComboboxInput = React.forwardRef<HTMLInputElement, BaseCombobox.Input.Props>(
  function ComboboxInput({ className, ...props }, ref) {
    return (
      <BaseCombobox.Input
        {...props}
        className={(state) => {
          const generated = stylex.props(styles.input).className;
          const custom = typeof className === "function" ? className(state) : className;
          return custom ? `${generated} ${custom}` : generated;
        }}
        data-slot="combobox-input"
        ref={ref}
      />
    );
  },
);

export const ComboboxShortcut = React.forwardRef<HTMLSpanElement, SpanProps>(
  function ComboboxShortcut({ className, ...props }, ref) {
    return (
      <span
        {...props}
        className={[stylex.props(styles.shortcut).className, className].filter(Boolean).join(" ")}
        data-slot="combobox-shortcut"
        ref={ref}
      />
    );
  },
);

export const ComboboxTrigger = BaseCombobox.Trigger;

export const ComboboxPortal = React.forwardRef<HTMLDivElement, BaseCombobox.Portal.Props>(
  function ComboboxPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseCombobox.Portal
        {...props}
        container={container ?? scopeContainer ?? undefined}
        data-slot="combobox-portal"
        ref={ref}
      />
    );
  },
);

export const ComboboxPositioner = React.forwardRef<HTMLDivElement, BaseCombobox.Positioner.Props>(
  function ComboboxPositioner({ align = "start", className, sideOffset = -36, ...props }, ref) {
    return (
      <BaseCombobox.Positioner
        {...props}
        align={align}
        className={mergeClassName(stylex.props(styles.positioner).className, className)}
        data-slot="combobox-positioner"
        ref={ref}
        sideOffset={sideOffset}
      />
    );
  },
);

export const ComboboxPopup = React.forwardRef<HTMLDivElement, BaseCombobox.Popup.Props>(
  function ComboboxPopup({ className, ...props }, ref) {
    return (
      <BaseCombobox.Popup
        {...props}
        className={mergeClassName(stylex.props(styles.popup).className, className)}
        data-slot="combobox-popup"
        ref={ref}
      />
    );
  },
);

export const ComboboxList = React.forwardRef<HTMLDivElement, BaseCombobox.List.Props>(
  function ComboboxList({ className, ...props }, ref) {
    return (
      <BaseCombobox.List
        {...props}
        className={mergeClassName(stylex.props(styles.list).className, className)}
        data-slot="combobox-list"
        ref={ref}
      />
    );
  },
);

export const ComboboxItem = React.forwardRef<HTMLDivElement, BaseCombobox.Item.Props>(
  function ComboboxItem({ className, ...props }, ref) {
    return (
      <BaseCombobox.Item
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.item,
            state.disabled && styles.itemDisabled,
          ).className;
          const custom = typeof className === "function" ? className(state) : className;
          return custom ? `${generated} ${custom}` : generated;
        }}
        data-slot="combobox-item"
        ref={ref}
      />
    );
  },
);

export const ComboboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  BaseCombobox.ItemIndicator.Props
>(function ComboboxItemIndicator({ children, className, ...props }, ref) {
  return (
    <BaseCombobox.ItemIndicator
      {...props}
      className={mergeClassName(stylex.props(styles.itemIndicator).className, className)}
      data-slot="combobox-item-indicator"
      ref={ref}
    >
      {children === undefined ? (
        <CheckIcon aria-hidden="true" {...stylex.props(styles.indicatorSvg)} />
      ) : (
        children
      )}
    </BaseCombobox.ItemIndicator>
  );
});

export const ComboboxItemText = React.forwardRef<HTMLSpanElement, SpanProps>(
  function ComboboxItemText({ className, ...props }, ref) {
    return (
      <span
        {...props}
        className={[stylex.props(styles.itemText).className, className].filter(Boolean).join(" ")}
        data-slot="combobox-item-text"
        ref={ref}
      />
    );
  },
);

export const ComboboxMarker = React.forwardRef<HTMLSpanElement, SpanProps>(function ComboboxMarker(
  { className, style, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={[stylex.props(styles.marker).className, className].filter(Boolean).join(" ")}
      data-slot="combobox-marker"
      ref={ref}
      style={{ backgroundColor: "currentColor", borderRadius: "50%", ...style }}
    />
  );
});

export const ComboboxEmpty = React.forwardRef<HTMLDivElement, BaseCombobox.Empty.Props>(
  function ComboboxEmpty({ className, ...props }, ref) {
    return (
      <BaseCombobox.Empty
        {...props}
        className={mergeClassName(stylex.props(styles.empty).className, className)}
        data-slot="combobox-empty"
        ref={ref}
      />
    );
  },
);

export const ComboboxStatus = React.forwardRef<HTMLDivElement, BaseCombobox.Status.Props>(
  function ComboboxStatus({ className, ...props }, ref) {
    return (
      <BaseCombobox.Status
        {...props}
        className={mergeClassName(stylex.props(styles.status).className, className)}
        data-slot="combobox-status"
        ref={ref}
      />
    );
  },
);

export const ComboboxGroupLabel = React.forwardRef<HTMLDivElement, BaseCombobox.GroupLabel.Props>(
  function ComboboxGroupLabel({ className, ...props }, ref) {
    return (
      <BaseCombobox.GroupLabel
        {...props}
        className={mergeClassName(stylex.props(styles.groupLabel).className, className)}
        data-slot="combobox-group-label"
        ref={ref}
      />
    );
  },
);

export const ComboboxSeparator = React.forwardRef<HTMLDivElement, BaseCombobox.Separator.Props>(
  function ComboboxSeparator({ className, ...props }, ref) {
    return (
      <BaseCombobox.Separator
        {...props}
        className={mergeClassName(stylex.props(styles.separator).className, className)}
        data-slot="combobox-separator"
        ref={ref}
      />
    );
  },
);

export const ComboboxClear = React.forwardRef<HTMLButtonElement, BaseCombobox.Clear.Props>(
  function ComboboxClear({ children, className, ...props }, ref) {
    return (
      <BaseCombobox.Clear
        {...props}
        className={mergeClassName(stylex.props(styles.clear).className, className)}
        data-slot="combobox-clear"
        ref={ref}
      >
        {children === undefined ? (
          <XIcon aria-hidden="true" {...stylex.props(styles.iconSvg)} />
        ) : (
          children
        )}
      </BaseCombobox.Clear>
    );
  },
);

export const ComboboxChips = BaseCombobox.Chips;
export const ComboboxChipRemove = BaseCombobox.ChipRemove;
export const ComboboxChip = React.forwardRef<HTMLDivElement, BaseCombobox.Chip.Props>(
  function ComboboxChip({ className, ...props }, ref) {
    return (
      <BaseCombobox.Chip
        {...props}
        className={mergeClassName(stylex.props(styles.chip).className, className)}
        data-slot="combobox-chip"
        ref={ref}
      />
    );
  },
);

export const Combobox = {
  Chip: ComboboxChip,
  ChipRemove: ComboboxChipRemove,
  Chips: ComboboxChips,
  Clear: ComboboxClear,
  Collection: ComboboxCollection,
  Empty: ComboboxEmpty,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
  Input: ComboboxInput,
  InputGroup: ComboboxInputGroup,
  Item: ComboboxItem,
  ItemIndicator: ComboboxItemIndicator,
  ItemText: ComboboxItemText,
  Label: ComboboxLabel,
  List: ComboboxList,
  Marker: ComboboxMarker,
  Popup: ComboboxPopup,
  Portal: ComboboxPortal,
  Positioner: ComboboxPositioner,
  Root: ComboboxRoot,
  Row: ComboboxRow,
  Separator: ComboboxSeparator,
  Shortcut: ComboboxShortcut,
  Status: ComboboxStatus,
  Trigger: ComboboxTrigger,
  Value: ComboboxValue,
} as const;
