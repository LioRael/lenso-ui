import { Pressable, Text, View } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import type { ControlProps } from "./types";

export interface SelectionControlProps extends ControlProps {
  kind: "checkbox" | "radio" | "toggle";
  checked: boolean;
  children?: string;
  onPress: () => void;
}
export function SelectionControl({
  kind,
  checked,
  children,
  onPress,
  disabled = false,
  tint,
  xstyle,
  style,
  ...props
}: SelectionControlProps) {
  const { palette } = useLensoAppearance();
  const color = tint ?? palette.tint;
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <Pressable
          {...native}
          {...props}
          onPress={onPress}
          disabled={disabled}
          accessibilityRole={kind === "toggle" ? "togglebutton" : kind}
          accessibilityLabel={props.accessibilityLabel ?? children}
          accessibilityState={{ checked, disabled }}
          style={({ pressed }) => [
            {
              minHeight: 44,
              minWidth: 44,
              paddingVertical: 8,
              paddingHorizontal: kind === "toggle" ? 12 : 0,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderRadius: 10,
              backgroundColor:
                kind === "toggle" ? (checked ? palette.fill : "transparent") : "transparent",
              opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
            },
            resolved,
          ]}
        >
          {kind !== "toggle" && (
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: kind === "radio" ? 11 : 5,
                borderWidth: checked ? 0 : 1.5,
                borderColor: palette.secondaryLabel,
                backgroundColor: checked ? color : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {checked &&
                (kind === "radio" ? (
                  <View
                    style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "white" }}
                  />
                ) : (
                  <Text style={{ color: "white", fontSize: 17, fontWeight: "700" }}>✓</Text>
                ))}
            </View>
          )}
          {children !== undefined && (
            <Text
              style={{ color: kind === "toggle" && checked ? color : palette.label, fontSize: 17 }}
            >
              {children}
            </Text>
          )}
        </Pressable>
      )}
    </NativeStyle>
  );
}
