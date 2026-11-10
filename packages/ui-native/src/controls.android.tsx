import { useId, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Backdrop, GlassSurface } from "./glass.android";
import { NativeStyle } from "./styles";
import { useLensoAppearance } from "./provider";
import { useValue } from "./use-value";
import { usePressMotion } from "./use-press";
import { sliderValue } from "./value";
import type { GlassButtonProps, SliderProps, SwitchProps } from "./types";

export function GlassButton({
  children,
  sourceID,
  variant = "default",
  size = "lg",
  disabled,
  destructive = false,
  tint,
  onPress,
  xstyle,
  style,
  ...props
}: GlassButtonProps) {
  const { palette } = useLensoAppearance();
  const [pressed, setPressed] = useState(false);
  const [width, setWidth] = useState(160);
  const height = { sm: 28, md: 34, lg: 50 }[size];
  const scale = usePressMotion(pressed, Math.max(width, height));
  const color = destructive ? palette.destructive : (tint ?? palette.tint);
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved) => (
        <Animated.View
          style={[
            { alignSelf: "flex-start", opacity: disabled ? 0.4 : 1 },
            resolved,
            { transform: [{ scale }] },
          ]}
        >
          <Pressable
            {...props}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
            style={{
              minHeight: height,
              paddingHorizontal: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GlassSurface
              sourceID={sourceID}
              tint={variant === "prominent" ? color : undefined}
              prominent={variant === "prominent"}
              held={pressed}
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { borderRadius: height / 2 }]}
            />
            <Text
              style={{
                color: variant === "prominent" ? "white" : color,
                fontSize: size === "sm" ? 13 : 17,
                fontWeight: "600",
              }}
            >
              {children}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </NativeStyle>
  );
}

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  tint,
  xstyle,
  style,
  ...props
}: SwitchProps) {
  const [current, setCurrent] = useValue(checked, defaultChecked, onCheckedChange);
  const [held, setHeld] = useState(false);
  const sourceID = useId();
  const { palette } = useLensoAppearance();
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved) => (
        <Pressable
          {...props}
          accessibilityRole="switch"
          accessibilityState={{ checked: current, disabled }}
          disabled={disabled}
          onPress={() => setCurrent(!current)}
          onPressIn={() => setHeld(true)}
          onPressOut={() => setHeld(false)}
          style={[{ width: 64, height: 38, opacity: disabled ? 0.4 : 1 }, resolved]}
        >
          <Backdrop
            sourceID={sourceID}
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 19,
                backgroundColor: current ? (tint ?? palette.switchOn) : palette.fill,
              },
            ]}
          />
          <GlassSurface
            sourceID={sourceID}
            pointerEvents="none"
            material="clear"
            lens={held}
            held={held}
            style={{
              position: "absolute",
              left: current ? 28 : 2,
              top: 2,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: held ? "transparent" : "white",
            }}
          />
        </Pressable>
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
  disabled,
  tint,
  xstyle,
  style,
  ...props
}: SliderProps) {
  const [stored, setCurrent] = useValue(value, defaultValue ?? min, onValueChange);
  const current = sliderValue(stored, min, max, step);
  const [width, setWidth] = useState(300);
  const [held, setHeld] = useState(false);
  const { palette } = useLensoAppearance();
  const sourceID = useId();
  const dragged = useRef(false);
  const tap = useRef({ x: 0, y: 0 });
  const proposed = useRef(current);
  const at = (x: number) =>
    sliderValue(
      min + Math.max(0, Math.min(1, (x - 19) / Math.max(1, width - 38))) * (max - min),
      min,
      max,
      step,
    );
  const move = (x: number) => {
    proposed.current = at(x);
    setCurrent(proposed.current);
  };
  const finish = () => {
    setHeld(false);
    onValueChangeEnd?.(proposed.current);
  };
  // PanResponder stores these handlers; it does not read gesture refs during render.
  // eslint-disable-next-line react/refs
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !disabled && Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: (event) => {
      dragged.current = true;
      setHeld(true);
      move(event.nativeEvent.locationX);
    },
    onPanResponderMove: (event) => move(event.nativeEvent.locationX),
    onPanResponderRelease: finish,
    onPanResponderTerminate: () => {
      setHeld(false);
    },
    onPanResponderTerminationRequest: () => true,
  });
  const fraction = Math.max(0, Math.min(1, (current - min) / (max - min)));
  return (
    <NativeStyle xstyle={xstyle} style={style}>
      {(resolved) => (
        <View
          {...props}
          {...responder.panHandlers}
          accessible
          accessibilityRole="adjustable"
          accessibilityState={{ disabled }}
          accessibilityValue={{ min, max, now: current }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(event) => {
            if (!disabled)
              setCurrent(
                sliderValue(
                  current +
                    (event.nativeEvent.actionName === "increment" ? 1 : -1) *
                      (step || (max - min) / 100),
                  min,
                  max,
                  step,
                ),
              );
          }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          onTouchStart={(event) => {
            dragged.current = false;
            tap.current = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
          }}
          onTouchEnd={(event) => {
            if (
              !disabled &&
              !dragged.current &&
              Math.hypot(
                event.nativeEvent.locationX - tap.current.x,
                event.nativeEvent.locationY - tap.current.y,
              ) < 6
            ) {
              move(event.nativeEvent.locationX);
              onValueChangeEnd?.(proposed.current);
            }
          }}
          style={[{ height: 44, alignSelf: "stretch", opacity: disabled ? 0.4 : 1 }, resolved]}
        >
          <Backdrop sourceID={sourceID} pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View
              style={{
                position: "absolute",
                left: 19,
                right: 19,
                top: 19,
                height: 6,
                borderRadius: 3,
                backgroundColor: palette.fill,
              }}
            >
              <View
                style={{
                  width: `${fraction * 100}%`,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: tint ?? palette.tint,
                }}
              />
            </View>
          </Backdrop>
          <GlassSurface
            sourceID={sourceID}
            pointerEvents="none"
            material="clear"
            lens={held}
            held={held}
            style={{
              position: "absolute",
              left: fraction * (width - 38),
              top: 10,
              width: 38,
              height: 24,
              borderRadius: 12,
              backgroundColor: held ? "transparent" : "white",
            }}
          />
        </View>
      )}
    </NativeStyle>
  );
}
