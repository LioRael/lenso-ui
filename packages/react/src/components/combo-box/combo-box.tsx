"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native combobox, including multiple selection and chips.
 */
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { comboBoxStyles, comboBoxSharedStyles } from "@lenso/tokens/combo-box";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const FullWidthContext = createContext(false);
export function ComboBoxRoot<Value, Multiple extends boolean | undefined = false>({
  fullWidth = false,
  ...props
}: ComboBoxRootProps<Value, Multiple>) {
  return (
    <FullWidthContext value={fullWidth}>
      <BaseCombobox.Root {...props} />
    </FullWidthContext>
  );
}
const InputGroup = styledPart(
  BaseCombobox.InputGroup,
  "combo-box-input-group",
  comboBoxStyles.inputGroup,
);
export type ComboBoxInputGroupProps = ComponentPropsWithRef<typeof InputGroup>;
export function ComboBoxInputGroup({ xstyle, ...props }: ComboBoxInputGroupProps) {
  const fullWidth = useContext(FullWidthContext);
  return <InputGroup {...props} xstyle={[fullWidth && comboBoxSharedStyles.fullWidth, xstyle]} />;
}
export const ComboBoxInput = styledPart(
  BaseCombobox.Input,
  "combo-box-input",
  comboBoxStyles.input,
);
export const ComboBoxValue = BaseCombobox.Value;
export const ComboBoxTrigger = styledPart(
  BaseCombobox.Trigger,
  "combo-box-trigger",
  comboBoxStyles.trigger,
);
const Icon = styledPart(BaseCombobox.Icon, "combo-box-indicator", comboBoxStyles.icon);
export type ComboBoxIndicatorProps = ComponentPropsWithRef<typeof Icon>;
export function ComboBoxIndicator({ children, ...props }: ComboBoxIndicatorProps) {
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
export type ComboBoxPortalProps = ComponentPropsWithRef<typeof BaseCombobox.Portal>;
export function ComboBoxPortal({ container, ...props }: ComboBoxPortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseCombobox.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export const ComboBoxPositioner = styledPart(
  BaseCombobox.Positioner,
  "combo-box-positioner",
  comboBoxSharedStyles.positioner,
);
export const ComboBoxPopover = styledPart(
  BaseCombobox.Popup,
  "combo-box-popover",
  comboBoxSharedStyles.popover,
);
export const ComboBoxList = styledPart(
  BaseCombobox.List,
  "combo-box-list",
  comboBoxSharedStyles.list,
);
export const ComboBoxItem = styledPart(
  BaseCombobox.Item,
  "combo-box-item",
  comboBoxSharedStyles.item,
);
const ItemIndicator = styledPart(
  BaseCombobox.ItemIndicator,
  "combo-box-item-indicator",
  comboBoxSharedStyles.itemIndicator,
);
export type ComboBoxItemIndicatorProps = ComponentPropsWithRef<typeof ItemIndicator>;
export function ComboBoxItemIndicator({ children, ...props }: ComboBoxItemIndicatorProps) {
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
export const ComboBoxLabel = styledPart("label", "combo-box-label", comboBoxSharedStyles.label);
export const ComboBoxGroup = styledPart(BaseCombobox.Group, "combo-box-group");
export const ComboBoxGroupLabel = styledPart(
  BaseCombobox.GroupLabel,
  "combo-box-group-label",
  comboBoxSharedStyles.groupLabel,
);
export const ComboBoxSeparator = styledPart(
  BaseCombobox.Separator,
  "combo-box-separator",
  comboBoxSharedStyles.separator,
);
export const ComboBoxArrow = styledPart(
  BaseCombobox.Arrow,
  "combo-box-arrow",
  comboBoxSharedStyles.arrow,
);
export const ComboBoxEmpty = styledPart(
  BaseCombobox.Empty,
  "combo-box-empty",
  comboBoxStyles.empty,
);
export const ComboBoxClearButton = styledPart(
  BaseCombobox.Clear,
  "combo-box-clear-button",
  comboBoxStyles.clear,
);
export const ComboBoxChips = styledPart(
  BaseCombobox.Chips,
  "combo-box-chips",
  comboBoxStyles.chips,
);
export const ComboBoxChip = styledPart(BaseCombobox.Chip, "combo-box-chip", comboBoxStyles.chip);
export const ComboBoxChipRemove = styledPart(
  BaseCombobox.ChipRemove,
  "combo-box-chip-remove",
  comboBoxStyles.chipRemove,
);
export const ComboBoxCollection = BaseCombobox.Collection;
export const ComboBoxRow = BaseCombobox.Row;
export const ComboBoxStatus = BaseCombobox.Status;
export const ComboBoxBackdrop = BaseCombobox.Backdrop;
export const useComboBoxFilter = BaseCombobox.useFilter;
export type ComboBoxRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple> & { fullWidth?: boolean };
export type ComboBoxInputProps = ComponentPropsWithRef<typeof ComboBoxInput>;
export type ComboBoxTriggerProps = ComponentPropsWithRef<typeof ComboBoxTrigger>;
export type ComboBoxPopoverProps = ComponentPropsWithRef<typeof ComboBoxPopover>;
export type ComboBoxPositionerProps = ComponentPropsWithRef<typeof ComboBoxPositioner>;
export type ComboBoxListProps = ComponentPropsWithRef<typeof ComboBoxList>;
export type ComboBoxItemProps = ComponentPropsWithRef<typeof ComboBoxItem>;
