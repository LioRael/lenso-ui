import { describe, expect, it } from "vitest";
import { renderHookOnServer } from "../helpers/ssr.js";
import {
  createListActions,
  type ListState,
  useCSSVariable,
  useIsHydrated,
  useMediaQuery,
  useOverlayState,
  useTheme,
} from "../../react/src/hooks/index.js";

describe("server hooks", () => {
  // No previous tests prove these hooks avoid document/window/storage access during SSR.
  it("renders hydration, media, CSS and system theme defaults without browser globals", () => {
    const { result } = renderHookOnServer(() => {
      const hydrated = useIsHydrated();
      const matches = useMediaQuery("(min-width: 20px)", { defaultValue: true });
      const css = useCSSVariable("--accent");
      const theme = useTheme();
      const overlay = useOverlayState({ defaultOpen: true });
      return {
        hydrated,
        matches,
        css,
        theme: theme.theme,
        resolvedTheme: theme.resolvedTheme,
        open: overlay.isOpen,
      };
    });
    expect(result).toEqual({
      hydrated: false,
      matches: true,
      css: undefined,
      theme: "system",
      resolvedTheme: undefined,
      open: true,
    });
  });
});

describe("list selection transitions", () => {
  // "all" is a sentinel, not an iterable of keys. Treating it as a Set corrupts removal semantics.
  it("materializes all selection before removing keys and clears selection when emptied", () => {
    let state: ListState<{ id: number }> = {
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      selectedKeys: "all",
      filterText: "",
    };
    const actions = createListActions({ getKey: (item: { id: number }) => item.id }, (update) => {
      state = update(state);
    });
    actions.removeKeysFromSelection(new Set([2]));
    expect(state.selectedKeys).toEqual(new Set([1, 3]));
    actions.removeSelectedItems();
    expect(state.items).toEqual([{ id: 2 }]);
    expect(state.selectedKeys).toEqual(new Set());
    actions.setSelectedKeys("all");
    actions.remove(2);
    expect(state.items).toEqual([]);
    expect(state.selectedKeys).toEqual(new Set());
  });
  it("retains source order when moving multiple keys and ignores missing keys", () => {
    let state: ListState<{ id: number }> = {
      items: [1, 2, 3, 4, 5].map((id) => ({ id })),
      selectedKeys: new Set(),
      filterText: "",
    };
    const actions = createListActions({ getKey: (item: { id: number }) => item.id }, (update) => {
      state = update(state);
    });
    actions.moveAfter(4, [3, 99, 1, 1]);
    expect(state.items.map((item) => item.id)).toEqual([2, 4, 1, 3, 5]);
    actions.update(1, (item) => ({ id: item.id + 10 }));
    expect(state.items.map((item) => item.id)).toEqual([2, 4, 11, 3, 5]);
  });
});
