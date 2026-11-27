import { createSignal, createEffect } from "solid-js";
import { createReactiveHooks } from "@lenso/primitives/hooks";
export {
  createListActions,
  type ListData,
  type ListOptions,
  type Key,
  type Selection,
  type UseMediaQueryOptions,
  type UseOverlayStateProps,
  type Theme,
} from "@lenso/primitives/hooks";
function cell<T>(initial: T) {
  const [read, set] = createSignal({ value: initial });
  return {
    read: () => read().value,
    write: (value: T) => {
      set({ value });
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
  createEffect(read, apply);
});
