"use client";
import { usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive";
import { useMemo, useSyncExternalStore } from "react";
import type {
  dateField,
  ModelValue,
  ModelController,
  ModelChangeReason,
  ModelControlOptions,
} from "@lenso/primitives/model-control";
import type { ChangeDetails } from "@ui-sdk/core";
export type ModelValueOptions<Value> = {
  value?: Value | null;
  defaultValue?: Value | null;
  onChange?: (value: Value | null, details: ChangeDetails<ModelChangeReason>) => void;
  onValueChange?: (value: Value | null, details: ChangeDetails<ModelChangeReason>) => void;
  controller?: ModelController;
  disabled?: boolean;
  readOnly?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
};
export type ModelControlHandle = PrimitiveHandle<typeof dateField>;
export type ModelControl<Value> = {
  handle: ModelControlHandle;
  value: Value | null;
  change(value: Value | null): boolean;
};
export function useModelControl<Value>(
  primitive: typeof dateField,
  options: ModelValueOptions<Value>,
  encode: (value: Value | null) => ModelValue,
  decode: (value: ModelValue) => Value | null,
  behavior?: Pick<ModelControlOptions, "move">,
): ModelControl<Value> {
  const handle = usePrimitive(primitive, {
    ...behavior,
    value: options.value === undefined ? undefined : encode(options.value),
    defaultValue: options.defaultValue === undefined ? undefined : encode(options.defaultValue),
    disabled: options.disabled ?? options.isDisabled,
    readOnly: options.readOnly ?? options.isReadOnly,
    controller: options.controller,
    validate(value) {
      try {
        decode(value);
        return true;
      } catch {
        return false;
      }
    },
    onValueChange(value, details) {
      const parsed = decode(value);
      options.onValueChange?.(parsed, details);
      if (!details.canceled) options.onChange?.(parsed, details);
    },
  });
  useSyncExternalStore(handle.instance.subscribe, handle.instance.get, () => handle.state);
  const value = useMemo(() => decode(handle.state.value), [decode, handle.state.value]);
  return { handle, value, change: (value: Value | null) => handle.api.setValue(encode(value)) };
}
