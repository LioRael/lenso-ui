"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { boxedControlStyles } from "../shared/boxed-control.stylex.js";
import { mergeClassName } from "../shared/merge-class-name.js";
import { useThemePortalContainer } from "../theme-scope/index.js";
import { styles } from "./menu.stylex.js";

export const MenuRoot = BaseMenu.Root;
export const MenuSubmenuRoot = BaseMenu.SubmenuRoot;
export const MenuGroup = BaseMenu.Group;
export const MenuRadioGroup = BaseMenu.RadioGroup;

export const MenuTrigger = React.forwardRef<HTMLButtonElement, BaseMenu.Trigger.Props>(
  function MenuTrigger({ className, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        {...props}
        className={mergeClassName(stylex.props(styles.trigger).className, className)}
        data-slot="menu-trigger"
        ref={ref}
      />
    );
  },
);

export interface MenuControlTriggerProps extends BaseMenu.Trigger.Props {
  icon?: React.ReactNode;
}

export const MenuControlTrigger = React.forwardRef<HTMLButtonElement, MenuControlTriggerProps>(
  function MenuControlTrigger({ children, className, icon, ...props }, ref) {
    return (
      <BaseMenu.Trigger
        {...props}
        className={(state) => {
          const generated = stylex.props(
            styles.trigger,
            styles.controlTrigger,
            boxedControlStyles.edge,
            state.disabled && styles.controlTriggerDisabled,
          ).className;
          const custom = typeof className === "function" ? className(state) : className;
          return custom ? `${generated} ${custom}` : generated;
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

export const MenuPositioner = React.forwardRef<HTMLDivElement, BaseMenu.Positioner.Props>(
  function MenuPositioner({ align = "start", className, sideOffset = 5, ...props }, ref) {
    return (
      <BaseMenu.Positioner
        {...props}
        align={align}
        className={mergeClassName(stylex.props(styles.positioner).className, className)}
        data-slot="menu-positioner"
        ref={ref}
        sideOffset={sideOffset}
      />
    );
  },
);

export const MenuPopup = React.forwardRef<
  HTMLDivElement,
  BaseMenu.Popup.Props & { submenu?: boolean }
>(function MenuPopup({ className, submenu = false, ...props }, ref) {
  return (
    <BaseMenu.Popup
      {...props}
      className={mergeClassName(
        stylex.props(styles.popup, submenu && styles.submenuPopup).className,
        className,
      )}
      data-slot="menu-popup"
      ref={ref}
    />
  );
});

type Tone = "danger" | "default";
function itemClass(className: BaseMenu.Item.Props["className"], tone: Tone) {
  return (state: BaseMenu.Item.State) => {
    const generated = stylex.props(
      styles.item,
      tone === "danger" && styles.danger,
      state.disabled && styles.disabled,
    ).className;
    const custom = typeof className === "function" ? className(state) : className;
    return custom ? `${generated} ${custom}` : generated;
  };
}

export const MenuItem = React.forwardRef<HTMLElement, BaseMenu.Item.Props & { tone?: Tone }>(
  function MenuItem({ className, tone = "default", ...props }, ref) {
    return (
      <BaseMenu.Item
        {...props}
        className={itemClass(className, tone)}
        data-slot="menu-item"
        ref={ref}
      />
    );
  },
);
export const MenuLinkItem = React.forwardRef<
  HTMLAnchorElement,
  BaseMenu.LinkItem.Props & { tone?: Tone }
>(function MenuLinkItem({ className, tone = "default", ...props }, ref) {
  return (
    <BaseMenu.LinkItem
      {...props}
      className={(state) => {
        const generated = stylex.props(styles.item, tone === "danger" && styles.danger).className;
        const custom = typeof className === "function" ? className(state) : className;
        return custom ? `${generated} ${custom}` : generated;
      }}
      data-slot="menu-item"
      ref={ref}
    />
  );
});
export interface MenuSubmenuTriggerProps extends BaseMenu.SubmenuTrigger.Props {
  icon?: React.ReactNode;
}
export const MenuSubmenuTrigger = React.forwardRef<HTMLElement, MenuSubmenuTriggerProps>(
  function MenuSubmenuTrigger({ children, className, icon, ...props }, ref) {
    const iconNode =
      icon === undefined ? <ChevronRightIcon {...stylex.props(styles.submenuIcon)} /> : icon;
    return (
      <BaseMenu.SubmenuTrigger
        {...props}
        className={itemClass(className as BaseMenu.Item.Props["className"], "default")}
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

type SpanProps = Omit<React.ComponentPropsWithoutRef<"span">, "className"> & { className?: string };
export const MenuLeading = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuLeading(
  { className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={mergeClassName(stylex.props(styles.leading).className, className) as string}
      data-slot="menu-leading"
      ref={ref}
    />
  );
});
export const MenuLabel = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuLabel(
  { className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={mergeClassName(stylex.props(styles.label).className, className) as string}
      data-slot="menu-label"
      ref={ref}
    />
  );
});
export const MenuTrailing = React.forwardRef<HTMLSpanElement, SpanProps>(function MenuTrailing(
  { className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={mergeClassName(stylex.props(styles.trailing).className, className) as string}
      data-slot="menu-trailing"
      ref={ref}
    />
  );
});
export const MenuShortcut = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<"kbd">, "className"> & { className?: string }
>(function MenuShortcut({ className, ...props }, ref) {
  return (
    <kbd
      {...props}
      className={mergeClassName(stylex.props(styles.shortcut).className, className) as string}
      data-slot="menu-shortcut"
      ref={ref}
    />
  );
});
export const MenuHint = React.forwardRef<
  HTMLParagraphElement,
  Omit<React.ComponentPropsWithoutRef<"p">, "className"> & { className?: string }
>(function MenuHint({ className, ...props }, ref) {
  return (
    <p
      {...props}
      className={mergeClassName(stylex.props(styles.hint).className, className) as string}
      data-slot="menu-hint"
      ref={ref}
    />
  );
});

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  Omit<React.ComponentPropsWithoutRef<"hr">, "className"> & { className?: string }
>(function MenuSeparator({ className, ...props }, ref) {
  return (
    <hr
      {...props}
      className={mergeClassName(stylex.props(styles.separator).className, className) as string}
      data-slot="menu-separator"
      ref={ref}
    />
  );
});
export const MenuGroupLabel = React.forwardRef<HTMLDivElement, BaseMenu.GroupLabel.Props>(
  function MenuGroupLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        {...props}
        className={
          typeof className === "function"
            ? (state) =>
                mergeClassName(
                  stylex.props(styles.groupLabel).className,
                  className(state),
                ) as string
            : (mergeClassName(stylex.props(styles.groupLabel).className, className) as string)
        }
        data-slot="menu-group-label"
        ref={ref}
      />
    );
  },
);

export const MenuCheckboxItem = BaseMenu.CheckboxItem;
export const MenuRadioItem = BaseMenu.RadioItem;
export const MenuItemIndicator = React.forwardRef<
  HTMLSpanElement,
  BaseMenu.CheckboxItemIndicator.Props
>(function MenuItemIndicator({ children, className, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItemIndicator
      {...props}
      className={mergeClassName(stylex.props(styles.indicator).className, className)}
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
