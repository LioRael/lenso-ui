import { requireNativeView } from "expo";
import { useState, type ComponentType } from "react";
import type { ColorValue, NativeSyntheticEvent, ViewProps } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import { useValue } from "./use-value";
import { sliderValue } from "./value";
import type { GlassButtonProps, SliderProps, SwitchProps } from "./types";

type Size = { width: number; height: number };
type Change<T> = NativeSyntheticEvent<{ value: T }>;
interface NativeControlProps<T> extends ViewProps {
  controlLabel?: string;
  disabled?: boolean;
  tint?: ColorValue;
  checked?: boolean;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  variant?: string;
  size?: string;
  dark?: boolean;
  opaque?: boolean;
  onSize?: (event: NativeSyntheticEvent<Size>) => void;
  onValueChange?: (event: Change<T>) => void;
  onValueChangeEnd?: (event: Change<number>) => void;
  onTrigger?: () => void;
}
const NativeButton: ComponentType<NativeControlProps<never>> = requireNativeView(
  "LensoGlass",
  "ButtonView",
);
const NativeSwitch: ComponentType<NativeControlProps<boolean>> = requireNativeView(
  "LensoGlass",
  "SwitchView",
);
const NativeSlider: ComponentType<NativeControlProps<number>> = requireNativeView(
  "LensoGlass",
  "SliderView",
);

function useSize(initial: Size, fill = false) {
  const [size, setSize] = useState(initial);
  return {
    style: fill ? { height: Math.max(44, size.height), alignSelf: "stretch" as const } : size,
    onSize: (event: NativeSyntheticEvent<Size>) => setSize(event.nativeEvent),
  };
}
export function GlassButton({
  sourceID: _sourceID,
  children,
  variant = "default",
  size = "lg",
  destructive = false,
  tint,
  xstyle,
  style,
  onPress,
  ...props
}: GlassButtonProps) {
  const appearance = useLensoAppearance();
  const measured = useSize({ width: 160, height: 50 });
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeButton
          {...native}
          {...props}
          {...measured}
          label={children}
          variant={variant}
          size={size}
          dark={appearance.dark}
          opaque={appearance.opaque}
          tint={destructive ? appearance.palette.destructive : tint}
          onTrigger={onPress}
          style={[measured.style, resolved]}
          accessible={false}
          controlLabel={props.accessibilityLabel}
        />
      )}
    </NativeStyle>
  );
}
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  xstyle,
  style,
  tint,
  ...props
}: SwitchProps) {
  const [current, setCurrent] = useValue(checked, defaultChecked, onCheckedChange);
  const { dark } = useLensoAppearance();
  const measured = useSize({ width: 64, height: 38 });
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeSwitch
          {...native}
          {...props}
          {...measured}
          style={[measured.style, resolved]}
          checked={current}
          tint={tint}
          dark={dark}
          accessible={false}
          controlLabel={props.accessibilityLabel}
          onValueChange={(event) => setCurrent(event.nativeEvent.value)}
        />
      )}
    </NativeStyle>
  );
}
export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  xstyle,
  style,
  ...props
}: SliderProps) {
  const [stored, setCurrent] = useValue(value, defaultValue ?? min, onValueChange);
  const current = sliderValue(stored, min, max, step);
  const { dark } = useLensoAppearance();
  const measured = useSize({ width: 0, height: 44 }, true);
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeSlider
          {...native}
          {...props}
          {...measured}
          style={[measured.style, resolved]}
          value={current}
          min={min}
          max={max}
          step={step}
          dark={dark}
          accessible={false}
          controlLabel={props.accessibilityLabel}
          onValueChange={(event) => setCurrent(event.nativeEvent.value)}
          onValueChangeEnd={(event) => onValueChangeEnd?.(event.nativeEvent.value)}
        />
      )}
    </NativeStyle>
  );
}
