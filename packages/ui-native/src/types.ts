import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import type { html } from "react-strict-dom";
import type {
  ColorValue,
  StyleProp,
  TextInput,
  TextStyle,
  ViewProps,
  ViewStyle,
} from "react-native";

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

export interface ButtonProps extends ControlProps {
  children: string;
  variant?: "prominent" | "bordered" | "borderless";
  size?: "sm" | "md" | "lg";
  destructive?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
}
export interface StepperProps extends ControlProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  /** Android button label; iOS uses UIKit's localized stepper actions. */
  incrementLabel?: string;
  /** Android button label; iOS uses UIKit's localized stepper actions. */
  decrementLabel?: string;
}
export interface SegmentedControlItem {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SegmentedControlProps extends ControlProps {
  items: readonly SegmentedControlItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}
export interface SelectionProps extends ControlProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: string;
  children?: string;
  readOnly?: boolean;
}
export interface SelectionGroupProps extends Omit<ViewProps, "style">, NativeStyles {
  disabled?: boolean;
  readOnly?: boolean;
  orientation?: "horizontal" | "vertical";
}
export interface CheckboxGroupProps extends SelectionGroupProps {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
}
export interface RadioGroupProps extends SelectionGroupProps {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}
export interface ToggleButtonProps extends Omit<
  SelectionProps,
  "checked" | "defaultChecked" | "onCheckedChange"
> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}
export interface InputProps
  extends
    Omit<ComponentPropsWithRef<typeof TextInput>, "style" | "readOnly">,
    Omit<NativeStyles, "style"> {
  style?: StyleProp<TextStyle>;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}
export interface TextFieldProps extends InputProps {
  label: string;
  description?: string;
  errorMessage?: string;
}
