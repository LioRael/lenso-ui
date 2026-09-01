"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { CheckIcon, XIcon } from "lucide-react";

import type { StyleXProps } from "../shared/stylex-props.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./combobox.stylex.js";

type SpanProps = StyleXProps<React.HTMLAttributes<HTMLSpanElement>>;

interface ComboboxContextValue {
  multiple: boolean;
}

const ComboboxContext = React.createContext<ComboboxContextValue>({
  multiple: false,
});

function stringifyInputValue(
  value: React.ComponentPropsWithoutRef<"input">["defaultValue"],
): string {
  return value == null ? "" : String(value);
}

export type ComboboxRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple> & {
  onInputValueChange?: (value: string, eventDetails: BaseCombobox.Root.ChangeEventDetails) => void;
};

export function ComboboxRoot<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxRootProps<Value, Multiple>,
) {
  const {
    children,
    defaultInputValue,
    inputValue: inputValueProp,
    multiple,
    onInputValueChange,
    ...rootProps
  } = props;
  const [uncontrolledInputValue, setUncontrolledInputValue] = React.useState(() =>
    stringifyInputValue(defaultInputValue),
  );
  const selectionInputPendingRef = React.useRef(false);
  const handleInputValueChange = React.useCallback(
    (nextInputValue: string, eventDetails: BaseCombobox.Root.ChangeEventDetails) => {
      const isItemPress = eventDetails.reason === "item-press";
      const isSelectionSync = selectionInputPendingRef.current && eventDetails.reason === "none";
      const resolvedInputValue = isItemPress || isSelectionSync ? "" : nextInputValue;

      if (isItemPress) {
        selectionInputPendingRef.current = true;
      } else if (eventDetails.reason === "input-change" || eventDetails.reason === "input-clear") {
        selectionInputPendingRef.current = false;
      } else if (!isSelectionSync && eventDetails.reason !== "none") {
        selectionInputPendingRef.current = false;
      }

      onInputValueChange?.(resolvedInputValue, eventDetails);
      if (eventDetails.isCanceled) return;
      if (inputValueProp === undefined) setUncontrolledInputValue(resolvedInputValue);
    },
    [inputValueProp, onInputValueChange],
  );
  const inputValue = inputValueProp === undefined ? uncontrolledInputValue : inputValueProp;
  const contextValue = React.useMemo(() => ({ multiple: multiple === true }), [multiple]);
  const BaseRoot = BaseCombobox.Root as unknown as React.ComponentType<
    ComboboxRootProps<Value, Multiple>
  >;

  return (
    <ComboboxContext.Provider value={contextValue}>
      <BaseRoot
        {...rootProps}
        inputValue={inputValue}
        multiple={multiple}
        onInputValueChange={handleInputValueChange}
      >
        {children}
      </BaseRoot>
    </ComboboxContext.Provider>
  );
}

export const ComboboxLabel = BaseCombobox.Label;
export const ComboboxGroup = BaseCombobox.Group;
export const ComboboxCollection = BaseCombobox.Collection;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxRow = BaseCombobox.Row;

export const ComboboxInputGroup = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.InputGroup.Props>
>(function ComboboxInputGroup({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.InputGroup
      {...props}
      className={stylex.props(styles.inputGroup, xstyle).className}
      data-slot="combobox-input-group"
      ref={ref}
    />
  );
});

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  StyleXProps<BaseCombobox.Input.Props>
>(function ComboboxInput({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Input
      {...props}
      className={stylex.props(styles.input, xstyle).className}
      data-slot="combobox-input"
      ref={ref}
    />
  );
});

export const ComboboxShortcut = React.forwardRef<HTMLSpanElement, SpanProps>(
  function ComboboxShortcut({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        {...stylex.props(styles.shortcut, xstyle)}
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

export const ComboboxPositioner = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Positioner.Props>
>(function ComboboxPositioner({ align = "start", sideOffset = -36, xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Positioner
      {...props}
      align={align}
      className={stylex.props(styles.positioner, xstyle).className}
      data-slot="combobox-positioner"
      ref={ref}
      sideOffset={sideOffset}
    />
  );
});

export const ComboboxPopup = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Popup.Props>
>(function ComboboxPopup({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Popup
      {...props}
      className={stylex.props(styles.popup, xstyle).className}
      data-slot="combobox-popup"
      ref={ref}
    />
  );
});

export const ComboboxList = React.forwardRef<HTMLDivElement, StyleXProps<BaseCombobox.List.Props>>(
  function ComboboxList({ xstyle, ...props }, ref) {
    return (
      <BaseCombobox.List
        {...props}
        className={stylex.props(styles.list, xstyle).className}
        data-slot="combobox-list"
        ref={ref}
      />
    );
  },
);

export const ComboboxItem = React.forwardRef<HTMLDivElement, StyleXProps<BaseCombobox.Item.Props>>(
  function ComboboxItem({ xstyle, ...props }, ref) {
    const { multiple } = React.useContext(ComboboxContext);

    return (
      <BaseCombobox.Item
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.item,
            !multiple && styles.itemSingle,
            state.disabled && styles.itemDisabled,
            xstyle,
          ).className;
          return generated;
        }}
        data-selection-mode={multiple ? "multiple" : "single"}
        data-slot="combobox-item"
        ref={ref}
      />
    );
  },
);

