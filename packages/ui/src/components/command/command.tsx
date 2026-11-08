"use client";

import {
  Command as Primitive,
  type CommandRootProps as PrimitiveRootProps,
  type CommandItemProps as PrimitiveItemProps,
} from "@lenso/primitives/command";
import { commandStyles as styles } from "@lenso/tokens/command";
import * as stylex from "@stylexjs/stylex";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";

export type CommandRootProps<Value> = PrimitiveRootProps<Value> &
  Pick<StyleXProps<ComponentPropsWithRef<"div">>, "xstyle" | "style" | "ref" | "data-slot">;
export function CommandRoot<Value>({
  xstyle,
  style,
  ref,
  children,
  "data-slot": slot,
  ...props
}: CommandRootProps<Value>) {
  const compiled = stylex.props(styles.root, xstyle);
  return (
    <Primitive.Root {...props}>
      <div
        ref={ref}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={slot ?? "command"}
      >
        {children}
      </div>
    </Primitive.Root>
  );
}

export type CommandItemProps<Value = string> = StyleXProps<PrimitiveItemProps<Value>>;
export function CommandItem<Value = string>({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: CommandItemProps<Value>) {
  const compiled = stylex.props(styles.item, xstyle);
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
  const compiled = stylex.props(styles.groupLabel, xstyle);
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
      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
