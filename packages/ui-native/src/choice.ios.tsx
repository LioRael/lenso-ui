import { requireNativeView } from "expo";
import type { ColorValue, NativeSyntheticEvent, ViewProps } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import { useNativeSize } from "./native-size.ios";
import { useValue } from "./use-value";
import { stepperValue, validateSegments } from "./choice-model";
import type { SegmentedControlItem, SegmentedControlProps, StepperProps } from "./types";

interface HostProps<T> extends ViewProps {
  value: T;
  disabled?: boolean;
  dark: boolean;
  tint?: ColorValue;
  controlLabel?: string;
  onSize: (event: NativeSyntheticEvent<{ width: number; height: number }>) => void;
  onValueChange: (event: NativeSyntheticEvent<{ value: T }>) => void;
}
const NativeStepper = requireNativeView<
  HostProps<number> & { min: number; max: number; step: number }
>("LensoGlass", "StepperView");
const NativeSegments = requireNativeView<
  HostProps<string | null> & { items: readonly SegmentedControlItem[] }
>("LensoGlass", "SegmentedView");

export function Stepper({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  incrementLabel: _incrementLabel,
  decrementLabel: _decrementLabel,
  xstyle,
  style,
  ...props
}: StepperProps) {
  const [stored, change] = useValue(value, defaultValue ?? min, onValueChange);
  const current = stepperValue(stored, min, max, step);
  const measured = useNativeSize({ width: 100, height: 44 });
  const { dark } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeStepper
          {...native}
          {...props}
          {...measured}
          value={current}
          min={min}
          max={max}
          step={step}
          dark={dark}
          accessible={false}
          controlLabel={props.accessibilityLabel}
          style={[{ minHeight: 44 }, measured.style, resolved]}
          onValueChange={(e) => change(e.nativeEvent.value)}
        />
      )}
    </NativeStyle>
  );
}
export function SegmentedControl({
  items,
  value,
  defaultValue = null,
  onValueChange,
  xstyle,
  style,
  ...props
}: SegmentedControlProps) {
  validateSegments(items);
  const [current, change] = useValue<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const measured = useNativeSize({ width: 0, height: 44 }, true);
  const { dark } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeSegments
          {...native}
          {...props}
          {...measured}
          items={items}
          value={current}
          dark={dark}
          accessible={false}
          controlLabel={props.accessibilityLabel}
          style={[measured.style, resolved]}
          onValueChange={(e) => change(e.nativeEvent.value)}
        />
      )}
    </NativeStyle>
  );
}