export const ComboboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<BaseCombobox.ItemIndicator.Props>
>(function ComboboxItemIndicator({ children, xstyle, ...props }, ref) {
  const { multiple } = React.useContext(ComboboxContext);
  const keepMounted = props.keepMounted ?? children === undefined;
  const indicatorStyle = multiple ? styles.itemIndicator : styles.itemIndicatorSingle;
  const indicatorSvgStyle = multiple ? styles.indicatorSvg : styles.singleIndicatorSvg;

  return (
    <BaseCombobox.ItemIndicator
      {...props}
      className={stylex.props(indicatorStyle, xstyle).className}
      data-slot="combobox-item-indicator"
      data-selection-mode={multiple ? "multiple" : "single"}
      keepMounted={keepMounted}
      ref={ref}
    >
      {children === undefined ? (
        <CheckIcon aria-hidden="true" {...stylex.props(indicatorSvgStyle)} />
      ) : (
        children
      )}
    </BaseCombobox.ItemIndicator>
  );
});

export const ComboboxItemText = React.forwardRef<HTMLSpanElement, SpanProps>(
  function ComboboxItemText({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        {...stylex.props(styles.itemText, xstyle)}
        data-slot="combobox-item-text"
        ref={ref}
      />
    );
  },
);

export const ComboboxMarker = React.forwardRef<HTMLSpanElement, SpanProps>(function ComboboxMarker(
  { xstyle, ...props },
  ref,
) {
  return (
    <span
      {...props}
      {...stylex.props(styles.marker, xstyle)}
      data-slot="combobox-marker"
      ref={ref}
    />
  );
});

export const ComboboxTrailing = React.forwardRef<HTMLSpanElement, SpanProps>(
  function ComboboxTrailing({ xstyle, ...props }, ref) {
    const { multiple } = React.useContext(ComboboxContext);

    return (
      <span
        {...props}
        {...stylex.props(styles.trailing, !multiple && styles.trailingSingle, xstyle)}
        data-slot="combobox-trailing"
        ref={ref}
      />
    );
  },
);

export const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Empty.Props>
>(function ComboboxEmpty({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Empty
      {...props}
      className={stylex.props(styles.empty, xstyle).className}
      data-slot="combobox-empty"
      ref={ref}
    />
  );
});

export const ComboboxStatus = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Status.Props>
>(function ComboboxStatus({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Status
      {...props}
      className={stylex.props(styles.status, xstyle).className}
      data-slot="combobox-status"
      ref={ref}
    />
  );
});

export const ComboboxGroupLabel = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.GroupLabel.Props>
>(function ComboboxGroupLabel({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.GroupLabel
      {...props}
      className={stylex.props(styles.groupLabel, xstyle).className}
      data-slot="combobox-group-label"
      ref={ref}
    />
  );
});

export const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Separator.Props>
>(function ComboboxSeparator({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Separator
      {...props}
      className={stylex.props(styles.separator, xstyle).className}
      data-slot="combobox-separator"
      ref={ref}
    />
  );
});

export const ComboboxClear = React.forwardRef<
  HTMLButtonElement,
  StyleXProps<BaseCombobox.Clear.Props>
>(function ComboboxClear({ children, xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Clear
      {...props}
      className={stylex.props(styles.clear, xstyle).className}
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
});

export const ComboboxChips = BaseCombobox.Chips;
export const ComboboxChipRemove = BaseCombobox.ChipRemove;
export const ComboboxChip = React.forwardRef<HTMLDivElement, StyleXProps<BaseCombobox.Chip.Props>>(
  function ComboboxChip({ xstyle, ...props }, ref) {
    return (
      <BaseCombobox.Chip
        {...props}
        className={stylex.props(styles.chip, xstyle).className}
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
  Trailing: ComboboxTrailing,
  Trigger: ComboboxTrigger,
  Value: ComboboxValue,
} as const;
