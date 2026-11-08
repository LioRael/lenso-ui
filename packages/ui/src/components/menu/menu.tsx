"use client";
// Base UI owns navigation.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import {
  ContextualMenu,
  MenuDismissal,
  MenuBackdropAnchor,
  MenuElastic,
  MenuMotion,
  MenuPresentation,
  useMenuPresentation,
} from "../../utils/menu-presentation.js";
import { Menu as Base } from "@base-ui/react/menu";
import { menuStyles as s } from "@lenso/tokens/menu";
import { menuItemStyles } from "@lenso/tokens/menu";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { presentationMaterials } from "../../utils/materials/presentation.js";
import { useSubmenuPopupRef } from "../../utils/interaction/submenu.js";
import { observeMenuPress, useMenuExitScroll } from "../../utils/interaction/menu-exit-scroll.js";
import { useMenuPopupRef } from "../../utils/interaction/menu.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { MenuItem } from "./menu-item.js";
import { MenuSection } from "./menu-section.js";

const noop = () => {};
const PortalContentMounted = React.createContext<boolean | null>(null);
const SubmenuMotion = React.createContext<{
  ownerDocument: Document | null;
  setOwnerDocument: (doc: Document) => void;
  stacked: boolean;
  trigger: React.RefObject<HTMLElement | null>;
  label: React.ReactNode;
  setLabel: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  close: () => void;
  unmount: () => void;
} | null>(null);
export type MenuRootProps<Payload = unknown> = Base.Root.Props<Payload> & {
  /** Morph the trigger into the popup. Disable to keep the trigger visible and use anchored popup motion. */
  morphTrigger?: boolean;
  /** Enable press enlargement and drag feedback without changing open/close motion. */
  elastic?: boolean;
};
export function MenuRoot<Payload = unknown>({
  morphTrigger = true,
  elastic = true,
  actionsRef,
  onOpenChange,
  onOpenChangeComplete,
  ...props
}: MenuRootProps<Payload>) {
  const state = useMenuPresentation(actionsRef, morphTrigger);
  const [mounted, setMounted] = React.useState(props.open ?? props.defaultOpen ?? false);
  const exitScroll = useMenuExitScroll(mounted, props.modal !== false);
  if (props.open && !mounted) setMounted(true);
  return (
    <MenuPresentation state={state} elastic={elastic}>
      <PortalContentMounted value={mounted}>
        <Base.Root
          {...props}
          actionsRef={state.actions}
          onOpenChange={(open, details) => {
            state.change(open, details, () => onOpenChange?.(open, details));
            exitScroll.change(open, details, state.trigger.current);
            if (open && !details.isCanceled && props.open === undefined) setMounted(true);
          }}
          onOpenChangeComplete={(open) => {
            if (!open) {
              exitScroll.complete();
              setMounted(false);
            }
            onOpenChangeComplete?.(open);
          }}
        />
      </PortalContentMounted>
    </MenuPresentation>
  );
}

