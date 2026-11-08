"use client";
import { createContext, use } from "react";
import {
  useColorPickerState,
  type ColorPickerProps,
  type ColorPickerState,
} from "react-stately/useColorPickerState";

// Color parsing and channel arithmetic stay separate from native control behavior.
export const ColorValueContext = createContext<ColorPickerState | null>(null);
export function useColorValue(props: ColorPickerProps): ColorPickerState {
  const inherited = use(ColorValueContext);
  const inherits = props.value === undefined && props.defaultValue === undefined && inherited;
  return useColorPickerState({
    ...props,
    value: inherits ? inherited.color : props.value,
    onChange(color) {
      if (inherits) inherited.setColor(color);
      props.onChange?.(color);
    },
  });
}
