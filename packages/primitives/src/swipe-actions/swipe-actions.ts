import {
  createChange,
  createController,
  createSwipeActions,
  definePrimitive,
  elements,
  live,
  type ChangeDetails,
  type ChangeOptions,
  type SlotDefinition,
  type SwipeDraft,
  type SwipeOpen,
  type SwipeSide,
} from "@ui-sdk/core";
export type SwipeActionsReason =
  | "swipe"
  | "trigger-press"
  | "escape-key"
  | "outside-press"
  | "imperative";
export type SwipeActionsController = {
  getOpenSide(): SwipeSide | null;
  setOpenSide(side: SwipeSide | null, options?: ChangeOptions<SwipeActionsReason>): boolean;
};
export type SwipeActionsOptions = {
  open?: SwipeOpen | null;
  defaultOpen?: SwipeOpen | null;
  onOpenChange?: (open: SwipeOpen | null, details: ChangeDetails<SwipeActionsReason>) => void;
  onFullSwipe?: (side: SwipeSide, details: { event: Event }) => boolean;
  disabled?: boolean;
  controller?: SwipeActionsController;
};
type State = { open: SwipeOpen | null; swiping: SwipeDraft | null; disabled: boolean };
type Api = SwipeActionsController & {
  swipe: ReturnType<typeof createSwipeActions<State>>;
  run(event: Event, action: () => void): void;
  keydown(event: KeyboardEvent): void;
};
type ActionProps = { side: SwipeSide; value: string };
type Slots = {
  root: SlotDefinition<State, Api, {}, State>;
  content: SlotDefinition<State, Api, {}>;
  body: SlotDefinition<State, Api, {}>;
  actions: SlotDefinition<State, Api, ActionProps>;
  trigger: SlotDefinition<State, Api, ActionProps>;
};
export function createSwipeActionsController() {
  return createController<SwipeActionsController>();
}
export const swipeActions: ReturnType<
  typeof definePrimitive<SwipeActionsOptions, State, Api, Slots>
