import { Pressable, Text, View } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import { useValue } from "./use-value";
import { stepperValue, validateSegments } from "./choice-model";
import type { SegmentedControlProps, StepperProps } from "./types";

export function Stepper({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
  incrementLabel = "Increase value",
  decrementLabel = "Decrease value",
  xstyle,
  style,
  ...props
}: StepperProps) {
  const [stored, change] = useValue(value, defaultValue ?? min, onValueChange);
  const current = stepperValue(stored, min, max, step);
  const { palette } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <View
          {...native}
          {...props}
          style={[
            {
              flexDirection: "row",
              alignSelf: "flex-start",
              borderRadius: 10,
              backgroundColor: palette.fill,
            },
            resolved,
          ]}
        >
          {([-1, 1] as const).map((direction) => {
            const blocked = disabled || (direction < 0 ? current <= min : current >= max);
            return (
              <Pressable
                key={direction}
                accessibilityRole="button"
                accessibilityLabel={direction < 0 ? decrementLabel : incrementLabel}
                accessibilityState={{ disabled: blocked }}
                disabled={blocked}
                onPress={() => change(stepperValue(current + direction * step, min, max, step))}
                style={({ pressed }) => ({
                  minWidth: 48,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: blocked ? 0.35 : pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 24, color: props.tint ?? palette.tint }}>
                  {direction < 0 ? "−" : "+"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </NativeStyle>
  );
}
export function SegmentedControl({
  items,
  value,
  defaultValue = null,
  onValueChange,
  disabled = false,
  tint,
  xstyle,
  style,
  ...props
}: SegmentedControlProps) {
  validateSegments(items);
  const [current, change] = useValue<string | null>(value, defaultValue, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const { palette } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <View
          {...native}
          {...props}
          accessibilityRole="radiogroup"
          style={[
            { flexDirection: "row", padding: 3, borderRadius: 12, backgroundColor: palette.fill },
            resolved,
          ]}
        >
          {items.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityState={{
                checked: current === item.value,
                disabled: disabled || item.disabled === true,
              }}
              disabled={disabled || item.disabled}
              onPress={() => change(item.value)}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 44,
                minHeight: 44,
                padding: 8,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: current === item.value ? palette.background : "transparent",
                opacity: disabled || item.disabled ? 0.4 : pressed ? 0.65 : 1,
              })}
            >
              <Text
                style={{
                  color: current === item.value ? (tint ?? palette.label) : palette.secondaryLabel,
                  fontSize: 15,
                  fontWeight: current === item.value ? "600" : "400",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </NativeStyle>
  );
}
