"use client";
import * as React from "react";
import { ContextMenu as Base } from "@base-ui/react/context-menu";
import * as stylex from "@stylexjs/stylex";
import { contextMenuStyles as s } from "@lenso/tokens/context-menu";
import { menuStyles } from "@lenso/tokens/menu";
import { afterMenuPlacement } from "../../utils/interaction/menu-placement.js";
import { createSpring } from "@lenso/glass/motion";
import { presentContextPreview } from "../../utils/interaction/context-preview.js";
import { Menu } from "../menu/menu.js";
import {
  ContextualMenu,
  MenuBackdropAnchor,
  MenuPresentation,
  useMenuPresentation,
} from "../../utils/menu-presentation.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

const ContextPresentation = React.createContext<{
  compact: boolean;
  expand: () => void;
  retainPreview: () => void;
  returned: () => void;
} | null>(null);
export type ContextMenuRootProps = Base.Root.Props & {
  elastic?: boolean;
  presentation?: "popup" | "bar";
};
export function ContextMenuRoot({
  elastic = true,
  presentation = "popup",
  actionsRef,
  onOpenChange,
  ...props
}: ContextMenuRootProps) {
  const state = useMenuPresentation(actionsRef, false);
  const [expanded, setExpanded] = React.useState(false);
  const previewActive = React.useRef(false);
  const pendingUnmount = React.useRef(false);
  const retainPreview = React.useCallback(() => {
    previewActive.current = true;
  }, []);
  const returned = React.useCallback(() => {
    previewActive.current = false;
    if (pendingUnmount.current) {
      pendingUnmount.current = false;
      state.actions.current?.unmount();
    }
  }, [state.actions]);
  const unmount = React.useCallback(() => {
    if (previewActive.current) pendingUnmount.current = true;
    else state.actions.current?.unmount();
  }, [state.actions]);
  const motion = React.useMemo(() => ({ ...state.motion, unmount }), [state.motion, unmount]);
  const compact = presentation === "bar" && !expanded;
  const expand = React.useCallback(() => setExpanded(true), []);
  const context = React.useMemo(
    () => ({ compact, expand, retainPreview, returned }),
    [compact, expand, retainPreview, returned],
  );
  return (
    <ContextualMenu value={true}>
      <ContextPresentation value={context}>
        <MenuPresentation state={{ ...state, motion }} elastic={elastic}>
          <Base.Root
            orientation={compact ? "horizontal" : "vertical"}
            {...props}
            actionsRef={state.actions}
            onOpenChange={(open, details) =>
              state.change(open, details, () => {
                onOpenChange?.(open, details);
                if (open && !details.isCanceled) {
                  pendingUnmount.current = false;
                  setExpanded(false);
                }
              })
            }
          />
        </MenuPresentation>
      </ContextPresentation>
    </ContextualMenu>
  );
}
export function ContextMenuTrigger({
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<typeof Base.Trigger>>) {
  const anchor = React.useContext(MenuBackdropAnchor);
  const register = React.useCallback(
    (node: HTMLDivElement | null) => {
      const caller = assignRef(ref, node),
        own = assignRef(anchor, node);
      return () => {
        caller();
        own();
      };
    },
    [ref, anchor],
  );
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <Base.Trigger
      tabIndex={0}
      {...props}
      {...compiled}
      ref={register}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot="context-menu-trigger"
    />
  );
}
export function ContextMenuPositioner({
  layout = "vertical",
  previewAlign = "leading",
  xstyle,
  children,
  ...props
}: React.ComponentProps<typeof Menu.Positioner> & {
  /** Horizontal preview/menu composition on wide screens; stacks on small screens. */
  layout?: "vertical" | "horizontal";
  previewAlign?: "leading" | "trailing";
}) {
  return (
    <Menu.Positioner align="start" {...props} xstyle={xstyle}>
      <div
        data-slot="context-menu-layout"
        {...stylex.props(
          s.positioner,
          previewAlign === "trailing" && s.trailing,
          layout === "horizontal" &&
            (previewAlign === "trailing" ? s.horizontalTrailing : s.horizontal),
        )}
      >
        {children}
      </div>
    </Menu.Positioner>
  );
}
export function ContextMenuPopup({
  xstyle,
  bar,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof Menu.Popup> & {
  /** Compact actions shown before expanding the complete menu. */
  bar?: React.ReactNode;
}) {
  const presentation = React.useContext(ContextPresentation);
  const compact = !!bar && presentation?.compact;
  const element = React.useRef<HTMLDivElement | null>(null);
  const from = React.useRef<DOMRect | null>(null);
  const register = React.useCallback(
    (node: HTMLDivElement | null) => {
      const own = assignRef(element, node),
        caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    const popup = element.current,
      origin = from.current;
    if (compact || !popup || !origin) return;
    from.current = null;
    let stop = () => {};
    const cancel = afterMenuPlacement(popup.parentElement!, () => {
      const target = popup.getBoundingClientRect();
      const previous = popup.style.transformOrigin;
      popup.style.transformOrigin = "0 0";
      const spring = createSpring(0, 600, 46, (t) => {
        popup.style.transform =
          t === 1
            ? ""
            : `translate(${(origin.x - target.x) * (1 - t)}px, ${(origin.y - target.y) * (1 - t)}px) scale(${(origin.width + (target.width - origin.width) * t) / target.width}, ${(origin.height + (target.height - origin.height) * t) / target.height})`;
      });
      spring.paint();
      spring.set(1);
      stop = () => {
        spring.stop();
        popup.style.transform = "";
        popup.style.transformOrigin = previous;
      };
    });
    return () => {
      cancel();
      stop();
    };
  }, [compact]);
  const expand = () => {
    from.current = element.current?.getBoundingClientRect() ?? null;
    presentation?.expand();
  };
  return (
    <Menu.Popup {...props} ref={register} xstyle={[s.popup, compact && s.compactPopup, xstyle]}>
      {compact ? (
        <div {...stylex.props(s.bar)}>
          {bar}
          <Menu.Item
            closeOnClick={false}
            aria-label="More actions"
            onClick={expand}
            xstyle={[menuStyles.barItem, s.barItem]}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Menu.Item>
        </div>
      ) : (
        children
      )}
    </Menu.Popup>
  );
}
export function ContextMenuBarItem({ xstyle, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return <Menu.Item {...props} xstyle={[menuStyles.barItem, s.barItem, xstyle]} />;
}
/** A noninteractive preview of the target content, separate from the menu material. */
export function ContextMenuPreview({
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const source = React.useContext(MenuBackdropAnchor);
  const presentation = React.useContext(ContextPresentation);
  const retainPreview = presentation?.retainPreview;
  const returned = presentation?.returned;
  React.useLayoutEffect(() => {
    const preview = elementRef.current;
    const trigger = source?.current;
    const popup = preview?.parentElement?.querySelector<HTMLElement>('[data-slot="menu-popup"]');
    if (!preview || !trigger || !popup || !retainPreview || !returned) return;
    retainPreview();
    const cleanup = presentContextPreview(preview, trigger, popup, returned);
    return () => {
      cleanup();
      returned();
    };
  }, [source, retainPreview, returned]);
  const register = React.useCallback(
    (node: HTMLDivElement | null) => {
      const own = assignRef(elementRef, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element?.parentElement) return;
    const parent = element.parentElement;
    const source = parent.closest("[data-theme]") ?? document.documentElement;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      element.dataset["theme"] = getComputedStyle(parent).colorScheme.includes("dark")
        ? "dark"
        : "light";
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(source, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });
    media.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);
  const compiled = stylex.props(s.preview, xstyle);
  return (
    <div
      ref={register}
      data-level="elevated"
      aria-hidden="true"
      inert
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="context-menu-preview"
    />
  );
}
export function ContextMenuBackdrop({
  xstyle,
  ...props
}: React.ComponentProps<typeof Menu.Backdrop>) {
  return <Menu.Backdrop {...props} xstyle={[s.backdrop, xstyle]} />;
}
// Native Base UI ContextMenu already shares Menu's item/submenu primitives.
// Reuse Lenso's complete presentation and controllers instead of copying them.
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Positioner: ContextMenuPositioner,
  Popup: ContextMenuPopup,
  BarItem: ContextMenuBarItem,
  Preview: ContextMenuPreview,
  Backdrop: ContextMenuBackdrop,
  Portal: Menu.Portal,
  Item: Menu.Item,
  ActionGroup: Menu.ActionGroup,
  Action: Menu.Action,
  CheckboxItem: Menu.CheckboxItem,
  CheckboxItemIndicator: Menu.CheckboxItemIndicator,
  RadioItem: Menu.RadioItem,
  RadioItemIndicator: Menu.RadioItemIndicator,
  RadioGroup: Menu.RadioGroup,
  LinkItem: Menu.LinkItem,
  Section: Menu.Group,
  Group: Menu.Group,
  GroupLabel: Menu.GroupLabel,
  Separator: Menu.Separator,
  SubmenuRoot: Menu.SubmenuRoot,
  SubmenuTrigger: Menu.SubmenuTrigger,
  Viewport: Menu.Viewport,
});
