import { useCallback, useEffect, useState, type Ref } from "react";

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

/** Binds a behavior to the mounted node while preserving the caller's ref. */
export function useBindRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  bind: (element: T) => (() => void) | undefined,
) {
  const [element, setElement] = useState<T | null>(null);
  useEffect(() => (element ? bind(element) : undefined), [element, bind]);
  return useCallback(
    (node: T | null) => {
      setElement(node);
      const cleanup = assignRef(ref, node);
      return () => {
        setElement(null);
        cleanup();
      };
    },
    [ref],
  );
}
