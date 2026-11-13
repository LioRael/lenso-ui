import {
  createChange,
  createController,
  definePrimitive,
  type ChangeDetails,
  type ChangeOptions,
  type SlotDefinition,
} from "@ui-sdk/core";
export type WheelOption = { value: string; label: string; disabled?: boolean };
export type WheelReason =
  | "item-press"
  | "list-navigation"
  | "scroll"
  | "drag"
  | "reset"
  | "restore"
  | "imperative";
export type WheelController = {
  getValue(): string | null;
  setValue(value: string | null, options?: ChangeOptions<WheelReason>): boolean;
  clear(options?: ChangeOptions<WheelReason>): boolean;
  reset(): boolean;
};
export type WheelOptions = {
  options: readonly WheelOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, details: ChangeDetails<WheelReason>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  controller?: WheelController;
};
type State = { value: string | null; disabled: boolean; readOnly: boolean };
type Api = WheelController & { items(): readonly WheelOption[] };
type Slots = { root: SlotDefinition<State, Api, {}, State> };
export function createWheelPickerController() {
  return createController<WheelController>();
}
export const wheelPicker: ReturnType<typeof definePrimitive<WheelOptions, State, Api, Slots>> =
  definePrimitive({
    name: "wheel-picker",
    options: {
      options: "list",
      value: "string",
      defaultValue: "string",
      onValueChange: "callback",
      disabled: "boolean",
      readOnly: "boolean",
      controller: "value",
    },
    controlled: ["value"],
    state: (options: WheelOptions): State => ({
      value:
        options.value === undefined
          ? (options.defaultValue ?? options.options.find((item) => !item.disabled)?.value ?? null)
          : options.value,
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
      const setValue = (value: string | null, options: ChangeOptions<WheelReason> = {}) => {
        const state = context.store.get();
        if (
          (state.disabled || state.readOnly) &&
          options.reason !== "reset" &&
          options.reason !== "restore"
        )
          return false;
        if (
          value !== null &&
          !context.options().options.some((item) => item.value === value && !item.disabled)
        )
          return false;
        return change("value", value, { ...options, reason: options.reason ?? "imperative" });
      };
      return {
        reset: () =>
          setValue(
            context.options().defaultValue ??
              context.options().options.find((item) => !item.disabled)?.value ??
              null,
            { reason: "reset" },
          ),
        getValue: () => context.store.get().value,
        setValue,
        clear: (options) => setValue(null, options),
        items: () => context.options().options,
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
      actions: ["setValue", "clear", "reset"],
      closed: true,
      items: (api) => api.items().map(({ value, label }) => ({ value, label })),
    },
  });
