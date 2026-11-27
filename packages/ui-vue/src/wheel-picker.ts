import {
  wheelPicker,
  type WheelOption,
  type WheelOptions,
} from "@lenso/primitives/wheel-picker/core";
import { wheelPickerStyles as s } from "@lenso/tokens/wheel-picker";
import * as stylex from "@stylexjs/stylex";
import { bindScrollPicker } from "@ui-sdk/core";
import { usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/vue/primitive";
import {
  cloneVNode,
  defineComponent,
  h,
  shallowRef,
  watch,
  type HTMLAttributes,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";
import { ListBox } from "./list-box.js";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export type WheelPickerOption = WheelOption;
type State = PrimitiveHandle<typeof wheelPicker>["state"];
const Wheel = defineComponent({
  name: "LensoWheelPicker",
  inheritAttrs: false,
  props: {
    options: { type: Array as PropType<readonly WheelPickerOption[]>, required: true },
    value: String as PropType<string | null>,
    modelValue: String as PropType<string | null>,
    defaultValue: String as PropType<string | null>,
    onValueChange: Function as PropType<WheelOptions["onValueChange"]>,
    controller: Object as PropType<WheelOptions["controller"]>,
    disabled: Boolean,
    readOnly: Boolean,
    emptyLabel: String,
    name: String,
    form: String,
    required: Boolean,
  },
  emits: {
    "update:value": (_value: string | null) => true,
    "update:modelValue": (_value: string | null) => true,
  },
  slots: Object as SlotsType<{
    render: (scope: {
      state: State;
      props: Record<string, unknown>;
      children: VNodeChild | (() => VNodeChild);
    }) => VNodeChild;
  }>,
  setup(props, { attrs, emit }) {
    const viewport = shallowRef<HTMLDivElement>();
    const handle = usePrimitive(wheelPicker, () => ({
      options: props.options,
      value: props.value === undefined ? props.modelValue : props.value,
      defaultValue: props.defaultValue,
      controller: props.controller,
      disabled: props.disabled,
      readOnly: props.readOnly,
      onValueChange(value, details) {
        props.onValueChange?.(value, details);
        if (!details.canceled) {
          emit("update:value", value);
          emit("update:modelValue", value);
        }
      },
    }));

    watch(
      [viewport, () => props.options],
      ([node, items], _, cleanup) => {
        if (!node) return;
        let active = true;
        const bind = () =>
          bindScrollPicker(node, {
            onSelect(index, { event }) {
              const item = items[index];
              if (!item) return;
              const accepted = handle.api.setValue(item.value, {
                reason:
                  event instanceof KeyboardEvent
                    ? "list-navigation"
                    : event instanceof PointerEvent
                      ? "drag"
                      : "scroll",
                event,
              });
              if (!accepted)
                queueMicrotask(() => {
                  if (!active) return;
                  unbind();
                  unbind = bind();
                });
            },
          });
        let unbind = bind();
        cleanup(() => {
          active = false;
          unbind();
        });
      },
      { flush: "post" },
    );

    const options = () =>
      props.options.map((item) =>
        h(
          ListBox.Item,
          {
            key: item.value,
            value: item.value,
            label: item.label,
            "aria-label": item.label,
            disabled: item.disabled,
            xstyle: s.option,
          },
          {
            default: () =>
              h(
                "span",
                {
                  ...stylex.attrs(s.label),
                  "aria-hidden": "true",
                  "data-wheel-label": "",
                },
                item.label,
              ),
          },
        ),
      );

    return usePart(
      handle,
      "root",
      undefined,
      () => partAttributes("wheel-picker", [s.root, props.disabled && s.disabled], attrs),
      {
        tag: "div",
        children: (state) => [
          h("div", { ...stylex.attrs(s.band), "aria-hidden": "true" }),
          h(
            ListBox,
            {
              "data-agent-hidden": "",
              "aria-label": attrs["aria-label"] as string | undefined,
              "aria-labelledby": attrs["aria-labelledby"] as string | undefined,
              name: props.name,
              form: props.form,
              required: props.required,
              value: state.value,
              disabled: props.disabled,
              readOnly: props.readOnly,
              activation: "automatic",
              loop: false,
              keepInView: false,
              xstyle: [s.viewport, props.disabled && s.disabledViewport],
              onValueChange(value, details) {
                if (details.reason === "reset") {
                  handle.api.reset();
                  details.cancel();
                } else if (
                  Array.isArray(value) ||
                  !handle.api.setValue(value, { reason: details.reason, event: details.event })
                ) {
                  details.cancel();
                }
              },
            },
            {
              render: ({
                props: elementProps,
                children,
              }: {
                props: Record<string, unknown>;
                children: VNodeChild | (() => VNodeChild);
              }) =>
                cloneVNode(
                  h("div", elementProps, [
                    ...options(),
                    typeof children === "function" ? children() : children,
                  ]),
                  { ref: viewport },
                  true,
                ),
            },
          ),
          !props.options.length &&
            h("div", stylex.attrs(s.empty), props.emptyLabel ?? "No options"),
        ],
      },
    );
  },
});
export const WheelPicker: StyledPart<typeof Wheel, HTMLAttributes> = Wheel as unknown as StyledPart<
  typeof Wheel,
  HTMLAttributes
>;
export type WheelPickerProps = ComponentProps<typeof WheelPicker>;
export { createWheelPickerController } from "@lenso/primitives/wheel-picker/core";
export type {
  WheelController as WheelPickerController,
  WheelReason as WheelPickerChangeReason,
} from "@lenso/primitives/wheel-picker/core";
