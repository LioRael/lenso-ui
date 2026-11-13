"use client";

import * as SdkCommand from "@ui-sdk/react/command";
import { DialogContent, DialogBackdrop, DialogClose } from "@ui-sdk/react/dialog";
import { slotRender } from "../../utils/sdk-render.js";
import { useGlassRef } from "@lenso/glass/react";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { ScrollShadow } from "../scroll-shadow/index.js";
import { GlassButton } from "../glass-button/index.js";
import { CloseButton } from "../close-button/index.js";
import { SearchField } from "../search-field/index.js";
import { Kbd } from "../kbd/index.js";
import { commandStyles as styles } from "@lenso/tokens/command";
import * as stylex from "@stylexjs/stylex";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";

// The native popup owns the backdrop across its opacity animation.
const CommandMaterialContext = createContext(true);

export type CommandRootProps = StyleXProps<SdkCommand.CommandProps>;
export function CommandRoot({
  xstyle,
  style,
  ref,
  children,
  render,
  "data-lenso-slot": slot,
  ...props
}: CommandRootProps) {
  const ownMaterial = useContext(CommandMaterialContext);
  const glassRef = useGlassRef<HTMLDivElement>(
    ref,
    ownMaterial,
    false,
    "glass-medium",
    undefined,
    false,
    true,
  );
  const compiled = stylex.props(
    materialStyles.root,
    ownMaterial && liquidMaterialStyles.small,
    ownMaterial && liquidMaterialStyles.medium,
    materialStyles.accessible,
    styles.root,
    xstyle,
  );
  return (
    <SdkCommand.Command
      {...props}
      {...compiled}
      ref={glassRef}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command", render)}
    >
      {children}
    </SdkCommand.Command>
  );
}

export type CommandItemProps = StyleXProps<ComponentPropsWithRef<typeof SdkCommand.CommandItem>> & {
  indent?: boolean;
};
export function CommandItem({
  indent = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemProps) {
  const compiled = stylex.props(styles.item, indent && styles.indentedItem, xstyle);
  return (
    <SdkCommand.CommandItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-item", props.render)}
    />
  );
}

export type CommandInputProps = StyleXProps<ComponentPropsWithRef<typeof SdkCommand.CommandInput>>;
export function CommandInput({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ref,
  ...props
}: CommandInputProps) {
  const focusRef = useFocusMethodRef(ref);
  const compiled = stylex.props(styles.input, xstyle);
  return (
    <SdkCommand.CommandInput
      ref={focusRef}
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("input", slot ?? "command-input", props.render)}
    />
  );
}

export type CommandListProps = StyleXProps<ComponentPropsWithRef<typeof SdkCommand.CommandList>>;
export function CommandList({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandListProps) {
  const compiled = stylex.props(styles.list, xstyle);
  return (
    <SdkCommand.CommandList
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-list", props.render)}
    />
  );
}

export type CommandGroupProps = StyleXProps<ComponentPropsWithRef<typeof SdkCommand.CommandGroup>>;
export function CommandGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandGroupProps) {
  const compiled = stylex.props(xstyle);
  return (
    <SdkCommand.CommandGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-group", props.render)}
    />
  );
}

export type CommandGroupLabelProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkCommand.CommandGroupLabel>
>;
export function CommandGroupLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandGroupLabelProps) {
  const compiled = stylex.props(styles.sectionLabel, xstyle);
  return (
    <SdkCommand.CommandGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-group-label", props.render)}
    />
  );
}

