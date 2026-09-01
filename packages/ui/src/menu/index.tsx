"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { boxedControlStyles } from "../shared/boxed-control.stylex.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./menu.stylex.js";

export const MenuRoot = BaseMenu.Root;
export const MenuSubmenuRoot = BaseMenu.SubmenuRoot;
export const MenuGroup = BaseMenu.Group;
export const MenuRadioGroup = BaseMenu.RadioGroup;

export const MenuTrigger = React.forwardRef<HTMLButtonElement, StyleXProps<BaseMenu.Trigger.Props>>(
  function MenuTrigger({ xstyle, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        {...props}
        className={stylex.props(styles.trigger, xstyle).className}
        data-slot="menu-trigger"
        ref={ref}
      />
    );
  },
);

export interface MenuControlTriggerProps extends StyleXProps<BaseMenu.Trigger.Props> {
  icon?: React.ReactNode;
}

export const MenuControlTrigger = React.forwardRef<HTMLButtonElement, MenuControlTriggerProps>(
  function MenuControlTrigger({ children, icon, xstyle, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.trigger,
            styles.controlTrigger,
            boxedControlStyles.edge,
            state.disabled && styles.controlTriggerDisabled,
            xstyle,
          ).className;
          return generated;
        }}
        data-slot="menu-control-trigger"
        ref={ref}
      >
        {children}
        {icon === null ? null : (
          <span aria-hidden="true" data-slot="menu-control-trigger-icon">
            {icon ?? <ChevronDownIcon {...stylex.props(styles.controlTriggerIcon)} />}
          </span>
        )}
      </BaseMenu.Trigger>
    );
  },
);

export const MenuPortal = React.forwardRef<HTMLDivElement, BaseMenu.Portal.Props>(
  function MenuPortal({ container, ...props }, ref) {
    const scopeContainer = useThemePortalContainer();
    return (
      <BaseMenu.Portal
        {...props}
        container={container ?? scopeContainer ?? undefined}
        data-slot="menu-portal"
        ref={ref}
      />
    );
  },
);

export const MenuPositioner = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseMenu.Positioner.Props>
>(function MenuPositioner({ align = "start", sideOffset = 5, xstyle, ...props }, ref) {
  return (
    <BaseMenu.Positioner
      {...props}
      align={align}
      className={stylex.props(styles.positioner, xstyle).className}
      data-slot="menu-positioner"
      ref={ref}
      sideOffset={sideOffset}
    />
  );
});

export const MenuPopup = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseMenu.Popup.Props> & { submenu?: boolean }
>(function MenuPopup({ submenu = false, xstyle, ...props }, ref) {
  return (
    <BaseMenu.Popup
      {...props}
      className={stylex.props(styles.popup, submenu && styles.submenuPopup, xstyle).className}
      data-slot="menu-popup"
      ref={ref}
    />
  );
});

type Tone = "danger" | "default";

export const MenuItem = React.forwardRef<
  HTMLElement,
  StyleXProps<BaseMenu.Item.Props> & { tone?: Tone }
>(function MenuItem({ tone = "default", xstyle, ...props }, ref) {
  return (
    <BaseMenu.Item
      {...props}
      className={(state) =>
        stylex.props(
          styles.item,
          tone === "danger" && styles.danger,
          state.disabled && styles.disabled,
          xstyle,
        ).className
      }
      data-slot="menu-item"
      ref={ref}
    />
  );
});
export const MenuLinkItem = React.forwardRef<
  HTMLAnchorElement,
  StyleXProps<BaseMenu.LinkItem.Props> & { tone?: Tone }
