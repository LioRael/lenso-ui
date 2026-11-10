import { requireNativeView } from "expo";
import type { NativeSyntheticEvent, ViewProps, ColorValue } from "react-native";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import { useNativeSize } from "./native-size.ios";
import type { ButtonProps } from "./types";

const NativeButton = requireNativeView<
  ViewProps & {
    label: string;
    variant: string;
    size: string;
    glass: boolean;
    loading: boolean;
    disabled: boolean;
    dark: boolean;
    tint?: ColorValue;
    controlLabel?: string;
    onSize: (event: NativeSyntheticEvent<{ width: number; height: number }>) => void;
    onTrigger?: () => void;
  }
>("LensoGlass", "ButtonView");

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
  const { dark, palette } = useLensoAppearance();
  const measured = useNativeSize({ width: 120, height: 44 });
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeButton
          {...native}
          {...props}
          {...measured}
          glass={false}
          label={children}
          variant={variant}
          size={size}
          loading={isLoading}
          disabled={disabled || isLoading}
          dark={dark}
          tint={destructive ? palette.destructive : tint}
          onTrigger={onPress}
          controlLabel={props.accessibilityLabel}
          accessible={false}
          style={[measured.style, resolved]}
        />
      )}
    </NativeStyle>
  );
}
