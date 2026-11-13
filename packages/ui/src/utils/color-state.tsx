"use client";
import {
  convertColor,
  parseColor as parseSDKColor,
  type Color as SDKColor,
} from "@ui-sdk/core/color";
import { parseColor, type Color, type ColorSpace } from "react-stately/Color";
import { createContext, useState, type ComponentProps, type ReactNode } from "react";
import {
  ColorPicker,
  createColorPickerController,
  type ColorPickerState,
  type ColorPickerValueChangeDetails,
  type ColorPickerValueCommitDetails,
  type ColorPickerChangeOptions,
  type ColorPickerController,
} from "@ui-sdk/react/color-picker";

export function colorFromSDK(value: string | SDKColor, space?: ColorSpace): Color {
  const color = typeof value === "string" ? parseSDKColor(value)! : value;
  let result: Color;
  if (color.space === "hsl" || color.space === "hsv") {
    const [h, s, l] = color.coords.map((value) => value ?? 0);
    result = parseColor(
      `${color.space === "hsv" ? "hsba" : "hsla"}(${h},${s}%,${l}%,${color.alpha})`,
    );
  } else {
    const { coords, alpha } = convertColor(color, "srgb");
    result = parseColor(
      `rgba(${coords.map((channel) => Math.max(0, Math.min(1, channel ?? 0)) * 255).join(",")},${alpha})`,
    );
  }
  return space ? result.toFormat(space) : result;
}
export function colorCSS(value: string | Color | undefined) {
  return typeof value === "string" || value === undefined
    ? value
    : value.toFormat("hsl").toString("hsla");
}
export type ColorValue = {
  color: Color;
  native: ColorPickerState;
  controller: ColorPickerController;
  setColor(color: string | Color | null, options?: ColorPickerChangeOptions): boolean;
};
export const ColorValueContext = createContext<ColorValue | null>(null);
export type ColorScopeProps = Omit<
  ComponentProps<typeof ColorPicker>,
  "value" | "defaultValue" | "children" | "onChange"
> & {
  value?: string | Color;
  defaultValue?: string | Color;
  onChange?: (value: Color, details: ColorPickerValueChangeDetails) => void;
  onChangeEnd?: (value: Color, details: ColorPickerValueCommitDetails) => void;
  children?: ReactNode | ((value: ColorValue) => ReactNode);
};
export function ColorScope({
  value,
  defaultValue,
  controller: provided,
  onValueChange,
  onValueCommit,
  onChange,
  onChangeEnd,
  children,
  ...props
}: ColorScopeProps) {
  const [own] = useState(createColorPickerController);
  const controller = provided ?? own;
  return (
    <ColorPicker
      {...props}
      controller={controller}
      value={colorCSS(value)}
      defaultValue={colorCSS(defaultValue)}
      onValueChange={(value, details) => {
        onValueChange?.(value, details);
        if (!details.canceled) onChange?.(colorFromSDK(details.color), details);
      }}
      onValueCommit={(value, details) => {
        onValueCommit?.(value, details);
        onChangeEnd?.(colorFromSDK(details.color), details);
      }}
    >
      {(native) => {
        const scope: ColorValue = {
          color: colorFromSDK(native.color),
          native,
          controller,
          setColor: (color, options) =>
            color !== null && controller.setValue(colorCSS(color)!, options),
        };
        return (
          <ColorValueContext value={scope}>
            {typeof children === "function" ? children(scope) : children}
          </ColorValueContext>
        );
      }}
    </ColorPicker>
  );
}
