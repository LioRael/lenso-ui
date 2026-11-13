"use client";
import { bindScrollPicker } from "@ui-sdk/core";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { usePrimitive, usePart, type PartProps } from "@ui-sdk/react/primitive";
import {
  wheelPicker,
  type WheelOptions,
  type WheelOption,
} from "@lenso/primitives/wheel-picker/core";
import * as stylex from "@stylexjs/stylex";
import { wheelPickerStyles as s } from "@lenso/tokens/wheel-picker";
import { ListBox } from "../list-box/index.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export { createWheelPickerController } from "@lenso/primitives/wheel-picker/core";
export type {
  WheelController as WheelPickerController,
  WheelReason as WheelPickerChangeReason,
} from "@lenso/primitives/wheel-picker/core";
export type WheelPickerOption = WheelOption;
export type WheelPickerProps = StyleXProps<
  PartProps<"div", ReturnType<typeof wheelPicker>["types"]["state"]>
> &
  WheelOptions & { emptyLabel?: string; name?: string; form?: string; required?: boolean };
export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  controller,
  emptyLabel = "No options",
  disabled = false,
  readOnly = false,
  xstyle,
  style,
  ref,
  render,
  onScroll,
  onScrollEnd,
  onKeyDown,
  name,
  form,
  required,
  ...props
}: WheelPickerProps) {
  const handle = usePrimitive(wheelPicker, {
    options,
    value,
    defaultValue,
    onValueChange,
    controller,
    disabled,
    readOnly,
  });
  useSyncExternalStore(handle.instance.subscribe, handle.instance.get, () => handle.state);
  const [viewport, register] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const element = viewport;
    if (!element) return;
    let disposed = false;
    let unbind: () => void;
    const bind = () =>
      bindScrollPicker(element, {
        onSelect(index, { event }) {
          const item = options[index];
          if (!item) return;
          const accepted = handle.api.setValue(item.value, {
            reason:
              event instanceof KeyboardEvent
                ? "list-navigation"
                : event instanceof PointerEvent
                  ? "drag"
                  : "scroll",
            ...(event ? { event } : {}),
          });
          // The beta scroll behavior has no cancellation hook; rebinding restores the accepted selection.
          if (!accepted)
            queueMicrotask(() => {
              if (!disposed) {
                unbind();
                unbind = bind();
              }
            });
        },
      });
    unbind = bind();
    return () => {
      disposed = true;
      unbind();
    };
  }, [handle, options, viewport]);
  useEffect(() => {
    const owner = form ? document.getElementById(form) : viewport?.closest("form");
    if (!(owner instanceof HTMLFormElement)) return;
    const reset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) handle.api.reset();
      });
    };
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [handle, form, viewport]);
  const compiled = stylex.props(s.root, disabled && s.disabled, xstyle);
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      ...compiled,
      ref,
      render,
      style: mergeStyle(compiled.style, style),
      ...{ "data-lenso-slot": props["data-lenso-slot"] ?? "wheel-picker" },
      children: (
        <>
          <div aria-hidden="true" {...stylex.props(s.band)} />
          <ListBox<string>
            data-agent-hidden=""
            aria-label={props["aria-label"]}
            aria-labelledby={props["aria-labelledby"]}
            name={name}
            form={form}
            ref={register}
            required={required}
            value={handle.state.value}
            disabled={disabled}
            readOnly={readOnly}
            activation="automatic"
            loop={false}
            keepInView={false}
            xstyle={[s.viewport, disabled && s.disabledViewport]}
            onScroll={onScroll}
            onScrollEnd={onScrollEnd}
            onKeyDown={onKeyDown}
            onValueChange={(value, details) => {
              if (details.reason === "reset") {
                handle.api.reset();
                details.cancel();
                return;
              }
              if (
                !handle.api.setValue(value, {
                  reason: details.reason,
                  ...(details.event ? { event: details.event } : {}),
                })
              )
                details.cancel();
            }}
          >
            {options.map((option) => (
              <ListBox.Item
                key={option.value}
                value={option.value}
                label={option.label}
                aria-label={option.label}
                disabled={option.disabled}
                xstyle={s.option}
              >
                <span data-wheel-label="" aria-hidden="true" {...stylex.props(s.label)}>
                  {option.label}
                </span>
              </ListBox.Item>
            ))}
          </ListBox>
          {!options.length && <div {...stylex.props(s.empty)}>{emptyLabel}</div>}
        </>
      ),
    },
    "div",
  );
}
