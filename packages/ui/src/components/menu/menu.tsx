"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import * as SdkMenu from "@ui-sdk/react/menu";
import { NativeButton } from "../../utils/native-button.js";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { slotRender } from "../../utils/sdk-render.js";
import { menuStyles as s, menuItemStyles } from "@lenso/tokens/menu";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { mergeStyle, type StyleXProps, type XStyle } from "../../utils/styled.js";
import { useMenuPopupRef } from "../../utils/interaction/menu.js";
import { useMenuStackOffset } from "../../utils/interaction/menu-placement.js";
import { usePopupExit } from "../../utils/interaction/popup-exit.js";
import { useSubmenuPopupRef } from "../../utils/interaction/submenu.js";
import { createMenuController } from "@ui-sdk/core/menu";
import { assignRef } from "../../utils/interaction/ref.js";
import { MenuItem } from "./menu-item.js";
import { MenuSection } from "./menu-section.js";
const Elastic = React.createContext(true);
const Motion = React.createContext<{
  trigger: React.RefObject<HTMLElement | null>;
  morph: boolean;
  popup: React.RefObject<HTMLDivElement | null>;
  finishExit: () => void;
} | null>(null);
const Submenu = React.createContext<{
  trigger: React.RefObject<HTMLElement | null>;
  popup: React.RefObject<HTMLDivElement | null>;
  finishExit: () => void;
  stacked: boolean;
  label: React.ComponentProps<typeof SdkMenu.MenuSubTrigger>["children"];
  setLabel: (label: React.ComponentProps<typeof SdkMenu.MenuSubTrigger>["children"]) => void;
  close: () => void;
} | null>(null);
const wideMenuQuery = "(min-width: 768px)";
const subscribeMenuWidth = (notify: () => void) => {
  const query = window.matchMedia(wideMenuQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const wideMenuSnapshot = () => window.matchMedia(wideMenuQuery).matches;
const narrowMenuServerSnapshot = () => false;
const noop = () => {};
export type MenuRootProps = React.ComponentProps<typeof SdkMenu.Menu> & {
  elastic?: boolean;
  morphTrigger?: boolean;
};
export function MenuRoot({
  elastic = true,
  morphTrigger = true,
  onOpenChange,
  ...props
}: MenuRootProps) {
  const trigger = React.useRef<HTMLElement>(null);
  const { popup, holdExit, finishExit } = usePopupExit(props.open);
  const motion = React.useMemo(
    () => ({ trigger, popup, finishExit, morph: morphTrigger }),
    [morphTrigger, popup, finishExit],
  );
  return (
    <Submenu value={null}>
      <Motion value={motion}>
        <Elastic value={elastic}>
          <SdkMenu.Menu
            {...props}
            onOpenChange={(open, details) => {
              onOpenChange?.(open, details);
              if (!details.canceled) holdExit(open);
            }}
          />
        </Elastic>
      </Motion>
    </Submenu>
  );
}
export function useMenuSourceRef(ref: React.Ref<HTMLElement> | undefined) {
  const motion = React.useContext(Motion);
  return React.useCallback(
    (node: HTMLElement | null) => {
      const caller = assignRef(ref, node);
      const own = assignRef(motion?.trigger, node);
      return () => {
        caller();
        own();
      };
    },
    [ref, motion],
  );
}

export function MenuTrigger({
  xstyle,
  style,
  ref,
  children,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuTrigger>> & {
  "data-menu-expand"?: boolean;
}) {
  const elastic = React.useContext(Elastic);
  const motion = React.useContext(Motion);
  const register = React.useCallback(
    (node: HTMLElement | null) => {
      const caller = assignRef(ref, node);
      const own = assignRef(
        motion?.trigger,
        node?.closest<HTMLElement>('[data-lenso-slot="menu-bar"], [data-menu-source]') ?? node,
      );
      return () => {
        caller();
        own();
      };
    },
    [ref, motion],
  );
  const own =
    !props["data-menu-expand"] &&
    (props.render == null ||
      (React.isValidElement(props.render) && typeof props.render.type === "string"));
  const motionRef = useElasticRef(useGlassRef(register, own), { enabled: elastic && own });
  const compiled = stylex.props(
    own && glassButtonStyles.root,
    own && liquidMaterialStyles.small,
    own && glassButtonSizes.md,
    own && glassButtonVariants.default,
    s.trigger,
    children == null && s.iconTrigger,
    xstyle,
  );
  return (
    <SdkMenu.MenuTrigger
      {...props}
      {...compiled}
      ref={motionRef}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", props["data-lenso-slot"] ?? "menu-trigger", props.render)}
    >
      {children ?? (
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      )}
    </SdkMenu.MenuTrigger>
  );
}
export function MenuSurface({
  nativeContent: Content,
  xstyle,
  style,
  ref,
  children,
  sideOffset,
  layout,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuContent>> & {
  nativeContent: typeof SdkMenu.MenuContent;
  layout?: { before: React.ReactNode; xstyle: XStyle; panelXstyle: XStyle };
}) {
  const motion = React.useContext(Motion);
  const submenu = React.useContext(Submenu);
  const elastic = React.useContext(Elastic);
  const ownPopup = React.useRef<HTMLDivElement>(null);
  const popup = layout ? ownPopup : (motion?.popup ?? submenu?.popup ?? ownPopup);
  const absent = React.useRef<HTMLElement>(null);
  const popupRef = useMenuPopupRef(
    layout ? undefined : ref,
    popup,
    layout ? absent : (motion?.trigger ?? absent),
    motion?.finishExit ?? noop,
    motion?.morph ?? false,
    !!motion,
  );
  const submenuRef = useSubmenuPopupRef(
    popupRef,
    submenu?.trigger,
    submenu?.finishExit,
    submenu?.stacked ?? false,
  );
  const parent = submenu?.trigger.current?.closest<HTMLElement>('[data-lenso-slot="menu-popup"]');
  const stacked = submenu?.stacked ?? false;
  const [stackElement, setStackElement] = React.useState<HTMLDivElement | null>(null);
  const stackRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setStackElement(node);
      return assignRef(submenuRef, node);
    },
    [submenuRef],
  );
  const stackOffset = useMenuStackOffset(stackElement, parent, stacked && sideOffset === undefined);
  const nativeRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      const caller = assignRef(ref, node);
      const own = assignRef(motion?.popup, node);
      return () => {
        caller();
        own();
      };
    },
    [ref, motion],
  );
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    s.popup,
    (!!motion || !!submenu) && s.morph,
    layout?.panelXstyle,
    !layout && xstyle,
  );
  const host = layout ? stylex.props(s.popup, s.morph, layout.xstyle, xstyle) : compiled;
  return (
    <Content
      ref={layout ? nativeRef : stackRef}
      anchor={stacked ? parent : layout ? undefined : (motion?.trigger.current ?? undefined)}
      side={stacked ? "bottom" : undefined}
      align={submenu ? "start" : "end"}
      alignOffset={submenu && !stacked ? -10 : undefined}
      {...props}
      {...host}
      data-menu-elastic={elastic ? "true" : "false"}
      sideOffset={
        sideOffset ??
        (stacked && parent
          ? stackOffset
          : motion?.morph && (!props.side || props.side === "bottom" || props.side === "top")
            ? -(motion.trigger.current?.offsetHeight ?? 0)
            : 8)
      }
      style={mergeStyle(host.style, style)}
      render={slotRender(
        "div",
        layout ? "context-menu-layout" : (props["data-lenso-slot"] ?? "menu-popup"),
        props.render,
      )}
      data-material={presentationMaterials.compact}
    >
      {(state) => {
        const panel = (
          <>
            <div
              data-lenso-slot="menu-surface"
              data-material-hidden={
                (motion || submenu) && state.presentation !== "sheet" ? "" : undefined
              }
              aria-hidden="true"
              {...stylex.props(s.surface)}
            >
              <MaterialBackground
                variant={presentationMaterials.compact}
                sourceAnchor={motion?.trigger ?? submenu?.trigger}
                deferOptics={
                  state.presentation !== "sheet" && (!!motion || (!!submenu && !stacked))
                }
                liveBackdrop
              />
            </div>
            {motion && (
              <div
                data-lenso-slot="menu-glyph"
                aria-hidden="true"
                inert
                {...stylex.props(s.glyph)}
              />
            )}
            <div data-lenso-slot="menu-content" {...stylex.props(s.content)}>
              {(motion || submenu) && (
                <div data-lenso-slot="menu-plate" aria-hidden="true" {...stylex.props(s.plate)} />
              )}
              {stacked && submenu && state.presentation !== "sheet" && (
                <MenuItem
                  closeOnSelect={false}
                  onSelect={submenu.close}
                  data-lenso-slot="menu-submenu-heading"
                  xstyle={s.submenuHeading}
                >
                  {typeof submenu.label === "function"
                    ? submenu.label({ open: true, disabled: false })
                    : submenu.label}
                </MenuItem>
              )}
              {submenu ? (
                <div data-lenso-slot="menu-submenu-body" {...stylex.props(s.submenuBody)}>
                  {stacked && <MenuSeparator />}
                  {typeof children === "function" ? children(state) : children}
                </div>
              ) : typeof children === "function" ? (
                children(state)
              ) : (
                children
              )}
            </div>
          </>
        );
        return layout ? (
          <>
            {layout.before}
            <div
              {...compiled}
              ref={stackRef}
              data-lenso-slot="menu-popup"
              data-open={state.open ? "" : undefined}
              data-closed={state.open ? undefined : ""}
              data-presentation={state.presentation}
              data-material={presentationMaterials.compact}
            >
              {panel}
            </div>
          </>
        ) : (
          panel
        );
      }}
    </Content>
  );
}
export function MenuContent(props: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuContent>>) {
  return <MenuSurface nativeContent={SdkMenu.MenuContent} {...props} />;
}
export function MenuSubContent(
  props: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuSubContent>>,
) {
  return <MenuSurface nativeContent={SdkMenu.MenuSubContent} {...props} />;
}
export function MenuBar({
  xstyle,
  style,
  children,
  ref,
  render,
  ...props
}: StyleXProps<PartProps<"div">>) {
  const elastic = React.useContext(Elastic);
  const elasticRef = useElasticRef(ref, { enabled: elastic });
  const compiled = stylex.props(materialStyles.root, s.bar, elastic && s.barElastic, xstyle);
  return renderElement(
    "div",
    {
      ...props,
      ...compiled,
      ref: elasticRef,
      role: "group",
      "data-lenso-slot": "menu-bar",
      style: mergeStyle(compiled.style, style),
      children: (
        <>
          <MaterialBackground variant={presentationMaterials.compact} />
          {children}
        </>
      ),
    },
    render,
  );
}
export function MenuBarItem({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof NativeButton>>) {
  const compiled = stylex.props(s.barItem, xstyle);
  return (
    <NativeButton
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot="menu-bar-item"
    />
  );
}
export function MenuSeparator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuSeparator>>) {
  const compiled = stylex.props(s.separator, xstyle);
  return (
    <SdkMenu.MenuSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-separator", props.render)}
    />
  );
}
export function MenuSubTrigger({
  ref,
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkMenu.MenuSubTrigger>>) {
  const submenu = React.useContext(Submenu);
  const setLabel = submenu?.setLabel;
  React.useLayoutEffect(() => {
    setLabel?.(children);
  }, [setLabel, children]);
  const register = React.useCallback(
    (node: HTMLElement | null) => {
      const own = assignRef(submenu?.trigger, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [submenu?.trigger, ref],
  );
  const compiled = stylex.props(menuItemStyles.root, xstyle);
  return (
    <SdkMenu.MenuSubTrigger
      {...props}
      ref={register}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-submenu-trigger", props.render)}
    >
      {children}
    </SdkMenu.MenuSubTrigger>
  );
}
export function MenuSub({
  presentation = "auto",
  controller,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SdkMenu.MenuSub> & {
  presentation?: "auto" | "stacked" | "cascade";
}) {
  const wide = React.useSyncExternalStore(
    subscribeMenuWidth,
    wideMenuSnapshot,
    narrowMenuServerSnapshot,
  );
  const trigger = React.useRef<HTMLElement>(null);
  const { popup, holdExit, finishExit } = usePopupExit(props.open);
  const [ownController] = React.useState(() => createMenuController());
  const nativeController = controller ?? ownController;
  const close = React.useCallback(() => {
    nativeController.close();
  }, [nativeController]);
  const [label, updateLabel] =
    React.useState<React.ComponentProps<typeof SdkMenu.MenuSubTrigger>["children"]>(null);
  const setLabel = React.useCallback(
    (label: React.ComponentProps<typeof SdkMenu.MenuSubTrigger>["children"]) =>
      updateLabel(() => label),
    [],
  );
  const stacked = presentation === "stacked" || (presentation === "auto" && !wide);
  const submenu = React.useMemo(
    () => ({ trigger, popup, finishExit, stacked, label, setLabel, close }),
    [popup, finishExit, stacked, label, setLabel, close],
  );
  return (
    <Motion value={null}>
      <Submenu value={submenu}>
        <SdkMenu.MenuSub
          {...props}
          controller={nativeController}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!details.canceled) holdExit(open);
          }}
        />
      </Submenu>
    </Motion>
  );
}
export const MenuRadioGroup = SdkMenu.MenuRadioGroup;
export function MenuExpandTrigger({
  xstyle,
  children,
  ...props
}: React.ComponentProps<typeof MenuTrigger>) {
  const label = props["aria-label"] ?? "More actions";
  return (
    <MenuTrigger
      data-menu-expand
      aria-label={label}
      {...props}
      render={<button type="button" aria-label={label} />}
      xstyle={[s.expand, xstyle]}
    >
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </MenuTrigger>
  );
}
export function MenuActionGroup({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<typeof SdkMenu.MenuGroup>>) {
  const compiled = stylex.props(s.actionGroup, xstyle);
  return (
    <SdkMenu.MenuGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot="menu-action-group"
    />
  );
}
export function MenuAction({ xstyle, ...props }: React.ComponentProps<typeof MenuItem>) {
  return <MenuItem {...props} xstyle={[s.action, xstyle]} data-lenso-slot="menu-action" />;
}
export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Bar: MenuBar,
  BarItem: MenuBarItem,
  ExpandTrigger: MenuExpandTrigger,
  Item: MenuItem,
  ActionGroup: MenuActionGroup,
  Action: MenuAction,
  CheckboxItem: MenuItem.Checkbox,
  ItemIndicator: MenuItem.Indicator,
  RadioItem: MenuItem.Radio,
  RadioGroup: MenuRadioGroup,
  Group: MenuSection,
  GroupLabel: MenuSection.Label,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
});
