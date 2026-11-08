import type { Ref } from "react";

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    return () => {
      if (typeof cleanup === "function") cleanup();
      else ref(null);
    };
  }
  if (ref) ref.current = node;
  return () => {
    if (ref) ref.current = null;
  };
}
