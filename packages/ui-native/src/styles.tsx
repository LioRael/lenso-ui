import type { ReactNode } from "react";
import { compat } from "react-strict-dom";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import type { NativeStyles } from "./types";

export function NativeStyle<T extends { style?: StyleProp<ViewStyle> } = ViewProps>({
  as = "div",
  xstyle,
  style,
  children,
}: NativeStyles & {
  as?: "div" | "span" | "input" | "textarea";
  children: (style: StyleProp<ViewStyle>, native: T) => ReactNode;
}) {
  return (
    <compat.native<T> as={as} style={xstyle}>
      {(native: T) => children([native.style, style], native)}
    </compat.native>
  );
}