export function MenuTrigger({
  xstyle,
  style,
  ref,
  children,
  render,
  onPointerDown,
  onMouseDown,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const ownPresentation =
    !(props as { "data-menu-expand"?: boolean })["data-menu-expand"] &&
    (!render || (React.isValidElement(render) && typeof render.type === "string"));
  const elastic = React.useContext(MenuElastic);
  const anchor = React.useContext(MenuBackdropAnchor);
  const register = React.useCallback(
    (node: HTMLElement | null) => {
      const caller = assignRef(ref, node),
        own = assignRef(anchor, node?.closest<HTMLElement>('[data-slot="menu-bar"]') ?? node),
        stopPress = node ? observeMenuPress(node) : undefined;
      return () => {
        stopPress?.();
        caller();
        own();
      };
    },
    [ref, anchor],
  );
  const glassRef = useElasticRef(useGlassRef(register, ownPresentation), {
    enabled: ownPresentation && elastic,
  });
  const iconOnly = children == null || (React.isValidElement(children) && children.type === "svg");
  const compiled = stylex.props(
    ownPresentation && glassButtonStyles.root,
    ownPresentation && liquidMaterialStyles.small,
    ownPresentation && glassButtonSizes.md,
    ownPresentation && glassButtonVariants.default,
    ownPresentation && iconOnly && s.iconTrigger,
    s.trigger,
    xstyle,
  );
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      ref={glassRef}
      render={render}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        event.preventBaseUIHandler();
      }}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        event.preventBaseUIHandler();
      }}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-trigger"}
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          {...stylex.props(s.triggerIcon)}
        >
          <circle cx="3" cy="8" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="13" cy="8" r="1.4" />
        </svg>
      )}
    </Base.Trigger>
  );
}
/** Compact Edit Menu. Its complete bar is the source of the popup morph. */
export function MenuBar({
  xstyle,
  style,
  ref,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"fieldset">>) {
  const elastic = React.useContext(MenuElastic);
  const elasticRef = useElasticRef(ref, { enabled: elastic });
  const compiled = stylex.props(materialStyles.root, s.bar, elastic && s.barElastic, xstyle);
  return (
    <fieldset
      {...props}
      {...compiled}
      ref={elasticRef}
      style={mergeStyle(compiled.style, style)}
      data-slot="menu-bar"
    >
      <MaterialBackground variant={presentationMaterials.compact} />
      {props.children}
    </fieldset>
  );
}
export function MenuBarItem({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<typeof BaseButton>>) {
  const compiled = stylex.props(s.barItem, xstyle);
  return (
    <BaseButton
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot="menu-bar-item"
    />
  );
}
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
export function MenuPortal({
  container,
  children,
  keepMounted,
  ...props
}: React.ComponentPropsWithRef<typeof Base.Portal>) {
  const themed = useThemePortalContainer();
  const mounted = React.useContext(PortalContentMounted);
  const submenu = React.useContext(SubmenuMotion);
  const retained =
    mounted !== null &&
    keepMounted === undefined &&
    container === undefined &&
    Object.keys(props).length === 0;
  if (retained && submenu && mounted !== null) {
    return (
      <PrivateSubmenuPortal
        anchor={submenu.trigger}
        ownerDocument={submenu.ownerDocument}
        container={themed}
        mounted={mounted}
      >
        {children}
      </PrivateSubmenuPortal>
    );
  }
  return (
    <Base.Portal
      {...props}
      // Retain only the private event target; caller-owned portals keep native lifetimes.
      keepMounted={retained ? true : keepMounted}
      container={container === undefined ? (themed ?? undefined) : container}
    >
      {retained && !mounted ? null : children}
    </Base.Portal>
  );
}

function PrivateSubmenuPortal({
  anchor,
  ownerDocument,
  container,
  mounted,
  children,
}: {
  anchor: React.RefObject<HTMLElement | null>;
  ownerDocument: Document | null;
  container: HTMLElement | null;
  mounted: boolean;
  children: React.ReactNode;
}) {
  const doc = container?.ownerDocument ?? ownerDocument;
  const host = React.useMemo(() => {
    if (!doc) return null;
    const node = doc.createElement("div");
    node.style.display = "contents";
    return node;
  }, [doc]);
  const [liveHost, setLiveHost] = React.useState<HTMLElement | null>(null);
  React.useLayoutEffect(() => () => host?.remove(), [host]);
  const connect = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!mounted || !host || !node || !host.contains(node)) return;
      // Register the private target off-document, then mount its contents where Base UI can
      // position and focus them. Custom portal containers retain their native lifecycle.
      const target =
        container ?? anchor.current?.closest("[data-base-ui-portal]") ?? host.ownerDocument.body;
      if (host.parentNode !== target) target.append(host);
      setLiveHost(host);
    },
    [anchor, container, host, mounted],
  );
  return host ? (
    <Base.Portal container={host} ref={connect} keepMounted>
      {mounted && liveHost === host ? children : null}
    </Base.Portal>
  ) : null;
}
export function MenuPositioner({
  xstyle,
  style,
  align,
  sideOffset,
  ref,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const contextual = React.useContext(ContextualMenu);
  const motion = React.useContext(MenuMotion);
  const submenu = React.useContext(SubmenuMotion);
  // A root menu grows across its trigger, as in the source. Explicit offsets
  // and submenu positioning remain native Base UI contracts.
  const overlap: Base.Positioner.Props["sideOffset"] =
    motion?.morphTrigger && (!props.side || props.side === "bottom" || props.side === "top")
      ? ({ side, anchor }) => {
          const trigger = motion.trigger.current;
          if (!trigger) return 0;
          const box = trigger.getBoundingClientRect();
          const viewport = trigger.ownerDocument.defaultView!;
          const visible = viewport.visualViewport;
          const top = visible?.offsetTop ?? 0;
          const bottom = top + (visible?.height ?? viewport.innerHeight);
          // Overlap only the visible portion; a clipped anchor must not pull
          // the final popup outside the viewport after Base UI flips it.
          return -Math.max(
            0,
            Math.min(anchor.height, side === "top" ? bottom - box.top : box.bottom - top),
          );
        }
      : 8;
  const compiled = stylex.props(s.positioner, xstyle);
  const Positioner = contextual && !submenu ? BaseContextMenu.Positioner : Base.Positioner;
  return (
    <Positioner
      {...props}
      {...compiled}
      ref={ref}
      anchor={
        props.anchor ??
        (motion?.trigger.current?.matches('[data-slot="menu-bar"], [data-menu-source]')
          ? motion.trigger.current
          : undefined) ??
        (submenu?.stacked
          ? () => submenu.trigger.current?.closest<HTMLElement>('[data-slot="menu-popup"]') ?? null
          : undefined)
      }
      side={props.side ?? (submenu ? (submenu.stacked ? "bottom" : "right") : undefined)}
      align={align ?? (submenu ? "start" : "end")}
      alignOffset={props.alignOffset ?? (submenu && !submenu.stacked ? -10 : undefined)}
      sideOffset={
        sideOffset ??
        (submenu
          ? submenu.stacked
            ? ({ anchor, positioner }) => -Math.min(anchor.height * 0.62, positioner.height + 8)
            : 8
          : contextual
            ? 0
            : overlap)
      }
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-positioner"}
    />
  );
}
export function MenuPopup({
  xstyle,
  style,
  ref,
  children,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const elastic = React.useContext(MenuElastic);
  const registeredAnchor = React.useContext(MenuBackdropAnchor);
  const submenu = React.useContext(SubmenuMotion);
  const motion = React.useContext(MenuMotion);
  const sourceAnchor = motion?.trigger ?? registeredAnchor;
  const ownPopup = React.useRef<HTMLDivElement>(null);
  const dismissal = React.useContext(MenuDismissal);
  const popup = dismissal ?? ownPopup;
  const absentTrigger = React.useRef<HTMLElement>(null);
  const popupRef = useMenuPopupRef(
    ref,
    popup,
    motion?.trigger ?? absentTrigger,
    motion?.unmount ?? noop,
    motion?.morphTrigger ?? false,
    !!motion,
  );
  const submenuRef = useSubmenuPopupRef(
    popupRef,
    submenu?.trigger,
    submenu?.unmount,
    submenu?.stacked ?? false,
  );
  const compiled = stylex.props(
    materialStyles.root,
    s.popup,
    (!!motion || !!submenu) && s.morph,
    materialStyles.accessible,
    xstyle,
  );
  return (
    <Base.Popup
      {...props}
      {...compiled}
      ref={submenuRef}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-popup"}
      data-menu-elastic={elastic ? "true" : "false"}
      data-material={presentationMaterials.compact}
    >
      <div data-slot="menu-surface" aria-hidden="true" {...stylex.props(s.surface)}>
        <MaterialBackground
          variant={presentationMaterials.compact}
          sourceAnchor={sourceAnchor}
          liveBackdrop
          deferOptics={!!motion || (!!submenu && !submenu.stacked)}
        />
      </div>
      {motion && <div data-slot="menu-glyph" aria-hidden="true" inert {...stylex.props(s.glyph)} />}
      <div data-slot="menu-content" role="presentation" {...stylex.props(s.content)}>
        {(!!motion || !!submenu) && (
          <div data-slot="menu-plate" aria-hidden="true" {...stylex.props(s.plate)} />
        )}
        {submenu ? (
          <>
            {submenu.stacked && (
              <Base.Item
                closeOnClick={false}
                onClick={submenu.close}
                data-slot="menu-submenu-heading"
                {...stylex.props(menuItemStyles.root, s.submenuHeading)}
              >
                {submenu.label}
              </Base.Item>
            )}
            <div data-slot="menu-submenu-body" {...stylex.props(s.submenuBody)}>
              {submenu.stacked && <Base.Separator {...stylex.props(s.separator)} />}
              {children}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </Base.Popup>
  );
}
export function MenuSeparator({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Separator.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Separator>, "ref">) {
  const compiled = stylex.props(s.separator, xstyle);
  return (
    <Base.Separator
      {...props}
      {...compiled}
      style={mergeStyle<Base.Separator.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-separator"}
    />
  );
}
export function MenuArrow({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Arrow.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Arrow>, "ref">) {
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <Base.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<Base.Arrow.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-arrow"}
    />
  );
}
export function MenuBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-backdrop"}
    />
  );
}
export function MenuSubmenuTrigger({
  xstyle,
  style,
  ref,
  children,
  ...props
}: StyleXProps<Omit<Base.SubmenuTrigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.SubmenuTrigger>, "ref">) {
  const submenu = React.useContext(SubmenuMotion);
  const setLabel = submenu?.setLabel;
  const setOwnerDocument = submenu?.setOwnerDocument;
  React.useLayoutEffect(() => {
    setLabel?.(children);
  }, [setLabel, children]);
  const register = React.useCallback(
    (node: HTMLElement | null) => {
      if (node) setOwnerDocument?.(node.ownerDocument);
      const own = assignRef(submenu?.trigger, node),
        caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [submenu?.trigger, setOwnerDocument, ref],
  );
  const compiled = stylex.props(menuItemStyles.root, xstyle);
  return (
    <Base.SubmenuTrigger
      {...props}
      ref={register}
      openOnHover={props.openOnHover ?? !submenu?.stacked}
      {...compiled}
      style={mergeStyle<Base.SubmenuTrigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-submenu-trigger"}
    >
      {children}
    </Base.SubmenuTrigger>
  );
}
const wideMenuQuery = "(min-width: 768px)";
const subscribeMenuWidth = (notify: () => void) => {
  const query = window.matchMedia(wideMenuQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const wideMenuSnapshot = () => window.matchMedia(wideMenuQuery).matches;
const narrowMenuServerSnapshot = () => false;

export function MenuSubmenuRoot({
  presentation = "auto",
  actionsRef,
  onOpenChange,
  onOpenChangeComplete,
  ...props
}: React.ComponentProps<typeof Base.SubmenuRoot> & {
  presentation?: "auto" | "stacked" | "cascade";
}) {
  const wide = React.useSyncExternalStore(
    subscribeMenuWidth,
    wideMenuSnapshot,
    narrowMenuServerSnapshot,
  );
  const stacked = presentation === "stacked" || (presentation === "auto" && !wide);
  const dismissal = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLElement>(null);
  const own = React.useRef<Base.Root.Actions>(null);
  const actions = actionsRef ?? own;
  // Mount the private portal with its parent, but keep the submenu content on Base UI's lifecycle.
  const [mounted, setMounted] = React.useState(props.open ?? props.defaultOpen ?? false);
  if (props.open && !mounted) setMounted(true);
  const [ownerDocument, setOwnerDocument] = React.useState<Document | null>(null);
  const [label, setLabel] = React.useState<React.ReactNode>(null);
  const close = React.useCallback(() => actions.current?.close(), [actions]);
  const unmount = React.useCallback(() => actions.current?.unmount(), [actions]);
  const motion = React.useMemo(
    () => ({ trigger, ownerDocument, setOwnerDocument, label, setLabel, close, unmount, stacked }),
    [ownerDocument, label, close, unmount, stacked],
  );
  return (
    <MenuDismissal value={dismissal}>
      <PortalContentMounted value={mounted}>
        <MenuMotion value={null}>
          <SubmenuMotion value={motion}>
            <Base.SubmenuRoot
              {...props}
              actionsRef={actions}
              onOpenChange={(open, details) => {
                if (
                  !open &&
                  details.reason === "outside-press" &&
                  dismissal.current?.hasAttribute("data-menu-child-count")
                ) {
                  details.cancel();
                  return;
                }
                onOpenChange?.(open, details);
                if (open && !details.isCanceled && props.open === undefined) setMounted(true);
                if (!open && !details.isCanceled) details.preventUnmountOnClose();
              }}
              onOpenChangeComplete={(open) => {
                if (!open) setMounted(false);
                onOpenChangeComplete?.(open);
              }}
            />
          </SubmenuMotion>
        </MenuMotion>
      </PortalContentMounted>
    </MenuDismissal>
  );
}
export function MenuActionGroup({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<typeof Base.Group>>) {
  const compiled = stylex.props(s.actionGroup, xstyle);
  return (
    <Base.Group
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot="menu-action-group"
    />
  );
}
export function MenuAction({ xstyle, ...props }: React.ComponentProps<typeof MenuItem>) {
  return <MenuItem {...props} xstyle={[s.action, xstyle]} data-slot="menu-action" />;
}
export const MenuRadioGroup = Base.RadioGroup;
export function MenuViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-viewport"}
    />
  );
}
export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Bar: MenuBar,
  BarItem: MenuBarItem,
  ExpandTrigger: MenuExpandTrigger,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Item: MenuItem,
  ActionGroup: MenuActionGroup,
  Action: MenuAction,
  CheckboxItem: MenuItem.Checkbox,
  CheckboxItemIndicator: MenuItem.Indicator,
  RadioItem: MenuItem.Radio,
  RadioItemIndicator: MenuItem.RadioIndicator,
  LinkItem: MenuItem.Link,
  Group: MenuSection,
  GroupLabel: MenuSection.Label,
  RadioGroup: MenuRadioGroup,
  Separator: MenuSeparator,
  Arrow: MenuArrow,
  Backdrop: MenuBackdrop,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Viewport: MenuViewport,
});
