"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI combobox with popup search; no React Aria Filter adapter.
 */
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import {
  autocompleteStyles,
  autocompleteFieldStyles,
  autocompleteSharedStyles,
} from "@lenso/tokens/autocomplete";
import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const AutocompleteStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export function AutocompleteRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  ...props
}: AutocompleteRootProps<Value, Multiple>) {
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <AutocompleteStyleContext value={appearance}>
      <BaseCombobox.Root {...props} />
    </AutocompleteStyleContext>
  );
}
export const AutocompleteInputGroup = styledPart(
  BaseCombobox.InputGroup,
  "autocomplete-input-group",
  autocompleteFieldStyles.inputGroup,
);
export const AutocompleteInput = styledPart(
  BaseCombobox.Input,
  "autocomplete-input",
  autocompleteStyles.input,
);
export const AutocompleteValue = BaseCombobox.Value;
const Trigger = styledPart(
  BaseCombobox.Trigger,
  "autocomplete-trigger",
  autocompleteSharedStyles.trigger,
);
export type AutocompleteTriggerProps = ComponentPropsWithRef<typeof Trigger>;
export function AutocompleteTrigger({ xstyle, ...props }: AutocompleteTriggerProps) {
  const inherited = useContext(AutocompleteStyleContext);
  return (
    <Trigger
      {...props}
      xstyle={[
        inherited.variant === "secondary" && autocompleteSharedStyles.secondary,
        inherited.fullWidth && autocompleteSharedStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
const Icon = styledPart(
  BaseCombobox.Icon,
  "autocomplete-indicator",
  autocompleteSharedStyles.indicator,
);
export type AutocompleteIndicatorProps = ComponentPropsWithRef<typeof Icon>;
export function AutocompleteIndicator({ children, ...props }: AutocompleteIndicatorProps) {
  return (
    <Icon {...props}>
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Icon>
  );
}
export type AutocompletePortalProps = ComponentPropsWithRef<typeof BaseCombobox.Portal>;
export function AutocompletePortal({ container, ...props }: AutocompletePortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseCombobox.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export const AutocompletePositioner = styledPart(
  BaseCombobox.Positioner,
  "autocomplete-positioner",
  autocompleteSharedStyles.positioner,
);
export const AutocompletePopover = styledPart(
  BaseCombobox.Popup,
  "autocomplete-popover",
  autocompleteStyles.popover,
);
export const AutocompleteList = styledPart(
  BaseCombobox.List,
  "autocomplete-list",
  autocompleteStyles.list,
);
export const AutocompleteItem = styledPart(
  BaseCombobox.Item,
  "autocomplete-item",
  autocompleteSharedStyles.item,
);
const ItemIndicator = styledPart(
  BaseCombobox.ItemIndicator,
  "autocomplete-item-indicator",
  autocompleteSharedStyles.itemIndicator,
);
export type AutocompleteItemIndicatorProps = ComponentPropsWithRef<typeof ItemIndicator>;
export function AutocompleteItemIndicator({ children, ...props }: AutocompleteItemIndicatorProps) {
  return (
    <ItemIndicator {...props}>
      {children ?? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="m2 6 2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </ItemIndicator>
  );
}
export const AutocompleteLabel = styledPart(
  BaseCombobox.Label,
  "autocomplete-label",
  autocompleteSharedStyles.label,
);
export const AutocompleteGroup = styledPart(BaseCombobox.Group, "autocomplete-group");
export const AutocompleteGroupLabel = styledPart(
  BaseCombobox.GroupLabel,
  "autocomplete-group-label",
  autocompleteSharedStyles.groupLabel,
);
export const AutocompleteSeparator = styledPart(
  BaseCombobox.Separator,
  "autocomplete-separator",
  autocompleteSharedStyles.separator,
);
export const AutocompleteArrow = styledPart(
  BaseCombobox.Arrow,
  "autocomplete-arrow",
  autocompleteSharedStyles.arrow,
);
export const AutocompleteEmpty = styledPart(
  BaseCombobox.Empty,
  "autocomplete-empty",
  autocompleteFieldStyles.empty,
);
export const AutocompleteClearButton = styledPart(
  BaseCombobox.Clear,
  "autocomplete-clear-button",
  autocompleteFieldStyles.clear,
);
export const AutocompleteChips = styledPart(
  BaseCombobox.Chips,
  "autocomplete-chips",
  autocompleteFieldStyles.chips,
);
export const AutocompleteChip = styledPart(
  BaseCombobox.Chip,
  "autocomplete-chip",
  autocompleteFieldStyles.chip,
);
export const AutocompleteChipRemove = styledPart(
  BaseCombobox.ChipRemove,
  "autocomplete-chip-remove",
  autocompleteFieldStyles.chipRemove,
);
export const AutocompleteCollection = BaseCombobox.Collection;
export const AutocompleteRow = BaseCombobox.Row;
export const AutocompleteStatus = BaseCombobox.Status;
export const AutocompleteBackdrop = BaseCombobox.Backdrop;
export const useAutocompleteFilter = BaseCombobox.useFilter;
export type AutocompleteRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export type AutocompleteInputProps = ComponentPropsWithRef<typeof AutocompleteInput>;
export type AutocompletePopoverProps = ComponentPropsWithRef<typeof AutocompletePopover>;
export type AutocompletePositionerProps = ComponentPropsWithRef<typeof AutocompletePositioner>;
export type AutocompleteListProps = ComponentPropsWithRef<typeof AutocompleteList>;
export type AutocompleteItemProps = ComponentPropsWithRef<typeof AutocompleteItem>;
