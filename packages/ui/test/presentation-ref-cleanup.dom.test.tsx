import { expect, test } from "bun:test";
import { act, createRef, type Ref } from "react";
import { createRoot } from "react-dom/client";
import { useSwitchRef } from "../src/utils/interaction/switch.js";
import { useSliderThumbRef } from "../src/utils/interaction/slider.js";
import { useTabsListRef } from "../src/utils/interaction/tabs.js";
import { useSubmenuPopupRef } from "../src/utils/interaction/submenu.js";
import { useTabBarMotionRef } from "../src/components/tab-bar/tab-bar-motion.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test.each(["switch", "slider", "tabs", "submenu", "tab-bar"] as const)(
  "%s releases presentation resources when only its host is removed",
  async (kind) => {
    const original = globalThis.MutationObserver;
    const active = new Set<MutationObserver>();
    globalThis.MutationObserver = class extends original {
      override observe(target: Node, options?: MutationObserverInit) {
        super.observe(target, options);
        active.add(this);
      }
      override disconnect() {
        super.disconnect();
        active.delete(this);
      }
    };
    const iterator = Object.getOwnPropertyDescriptor(
      CSSStyleDeclaration.prototype,
      Symbol.iterator,
    );
    Object.defineProperty(CSSStyleDeclaration.prototype, Symbol.iterator, {
      configurable: true,
      value: function* (this: CSSStyleDeclaration) {
        for (let i = 0; i < this.length; i++) yield this.item(i);
      },
    });
    const host = document.createElement("div");
    const parent = document.createElement("div");
    parent.dataset["lensoSlot"] = "menu-popup";
    parent.innerHTML = "<button>Submenu</button>";
    const trigger = { current: parent.firstElementChild as HTMLElement };
    document.body.append(parent, host);
    const root = createRoot(host);
    const forwarded = createRef<HTMLDivElement>();
    const unmount = () => {};
    const hooks: Record<typeof kind, (ref: Ref<HTMLDivElement>) => Ref<HTMLDivElement>> = {
      switch: useSwitchRef,
      slider: useSliderThumbRef,
      tabs: (ref) => useTabsListRef(ref, true),
      submenu: (ref) => useSubmenuPopupRef(ref, trigger, unmount, false),
      "tab-bar": (ref) => useTabBarMotionRef(ref, true),
    };
    const usePresentation = hooks[kind];
    let renders = 0;
    function Example({ visible }: { visible: boolean }) {
      renders++;
      const ref = usePresentation(forwarded);
      return (
        <div data-lg-slider-control="">
          {visible && (
            <div ref={ref}>
              {kind === "submenu" && (
                <>
                  <div data-lenso-slot="menu-surface" />
                  <div data-lenso-slot="menu-content">
                    <div data-lenso-slot="menu-plate" />
                  </div>
                </>
              )}
              {kind === "tab-bar" && (
                <>
                  <div data-tab-bar-list="" />
                  {[
                    "indicator",
                    "highlight",
                    "highlight-row",
                    "highlight-ring",
                    "highlight-centre",
                    "highlight-centre-row",
                  ].map((slot) => (
                    <div key={slot} data-lenso-slot={`tab-bar-${slot}`} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      );
    }
    try {
      await act(() => root.render(<Example visible />));
      expect(forwarded.current).not.toBeNull();
      expect(active.size).toBeGreaterThan(0);
      const beforeRemoval = renders;
      await act(() => root.render(<Example visible={false} />));
      expect(renders).toBeGreaterThan(beforeRemoval);
      expect(forwarded.current).toBeNull();
      expect(active.size).toBe(0);
      if (kind === "submenu") expect(parent.hasAttribute("data-menu-child-count")).toBe(false);
      await act(() => root.render(<Example visible />));
      expect(active.size).toBeGreaterThan(0);
    } finally {
      await act(() => root.unmount());
      host.remove();
      parent.remove();
      globalThis.MutationObserver = original;
      if (iterator) Object.defineProperty(CSSStyleDeclaration.prototype, Symbol.iterator, iterator);
      else Reflect.deleteProperty(CSSStyleDeclaration.prototype, Symbol.iterator);
    }
  },
);
