import { useState } from "react";
import type { NativeSyntheticEvent } from "react-native";

type Size = { width: number; height: number };
export function useNativeSize(initial: Size, fill = false) {
  const [size, setSize] = useState(initial);
  return {
    style: fill ? { height: Math.max(44, size.height), alignSelf: "stretch" as const } : size,
    onSize: (event: NativeSyntheticEvent<Size>) => setSize(event.nativeEvent),
  };
}
