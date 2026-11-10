import { useState } from "react";

export function useValue<T>(controlled: T | undefined, initial: T, onChange?: (value: T) => void) {
  const [local, setLocal] = useState(initial);
  const value = controlled === undefined ? local : controlled;
  const change = (next: T) => {
    if (next === value) return;
    if (controlled === undefined) setLocal(next);
    onChange?.(next);
  };
  return [value, change] as const;
}
