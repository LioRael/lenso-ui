"use client";

import {
  Command as Primitive,
  type CommandRootProps as PrimitiveRootProps,
  type CommandItemProps as PrimitiveItemProps,
} from "@lenso/primitives/command";
import { Dialog } from "@base-ui/react/dialog";
import { useRender } from "@base-ui/react/use-render";
import { useGlassRef } from "@lenso/glass/react";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { ScrollShadow } from "../scroll-shadow/index.js";
import { GlassButton } from "../glass-button/index.js";
import { CloseButton } from "../close-button/index.js";
import { SearchField } from "../search-field/index.js";
import { Kbd } from "../kbd/index.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { commandStyles as styles } from "@lenso/tokens/command";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";

export type CommandRootProps<Value> = PrimitiveRootProps<Value> &
  Pick<StyleXProps<ComponentPropsWithRef<"div">>, "xstyle" | "style" | "ref" | "data-slot"> & {
    render?: useRender.RenderProp;
  };
export function CommandRoot<Value>({
  xstyle,
  style,
  ref,
  children,
  render,
  "data-slot": slot,
  ...props
}: CommandRootProps<Value>) {
  const glassRef = useGlassRef<HTMLDivElement>(
    ref,
    true,
    false,
    "glass-medium",
    undefined,
    false,
    true,
  );
  const compiled = stylex.props(
    materialStyles.root,
    liquidMaterialStyles.small,
    liquidMaterialStyles.medium,
    materialStyles.accessible,
    styles.root,
    xstyle,
  );
  const element = useRender({
    render,
    ref: glassRef,
    props: {
      ...compiled,
      style: mergeStyle(compiled.style, style),
      "data-slot": slot ?? "command",
      children,
    },
  });
  return <Primitive.Root {...props}>{element}</Primitive.Root>;
}

export type CommandItemProps<Value = string> = StyleXProps<PrimitiveItemProps<Value>> & {
  indent?: boolean;
};
export function CommandItem<Value = string>({
  indent = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemProps<Value>) {
  const compiled = stylex.props(styles.item, indent && styles.indentedItem, xstyle);
  return (
    <Primitive.Item
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item"}
    />
  );
}

export type CommandInputProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Input>>;
export function CommandInput({
  xstyle,
  style,
  "data-slot": slot,
  ref,
  ...props
}: CommandInputProps) {
  const focusRef = useFocusMethodRef(ref);
  const compiled = stylex.props(styles.input, xstyle);
  return (
    <Primitive.Input
      ref={focusRef}
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-input"}
    />
  );
}

export type CommandListProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.List>>;
export function CommandList({ xstyle, style, "data-slot": slot, ...props }: CommandListProps) {
  const compiled = stylex.props(styles.list, xstyle);
  return (
    <Primitive.List
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-list"}
    />
  );
}

export type CommandGroupProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Group>>;
export function CommandGroup({ xstyle, style, "data-slot": slot, ...props }: CommandGroupProps) {
  const compiled = stylex.props(xstyle);
  return (
    <Primitive.Group
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-group"}
    />
  );
}

export type CommandGroupLabelProps = StyleXProps<
  ComponentPropsWithRef<typeof Primitive.GroupLabel>
>;
export function CommandGroupLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandGroupLabelProps) {
  const compiled = stylex.props(styles.sectionLabel, xstyle);
  return (
    <Primitive.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-group-label"}
    />
  );
}

export type CommandSeparatorProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Separator>>;
export function CommandSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandSeparatorProps) {
  const compiled = stylex.props(styles.separator, xstyle);
  return (
    <Primitive.Separator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-separator"}
    />
  );
}

export type CommandEmptyProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Empty>>;
export function CommandEmpty({ xstyle, style, "data-slot": slot, ...props }: CommandEmptyProps) {
  const compiled = stylex.props(styles.empty, xstyle);
  return (
    <Primitive.Empty
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-empty"}
    />
  );
}

export type CommandStatusProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Status>>;
export function CommandStatus({ xstyle, style, "data-slot": slot, ...props }: CommandStatusProps) {
  const compiled = stylex.props(styles.status, xstyle);
  return (
    <Primitive.Status
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-status"}
    />
  );
}

export type CommandClearProps = StyleXProps<ComponentPropsWithRef<typeof Primitive.Clear>>;
export function CommandClear({
  xstyle,
  style,
  children = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4.5 4.5 7 7m0-7-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "data-slot": slot,
  ...props
}: CommandClearProps) {
  const compiled = stylex.props(styles.clear, xstyle);
  return (
    <Primitive.Clear
      aria-label="Clear search"
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-clear"}
    >
      {children}
    </Primitive.Clear>
  );
}

export const CommandCollection: typeof Primitive.Collection = Primitive.Collection;
export const useCommandFilter: typeof Primitive.useFilter = Primitive.useFilter;

