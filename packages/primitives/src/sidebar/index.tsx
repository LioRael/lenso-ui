"use client";

import * as React from "react";
import { Button } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

export type SidebarSide = "left" | "right";
export type SidebarDirection = "ltr" | "rtl";

export interface SidebarState {
  open: boolean;
}

export interface SidebarActions {
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export interface SidebarMeta {
  dir: SidebarDirection;
  panelId: string;
  rootId: string;
  side: SidebarSide;
  triggerRef: React.RefObject<HTMLElement | null>;
}

interface SidebarController {
  actions: SidebarActions;
  meta: SidebarMeta;
  state: SidebarState;
}

interface SidebarGroupContextValue {
  get: (rootId: string) => SidebarController | null;
  register: (controller: SidebarController) => () => void;
  subscribe: (listener: () => void) => () => void;
}

const SidebarContext = React.createContext<SidebarController | null>(null);
const SidebarGroupContext = React.createContext<SidebarGroupContextValue | null>(null);

type SidebarRenderProps<ElementType extends React.ElementType, State = {}> = Omit<
  useRender.ComponentProps<ElementType, State>,
  "ref"
> & {
  ref?: React.Ref<HTMLElement>;
};

function useSidebarController(part: string): SidebarController {
  const nearest = React.useContext(SidebarContext);
  if (!nearest) throw new Error(`Sidebar.${part} must be used within Sidebar.Root`);
  return nearest;
}

const noopSubscribe = () => () => {};

function useTargetController(targetId: string | undefined): SidebarController | null {
  const group = React.useContext(SidebarGroupContext);
  return React.useSyncExternalStore(
    group?.subscribe ?? noopSubscribe,
    () => (targetId ? (group?.get(targetId) ?? null) : null),
    () => null,
  );
}

function useControllableOpen({
  defaultOpen,
  onOpenChange,
  open,
}: {
  defaultOpen: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
  open: boolean | undefined;
}): [boolean, (nextOpen: boolean) => void] {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const controlled = open !== undefined;
  const currentOpen = controlled ? open : uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!controlled) setUncontrolledOpen(nextOpen);
      if (nextOpen !== currentOpen) onOpenChange?.(nextOpen);
    },
    [controlled, currentOpen, onOpenChange],
  );
  return [currentOpen, setOpen];
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}

export interface SidebarGroupProps extends SidebarRenderProps<"div"> {}

export function SidebarGroup({ children, ref, render, ...props }: SidebarGroupProps) {
  const store = React.useRef<{
    controllers: Map<string, SidebarController>;
    listeners: Set<() => void>;
  }>({ controllers: new Map(), listeners: new Set() });
  const value = React.useMemo<SidebarGroupContextValue>(
    () => ({
      get: (rootId) => store.current.controllers.get(rootId) ?? null,
      register: (controller) => {
        store.current.controllers.set(controller.meta.rootId, controller);
        for (const listener of store.current.listeners) listener();
        return () => {
          if (store.current.controllers.get(controller.meta.rootId) === controller) {
            store.current.controllers.delete(controller.meta.rootId);
            for (const listener of store.current.listeners) listener();
          }
        };
      },
      subscribe: (listener) => {
        store.current.listeners.add(listener);
        return () => store.current.listeners.delete(listener);
      },
    }),
    [],
  );
  const element = useRender({
    defaultTagName: "div",
    ref,
    render,
    props: {
      ...mergeProps<"div">({ children }, props),
      "data-slot": "sidebar-group",
    },
  });

  return <SidebarGroupContext.Provider value={value}>{element}</SidebarGroupContext.Provider>;
}

export interface SidebarProviderProps {
  actions: SidebarActions;
  children?: React.ReactNode;
  meta: SidebarMeta;
  state: SidebarState;
}

export function SidebarProvider({ actions, children, meta, state }: SidebarProviderProps) {
  const group = React.useContext(SidebarGroupContext);
  const controller = React.useMemo(() => ({ actions, meta, state }), [actions, meta, state]);

  React.useEffect(() => group?.register(controller), [controller, group]);

  return <SidebarContext.Provider value={controller}>{children}</SidebarContext.Provider>;
}

export type SidebarRootState = {
  dir: SidebarDirection;
  open: boolean;
  side: SidebarSide;
};

export interface SidebarRootProps extends Omit<
  SidebarRenderProps<"div", SidebarRootState>,
  "defaultValue" | "dir"
