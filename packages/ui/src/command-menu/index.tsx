"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./command-menu.stylex.js";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type SpanProps = React.HTMLAttributes<HTMLSpanElement>;
type KbdProps = React.HTMLAttributes<HTMLElement>;

export const CommandMenuRoot = BaseCombobox.Root;
export const CommandMenuGroup = BaseCombobox.Group;
export const CommandMenuCollection = BaseCombobox.Collection;

export const CommandMenuPanel = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuPanel({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={mergeClassName(stylex.props(styles.panel).className, className) as string}
        data-slot="command-menu-panel"
        ref={ref}
      />
    );
  },
);

export const CommandMenuSearch = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuSearch({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={mergeClassName(stylex.props(styles.search).className, className) as string}
        data-slot="command-menu-search"
        ref={ref}
      />
    );
  },
);

export const CommandMenuInput = React.forwardRef<HTMLInputElement, BaseCombobox.Input.Props>(
  function CommandMenuInput({ className, ...props }, ref) {
    return (
      <BaseCombobox.Input
        {...props}
        className={mergeClassName(stylex.props(styles.input).className, className)}
        data-slot="command-menu-input"
        ref={ref}
      />
    );
  },
);

export const CommandMenuSearchHint = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuSearchHint({ className, ...props }, ref) {
    return (
      <span
        {...props}
        className={mergeClassName(stylex.props(styles.searchHint).className, className) as string}
        data-slot="command-menu-search-hint"
        ref={ref}
      />
    );
  },
);

export const CommandMenuList = React.forwardRef<HTMLDivElement, BaseCombobox.List.Props>(
  function CommandMenuList({ className, ...props }, ref) {
    return (
      <BaseCombobox.List
        {...props}
        aria-label={props["aria-label"] ?? "Commands"}
        className={mergeClassName(stylex.props(styles.list).className, className)}
        data-slot="command-menu-list"
        ref={ref}
      />
    );
  },
);

export const CommandMenuGroupLabel = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuGroupLabel({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={mergeClassName(stylex.props(styles.groupLabel).className, className) as string}
        data-slot="command-menu-group-label"
        ref={ref}
      />
    );
  },
);

export const CommandMenuItem = React.forwardRef<HTMLDivElement, BaseCombobox.Item.Props>(
  function CommandMenuItem({ className, ...props }, ref) {
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
        data-slot="command-menu-item"
        ref={ref}
      />
    );
  },
);

export const CommandMenuItemIcon = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuItemIcon({ className, ...props }, ref) {
    return (
      <span
        {...props}
        className={mergeClassName(stylex.props(styles.itemIcon).className, className) as string}
        data-slot="command-menu-item-icon"
        ref={ref}
      />
    );
  },
);

export const CommandMenuItemText = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuItemText({ className, ...props }, ref) {
    return (
      <span
        {...props}
        className={mergeClassName(stylex.props(styles.itemText).className, className) as string}
        data-slot="command-menu-item-text"
        ref={ref}
      />
    );
  },
);

export const CommandMenuShortcut = React.forwardRef<HTMLElement, KbdProps>(
  function CommandMenuShortcut({ className, ...props }, ref) {
    return (
      <kbd
        {...props}
        className={mergeClassName(stylex.props(styles.shortcut).className, className) as string}
        data-slot="command-menu-shortcut"
        ref={ref}
      />
    );
  },
);

export const CommandMenuEmpty = React.forwardRef<HTMLDivElement, BaseCombobox.Empty.Props>(
  function CommandMenuEmpty({ className, ...props }, ref) {
    return (
      <BaseCombobox.Empty
        {...props}
        className={mergeClassName(stylex.props(styles.empty).className, className)}
        data-slot="command-menu-empty"
        ref={ref}
      />
    );
  },
);

export const CommandMenuSeparator = React.forwardRef<HTMLDivElement, BaseCombobox.Separator.Props>(
  function CommandMenuSeparator({ className, ...props }, ref) {
    return (
      <BaseCombobox.Separator
        {...props}
        className={mergeClassName(stylex.props(styles.separator).className, className)}
        data-slot="command-menu-separator"
        ref={ref}
      />
    );
  },
);

export const CommandMenu = {
  Collection: CommandMenuCollection,
  Empty: CommandMenuEmpty,
  Group: CommandMenuGroup,
  GroupLabel: CommandMenuGroupLabel,
  Input: CommandMenuInput,
  Item: CommandMenuItem,
  ItemIcon: CommandMenuItemIcon,
  ItemText: CommandMenuItemText,
  List: CommandMenuList,
  Panel: CommandMenuPanel,
  Root: CommandMenuRoot,
  Search: CommandMenuSearch,
  SearchHint: CommandMenuSearchHint,
  Separator: CommandMenuSeparator,
  Shortcut: CommandMenuShortcut,
} as const;
