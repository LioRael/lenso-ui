import {
  bindDrag,
  createChange,
  createController,
  createRovingFocus,
  definePrimitive,
  elements,
  selects,
  type ChangeDetails,
  type ChangeOptions,
  type SlotDefinition,
} from "@ui-sdk/core";

export type SectionIndexItem = {
  value: string;
  label: string;
  href: `#${string}`;
  disabled?: boolean;
};
export type SectionIndexReason = "item-press" | "drag" | "imperative";
export type SectionIndexController = {
  getValue(): string | null;
  setValue(value: string, options?: ChangeOptions<SectionIndexReason>): boolean;
};
export type SectionIndexOptions = {
  items: readonly SectionIndexItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, details: ChangeDetails<SectionIndexReason>) => void;
  disabled?: boolean;
  controller?: SectionIndexController;
};
type State = {
  value: string | null;
  focused: string | null;
  disabled: boolean;
  items: readonly SectionIndexItem[];
};
type ItemProps = { value: string; href: string; disabled?: boolean };
type Api = SectionIndexController & {
  roving: ReturnType<typeof createRovingFocus<State, ItemProps>>;
  scrub(event: PointerEvent, el: HTMLElement): void;
};
type Slots = {
  root: SlotDefinition<State, Api, {}, State>;
  item: SlotDefinition<State, Api, ItemProps>;
};
export function createSectionIndexController() {
  return createController<SectionIndexController>();
}
export const sectionIndex: ReturnType<
  typeof definePrimitive<SectionIndexOptions, State, Api, Slots>
> = definePrimitive({
  name: "section-index",
  options: {
    items: "list",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    disabled: "boolean",
    controller: "value",
  },
  controlled: ["value"],
  state: (options: SectionIndexOptions): State => ({
    value: options.value === undefined ? (options.defaultValue ?? null) : options.value,
    focused: null,
    disabled: !!options.disabled,
    items: options.items,
  }),
  sync: (options) => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    disabled: !!options.disabled,
    items: options.items,
  }),
  api: (context) => {
    const change = createChange(context);
    const roving = createRovingFocus<State, ItemProps>(context, {
      slot: "item",
      key: "focused",
      focusable: (item) => !context.store.get().disabled && !item.props.disabled,
      preferred: (item) => item.key === context.store.get().value,
      claims: (state, item) =>
        !state.disabled && !item.props.disabled && (!state.value || item.key === state.value),
    });
    let release: (() => void) | undefined;
    context.onDestroy(() => release?.());
    const setValue = (value: string, options: ChangeOptions<SectionIndexReason> = {}) => {
      const state = context.store.get();
      const item = state.items.find((item) => item.value === value);
      if (state.disabled || !item || item.disabled) return false;
      const accepted = change("value", value, {
        ...options,
        reason: options.reason ?? "imperative",
      });
      if (accepted || state.value === value) {
        const document = elements(context, "root")[0]?.el.ownerDocument;
        let fragment = item.href.slice(1);
        try {
          fragment = decodeURIComponent(fragment);
        } catch {
          /* Browsers also accept literal percent signs in fragment IDs. */
        }
        document?.getElementById(fragment)?.scrollIntoView();
      }
      return accepted;
    };
    return {
      getValue: () => context.store.get().value,
      setValue,
      roving,
      scrub(event, el) {
        if (
          release ||
          context.store.get().disabled ||
          event.button !== 0 ||
          !event.isPrimary ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        const pick = (y: number, event: PointerEvent) => {
          const nearest = roving
            .items()
            .map((item) => {
              const rect = item.el.getBoundingClientRect();
              return { item, distance: Math.abs(y - rect.top - rect.height / 2) };
            })
            .sort((a, b) => a.distance - b.distance)[0]?.item;
          if (nearest) setValue(nearest.key, { reason: "drag", event });
        };
        if (event.target instanceof Element && event.target.closest('[aria-disabled="true"]'))
          return;
        event.preventDefault();
        pick(event.clientY, event);
        release = bindDrag(el, event, {
          cancelOnEscape: true,
          onMove: ({ y, event }) => pick(y, event),
          onEnd: () => {
            release = undefined;
          },
        });
      },
    };
  },
  slots: (slot) => ({
    root: slot<{}, State>({
      state: (state) => state,
      attrs: (state) => ({ "data-disabled": state.disabled ? "" : undefined }),
      on: { pointerdown: (event, { api, el }) => api.scrub(event, el!) },
    }),
    item: slot<ItemProps>({
      props: { value: "string", href: "string", disabled: "boolean" },
      selects: selects({ value: ({ key }) => [key, null], focused: ({ key }) => [key, null] }),
      attrs: (state, part) => ({
        href: part.props.href,
        draggable: "false",
        "aria-disabled": state.disabled || part.props.disabled ? "true" : undefined,
        "aria-current": state.value === part.key ? "location" : undefined,
        tabindex:
          state.disabled || part.props.disabled ? "-1" : part.api.roving.tabIndex(state, part),
      }),
      press: ({ api, key, props, store }, event) => {
        if (
          event instanceof MouseEvent &&
          (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        )
          return;
        const state = store.get();
        if (props.disabled || state.disabled) {
          event?.preventDefault();
          return;
        }
        if (
          !api.setValue(key, { reason: "item-press", ...(event ? { event } : {}) }) &&
          state.value !== key
        )
          event?.preventDefault();
      },
      on: {
        keydown: (event, { api, el, key }) => {
          if (
            event.key === "Enter" &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            event.preventDefault();
            api.setValue(key, { reason: "item-press", event });
          } else api.roving.keydown(event, el!);
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
  }),
  agent: {
    actions: ["setValue"],
    closed: true,
    items: (api) =>
      api.roving.items().map(({ key, el }) => ({ value: key, label: el.textContent ?? key })),
  },
});