> {
  defaultOpen?: boolean;
  dir?: SidebarDirection;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: SidebarSide;
}

export function SidebarRoot({
  defaultOpen = true,
  dir = "ltr",
  id,
  onOpenChange,
  open,
  ref,
  render,
  side = "left",
  ...props
}: SidebarRootProps) {
  const generatedId = React.useId();
  const rootId = id ?? `sidebar-${generatedId.replaceAll(":", "")}`;
  const panelId = `${rootId}-panel`;
  const [currentOpen, setOpen] = useControllableOpen({ defaultOpen, onOpenChange, open });
  const triggerRef = React.useRef<HTMLElement>(null);
  const state = React.useMemo(() => ({ open: currentOpen }), [currentOpen]);
  const actions = React.useMemo<SidebarActions>(
    () => ({
      setOpen,
      toggle: () => setOpen(!currentOpen),
    }),
    [currentOpen, setOpen],
  );
  const meta = React.useMemo<SidebarMeta>(
    () => ({ dir, panelId, rootId, side, triggerRef }),
    [dir, panelId, rootId, side],
  );
  const renderState = React.useMemo<SidebarRootState>(
    () => ({ dir, open: currentOpen, side }),
    [currentOpen, dir, side],
  );
  const element = useRender<SidebarRootState, HTMLElement>({
    defaultTagName: "div",
    ref,
    render,
    state: renderState,
    stateAttributesMapping: {
      dir: () => null,
      open: (value) => ({ "data-state": value ? "open" : "closed" }),
      side: (value) => ({ "data-side": value }),
    },
    props: {
      ...mergeProps<"div">({ dir, id: rootId }, props),
      "data-slot": "sidebar-root",
    },
  });

  return (
    <SidebarProvider actions={actions} meta={meta} state={state}>
      {element}
    </SidebarProvider>
  );
}

export interface SidebarTriggerProps extends Omit<Button.Props, "ref"> {
  ref?: React.Ref<HTMLElement>;
  targetId?: string;
}

export function SidebarTrigger({ onClick, ref, targetId, ...props }: SidebarTriggerProps) {
  const nearest = React.useContext(SidebarContext);
  const targeted = useTargetController(targetId);
  const controller = targetId ? targeted : nearest;
  if (!targetId && !controller) {
    throw new Error("Sidebar.Trigger must be used within Sidebar.Root or specify targetId");
  }
  const panelId = controller?.meta.panelId ?? `${targetId}-panel`;
  const open = controller?.state.open ?? false;
  return (
    <Button
      {...props}
      aria-controls={panelId}
      aria-expanded={open}
      data-side={controller?.meta.side}
      data-slot="sidebar-trigger"
      data-state={open ? "open" : "closed"}
      disabled={props.disabled || !controller}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.baseUIHandlerPrevented) {
          controller?.actions.toggle();
        }
      }}
      ref={controller ? composeRefs(controller.meta.triggerRef, ref) : ref}
    />
  );
}

export type SidebarPanelState = {
  open: boolean;
  side: SidebarSide;
};

export interface SidebarPanelProps extends SidebarRenderProps<"aside", SidebarPanelState> {}

export function SidebarPanel({ onKeyDown, ref, render, ...props }: SidebarPanelProps) {
  const controller = useSidebarController("Panel");
  const state = React.useMemo<SidebarPanelState>(
    () => ({ open: controller.state.open, side: controller.meta.side }),
    [controller.meta.side, controller.state.open],
  );

  // Escape is delegated from interactive descendants so the landmark itself stays non-interactive.
  return useRender<SidebarPanelState, HTMLElement>({
    defaultTagName: "aside",
    ref,
    render,
    state,
    stateAttributesMapping: {
      open: (value) => ({ "data-state": value ? "open" : "closed" }),
      side: (value) => ({ "data-side": value }),
    },
    props: {
      ...mergeProps<"aside">(
        {
          "aria-hidden": !controller.state.open,
          hidden: !controller.state.open,
          id: controller.meta.panelId,
          onKeyDown(event) {
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.preventDefault();
              controller.actions.setOpen(false);
              queueMicrotask(() => controller.meta.triggerRef.current?.focus());
            }
          },
        },
        { ...props, onKeyDown },
      ),
      "data-slot": "sidebar-panel",
    },
  });
}

