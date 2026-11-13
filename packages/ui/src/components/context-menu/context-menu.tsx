"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { MenuContextTrigger, MenuContent as NativeMenuContent } from "@ui-sdk/react/menu";
import { contextMenuStyles as s } from "@lenso/tokens/context-menu";
import { Menu, MenuSurface, useMenuSourceRef } from "../menu/menu.js";
import { slotRender } from "../../utils/sdk-render.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { presentContextPreview } from "../../utils/interaction/context-preview.js";
import { afterMenuPlacement } from "../../utils/interaction/menu-placement.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { finishPopupExit } from "../../utils/interaction/popup-exit.js";
import { createSpring } from "@lenso/glass/motion";
import { menuStyles } from "@lenso/tokens/menu";
import { IconChevronRight } from "../../icons/index.js";
const Presentation = React.createContext<{
  trigger: React.RefObject<HTMLElement | null>;
  compact: boolean;
  expand: () => void;
} | null>(null);
export type ContextMenuRootProps = Omit<React.ComponentProps<typeof Menu.Root>, "morphTrigger"> & {
  compact?: boolean;
};
export function ContextMenuRoot({ compact = false, onOpenChange, ...props }: ContextMenuRootProps) {
  const trigger = React.useRef<HTMLElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const expand = React.useCallback(() => setExpanded(true), []);
  const value = React.useMemo(
    () => ({ trigger, compact: compact && !expanded, expand }),
    [compact, expanded, expand],
  );
  return (
    <Presentation value={value}>
      <Menu.Root
        {...props}
        morphTrigger={false}
        onOpenChange={(open, details) => {
          onOpenChange?.(open, details);
          if (open && !details.canceled) setExpanded(false);
        }}
      />
    </Presentation>
  );
}
export function ContextMenuTrigger({
  xstyle,
  style,
  ref,
  ...props
}: StyleXProps<React.ComponentProps<typeof MenuContextTrigger>>) {
  const presentation = React.useContext(Presentation);
  const sourceRef = useMenuSourceRef(ref);
  const register = React.useCallback(
    (node: HTMLElement | null) => {
      const source = assignRef(sourceRef, node);
      const own = assignRef(presentation?.trigger, node);
      return () => {
        source();
        own();
      };
    },
    [sourceRef, presentation],
  );
  const compiled = stylex.props(s.trigger, xstyle);
  return (
    <MenuContextTrigger
      tabIndex={0}
      {...props}
      ref={register}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", "context-menu-trigger", props.render)}
    />
  );
}
export type ContextMenuContentProps = React.ComponentProps<typeof Menu.Content> & {
  preview?: React.ReactNode;
  bar?: React.ReactNode;
  layout?: "vertical" | "horizontal";
  previewAlign?: "leading" | "trailing";
  dim?: boolean;
};
export function ContextMenuContent({
  preview,
  align = "start",
  bar,
  layout = "vertical",
  previewAlign = "leading",
  dim = true,
  children,
  ref,
  xstyle,
  ...props
}: ContextMenuContentProps) {
  const presentation = React.useContext(Presentation);
  const compact = !!bar && !!presentation?.compact;
  const host = React.useRef<HTMLDivElement>(null);
  const from = React.useRef<DOMRect | null>(null);
  const register = React.useCallback(
    (node: HTMLDivElement | null) => {
      const own = assignRef(host, node),
        caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    if (compact || !from.current || !host.current) return;
    const origin = from.current;
    from.current = null;
    const panel = host.current.querySelector<HTMLElement>('[data-lenso-slot="menu-popup"]');
    if (!panel) return;
    let stop = () => {};
    const cancel = afterMenuPlacement(host.current, () => {
      const target = panel.getBoundingClientRect();
      const previous = panel.style.transformOrigin;
      panel.style.transformOrigin = "0 0";
      const spring = createSpring(0, 600, 46, (t) => {
        panel.style.transform =
          t === 1
            ? ""
            : `translate(${(origin.x - target.x) * (1 - t)}px, ${(origin.y - target.y) * (1 - t)}px) scale(${(origin.width + (target.width - origin.width) * t) / target.width}, ${(origin.height + (target.height - origin.height) * t) / target.height})`;
      });
      spring.paint();
      spring.set(1);
      stop = () => {
        spring.stop();
        panel.style.transform = "";
        panel.style.transformOrigin = previous;
      };
    });
    return () => {
      cancel();
      stop();
    };
  }, [compact]);
  return (
    <MenuSurface
      {...props}
      ref={register}
      nativeContent={NativeMenuContent}
      align={align}
      xstyle={xstyle}
      layout={{
        before: preview,
        xstyle: [
          s.host,
          dim && s.dimmed,
          previewAlign === "trailing" && s.trailing,
          layout === "horizontal" &&
            (previewAlign === "trailing" ? s.horizontalTrailing : s.horizontal),
        ],
        panelXstyle: [s.popup, s.panel, compact && s.compactPopup],
      }}
    >
      {(state) =>
        compact ? (
          <div {...stylex.props(s.bar)}>
            {bar}
            <Menu.Item
              closeOnSelect={false}
              aria-label="More actions"
              onSelect={() => {
                from.current =
                  host.current
                    ?.querySelector<HTMLElement>('[data-lenso-slot="menu-popup"]')
                    ?.getBoundingClientRect() ?? null;
                presentation?.expand();
              }}
              xstyle={[menuStyles.barItem, s.barItem]}
            >
              <IconChevronRight />
            </Menu.Item>
          </div>
        ) : typeof children === "function" ? (
          children(state)
        ) : (
          children
        )
      }
    </MenuSurface>
  );
}
export function ContextMenuBarItem({ xstyle, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return <Menu.Item {...props} xstyle={[menuStyles.barItem, s.barItem, xstyle]} />;
}
export function ContextMenuPreview({
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const presentation = React.useContext(Presentation);
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const register = React.useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
  React.useLayoutEffect(() => {
    const source = presentation?.trigger.current;
    const panel = element?.parentElement?.querySelector<HTMLElement>(
      '[data-lenso-slot="menu-popup"]',
    );
    if (!element || !source || !panel) return;
    const host = element.parentElement!;
    return presentContextPreview(element, source, panel, () => finishPopupExit(host));
  }, [element, presentation?.trigger]);
  const compiled = stylex.props(s.preview, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      ref={register}
      aria-hidden="true"
      inert
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="context-menu-preview"
    />
  );
}
export const ContextMenu = Object.assign(ContextMenuRoot, {
  ...Menu,
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  BarItem: ContextMenuBarItem,
  Preview: ContextMenuPreview,
  Section: Menu.Group,
});
