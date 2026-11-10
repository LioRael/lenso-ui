import { requireNativeView } from "expo";
import { Animated, StyleSheet, type ColorValue, type ViewProps } from "react-native";
import { useState, type ComponentType } from "react";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import type { BackdropProps, GlassGroupProps, GlassProps } from "./types";
import { usePressMotion } from "./use-press";

interface SurfaceProps extends ViewProps {
  sourceID: string;
  cornerRadius: number;
  clear: boolean;
  dark: boolean;
  tint?: ColorValue;
  held: boolean;
  prominent: boolean;
  lens: boolean;
  zoom: number;
  split: number;
}
const NativeGlass: ComponentType<SurfaceProps> = requireNativeView("LensoGlass", "GlassView");
const AnimatedGlass = Animated.createAnimatedComponent(NativeGlass);
const NativeBackdrop: ComponentType<ViewProps & { sourceID: string }> = requireNativeView(
  "LensoGlass",
  "BackdropView",
);
const NativeGroup: ComponentType<ViewProps & { sourceID: string; spacing: number }> =
  requireNativeView("LensoGlass", "GlassGroupView");

export function Backdrop({ xstyle, style, ...props }: BackdropProps) {
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeBackdrop {...native} {...props} collapsable={false} style={resolved} />
      )}
    </NativeStyle>
  );
}
export function GlassSurface({
  sourceID,
  material = "regular",
  tint,
  interactive = false,
  held = false,
  prominent = false,
  lens = false,
  zoom = 1,
  split = 0,
  xstyle,
  style,
  onLayout,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...props
}: GlassProps & {
  held?: boolean;
  prominent?: boolean;
  lens?: boolean;
  zoom?: number;
  split?: number;
}) {
  const { dark, opaque, palette } = useLensoAppearance();
  const [pressed, setPressed] = useState(false);
  const [length, setLength] = useState(160);
  const scale = usePressMotion(interactive && pressed, length);
  const events: ViewProps = {
    onLayout(event) {
      const { width, height } = event.nativeEvent.layout;
      setLength(Math.max(width, height));
      onLayout?.(event);
    },
    onTouchStart(event) {
      setPressed(true);
      onTouchStart?.(event);
    },
    onTouchEnd(event) {
      setPressed(false);
      onTouchEnd?.(event);
    },
    onTouchCancel(event) {
      setPressed(false);
      onTouchCancel?.(event);
    },
  };
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) =>
        opaque ? (
          <Animated.View
            {...native}
            {...props}
            {...events}
            style={[
              { backgroundColor: tint ?? palette.secondaryBackground },
              ...(interactive ? [{ transform: [{ scale }] }] : []),
              resolved,
            ]}
          />
        ) : (
          <AnimatedGlass
            {...native}
            {...props}
            {...events}
            sourceID={sourceID}
            collapsable={false}
            style={[...(interactive ? [{ transform: [{ scale }] }] : []), resolved]}
            cornerRadius={Number(StyleSheet.flatten(resolved)?.borderRadius) || 0}
            clear={material === "clear"}
            dark={dark}
            tint={tint}
            held={held || (interactive && pressed)}
            prominent={prominent}
            lens={lens}
            zoom={zoom}
            split={split}
          />
        )
      }
    </NativeStyle>
  );
}
export const Glass = GlassSurface;
export function GlassGroup({ spacing = 20, xstyle, style, ...props }: GlassGroupProps) {
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved, native) => (
        <NativeGroup
          {...native}
          {...props}
          collapsable={false}
          spacing={spacing}
          style={resolved}
        />
      )}
    </NativeStyle>
  );
}
