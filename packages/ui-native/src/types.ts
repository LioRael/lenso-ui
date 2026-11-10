import type { ComponentProps, ReactNode } from "react";
import type { html } from "react-strict-dom";
import type { ColorValue, StyleProp, ViewProps, ViewStyle } from "react-native";

export interface NativeStyles {
  /** Shared React Strict DOM styles, resolved on the native host. */
  xstyle?: ComponentProps<typeof html.div>["style"];
  /** Additional platform-specific outer layout. */
  style?: StyleProp<ViewStyle>;
}
export type GlassProps = Omit<ViewProps, "style"> &
  NativeStyles & {
    sourceID: string;
    material?: "regular" | "clear";
    tint?: ColorValue;
    interactive?: boolean;
  };
export type BackdropProps = Omit<ViewProps, "style"> & NativeStyles & { sourceID: string };
export type GlassGroupProps = BackdropProps & { spacing?: number };
export interface ControlProps extends NativeStyles {
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  tint?: ColorValue;
}
export interface GlassButtonProps extends ControlProps {
  sourceID: string;
  children: string;
  variant?: "default" | "prominent";
  size?: "sm" | "md" | "lg";
  destructive?: boolean;
  onPress?: () => void;
}
export interface SwitchProps extends ControlProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
export interface SliderProps extends ControlProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onValueChangeEnd?: (value: number) => void;
}
export interface LensoProviderProps {
  appearance?: "system" | "light" | "dark";
  reduceTransparency?: boolean;
  children: ReactNode;
}