export type CommandBackdropProps = StyleXProps<ComponentPropsWithRef<typeof Dialog.Backdrop>>;
export function CommandBackdrop({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandBackdropProps) {
  const compiled = stylex.props(styles.backdrop, xstyle);
  return (
    <Dialog.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-backdrop"}
    />
  );
}

export type CommandPopupProps<Value> = Omit<CommandRootProps<Value>, "render"> & {
  popupProps?: ComponentPropsWithRef<typeof Dialog.Popup> & {
    [attribute: `data-${string}`]: unknown;
  };
};
export function CommandPopup<Value>({ popupProps, xstyle, ...props }: CommandPopupProps<Value>) {
  return (
    <CommandRoot
      {...props}
      xstyle={[styles.popup, xstyle]}
      render={<Dialog.Popup {...popupProps} />}
    />
  );
}

export function CommandPortal({
  container,
  children,
  ...props
}: ComponentPropsWithRef<typeof Dialog.Portal>) {
  const themed = useThemePortalContainer();
  return (
    <Dialog.Portal
      {...props}
      container={container === undefined ? (themed ?? undefined) : container}
    >
      <div data-lenso-backdrop="live" {...stylex.props(styles.opticalScope)}>
        {children}
      </div>
    </Dialog.Portal>
  );
}

export type CommandViewportProps = ComponentPropsWithRef<typeof ScrollShadow>;
export function CommandViewport({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandViewportProps) {
  return (
    <ScrollShadow
      size={24}
      {...props}
      xstyle={[styles.viewport, xstyle]}
      style={style}
      data-slot={slot ?? "command-viewport"}
    />
  );
}

export type CommandSearchIconProps = ComponentPropsWithRef<typeof SearchField.SearchIcon>;
export function CommandSearchIcon({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandSearchIconProps) {
  return (
    <SearchField.SearchIcon
      {...props}
      xstyle={[styles.searchIcon, xstyle]}
      style={style}
      data-slot={slot ?? "command-searchicon"}
    />
  );
}

export type CommandKeyProps = ComponentPropsWithRef<typeof Kbd>;
export function CommandKey({ xstyle, style, "data-slot": slot, ...props }: CommandKeyProps) {
  return (
    <Kbd
      variant="light"
      {...props}
      xstyle={[styles.key, xstyle]}
      style={style}
      data-slot={slot ?? "command-key"}
    />
  );
}

export type CommandActionKeyProps = ComponentPropsWithRef<typeof Kbd>;
export function CommandActionKey({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandActionKeyProps) {
  return (
    <Kbd
      variant="light"
      {...props}
      xstyle={[styles.actionKey, xstyle]}
      style={style}
      data-slot={slot ?? "command-actionkey"}
    />
  );
}

export type CommandActionProps = ComponentPropsWithRef<typeof GlassButton>;
export function CommandAction({ xstyle, style, "data-slot": slot, ...props }: CommandActionProps) {
  return (
    <GlassButton
      size="sm"
      {...props}
      xstyle={[styles.action, xstyle]}
      style={style}
      data-slot={slot ?? "command-action"}
    />
  );
}

export type CommandHeaderProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandHeader({ xstyle, style, "data-slot": slot, ...props }: CommandHeaderProps) {
  const compiled = stylex.props(styles.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-header"}
    />
  );
}

export type CommandInputGroupProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandInputGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandInputGroupProps) {
  const compiled = stylex.props(styles.inputGroup, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-input-group"}
    />
  );
}

export type CommandSectionLabelProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandSectionLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandSectionLabelProps) {
  const compiled = stylex.props(styles.sectionLabel, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-section-label"}
    />
  );
}

export type CommandIconProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandIcon({ xstyle, style, "data-slot": slot, ...props }: CommandIconProps) {
  const compiled = stylex.props(styles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-icon"}
    />
  );
}

export type CommandItemBodyProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemBody({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemBodyProps) {
  const compiled = stylex.props(styles.itemBody, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item-body"}
    />
  );
}

export type CommandItemContentProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemContent({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemContentProps) {
  const compiled = stylex.props(styles.itemContent, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item-content"}
    />
  );
}

export type CommandItemTextProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemText({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemTextProps) {
  const compiled = stylex.props(styles.itemText, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item-text"}
    />
  );
}

export type CommandItemDescriptionProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemDescription({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemDescriptionProps) {
  const compiled = stylex.props(styles.itemDescription, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item-description"}
    />
  );
}

export type CommandItemMetaProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemMeta({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemMetaProps) {
  const compiled = stylex.props(styles.itemMeta, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-item-meta"}
    />
  );
}

export type CommandMessageProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandMessage({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandMessageProps) {
  const compiled = stylex.props(styles.message, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-message"}
    />
  );
}

export type CommandFooterProps = StyleXProps<ComponentPropsWithRef<"footer">>;
export function CommandFooter({ xstyle, style, "data-slot": slot, ...props }: CommandFooterProps) {
  const compiled = stylex.props(styles.footer, xstyle);
  return (
    <footer
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-footer"}
    />
  );
}

export type CommandHintProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandHint({ xstyle, style, "data-slot": slot, ...props }: CommandHintProps) {
  const compiled = stylex.props(styles.hint, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-hint"}
    />
  );
}

export type CommandCloseProps = StyleXProps<ComponentPropsWithRef<typeof Dialog.Close>>;
export function CommandClose({
  xstyle,
  style,
  children = <CommandKey>esc</CommandKey>,
  render = <CloseButton xstyle={[styles.close, xstyle]} />,
  "data-slot": slot,
  ...props
}: CommandCloseProps) {
  const compiled = stylex.props(styles.close, xstyle);
  return (
    <Dialog.Close
      aria-label="Close"
      {...props}
      render={render}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={slot ?? "command-close"}
    >
      {children}
    </Dialog.Close>
  );
}
