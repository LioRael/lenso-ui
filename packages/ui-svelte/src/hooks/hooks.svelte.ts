import { untrack } from "svelte";
import { createReactiveHooks } from "@lenso/primitives/hooks";
function cell<T>(initial: T) {
  let value = $state.raw(initial);
  return {
    read: () => value,
    write: (next: T) => {
      value = next;
    },
  };
}
export const {
  useIsMounted,
  useIsHydrated,
  useCSSVariable,
  useMediaQuery,
  useMeasuredHeight,
  useOverlayState,
  useListData,
  useTheme,
  useSafeLayoutEffect,
  useIsomorphicLayoutEffect,
} = createReactiveHooks(cell, (read, apply) => {
  $effect.pre(() => {
    const value = read();
    return untrack(() => apply(value));
  });
});
