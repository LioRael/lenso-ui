"use client";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI selection/collection API and scoped portals.
 */
import { Select as BaseSelect } from "@base-ui/react/select";
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { selectStyles } from "@lenso/tokens/select";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  isValidElement,
  type ComponentPropsWithRef,
  type RefObject,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { useMenuPopupRef } from "../../utils/interaction/menu.js";
import { assignRef } from "../../utils/interaction/ref.js";

const SelectMotionContext = createContext<{
  trigger: RefObject<HTMLElement | null>;
  popup: RefObject<HTMLDivElement | null>;
  unmount: () => void;
  morphTrigger: boolean;
} | null>(null);

const SelectStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export function SelectRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  morphTrigger = true,
  actionsRef,
  onOpenChange,
  ...props
}: SelectRootProps<Value, Multiple>) {
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  const trigger = useRef<HTMLElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const ownActions = useRef<BaseSelect.Root.Actions>(null);
  const actions = actionsRef ?? ownActions;
  const unmount = useCallback(() => actions.current?.unmount(), [actions]);
  const motion = useMemo(
    () => ({ trigger, popup, unmount, morphTrigger }),
    [unmount, morphTrigger],
  );
  return (
    <SelectStyleContext value={appearance}>
      <SelectMotionContext value={motion}>
        <BaseSelect.Root
          {...props}
          actionsRef={actions}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!open && !details.isCanceled) details.preventUnmountOnClose();
          }}
        />
      </SelectMotionContext>
    </SelectStyleContext>
  );
}
export type SelectTriggerProps = StyleXProps<BaseSelect.Trigger.Props> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function SelectTrigger({
  ref,
  render,
  variant,
  fullWidth,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectTriggerProps) {
  const inherited = useContext(SelectStyleContext);
  const ownPresentation = !render || (isValidElement(render) && typeof render.type === "string");
  const motion = useContext(SelectMotionContext)!;
  const register = useCallback(
    (node: HTMLButtonElement | null) => {
      const own = assignRef(motion.trigger, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [motion.trigger, ref],
  );
  const compiled = stylex.props(
    ownPresentation && popupButtonStyles.root,
    ownPresentation && selectStyles.validation,
    ownPresentation && (variant ?? inherited.variant) === "secondary" && selectStyles.secondary,
    ownPresentation && (fullWidth ?? inherited.fullWidth) && selectStyles.fullWidth,
    xstyle,
  );
  return (
    <BaseSelect.Trigger
      {...props}
      ref={register}
      render={render}
      {...compiled}
      style={mergeStyle<BaseSelect.Trigger.State>(compiled.style, style)}
      data-slot={slot ?? "select-trigger"}
    />
  );
}
export function SelectValue({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Value.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.value, xstyle);
  return (
    <BaseSelect.Value
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Value.State>(compiled.style, style)}
      data-slot={slot ?? "select-value"}
    />
  );
}
export type SelectIndicatorProps = StyleXProps<BaseSelect.Icon.Props> & { "data-slot"?: unknown };
export function SelectIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectIndicatorProps) {
  const compiled = stylex.props(selectStyles.indicator, xstyle);
  return (
    <BaseSelect.Icon
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Icon.State>(compiled.style, style)}
      data-slot={slot ?? "select-indicator"}
    >
      {children ?? (
        <svg width="14" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m5 5 3-3 3 3 M5 11l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </BaseSelect.Icon>
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
export function SelectPositioner({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Positioner.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.positioner, xstyle);
  return (
    <BaseSelect.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Positioner.State>(compiled.style, style)}
      data-slot={slot ?? "select-positioner"}
    />
  );
}
export function SelectPopover({
  ref,
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Popup.Props> & { "data-slot"?: unknown }) {
  const motion = useContext(SelectMotionContext)!;
  const popupRef = useMenuPopupRef(
    ref,
    motion.popup,
    motion.trigger,
    motion.unmount,
    motion.morphTrigger,
    true,
    "select",
  );
  const compiled = stylex.props(
    materialStyles.root,
    menuStyles.popup,
    menuStyles.morph,
    selectStyles.popover,
    selectStyles.typography,
    materialStyles.accessible,
    xstyle,
  );
  return (
    <BaseSelect.Popup
      {...props}
      ref={popupRef}
      {...compiled}
      style={mergeStyle<BaseSelect.Popup.State>(compiled.style, style)}
      data-slot={slot ?? "select-popover"}
      data-material="glass-medium"
      data-menu-elastic="false"
    >
      <div aria-hidden="true" data-slot="select-surface" {...stylex.props(menuStyles.surface)}>
        <MaterialBackground variant="glass-medium" sourceAnchor={motion.trigger} liveBackdrop />
      </div>
      <div aria-hidden="true" inert data-slot="select-glyph" {...stylex.props(menuStyles.glyph)} />
      {children}
    </BaseSelect.Popup>
  );
}
export function SelectList({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.List.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(menuStyles.content, selectStyles.list, xstyle);
  return (
    <BaseSelect.List
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.List.State>(compiled.style, style)}
      data-slot={slot ?? "select-list"}
      data-select-content=""
    >
      <div data-slot="select-plate" aria-hidden="true" {...stylex.props(menuStyles.plate)} />
      {children}
    </BaseSelect.List>
  );
}
export function SelectItem({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Omit<BaseSelect.Item.Props, "ref"> & React.RefAttributes<HTMLElement>> & {
  "data-slot"?: unknown;
}) {
  const { variant } = useContext(SelectStyleContext);
  const compiled = stylex.props(
    menuItemStyles.root,
    selectStyles.item,
    variant === "primary" && selectStyles.primaryItem,
    xstyle,
  );
  return (
    <BaseSelect.Item
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Item.State>(compiled.style, style)}
      data-slot={slot ?? "select-item"}
    />
  );
}
export function SelectItemText({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.ItemText.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.itemText, xstyle);
  return (
    <BaseSelect.ItemText
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.ItemText.State>(compiled.style, style)}
      data-slot={slot ?? "select-item-text"}
    />
  );
}
export type SelectItemIndicatorProps = StyleXProps<BaseSelect.ItemIndicator.Props> & {
  "data-slot"?: unknown;
};
export function SelectItemIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectItemIndicatorProps) {
  const compiled = stylex.props(menuItemStyles.indicator, xstyle);
  return (
    <BaseSelect.ItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.ItemIndicator.State>(compiled.style, style)}
      data-slot={slot ?? "select-item-indicator"}
    >
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
    </BaseSelect.ItemIndicator>
  );
}
export function SelectLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Label.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.label, xstyle);
  return (
    <BaseSelect.Label
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Label.State>(compiled.style, style)}
      data-slot={slot ?? "select-label"}
    />
  );
}
export function SelectGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Group.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return (
    <BaseSelect.Group
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Group.State>(compiled.style, style)}
      data-slot={slot ?? "select-group"}
    />
  );
}
export function SelectGroupLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.GroupLabel.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(menuSectionStyles.label, xstyle);
  return (
    <BaseSelect.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.GroupLabel.State>(compiled.style, style)}
      data-slot={slot ?? "select-group-label"}
    />
  );
}
export function SelectSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Separator.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(menuStyles.separator, xstyle);
  return (
    <BaseSelect.Separator
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Separator.State>(compiled.style, style)}
      data-slot={slot ?? "select-separator"}
    />
  );
}
export function SelectArrow({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Arrow.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.arrow, xstyle);
  return (
    <BaseSelect.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Arrow.State>(compiled.style, style)}
      data-slot={slot ?? "select-arrow"}
    />
  );
}
export const SelectScrollUpArrow = BaseSelect.ScrollUpArrow;
export const SelectScrollDownArrow = BaseSelect.ScrollDownArrow;
export const SelectBackdrop = BaseSelect.Backdrop;
export type SelectRootProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  /** Keep the trigger visible and animate the popup independently when false. */
  morphTrigger?: boolean;
};
export type SelectValueProps = ComponentPropsWithRef<typeof SelectValue>;
export type SelectPopoverProps = ComponentPropsWithRef<typeof SelectPopover>;
export type SelectPositionerProps = ComponentPropsWithRef<typeof SelectPositioner>;
export type SelectListProps = ComponentPropsWithRef<typeof SelectList>;
export type SelectItemProps = ComponentPropsWithRef<typeof SelectItem>;
