import { requireNativeView } from "expo";
import type { ColorValue, NativeSyntheticEvent, ViewProps } from "react-native";
import { NativeStyle } from "./styles";
import { useNativeSize } from "./native-size.ios";
import { useLensoAppearance } from "./provider";
import type { ControlProps } from "./types";

export interface SelectionControlProps extends ControlProps {
  kind: "checkbox" | "radio" | "toggle";
  checked: boolean;
  children?: string;
  onPress: () => void;
}
const NativeSelection = requireNativeView<
  ViewProps & {
    kind: string;
    checked: boolean;
    label: string;
    disabled?: boolean;
    dark: boolean;
    tint?: ColorValue;
    controlLabel?: string;
    onTrigger: () => void;
    onSize: (event: NativeSyntheticEvent<{ width: number; height: number }>) => void;
  }
>("LensoGlass", "SelectionView");
export function SelectionControl({
  children = "",
  onPress,
  xstyle,
  style,
  ...props
}: SelectionControlProps) {
  const measured = useNativeSize({ width: 140, height: 44 });
  const { dark } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeSelection
          {...native}
          {...props}
          {...measured}
          label={children}
          dark={dark}
          onTrigger={onPress}
          accessible={false}
          controlLabel={props.accessibilityLabel}
          style={[{ minHeight: 44 }, measured.style, resolved]}
        />
      )}
    </NativeStyle>
  );
}
