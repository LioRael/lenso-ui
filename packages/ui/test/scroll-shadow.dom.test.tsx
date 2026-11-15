import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import {
  ScrollShadow,
  type ScrollShadowVisibility,
} from "../src/components/scroll-shadow/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// Subscription reuse must not skip overflow changes from nested text/styles or
// replaced direct children. Happy DOM supplies mutations, not browser layout.
test.each(["vertical", "horizontal"] as const)(
  "automatic %s shadows follow content mutations and scrolling",
  async (orientation) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const changes: ScrollShadowVisibility[] = [];
    let length = 80;
    const vertical = orientation === "vertical";
    const settle = async (change: () => void) =>
      act(async () => {
        change();
        await new Promise((resolve) => setTimeout(resolve, 30));
      });
    try {
      await act(() =>
        root.render(
          <ScrollShadow
            aria-label="Results"
            orientation={orientation}
            onVisibilityChange={(value) => changes.push(value)}
            ref={(node) => {
              if (node)
                Object.defineProperties(node, {
                  [vertical ? "scrollHeight" : "scrollWidth"]: { get: () => length },
                  [vertical ? "clientHeight" : "clientWidth"]: { value: 100 },
                });
            }}
          >
            <div>
              <span>Short</span>
            </div>
          </ScrollShadow>,
        ),
      );
      const scroll = host.querySelector<HTMLElement>('[aria-label="Results"]')!;
      expect(changes.at(-1)).toBe("none");
      await settle(() => {
        length = 300;
        scroll.querySelector("span")!.firstChild!.textContent = "Longer content";
      });
      expect(changes.at(-1)).toBe(vertical ? "bottom" : "right");
      await settle(() => {
        scroll[vertical ? "scrollTop" : "scrollLeft"] = 50;
        scroll.dispatchEvent(new Event("scroll"));
      });
      expect(changes.at(-1)).toBe("both");
      await settle(() => {
        length = 150;
        scroll.querySelector("span")!.className = "compact";
      });
      expect(changes.at(-1)).toBe(vertical ? "top" : "left");
      await settle(() => {
        length = 90;
        scroll[vertical ? "scrollTop" : "scrollLeft"] = 0;
        scroll.replaceChildren(document.createElement("div"));
      });
      expect(changes.at(-1)).toBe("none");
      await settle(() => {
        length = 240;
        scroll.firstElementChild!.setAttribute("style", "height:240px;width:240px");
      });
      expect(changes.at(-1)).toBe(vertical ? "bottom" : "right");
    } finally {
      await act(() => root.unmount());
      host.remove();
    }
  },
);
