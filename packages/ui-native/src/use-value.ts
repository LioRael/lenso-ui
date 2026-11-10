import { useCallback, useState } from "react";

export function useValue<T>(controlled: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [local, setLocal] = useState(initial);
  const uncontrolled = controlled === undefined;
  const value = uncontrolled ? local : controlled;
  const change = useCallback(
    (next: T) => {
      if (next === value) return;
      if (uncontrolled) setLocal(next);
      onChange?.(next);
    },
    [uncontrolled, value, onChange],
  );
  return [value, change] as const;
}
