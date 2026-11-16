import { expect, test } from "bun:test";
import { act, type ComponentPropsWithRef } from "react";
import { createRoot } from "react-dom/client";
import { GlassMagnifier } from "../src/components/glass-magnifier/index.js";
import { GlassContainer } from "../src/components/glass-container/index.js";
import { Toolbar } from "../src/components/toolbar/index.js";
import { useMenuPopupRef } from "../src/utils/interaction/menu.js";

function Host({ shown, ...props }: ComponentPropsWithRef<"div"> & { shown: boolean }) {
  return shown ? <div {...props} /> : null;
}

for (const kind of ["magnifier", "container", "toolbar", "menu"] as const) {
  test(`${kind} releases its host while the composing owner stays mounted`, async () => {
    const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previous = environment.IS_REACT_ACT_ENVIRONMENT;
    environment.IS_REACT_ACT_ENVIRONMENT = true;
    const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
    if (!document.fonts)
      Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
    const NativeObserver = globalThis.MutationObserver;
    const observed = new Map<MutationObserver, Set<Node>>();
    globalThis.MutationObserver = class extends NativeObserver {
      override observe(node: Node, options: MutationObserverInit) {
        let targets = observed.get(this);
        if (!targets) observed.set(this, (targets = new Set()));
        targets.add(node);
        super.observe(node, options);
      }
      override disconnect() {
        observed.delete(this);
        super.disconnect();
      }
    };
    const raf = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;
    const frames = new Map<number, FrameRequestCallback>();
    let serial = 0;
    globalThis.requestAnimationFrame = (callback) => {
      frames.set(++serial, callback);
      return serial;
    };
    globalThis.cancelAnimationFrame = (id) => frames.delete(id);
    const popup = { current: null as HTMLElement | null };
    const trigger = { current: null as HTMLElement | null };
    const unmount = () => {};
    function MenuOwner({ shown }: { shown: boolean }) {
      const ref = useMenuPopupRef(undefined, popup, trigger, unmount, false, true);
      return shown ? <div ref={ref} data-open="" /> : null;
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const render = async (shown: boolean) => {
      await act(async () => {
        root.render(
          kind === "magnifier" ? (
            <GlassMagnifier render={<Host shown={shown} />} />
          ) : kind === "container" ? (
            <GlassContainer disabled render={<Host shown={shown} />} />
          ) : kind === "toolbar" ? (
            <Toolbar>
              <Toolbar.Group isDetached={false} render={<Host shown={shown} />} />
            </Toolbar>
          ) : (
            <MenuOwner shown={shown} />
          ),
        );
      });
    };
    try {
      await render(true);
      const node =
        kind === "menu"
          ? popup.current!
          : host.querySelector<HTMLElement>(
              `[data-lenso-slot="${kind === "container" ? "glass-container" : kind === "toolbar" ? "toolbar-group" : "glass-magnifier"}"]`,
            )!;
      expect(node).toBeTruthy();
      if (kind === "magnifier") expect(node.style.scale).not.toBe("");
      if (kind === "toolbar") expect(node.hasAttribute("data-toolbar-morph-ready")).toBe(true);
      if (kind === "menu") expect(frames.size).toBe(1);
      if (kind === "container")
        expect([...observed.values()].some((targets) => targets.has(node))).toBe(true);
      await render(false);
      expect(node.isConnected).toBe(false);
      if (kind === "magnifier") expect(node.style.scale).toBe("");
      if (kind === "toolbar") expect(node.hasAttribute("data-toolbar-morph-ready")).toBe(false);
      if (kind === "menu") {
        expect(popup.current).toBe(null);
        expect(frames.size).toBe(0);
      }
      expect([...observed.values()].some((targets) => targets.has(node))).toBe(false);
    } finally {
      await act(async () => root.unmount());
      host.remove();
      globalThis.MutationObserver = NativeObserver;
      globalThis.requestAnimationFrame = raf;
      globalThis.cancelAnimationFrame = cancel;
      environment.IS_REACT_ACT_ENVIRONMENT = previous;
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    }
  });
}
