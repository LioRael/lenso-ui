"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./command-menu.stylex.js";

type DivProps = StyleXProps<React.HTMLAttributes<HTMLDivElement>>;
type SpanProps = StyleXProps<React.HTMLAttributes<HTMLSpanElement>>;
type KbdProps = StyleXProps<React.HTMLAttributes<HTMLElement>>;

export const CommandMenuRoot = BaseCombobox.Root;
export const CommandMenuGroup = BaseCombobox.Group;
export const CommandMenuCollection = BaseCombobox.Collection;

export const CommandMenuPanel = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuPanel({ xstyle, ...props }, ref) {
    return (
      <div
        {...props}
        {...stylex.props(styles.panel, xstyle)}
        data-slot="command-menu-panel"
        ref={ref}
      />
    );
  },
);

export const CommandMenuSearch = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuSearch({ xstyle, ...props }, ref) {
    return (
      <div
        {...props}
        {...stylex.props(styles.search, xstyle)}
        data-slot="command-menu-search"
        ref={ref}
      />
    );
  },
);

export const CommandMenuInput = React.forwardRef<
  HTMLInputElement,
  StyleXProps<BaseCombobox.Input.Props>
>(function CommandMenuInput({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Input
      {...props}
      className={stylex.props(styles.input, xstyle).className}
      data-slot="command-menu-input"
      ref={ref}
    />
  );
});

export const CommandMenuSearchHint = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuSearchHint({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        {...stylex.props(styles.searchHint, xstyle)}
        data-slot="command-menu-search-hint"
        ref={ref}
      />
    );
  },
);

export const CommandMenuList = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.List.Props>
>(function CommandMenuList({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.List
      {...props}
      aria-label={props["aria-label"] ?? "Commands"}
      className={stylex.props(styles.list, xstyle).className}
      data-slot="command-menu-list"
      ref={ref}
    />
  );
});

export const CommandMenuGroupLabel = React.forwardRef<HTMLDivElement, DivProps>(
  function CommandMenuGroupLabel({ xstyle, ...props }, ref) {
    return (
      <div
        {...props}
        {...stylex.props(styles.groupLabel, xstyle)}
        data-slot="command-menu-group-label"
        ref={ref}
      />
    );
  },
);

export const CommandMenuItem = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Item.Props>
>(function CommandMenuItem({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Item
      {...props}
      className={(state) => {
        const generated = stylex.props(
          styles.item,
          state.disabled && styles.itemDisabled,
          xstyle,
        ).className;
        return generated;
      }}
      data-slot="command-menu-item"
      ref={ref}
    />
  );
});

export const CommandMenuItemIcon = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuItemIcon({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        {...stylex.props(styles.itemIcon, xstyle)}
        data-slot="command-menu-item-icon"
        ref={ref}
      />
    );
  },
);

export const CommandMenuItemText = React.forwardRef<HTMLSpanElement, SpanProps>(
  function CommandMenuItemText({ xstyle, ...props }, ref) {
    return (
      <span
        {...props}
        {...stylex.props(styles.itemText, xstyle)}
        data-slot="command-menu-item-text"
        ref={ref}
      />
    );
  },
);

export const CommandMenuShortcut = React.forwardRef<HTMLElement, KbdProps>(
  function CommandMenuShortcut({ xstyle, ...props }, ref) {
    return (
      <kbd
        {...props}
        {...stylex.props(styles.shortcut, xstyle)}
        data-slot="command-menu-shortcut"
        ref={ref}
      />
    );
  },
);

export const CommandMenuEmpty = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Empty.Props>
>(function CommandMenuEmpty({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Empty
      {...props}
      className={stylex.props(styles.empty, xstyle).className}
      data-slot="command-menu-empty"
      ref={ref}
    />
  );
});

export const CommandMenuSeparator = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseCombobox.Separator.Props>
>(function CommandMenuSeparator({ xstyle, ...props }, ref) {
  return (
    <BaseCombobox.Separator
      {...props}
      className={stylex.props(styles.separator, xstyle).className}
      data-slot="command-menu-separator"
      ref={ref}
    />
  );
});

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
