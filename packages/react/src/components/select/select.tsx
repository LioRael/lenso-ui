"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI selection/collection API and scoped portals.
 */
import { Select as BaseSelect } from "@base-ui/react/select";
import { selectStyles } from "@lenso/tokens/select";
import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const SelectStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export function SelectRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  ...props
}: SelectRootProps<Value, Multiple>) {
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <SelectStyleContext value={appearance}>
      <BaseSelect.Root {...props} />
    </SelectStyleContext>
  );
}
const Trigger = styledPart(BaseSelect.Trigger, "select-trigger", selectStyles.trigger);
export type SelectTriggerProps = ComponentPropsWithRef<typeof Trigger> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function SelectTrigger({ variant, fullWidth, xstyle, ...props }: SelectTriggerProps) {
  const inherited = useContext(SelectStyleContext);
  return (
    <Trigger
      {...props}
      xstyle={[
        (variant ?? inherited.variant) === "secondary" && selectStyles.secondary,
        (fullWidth ?? inherited.fullWidth) && selectStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
export const SelectValue = styledPart(BaseSelect.Value, "select-value", selectStyles.value);
const Icon = styledPart(BaseSelect.Icon, "select-indicator", selectStyles.indicator);
export type SelectIndicatorProps = ComponentPropsWithRef<typeof Icon>;
export function SelectIndicator({ children, ...props }: SelectIndicatorProps) {
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
export type SelectPortalProps = ComponentPropsWithRef<typeof BaseSelect.Portal>;
export function SelectPortal({ container, ...props }: SelectPortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseSelect.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export const SelectPositioner = styledPart(
  BaseSelect.Positioner,
  "select-positioner",
  selectStyles.positioner,
);
export const SelectPopover = styledPart(BaseSelect.Popup, "select-popover", selectStyles.popover);
export const SelectList = styledPart(BaseSelect.List, "select-list", selectStyles.list);
export const SelectItem = styledPart(BaseSelect.Item, "select-item", selectStyles.item);
export const SelectItemText = styledPart(
  BaseSelect.ItemText,
  "select-item-text",
  selectStyles.itemText,
);
const ItemIndicator = styledPart(
  BaseSelect.ItemIndicator,
  "select-item-indicator",
  selectStyles.itemIndicator,
);
export type SelectItemIndicatorProps = ComponentPropsWithRef<typeof ItemIndicator>;
export function SelectItemIndicator({ children, ...props }: SelectItemIndicatorProps) {
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
export const SelectLabel = styledPart(BaseSelect.Label, "select-label", selectStyles.label);
export const SelectGroup = styledPart(BaseSelect.Group, "select-group");
export const SelectGroupLabel = styledPart(
  BaseSelect.GroupLabel,
  "select-group-label",
  selectStyles.groupLabel,
);
export const SelectSeparator = styledPart(
  BaseSelect.Separator,
  "select-separator",
  selectStyles.separator,
);
export const SelectArrow = styledPart(BaseSelect.Arrow, "select-arrow", selectStyles.arrow);
export const SelectScrollUpArrow = BaseSelect.ScrollUpArrow;
export const SelectScrollDownArrow = BaseSelect.ScrollDownArrow;
export const SelectBackdrop = BaseSelect.Backdrop;
export type SelectRootProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export type SelectValueProps = ComponentPropsWithRef<typeof SelectValue>;
export type SelectPopoverProps = ComponentPropsWithRef<typeof SelectPopover>;
export type SelectPositionerProps = ComponentPropsWithRef<typeof SelectPositioner>;
export type SelectListProps = ComponentPropsWithRef<typeof SelectList>;
export type SelectItemProps = ComponentPropsWithRef<typeof SelectItem>;
