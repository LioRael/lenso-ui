import type { ReactNode } from "react";
import { compat } from "react-strict-dom";
import type { StyleProp, ViewProps, ViewStyle } from "react-native";
import type { NativeStyles } from "./types";

export function NativeStyle({
  xstyle,
  style,
  children,
}: NativeStyles & {
  children: (style: StyleProp<ViewStyle>, native: ViewProps) => ReactNode;
}) {
  return (
    <compat.native as="div" style={xstyle}>
      {(native: ViewProps) => children([native.style, style], native)}
    </compat.native>
  );
}
