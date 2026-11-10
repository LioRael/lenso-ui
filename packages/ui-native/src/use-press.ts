import { useEffect, useState } from "react";
import { Animated } from "react-native";
import { touchPress } from "../../glass/src/motion/press-model";
import { useLensoAppearance } from "./provider";

export function usePressMotion(pressed: boolean, length: number) {
  const [scale] = useState(() => new Animated.Value(1));
  const { reducedMotion } = useLensoAppearance();
  useEffect(() => {
    if (reducedMotion) {
      scale.stopAnimation();
      scale.setValue(1);
      return;
    }
    const [stiffness, damping] = pressed ? touchPress.press : touchPress.release;
    const animation = Animated.spring(scale, {
      toValue: pressed ? 1 + touchPress.grow / Math.max(length, 1) : 1,
      stiffness,
      damping,
      mass: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [pressed, length, reducedMotion, scale]);
  return scale;
}