>(function MenuLinkItem({ tone = "default", xstyle, ...props }, ref) {
  return (
    <BaseMenu.LinkItem
      {...props}
      className={stylex.props(styles.item, tone === "danger" && styles.danger, xstyle).className}
      data-slot="menu-item"
      ref={ref}
    />
  );
});
export interface MenuSubmenuTriggerProps extends StyleXProps<BaseMenu.SubmenuTrigger.Props> {
  icon?: React.ReactNode;
}
export const MenuSubmenuTrigger = React.forwardRef<HTMLElement, MenuSubmenuTriggerProps>(
  function MenuSubmenuTrigger({ children, icon, xstyle, ...props }, ref) {
    const iconNode =
      icon === undefined ? <ChevronRightIcon {...stylex.props(styles.submenuIcon)} /> : icon;
    return (
      <BaseMenu.SubmenuTrigger
        {...props}
        className={(state) =>
          stylex.props(styles.item, state.disabled && styles.disabled, xstyle).className
        }
        data-slot="menu-submenu-trigger"
        ref={ref}
      >
        {children}
        {iconNode === null ? null : (
          <MenuTrailing>
            <span aria-hidden="true" data-slot="icon" {...stylex.props(styles.submenuIconSlot)}>
              {iconNode}
            </span>
          </MenuTrailing>
        )}
      </BaseMenu.SubmenuTrigger>
    );
  },
);

type SpanProps = StyleXProps<React.ComponentPropsWithoutRef<"span">>;
export const MenuLeading = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuLeading(
  { xstyle, ...props },
  ref,
) {
  return (
    <span {...props} {...stylex.props(styles.leading, xstyle)} data-slot="menu-leading" ref={ref} />
  );
});
export const MenuLabel = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuLabel(
  { xstyle, ...props },
  ref,
) {
  return (
    <span {...props} {...stylex.props(styles.label, xstyle)} data-slot="menu-label" ref={ref} />
  );
});
export const MenuTrailing = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuTrailing(
  { xstyle, ...props },
  ref,
) {
  return (
    <span
      {...props}
      {...stylex.props(styles.trailing, xstyle)}
      data-slot="menu-trailing"
      ref={ref}
    />
  );
});
export const MenuShortcut = React.forwardRef<
  HTMLElement,
  StyleXProps<React.ComponentPropsWithoutRef<"kbd">>
>(function MenuShortcut({ xstyle, ...props }, ref) {
  return (
    <kbd
      {...props}
      {...stylex.props(styles.shortcut, xstyle)}
      data-slot="menu-shortcut"
      ref={ref}
    />
  );
});
export const MenuHint = React.forwardRef<
  HTMLParagraphElement,
  StyleXProps<React.ComponentPropsWithoutRef<"p">>
>(function MenuHint({ xstyle, ...props }, ref) {
  return <p {...props} {...stylex.props(styles.hint, xstyle)} data-slot="menu-hint" ref={ref} />;
});

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  StyleXProps<React.ComponentPropsWithoutRef<"hr">>
>(function MenuSeparator({ xstyle, ...props }, ref) {
  return (
    <hr
      {...props}
      {...stylex.props(styles.separator, xstyle)}
      data-slot="menu-separator"
      ref={ref}
    />
  );
});
export const MenuGroupLabel = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseMenu.GroupLabel.Props>
>(function MenuGroupLabel({ xstyle, ...props }, ref) {
  return (
    <BaseMenu.GroupLabel
      {...props}
      className={stylex.props(styles.groupLabel, xstyle).className}
      data-slot="menu-group-label"
      ref={ref}
    />
  );
});

export const MenuCheckboxItem = BaseMenu.CheckboxItem;
export const MenuRadioItem = BaseMenu.RadioItem;
export const MenuItemIndicator = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<BaseMenu.CheckboxItemIndicator.Props>
>(function MenuItemIndicator({ children, xstyle, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItemIndicator
      {...props}
      className={stylex.props(styles.indicator, xstyle).className}
      ref={ref}
    >
      {children ?? <CheckIcon aria-hidden="true" {...stylex.props(styles.submenuIcon)} />}
    </BaseMenu.CheckboxItemIndicator>
  );
});

export const Menu = {
  CheckboxItem: MenuCheckboxItem,
  ControlTrigger: MenuControlTrigger,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Hint: MenuHint,
  Item: MenuItem,
  ItemIndicator: MenuItemIndicator,
  Label: MenuLabel,
  Leading: MenuLeading,
  LinkItem: MenuLinkItem,
  Popup: MenuPopup,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Root: MenuRoot,
  Separator: MenuSeparator,
  Shortcut: MenuShortcut,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Trailing: MenuTrailing,
  Trigger: MenuTrigger,
} as const;
