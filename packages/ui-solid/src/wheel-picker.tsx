import type { JSX } from "@solidjs/web";
import {
  wheelPicker,
  type WheelOption,
  type WheelOptions,
} from "@lenso/primitives/wheel-picker/core";
import { wheelPickerStyles as s } from "@lenso/tokens/wheel-picker";
import * as stylex from "@stylexjs/stylex";
import { bindScrollPicker } from "@ui-sdk/core";
import { usePart, usePrimitive, type PartProps } from "@ui-sdk/solid/primitive";
import { createEffect, createMemo, createSignal, For, merge, omit } from "solid-js";
import { ListBox } from "./list-box.js";
import { styled, type StyleXProps } from "./styled.js";

export type WheelPickerOption = WheelOption;
export type WheelPickerProps = PartProps<"div", ReturnType<typeof wheelPicker>["types"]["state"]> &
  WheelOptions &
  StyleXProps & { emptyLabel?: string; name?: string; form?: string; required?: boolean };

export function WheelPicker(props: WheelPickerProps) {
  const options = () => props.options;
  const handle = usePrimitive(wheelPicker, () => ({
    options: props.options,
    value: props.value,
    defaultValue: props.defaultValue,
    onValueChange: props.onValueChange,
    controller: props.controller,
    disabled: props.disabled,
    readOnly: props.readOnly,
  }));
  const [viewport, setViewport] = createSignal<HTMLDivElement>();
  const [selected, setSelected] = createSignal(handle.api.getValue());

  createEffect(
    () => handle,
    (current) => {
      setSelected(current.api.getValue());
      return current.instance.subscribe(() => setSelected(current.api.getValue()));
    },
  );
  createEffect(
    () => [viewport(), options()] as const,
    ([node, items]) => {
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
      return () => {
        active = false;
        unbind();
      };
    },
  );

  function Contents() {
    return (
      <>
        <div aria-hidden="true" {...stylex.attrs(s.band)} />
        <ListBox<string>
          ref={setViewport}
          data-agent-hidden=""
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-labelledby"]}
          name={props.name}
          form={props.form}
          required={props.required}
          value={selected()}
          disabled={props.disabled}
          readOnly={props.readOnly}
          activation="automatic"
          loop={false}
          keepInView={false}
          xstyle={[s.viewport, props.disabled && s.disabledViewport]}
          onValueChange={(value, details) => {
            if (details.reason === "reset") {
              handle.api.reset();
              details.cancel();
            } else if (
              !handle.api.setValue(value, { reason: details.reason, event: details.event })
            ) {
              details.cancel();
            }
          }}
        >
          <For each={options().map(({ value }) => value)}>
            {(value) => {
              const item = () => options().find((option) => option.value === value)!;
              return (
                <ListBox.Item
                  value={value}
                  label={item().label}
                  aria-label={item().label}
                  disabled={item().disabled}
                  xstyle={s.option}
                >
                  <span data-wheel-label="" aria-hidden="true" {...stylex.attrs(s.label)}>
                    {item().label}
                  </span>
                </ListBox.Item>
              );
            }}
          </For>
        </ListBox>
        {!options().length && (
          <div {...stylex.attrs(s.empty)}>{props.emptyLabel ?? "No options"}</div>
        )}
      </>
    );
  }

  const compiled = createMemo(() =>
    stylex.props(s.root, props.disabled && s.disabled, props.xstyle),
  );
  const rest = omit(
    props,
    "class",
    "style",
    "xstyle",
    "children",
    "options",
    "value",
    "defaultValue",
    "onValueChange",
    "controller",
    "disabled",
    "readOnly",
    "name",
    "form",
    "required",
    "emptyLabel",
  );
  return usePart(
    handle,
    "root",
    () => ({}),
    merge(
      { "data-lenso-slot": "wheel-picker" },
      rest,
      styled<ReturnType<typeof wheelPicker>["types"]["state"]>(compiled, props),
      {
        get children(): JSX.Element {
          return <Contents />;
        },
      },
    ),
    "div",
  );
}

export { createWheelPickerController } from "@lenso/primitives/wheel-picker/core";
export type {
  WheelController as WheelPickerController,
  WheelReason as WheelPickerChangeReason,
} from "@lenso/primitives/wheel-picker/core";
