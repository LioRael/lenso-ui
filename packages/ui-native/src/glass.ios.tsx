import { View } from "react-native";
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import type { BackdropProps, GlassGroupProps, GlassProps } from "./types";

export function Backdrop({ sourceID: _sourceID, xstyle, style, ...props }: BackdropProps) {
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => <View {...native} {...props} style={resolved} />}
    </NativeStyle>
  );
}
export function Glass({
  sourceID: _sourceID,
  material = "regular",
  tint,
  interactive = false,
  xstyle,
  style,
  ...props
}: GlassProps) {
  const { dark, opaque, palette } = useLensoAppearance();
  const system = isLiquidGlassAvailable() && isGlassEffectAPIAvailable() && !opaque;
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) =>
        system ? (
          <GlassView
            {...native}
            {...props}
            style={resolved}
            glassEffectStyle={material}
            tintColor={tint}
            isInteractive={interactive}
            colorScheme={dark ? "dark" : "light"}
          />
        ) : (
          <View
            {...native}
            {...props}
            style={[{ backgroundColor: palette.secondaryBackground }, resolved]}
          />
        )
      }
    </NativeStyle>
  );
}
export function GlassGroup({
  sourceID: _sourceID,
  spacing = 20,
  xstyle,
  style,
  ...props
}: GlassGroupProps) {
  const { opaque } = useLensoAppearance();
  const system = isLiquidGlassAvailable() && isGlassEffectAPIAvailable() && !opaque;
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) =>
        system ? (
          <GlassContainer {...native} {...props} spacing={spacing} style={resolved} />
        ) : (
          <View {...native} {...props} style={resolved} />
        )
      }
    </NativeStyle>
  );
}
