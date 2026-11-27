import { useCallback, type Ref } from "react";
import { bindTabBarMotion } from "@lenso/glass/motion";
import { useBindRef } from "../../utils/interaction/ref.js";

export function useTabBarMotionRef(
  ref: Ref<HTMLDivElement> | undefined,
  enabled: boolean,
  vertical: boolean,
) {
  return useBindRef(
    ref,
    useCallback(
      (element: HTMLDivElement) => (enabled ? bindTabBarMotion(element, vertical) : undefined),
      [enabled, vertical],
    ),
  );
}
