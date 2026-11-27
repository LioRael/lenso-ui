import { getContext, setContext } from "svelte";

export function createOptionalContext<Value>() {
  const key = Symbol();
  return [
    () => getContext<Value | undefined>(key),
    (value: Value) => setContext(key, value),
  ] as const;
}
