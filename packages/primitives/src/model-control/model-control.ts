import {
  createChange,
  createController,
  createRovingFocus,
  definePrimitive,
  type ChangeDetails,
  type ChangeOptions,
  type RovingFocusItem,
  type SlotDefinition,
} from "@ui-sdk/core";
export type ModelValue = string | string[] | null;
export type ModelChangeReason =
  | "input-change"
  | "input-commit"
  | "step-key"
  | "item-press"
  | "list-navigation"
  | "drag"
  | "reset"
  | "imperative";
export type ModelController = {
  getValue(): ModelValue;
  setValue(value: ModelValue, options?: ChangeOptions<ModelChangeReason>): boolean;
  clear(options?: ChangeOptions<ModelChangeReason>): boolean;
  reset(): boolean;
  focus(key?: string): void;
};
export type ModelControlOptions = {
  value?: ModelValue;
  defaultValue?: ModelValue;
  onValueChange?: (value: ModelValue, details: ChangeDetails<ModelChangeReason>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  validate?: (value: ModelValue) => boolean;
  controller?: ModelController;
  move?: (event: KeyboardEvent, from: string) => string | undefined;
};
type State = { value: ModelValue; focused: string | null; disabled: boolean; readOnly: boolean };
type Item = { value: string; disabled?: boolean };
type Api = ModelController & {
  roving: ReturnType<typeof createRovingFocus<State, Item>>;
  run(action: () => void, options: ChangeOptions<ModelChangeReason>): boolean | undefined;
  bind(el: HTMLElement, key: string, disabled?: boolean): () => void;
  navigate(event: KeyboardEvent): void;
};
type Slots = { root: SlotDefinition<State, Api, {}, State> };
export function createModelController() {
  return createController<ModelController>();
}
function modelControl(
  name: string,
): ReturnType<typeof definePrimitive<ModelControlOptions, State, Api, Slots>> {
  return definePrimitive({
    name,
    options: {
      value: "value",
      defaultValue: "value",
      onValueChange: "callback",
      disabled: "boolean",
      readOnly: "boolean",
      validate: "action",
      controller: "value",
      move: "action",
    },
    controlled: ["value"],
    state: (options: ModelControlOptions): State => ({
      value: options.value === undefined ? (options.defaultValue ?? null) : options.value,
      focused: null,
      disabled: !!options.disabled,
      readOnly: !!options.readOnly,
    }),
    sync: (options) => ({
      ...(options.value === undefined ? {} : { value: options.value }),
      disabled: !!options.disabled,
      readOnly: !!options.readOnly,
    }),
    api: (context) => {
      const change = createChange(context);
      let cause: ChangeOptions<ModelChangeReason> = {};
      let result: boolean | undefined;
      const roving = createRovingFocus<State, Item>(context, {
        slot: "item",
        key: "focused",
        orientation: () => "horizontal",
        ...(context.options().move
          ? {
              move: (event: KeyboardEvent, { from }: { from: RovingFocusItem<Item> }) =>
                context.options().move?.(event, from.key),
            }
          : {}),
        focusable: (item) => !context.store.get().disabled && !item.props.disabled,
      });
      const setValue = (value: ModelValue, options: ChangeOptions<ModelChangeReason> = {}) => {
        const state = context.store.get();
        if (
          ((state.disabled || state.readOnly) && options.reason !== "reset") ||
          context.options().validate?.(value) === false
        )
          return (result = false);
        return (result = change("value", value, {
          ...cause,
          ...options,
          reason: options.reason ?? cause.reason ?? "imperative",
        }));
      };
      return {
        roving,
        getValue: () => context.store.get().value,
        setValue,
        clear: (options) => setValue(null, options),
        reset: () => setValue(context.options().defaultValue ?? null, { reason: "reset" }),
        focus: (key) => roving.focus(key),
        run(action, options): boolean | undefined {
          const previous = cause;
          const previousResult = result;
          cause = options;
          result = undefined;
          try {
            action();
            return result;
          } finally {
            cause = previous;
            result = previousResult;
          }
        },
        bind: (el, key, disabled) =>
          roving.bind(el, {
            key,
            props: { value: key, ...(disabled === undefined ? {} : { disabled }) },
          }),
        navigate(event) {
          if (event.target instanceof HTMLElement) roving.keydown(event, event.target);
        },
      };
    },
    slots: (slot) => ({
      root: slot<{}, State>({
        state: (state) => state,
        attrs: (state) => ({
          role: "group",
          "data-disabled": state.disabled ? "" : undefined,
          "data-readonly": state.readOnly ? "" : undefined,
        }),
      }),
    }),
    agent: {
      actions: name === "year-picker" ? ["setValue"] : ["setValue", "clear", "reset"],
      ...(name === "year-picker" ? { closed: true } : {}),
      ...(name === "calendar" || name === "range-calendar" || name === "year-picker"
        ? {
            items: (api: Api) =>
              api.roving.items().map((item: RovingFocusItem<Item> & { el: HTMLElement }) => ({
                value: item.key,
                label: item.el.getAttribute("aria-label") ?? item.el.textContent ?? item.key,
              })),
          }
        : {}),
    },
  });
}
export const dateField: ReturnType<typeof modelControl> = modelControl("date-field");
export const timeField: ReturnType<typeof modelControl> = modelControl("time-field");
export const datePicker: ReturnType<typeof modelControl> = modelControl("date-picker");
export const dateRangePicker: ReturnType<typeof modelControl> = modelControl("date-range-picker");
export const calendar: ReturnType<typeof modelControl> = modelControl("calendar");
export const rangeCalendar: ReturnType<typeof modelControl> = modelControl("range-calendar");

export const colorField: ReturnType<typeof modelControl> = modelControl("color-field");

export const yearPicker: ReturnType<typeof modelControl> = modelControl("year-picker");
