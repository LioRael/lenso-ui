"use client";

import * as React from "react";

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
  triggerRef: React.RefObject<HTMLButtonElement | null>;
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

function composeRefs<T>(
  localRef: React.RefObject<T | null>,
  forwardedRef: React.ForwardedRef<T>,
): (node: T | null) => void {
  return (node) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
}

export interface SidebarGroupProps extends React.ComponentPropsWithoutRef<"div"> {}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup({ children, ...props }, ref) {
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

    return (
      <SidebarGroupContext.Provider value={value}>
        <div {...props} data-slot="sidebar-group" ref={ref}>
          {children}
        </div>
      </SidebarGroupContext.Provider>
    );
  },
);

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

export interface SidebarRootProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "dir"
> {
  defaultOpen?: boolean;
  dir?: SidebarDirection;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  side?: SidebarSide;
}

export const SidebarRoot = React.forwardRef<HTMLDivElement, SidebarRootProps>(function SidebarRoot(
  { defaultOpen = true, dir = "ltr", id, onOpenChange, open, side = "left", ...props },
  ref,
) {
  const generatedId = React.useId();
  const rootId = id ?? `sidebar-${generatedId.replaceAll(":", "")}`;
  const panelId = `${rootId}-panel`;
  const [currentOpen, setOpen] = useControllableOpen({ defaultOpen, onOpenChange, open });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
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

  return (
    <SidebarProvider actions={actions} meta={meta} state={state}>
      <div
        {...props}
        data-side={side}
        data-slot="sidebar-root"
        data-state={currentOpen ? "open" : "closed"}
        dir={dir}
        id={rootId}
        ref={ref}
      />
    </SidebarProvider>
  );
});

export interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  targetId?: string;
}

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ onClick, targetId, type = "button", ...props }, forwardedRef) {
    const nearest = React.useContext(SidebarContext);
    const targeted = useTargetController(targetId);
    const controller = targetId ? targeted : nearest;
    if (!targetId && !controller) {
      throw new Error("Sidebar.Trigger must be used within Sidebar.Root or specify targetId");
    }
    const panelId = controller?.meta.panelId ?? `${targetId}-panel`;
    const open = controller?.state.open ?? false;
    return (
      <button
        {...props}
        aria-controls={panelId}
        aria-expanded={open}
        data-side={controller?.meta.side}
        data-slot="sidebar-trigger"
        data-state={open ? "open" : "closed"}
        disabled={props.disabled || !controller}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) controller?.actions.toggle();
        }}
        ref={controller ? composeRefs(controller.meta.triggerRef, forwardedRef) : forwardedRef}
        type={type}
      />
    );
  },
);

export interface SidebarPanelProps extends React.ComponentPropsWithoutRef<"aside"> {}

export const SidebarPanel = React.forwardRef<HTMLElement, SidebarPanelProps>(function SidebarPanel(
  { onKeyDown, ...props },
  ref,
) {
  const controller = useSidebarController("Panel");
  return (
    // Escape is delegated from interactive descendants so the landmark itself stays non-interactive.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <aside
      {...props}
      aria-hidden={!controller.state.open}
      data-side={controller.meta.side}
      data-slot="sidebar-panel"
      data-state={controller.state.open ? "open" : "closed"}
      hidden={!controller.state.open}
      id={controller.meta.panelId}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          controller.actions.setOpen(false);
          queueMicrotask(() => controller.meta.triggerRef.current?.focus());
        }
      }}
      ref={ref}
    />
  );
});

export interface SidebarRailProps extends React.ComponentPropsWithoutRef<"button"> {
  closeLabel?: string;
  openLabel?: string;
  targetId?: string;
}

export const SidebarRail = React.forwardRef<HTMLButtonElement, SidebarRailProps>(
  function SidebarRail(
    {
      "aria-label": ariaLabel,
      closeLabel = "Close sidebar",
      onClick,
      openLabel = "Open sidebar",
      targetId,
      type = "button",
      ...props
    },
    ref,
  ) {
    const nearest = React.useContext(SidebarContext);
    const targeted = useTargetController(targetId);
    const controller = targetId ? targeted : nearest;
    if (!targetId && !controller) {
      throw new Error("Sidebar.Rail must be used within Sidebar.Root or specify targetId");
    }
    const panelId = controller?.meta.panelId ?? `${targetId}-panel`;
    const open = controller?.state.open ?? false;
    return (
      <button
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
          if (!event.defaultPrevented) controller?.actions.toggle();
        }}
        ref={ref}
        type={type}
      />
    );
  },
);

function createSidebarDivPart(slot: string) {
  return React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    function SidebarPart(props, ref) {
      return <div {...props} data-slot={slot} ref={ref} />;
    },
  );
}

function createSidebarListPart(slot: string) {
  return React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
    function SidebarListPart(props, ref) {
      return <ul {...props} data-slot={slot} ref={ref} />;
    },
  );
}

export const SidebarHeader = createSidebarDivPart("sidebar-header");
export const SidebarContent = createSidebarDivPart("sidebar-content");
export const SidebarFooter = createSidebarDivPart("sidebar-footer");
export const SidebarMenu = createSidebarListPart("sidebar-menu");
export const SidebarSubmenu = createSidebarListPart("sidebar-submenu");
export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function SidebarMenuItem(props, ref) {
  return <li {...props} data-slot="sidebar-menu-item" ref={ref} />;
});

export const SidebarInset = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"main">>(
  function SidebarInset(props, ref) {
    return <main {...props} data-slot="sidebar-inset" ref={ref} />;
  },
);

export const Sidebar = {
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Header: SidebarHeader,
  Inset: SidebarInset,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  Panel: SidebarPanel,
  Provider: SidebarProvider,
  Rail: SidebarRail,
  Root: SidebarRoot,
  Submenu: SidebarSubmenu,
  Trigger: SidebarTrigger,
} as const;
