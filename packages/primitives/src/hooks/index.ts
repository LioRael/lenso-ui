import {
  createListActions,
  defaultKey,
  type ListData,
  type ListOptions,
  type ListState,
} from "./list-data.js";
export * from "./list-data.js";

type Cell<T> = { read(): T; write(value: T): void };
type Watch = <T>(read: () => T, apply: (value: T) => void | (() => void)) => void;
export type UseMediaQueryOptions = { defaultValue?: boolean; initializeWithValue?: boolean };
export type UseOverlayStateProps = {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
};
export type Theme = string;

export function createReactiveHooks(cell: <T>(initial: T) => Cell<T>, watch: Watch) {
  const variables = new Map<string, string | undefined>();
  const useSafeLayoutEffect = (
    setup: () => void | (() => void),
    dependencies: () => unknown = () => undefined,
  ) => watch(dependencies, setup);
  function useIsMounted() {
    const mounted = cell(false);
    useSafeLayoutEffect(() => {
      mounted.write(true);
      return () => mounted.write(false);
    });
    return mounted.read;
  }
  function useCSSVariable(name: string, override?: string, cache = true) {
    const hydrated = useIsMounted();
    return () => {
      if (override !== undefined || !hydrated()) return override;
      if (cache && variables.has(name)) return variables.get(name);
      const value =
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;
      if (cache) variables.set(name, value);
      return value;
    };
  }
  function useMediaQuery(query: string, options: UseMediaQueryOptions = {}) {
    const match = cell(
      options.initializeWithValue !== false && typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia(query).matches
        : (options.defaultValue ?? false),
    );
    useSafeLayoutEffect(() => {
      if (!window.matchMedia) return;
      const media = window.matchMedia(query);
      const update = () => match.write(media.matches);
      update();
      if (media.addEventListener) {
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
      }
      media.addListener(update);
      return () => media.removeListener(update);
    });
    return match.read;
  }
  function useMeasuredHeight(ref: () => HTMLElement | null | undefined) {
    const height = cell<number | undefined>(undefined);
    watch(ref, (node) => {
      if (!node) return;
      const measure = () => {
        const previous = node.style.height;
        node.style.height = "auto";
        const next = node.scrollHeight;
        node.style.height = previous;
        height.write(next);
      };
      let frame = 0;
      const schedule = () => {
        if (!frame)
          frame = requestAnimationFrame(() => {
            frame = 0;
            measure();
          });
      };
      measure();
      const mutations = new MutationObserver(schedule);
      mutations.observe(node, {
        attributeFilter: ["class"],
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
      let width = node.getBoundingClientRect().width;
      const resize = new ResizeObserver((entries) => {
        const next = entries[0]?.contentRect.width;
        if (next !== undefined && Math.abs(next - width) >= 0.5) {
          width = next;
          schedule();
        }
      });
      resize.observe(node);
      return () => {
        mutations.disconnect();
        resize.disconnect();
        cancelAnimationFrame(frame);
      };
    });
    return {
      get height() {
        return height.read();
      },
    };
  }
  function useOverlayState(props: UseOverlayStateProps = {}) {
    const local = cell(props.defaultOpen ?? false);
    const current = () => props.isOpen ?? local.read();
    const setOpen = (next: boolean) => {
      props.onOpenChange?.(next);
      if (props.isOpen === undefined) local.write(next);
    };
    return {
      get isOpen() {
        return current();
      },
      setOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen(!current()),
    };
  }
  function useListData<T>(options: ListOptions<T>): ListData<T> {
    const getKey = options.getKey ?? defaultKey<T>;
    const state = cell<ListState<T>>({
      items: options.initialItems ?? [],
      selectedKeys:
        options.initialSelectedKeys === "all" ? "all" : new Set(options.initialSelectedKeys),
      filterText: options.initialFilterText ?? "",
    });
    return {
      ...createListActions<T, never>({ getKey }, (update) => state.write(update(state.read()))),
      get items() {
        const { items, filterText } = state.read();
        return options.filter ? items.filter((item) => options.filter!(item, filterText)) : items;
      },
      get selectedKeys() {
        return state.read().selectedKeys;
      },
      get filterText() {
        return state.read().filterText;
      },
      getItem: (key) => state.read().items.find((item) => getKey(item) === key),
    };
  }
  function useTheme(defaultTheme = "system") {
    const theme = cell(defaultTheme),
      mounted = useIsMounted(),
      dark = useMediaQuery("(prefers-color-scheme: dark)", { initializeWithValue: false });
    const resolved = () =>
      theme.read() !== "system"
        ? theme.read()
        : mounted()
          ? dark()
            ? "dark"
            : "light"
          : undefined;
    let previous: string | undefined;
    useSafeLayoutEffect(() => {
      try {
        theme.write(window.localStorage.getItem("lenso-theme") ?? defaultTheme);
      } catch {
        /* Storage is optional. */
      }
    });
    watch(resolved, (value) => {
      if (!value) return;
      const root = document.documentElement;
      if (previous) root.classList.remove(previous);
      root.classList.add(value);
      root.dataset["theme"] = value;
      previous = value;
    });
    return {
      get theme() {
        return theme.read();
      },
      get resolvedTheme() {
        return resolved();
      },
      setTheme(next: string) {
        try {
          window.localStorage.setItem("lenso-theme", next);
        } catch {
          /* Storage is optional. */
        }
        theme.write(next);
      },
    };
  }
  return {
    useIsMounted,
    useIsHydrated: useIsMounted,
    useCSSVariable,
    useMediaQuery,
    useMeasuredHeight,
    useOverlayState,
    useListData,
    useTheme,
    useSafeLayoutEffect,
    useIsomorphicLayoutEffect: useSafeLayoutEffect,
  };
}