> = definePrimitive({
  name: "swipe-actions",
  options: {
    open: "value",
    defaultOpen: "value",
    onOpenChange: "callback",
    onFullSwipe: "action",
    disabled: "boolean",
    controller: "value",
  },
  controlled: ["open"],
  live: ["swiping"],
  state: (options: SwipeActionsOptions): State => ({
    open: options.open === undefined ? (options.defaultOpen ?? null) : options.open,
    swiping: null,
    disabled: !!options.disabled,
  }),
  sync: (options) => ({
    ...(options.open === undefined ? {} : { open: options.open }),
    disabled: !!options.disabled,
  }),
  api: (context) => {
    const change = createChange(context);
    let cause: ChangeOptions<SwipeActionsReason> = { reason: "imperative" };
    let accepted = false;
    // The beta swipe helper can request an open after pointer cancellation.
    // Keep that request canceled through the final capture-loss event.
    let canceled = false;
    const store = {
      ...context.store,
      set(patch: Partial<State>, delivered?: boolean) {
        const { open, ...internal } = patch;
        if (open !== undefined && !canceled)
          accepted = change("open", open, { ...cause, reason: cause.reason ?? "imperative" });
        context.store.set(internal, delivered);
      },
    };
    const swipe = createSwipeActions(
      { ...context, store },
      {
        key: "open",
        draft: "swiping",
        disabled: () => context.store.get().disabled,
        fullSwipe: () => (context.options().onFullSwipe ? 0.8 : Infinity),
        onFullSwipe: (_key, side, details) =>
          context.options().onFullSwipe?.(side, details) ?? false,
      },
    );
    const run = (event: Event, action: () => void) => {
      if (event.type === "pointerdown" || event instanceof KeyboardEvent) canceled = false;
      if (event.type === "pointercancel" || event.type === "lostpointercapture") canceled = true;
      cause = {
        event,
        reason:
          event instanceof KeyboardEvent
            ? event.key === "Escape"
              ? "escape-key"
              : "trigger-press"
            : event instanceof PointerEvent &&
                event.target instanceof Element &&
                event.target.closest("[data-swipe-body]") &&
                elements(context, "root").some(({ el }) => el.contains(event.target as Node))
              ? "swipe"
              : "outside-press",
      };
      action();
    };
    const setOpenSide = (
      side: SwipeSide | null,
      options: ChangeOptions<SwipeActionsReason> = {},
    ) => {
      if (context.store.get().disabled && side !== null) return false;
      canceled = false;
      cause = { ...options, reason: options.reason ?? "imperative" };
      accepted = false;
      if (side) swipe.show("row", side);
      else swipe.close();
      return accepted;
    };
    const keydown = (event: KeyboardEvent) =>
      run(event, () => {
        const side = context.store.get().open?.side;
        swipe.keydown(event, "row");
        if (event.key === "Escape" && side && !context.store.get().open)
          elements(context, "trigger")
            .find((part) => context.props<ActionProps>("trigger", part.key)?.side === side)
            ?.el.focus();
      });
    return {
      swipe,
      run,
      keydown,
      getOpenSide: () => context.store.get().open?.side ?? null,
      setOpenSide,
    };
  },
  slots: (slot) => ({
    root: slot<{}, State>({
      state: (state) => state,
      attrs: (state) => ({
        role: "group",
        tabindex: "-1",
        "data-disabled": state.disabled ? "" : undefined,
        "data-open-side": state.open?.side,
      }),
      live: live((state, { api }) => {
        const attrs = api.swipe.contentAttrs(state, "row");
        return { "data-swipe": attrs["data-swipe"], "data-swiping": attrs["data-swiping"] };
      }),
      on: {
        pointerdown: (event, { api, el }) => {
          const body =
            event.target instanceof Element
              ? event.target.closest<HTMLElement>("[data-swipe-body]")
              : null;
          if (body && el?.contains(body))
            api.run(event, () => api.swipe.pointerdown(event, "row", body));
        },
        keydown: (event, { api }) => api.keydown(event),
      },
      bind: (el, { api }) => {
        const unbind = api.swipe.bindRow(el, "row");
        let pointer: { id: number; body: HTMLElement } | undefined;
        const capture = (event: PointerEvent) => {
          if (event.type === "pointerdown") {
            if (!(event.target instanceof Node) || !el.contains(event.target))
              api.run(event, () => {});
            const body =
              event.target instanceof Element
                ? event.target.closest<HTMLElement>("[data-swipe-body]")
                : null;
            if (event.button !== 0 || !event.isPrimary || !body || !el.contains(body)) return;
            pointer = { id: event.pointerId, body };
          }
          if (!pointer || event.pointerId !== pointer.id) return;
          // Capture can move from a touched child to the drag owner without ending the swipe.
          if (
            event.type === "lostpointercapture" &&
            (event.target !== pointer.body || pointer.body.hasPointerCapture(pointer.id))
          )
            return;
          api.run(event, () => {});
          if (event.type !== "pointerdown") pointer = undefined;
        };
        const selection = (event: Event) => {
          if (
            !(event.target instanceof Element) ||
            !event.target.closest("input,textarea,select,[contenteditable]")
          )
            event.preventDefault();
        };
        el.addEventListener("selectstart", selection);
        for (const type of [
          "pointerdown",
          "pointerup",
          "pointercancel",
          "lostpointercapture",
        ] as const)
          el.ownerDocument.addEventListener(type, capture, true);
        return () => {
          el.removeEventListener("selectstart", selection);
          for (const type of [
            "pointerdown",
            "pointerup",
            "pointercancel",
            "lostpointercapture",
          ] as const)
            el.ownerDocument.removeEventListener(type, capture, true);
          unbind();
        };
      },
    }),
    body: slot({ attrs: () => ({ "data-swipe-body": "" }) }),
    content: slot({ live: live((state, { api }) => api.swipe.contentAttrs(state, "row")) }),
    actions: slot<ActionProps>({
      props: { side: "string", value: "string" },
      attrs: (state, { api, props, id }) => ({
        id: elementsId(id, props.side),
        ...api.swipe.actionsAttrs(state, "row", props.side),
        "aria-hidden": String(state.disabled || state.open?.side !== props.side),
      }),
      bind: (el, { api, props }) => api.swipe.bindActions(el, "row", props.side),
    }),
    trigger: slot<ActionProps>({
      props: { side: "string", value: "string" },
      role: "button",
      focus: "native",
      attrs: (state, { id, props }) => ({
        type: "button",
        disabled: state.disabled ? "" : undefined,
        "aria-expanded": String(state.open?.side === props.side),
        "aria-controls": elementsId(id, props.side),
      }),
      press: ({ api, props }, event) => {
        api.setOpenSide(api.getOpenSide() === props.side ? null : props.side, {
          reason: "trigger-press",
          ...(event ? { event } : {}),
        });
      },
    }),
  }),
  agent: {
    actions: ["setOpenSide"],
    reveals: true,
    items: () => [
      { value: "start", label: "Leading actions" },
      { value: "end", label: "Trailing actions" },
    ],
  },
});
function elementsId(id: string, side: SwipeSide) {
  return `${id}-${side}-actions`;
}