export interface SidebarRailProps extends Omit<Button.Props, "ref"> {
  closeLabel?: string;
  openLabel?: string;
  ref?: React.Ref<HTMLElement>;
  targetId?: string;
}

export function SidebarRail({
  "aria-label": ariaLabel,
  closeLabel = "Close sidebar",
  onClick,
  openLabel = "Open sidebar",
  ref,
  targetId,
  ...props
}: SidebarRailProps) {
  const nearest = React.useContext(SidebarContext);
  const targeted = useTargetController(targetId);
  const controller = targetId ? targeted : nearest;
  if (!targetId && !controller) {
    throw new Error("Sidebar.Rail must be used within Sidebar.Root or specify targetId");
  }
  const panelId = controller?.meta.panelId ?? `${targetId}-panel`;
  const open = controller?.state.open ?? false;
  return (
    <Button
      {...props}
      aria-controls={panelId}
      aria-expanded={open}
      aria-label={ariaLabel ?? (open ? closeLabel : openLabel)}
      data-side={controller?.meta.side}
      data-slot="sidebar-rail"
      data-state={open ? "open" : "closed"}
      disabled={props.disabled || !controller}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.baseUIHandlerPrevented) {
          controller?.actions.toggle();
        }
      }}
      ref={ref}
    />
  );
}

function useSidebarPart<TagName extends keyof React.JSX.IntrinsicElements>(
  defaultTagName: TagName,
  slot: string,
  { ref, render, ...props }: SidebarRenderProps<TagName>,
) {
  return useRender({
    defaultTagName,
    ref,
    render,
    props: { ...props, "data-slot": slot },
  });
}

export interface SidebarHeaderProps extends SidebarRenderProps<"div"> {}
export function SidebarHeader(props: SidebarHeaderProps) {
  return useSidebarPart("div", "sidebar-header", props);
}

export interface SidebarContentProps extends SidebarRenderProps<"div"> {}
export function SidebarContent(props: SidebarContentProps) {
  return useSidebarPart("div", "sidebar-content", props);
}

export interface SidebarFooterProps extends SidebarRenderProps<"div"> {}
export function SidebarFooter(props: SidebarFooterProps) {
  return useSidebarPart("div", "sidebar-footer", props);
}

export interface SidebarMenuProps extends SidebarRenderProps<"ul"> {}
export function SidebarMenu(props: SidebarMenuProps) {
  return useSidebarPart("ul", "sidebar-menu", props);
}

export interface SidebarSubmenuProps extends SidebarRenderProps<"ul"> {}
export function SidebarSubmenu(props: SidebarSubmenuProps) {
  return useSidebarPart("ul", "sidebar-submenu", props);
}

export interface SidebarMenuItemProps extends SidebarRenderProps<"li"> {}
export function SidebarMenuItem(props: SidebarMenuItemProps) {
  return useSidebarPart("li", "sidebar-menu-item", props);
}

export type SidebarItemState = {
  nested: boolean;
  selected: boolean;
};

export interface SidebarItemProps extends SidebarRenderProps<"button", SidebarItemState> {
  nested?: boolean;
  selected?: boolean;
}

export function SidebarItem({
  nested = false,
  ref,
  render,
  selected = false,
  ...props
}: SidebarItemProps) {
  const state = React.useMemo<SidebarItemState>(() => ({ nested, selected }), [nested, selected]);

  return useRender<SidebarItemState, HTMLElement>({
    defaultTagName: "button",
    ref,
    render,
    state,
    stateAttributesMapping: {
      nested: (value) => ({ "data-level": value ? "nested" : "root" }),
      selected: (value) => ({ "data-state": value ? "selected" : "default" }),
    },
    props: {
      ...mergeProps<"button">(
        {
          "aria-current": selected ? "page" : undefined,
        },
        props,
      ),
      "data-slot": "sidebar-item",
    },
  });
}

export interface SidebarInsetProps extends SidebarRenderProps<"main"> {}
export function SidebarInset(props: SidebarInsetProps) {
  return useSidebarPart("main", "sidebar-inset", props);
}

export const Sidebar = {
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Header: SidebarHeader,
  Inset: SidebarInset,
  Item: SidebarItem,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  Panel: SidebarPanel,
  Provider: SidebarProvider,
  Rail: SidebarRail,
  Root: SidebarRoot,
  Submenu: SidebarSubmenu,
  Trigger: SidebarTrigger,
} as const;
