import {
  bindPanel,
  createChange,
  createController,
  createFocusRecovery,
  type FocusRecovery,
  definePrimitive,
  elements,
  type ChangeDetails,
  type ChangeOptions,
  type SlotDefinition,
} from "@ui-sdk/core";

export type SidebarSide = "left" | "right";
export type SidebarChangeReason = "trigger-press" | "escape-key" | "controller";
export type SidebarController = {
  isOpen: () => boolean;
  setOpen: (open: boolean, options?: ChangeOptions<SidebarChangeReason>) => boolean;
  toggle: (options?: ChangeOptions<SidebarChangeReason>) => boolean;
};
export type SidebarOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: ChangeDetails<SidebarChangeReason>) => void;
  side?: SidebarSide;
  controller?: SidebarController;
};

export type SidebarState = { open: boolean; side: SidebarSide };
export type SidebarItemState = { selected: boolean; nested: boolean };
type SidebarItemOptions = { selected?: boolean; nested?: boolean };
type SidebarApi = SidebarController & {
  trigger: () => HTMLElement | undefined;
  recovery: FocusRecovery;
};
type SidebarSlots = {
  [Name in "root" | "trigger" | "rail" | "panel"]: SlotDefinition<
    SidebarState,
    SidebarApi,
    {},
    SidebarState
  >;
} & {
  item: SlotDefinition<SidebarState, SidebarApi, SidebarItemOptions, SidebarItemState>;
} & {
  [
    Name in "header" | "content" | "footer" | "menu" | "menu-item" | "submenu" | "inset"
  ]: SlotDefinition<SidebarState, SidebarApi, {}>;
};

export function createSidebarController() {
  return createController<SidebarController>();
}

export const sidebar: ReturnType<
  typeof definePrimitive<SidebarOptions, SidebarState, SidebarApi, SidebarSlots>
> = definePrimitive({
  name: "sidebar",
  options: {
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    side: "string",
    controller: "value",
  },
  controlled: ["open"],
  state: (options: SidebarOptions) => ({
    open: options.open ?? options.defaultOpen ?? true,
    side: options.side ?? "left",
  }),
  sync: (options) => ({
    ...(options.open === undefined ? {} : { open: options.open }),
    side: options.side ?? "left",
  }),
  api: (context) => {
    const change = createChange(context);
    const setOpen = (open: boolean, options: ChangeOptions<SidebarChangeReason> = {}) =>
      change("open", open, { ...options, reason: options.reason ?? "controller" });
    const trigger = () => elements(context, "trigger")[0]?.el ?? elements(context, "rail")[0]?.el;
    return {
      recovery: createFocusRecovery({ fallback: trigger }),
      isOpen: () => context.store.get().open,
      setOpen,
      toggle: (options?: ChangeOptions<SidebarChangeReason>) =>
        setOpen(!context.store.get().open, options),
      trigger,
    };
  },
  slots: (slot) => {
    const toggle = slot<{}, SidebarState>({
      role: "button",
      focus: "native",
      state: (state) => ({ open: state.open, side: state.side }),
      attrs: (state, part) => ({
        type: "button",
        "aria-controls": `${part.id}-panel`,
        "aria-expanded": String(state.open),
        "data-open": state.open ? "" : undefined,
        "data-closed": state.open ? undefined : "",
        "data-side": state.side,
      }),
      press: ({ api }, event) =>
        api.toggle({ reason: "trigger-press", ...(event ? { event } : {}) }),
    });
    return {
      root: slot<{}, SidebarState>({
        state: (state) => ({ open: state.open, side: state.side }),
        attrs: (state) => ({
          "data-open": state.open ? "" : undefined,
          "data-closed": state.open ? undefined : "",
          "data-side": state.side,
        }),
      }),
      trigger: toggle,
      rail: toggle,
      panel: slot<{}, SidebarState>({
        role: "complementary",
        state: (state) => ({ open: state.open, side: state.side }),
        attrs: (state, part) => ({
          id: `${part.id}-panel`,
          hidden: state.open ? undefined : "",
          "aria-hidden": String(!state.open),
          "data-open": state.open ? "" : undefined,
          "data-closed": state.open ? undefined : "",
          "data-side": state.side,
        }),
        on: {
          keydown: (event, { api, store }) => {
            if (event.key !== "Escape" || !store.get().open) return;
            event.preventDefault();
            api.setOpen(false, { reason: "escape-key", event });
          },
        },
        bind: (el, part) => {
          const { api, store } = part;
          const recover = api.recovery.bind(el, part);
          const unbind = bindPanel(el, {
            size: (element, height, width) => {
              element.style.setProperty("--sidebar-panel-height", height);
              element.style.setProperty("--sidebar-panel-width", width);
            },
            isOpen: () => store.get().open,
            isExiting: () => false,
            isFindable: () => false,
            opening: () => "instant",
            reveal: (event) => {
              api.setOpen(true, { reason: "controller", event });
            },
            trigger: api.trigger,
            subscribe: store.subscribe,
            settled: () => {},
            exited: () => {},
          });
          return () => {
            unbind();
            recover();
          };
        },
      }),
      item: slot<{ selected?: boolean; nested?: boolean }, { selected: boolean; nested: boolean }>({
        props: { selected: "boolean", nested: "boolean" },
        state: (_, { props }) => ({
          selected: props.selected ?? false,
          nested: props.nested ?? false,
        }),
        attrs: (_, { props }) => ({
          "aria-current": props.selected ? "page" : undefined,
          "data-selected": props.selected ? "" : undefined,
          "data-nested": props.nested ? "" : undefined,
        }),
      }),
      header: slot({}),
      content: slot({}),
      footer: slot({}),
      menu: slot({}),
      "menu-item": slot({}),
      submenu: slot({}),
      inset: slot({}),
    };
  },
  agent: { actions: ["setOpen", "toggle"] },
});