export type CommandSeparatorProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkCommand.CommandSeparator>
>;
export function CommandSeparator({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandSeparatorProps) {
  const compiled = stylex.props(styles.separator, xstyle);
  return (
    <SdkCommand.CommandSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-separator", props.render)}
    />
  );
}

export type CommandEmptyProps = StyleXProps<ComponentPropsWithRef<typeof SdkCommand.CommandEmpty>>;
export function CommandEmpty({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandEmptyProps) {
  const compiled = stylex.props(styles.empty, xstyle);
  return (
    <SdkCommand.CommandEmpty
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-empty", props.render)}
    />
  );
}

export type CommandStatusProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkCommand.CommandStatus>
>;
export function CommandStatus({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandStatusProps) {
  const compiled = stylex.props(styles.status, xstyle);
  return (
    <SdkCommand.CommandStatus
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "command-status", props.render)}
    />
  );
}

export type CommandBackdropProps = StyleXProps<ComponentPropsWithRef<typeof DialogBackdrop>>;
export function CommandBackdrop({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandBackdropProps) {
  const compiled = stylex.props(styles.backdrop, xstyle);
  return (
    <DialogBackdrop
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-backdrop"}
    />
  );
}

export type CommandContentProps = CommandRootProps & {
  contentProps?: ComponentPropsWithRef<typeof DialogContent> & { "data-lenso-slot"?: string };
};
export function CommandContent({ contentProps, xstyle, ...props }: CommandContentProps) {
  const glassRef = useGlassRef(
    contentProps?.ref,
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
    styles.popup,
  );
  return (
    <DialogContent
      {...contentProps}
      ref={glassRef}
      {...compiled}
      className={[compiled.className, contentProps?.className].filter(Boolean).join(" ")}
      style={mergeStyle(compiled.style, contentProps?.style)}
      data-lenso-slot={contentProps?.["data-lenso-slot"] ?? "command-content"}
    >
      <CommandMaterialContext value={false}>
        <CommandRoot {...props} xstyle={xstyle} />
      </CommandMaterialContext>
    </DialogContent>
  );
}

export type CommandViewportProps = ComponentPropsWithRef<typeof ScrollShadow>;
export function CommandViewport({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandViewportProps) {
  return (
    <ScrollShadow
      size={24}
      {...props}
      xstyle={[styles.viewport, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "command-viewport"}
    />
  );
}

export type CommandSearchIconProps = ComponentPropsWithRef<typeof SearchField.SearchIcon>;
export function CommandSearchIcon({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandSearchIconProps) {
  return (
    <SearchField.SearchIcon
      {...props}
      xstyle={[styles.searchIcon, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "command-searchicon"}
    />
  );
}

export type CommandKeyProps = ComponentPropsWithRef<typeof Kbd>;
export function CommandKey({ xstyle, style, "data-lenso-slot": slot, ...props }: CommandKeyProps) {
  return (
    <Kbd
      variant="light"
      {...props}
      xstyle={[styles.key, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "command-key"}
    />
  );
}

export type CommandActionKeyProps = ComponentPropsWithRef<typeof Kbd>;
export function CommandActionKey({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandActionKeyProps) {
  return (
    <Kbd
      variant="light"
      {...props}
      xstyle={[styles.actionKey, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "command-actionkey"}
    />
  );
}

export type CommandActionProps = ComponentPropsWithRef<typeof GlassButton>;
export function CommandAction({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandActionProps) {
  return (
    <GlassButton
      size="sm"
      {...props}
      xstyle={[styles.action, xstyle]}
      style={style}
      data-lenso-slot={slot ?? "command-action"}
    />
  );
}

export type CommandHeaderProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandHeader({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandHeaderProps) {
  const compiled = stylex.props(styles.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-header"}
    />
  );
}

export type CommandInputGroupProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandInputGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandInputGroupProps) {
  const compiled = stylex.props(styles.inputGroup, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-input-group"}
    />
  );
}

export type CommandSectionLabelProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandSectionLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandSectionLabelProps) {
  const compiled = stylex.props(styles.sectionLabel, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-section-label"}
    />
  );
}

export type CommandIconProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandIcon({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandIconProps) {
  const compiled = stylex.props(styles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-icon"}
    />
  );
}

export type CommandItemBodyProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemBody({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemBodyProps) {
  const compiled = stylex.props(styles.itemBody, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-item-body"}
    />
  );
}

export type CommandItemContentProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemContent({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemContentProps) {
  const compiled = stylex.props(styles.itemContent, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-item-content"}
    />
  );
}

export type CommandItemTextProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemText({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemTextProps) {
  const compiled = stylex.props(styles.itemText, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-item-text"}
    />
  );
}

export type CommandItemDescriptionProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemDescription({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemDescriptionProps) {
  const compiled = stylex.props(styles.itemDescription, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-item-description"}
    />
  );
}

export type CommandItemMetaProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandItemMeta({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandItemMetaProps) {
  const compiled = stylex.props(styles.itemMeta, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-item-meta"}
    />
  );
}

export type CommandMessageProps = StyleXProps<ComponentPropsWithRef<"div">>;
export function CommandMessage({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandMessageProps) {
  const compiled = stylex.props(styles.message, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-message"}
    />
  );
}

export type CommandFooterProps = StyleXProps<ComponentPropsWithRef<"footer">>;
export function CommandFooter({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandFooterProps) {
  const compiled = stylex.props(styles.footer, xstyle);
  return (
    <footer
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-footer"}
    />
  );
}

export type CommandHintProps = StyleXProps<ComponentPropsWithRef<"span">>;
export function CommandHint({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: CommandHintProps) {
  const compiled = stylex.props(styles.hint, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-hint"}
    />
  );
}

export type CommandCloseProps = StyleXProps<ComponentPropsWithRef<typeof DialogClose>>;
export function CommandClose({
  xstyle,
  style,
  children = <CommandKey>esc</CommandKey>,
  render = <CloseButton xstyle={[styles.close, xstyle]} />,
  "data-lenso-slot": slot,
  ...props
}: CommandCloseProps) {
  const compiled = stylex.props(styles.close, xstyle);
  return (
    <DialogClose
      aria-label="Close"
      {...props}
      render={render}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "command-close"}
    >
      {children}
    </DialogClose>
  );
}
