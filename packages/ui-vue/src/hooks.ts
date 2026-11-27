import { createReactiveHooks } from "@lenso/primitives/hooks";
import { onMounted, onScopeDispose, shallowRef, watch } from "vue";
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
} = createReactiveHooks(
  <T>(initial: T) => {
    const value = shallowRef(initial);
    return {
      read: () => value.value,
      write: (next: T) => {
        value.value = next;
      },
    };
  },
  (read, apply) => {
    let stop: (() => void) | undefined;
    onMounted(() => {
      stop = watch(
        read,
        (value, _, cleanup) => {
          const dispose = apply(value);
          if (dispose) cleanup(dispose);
        },
        { immediate: true, flush: "post" },
      );
    });
    onScopeDispose(() => stop?.());
  },
);
