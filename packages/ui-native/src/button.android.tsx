import { ActivityIndicator, Pressable, Text } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import type { ButtonProps } from "./types";

export function Button({
  children,
  variant = "bordered",
  size = "md",
  destructive = false,
  isLoading = false,
  disabled = false,
  tint,
  xstyle,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { palette } = useLensoAppearance();
  const color = destructive ? palette.destructive : (tint ?? palette.tint);
  const foreground = variant === "prominent" ? "white" : color;
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <Pressable
          {...native}
          {...props}
          onPress={onPress}
          disabled={disabled || isLoading}
          accessibilityRole="button"
          accessibilityLabel={props.accessibilityLabel ?? children}
          accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
          style={({ pressed }) => [
            {
              alignSelf: "flex-start",
              minHeight: 44,
              minWidth: 44,
              paddingHorizontal: size === "sm" ? 12 : size === "lg" ? 24 : 18,
              paddingVertical: 10,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor:
                variant === "prominent"
                  ? color
                  : variant === "bordered"
                    ? palette.fill
                    : "transparent",
              opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
            },
            resolved,
          ]}
        >
          {isLoading && <ActivityIndicator color={foreground} />}
          <Text style={{ color: foreground, fontSize: size === "sm" ? 15 : 17, fontWeight: "600" }}>
            {children}
          </Text>
        </Pressable>
      )}
    </NativeStyle>
  );
}
