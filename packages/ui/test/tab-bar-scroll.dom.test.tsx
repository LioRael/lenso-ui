import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TabBar, type TabBarRootProps } from "../src/components/tab-bar/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
const styleIterator = Object.getOwnPropertyDescriptor(
  CSSStyleDeclaration.prototype,
  Symbol.iterator,
);
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
  if (styleIterator)
    Object.defineProperty(CSSStyleDeclaration.prototype, Symbol.iterator, styleIterator);
  else Reflect.deleteProperty(CSSStyleDeclaration.prototype, Symbol.iterator);
});

async function fixture(autoMinimize: TabBarRootProps["autoMinimize"], controlled?: boolean) {
  const target = createRef<HTMLDivElement>();
  const changes: boolean[] = [];
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = async (mode = autoMinimize) =>
    act(() =>
      root!.render(
        <div ref={target}>
          <TabBar
            aria-label="Navigation"
            autoMinimize={mode}
            scrollTarget={target}
            minimized={controlled}
            onMinimizedChange={(value) => changes.push(value)}
          />
        </div>,
      ),
    );
  await render();
  Object.defineProperties(target.current!, {
    scrollHeight: { value: 1000 },
    clientHeight: { value: 200 },
  });
  const element = target.current!;
  const scroll = async (top: number) =>
    act(() => {
      element.scrollTop = top;
      element.dispatchEvent(new Event("scroll"));
    });
  const minimized = () => host.querySelector("nav")!.hasAttribute("data-minimized");
  return { scroll, minimized, changes, render, target };
}

test("true and down minimize after accumulated travel, reverse after 8px, and expand at the top", async () => {
  const f = await fixture(true);
  await f.scroll(4);
  expect(f.minimized()).toBe(false);
  await f.scroll(8);
  expect(f.minimized()).toBe(true);
  await f.scroll(6);
  expect(f.minimized()).toBe(true);
  await f.scroll(0);
  expect(f.minimized()).toBe(false);
  await f.render("down");
  await f.scroll(20);
  expect(f.minimized()).toBe(true);
  await f.scroll(17);
  await f.scroll(19);
  await f.scroll(12);
  expect(f.minimized()).toBe(true);
  await f.scroll(11);
  expect(f.minimized()).toBe(false);
  expect(f.changes).toEqual([true, false, true, false]);
});

test("up minimizes toward the top, including zero, and down expands", async () => {
  const f = await fixture("up");
  await f.scroll(40);
  expect(f.minimized()).toBe(false);
  await f.scroll(33);
  expect(f.minimized()).toBe(false);
  await f.scroll(32);
  expect(f.minimized()).toBe(true);
  await f.scroll(40);
  expect(f.minimized()).toBe(false);
  await f.scroll(0);
  expect(f.minimized()).toBe(true);
  await f.scroll(-20);
  expect(f.changes).toEqual([true, false, true]);
});

test("disabled mode and unrelated page scrolling do not minimize; changing direction resets history", async () => {
  const f = await fixture(false);
  await f.scroll(20);
  expect(f.changes).toEqual([]);
  await f.render("up");
  await act(() => window.dispatchEvent(new Event("scroll")));
  expect(f.changes).toEqual([]);
  await f.scroll(16);
  await f.render("down");
  await f.scroll(20);
  expect(f.changes).toEqual([]);
  await f.scroll(24);
  expect(f.minimized()).toBe(true);
  await f.render(false);
  await f.scroll(0);
  expect(f.minimized()).toBe(true);
});

test("controlled minimization reports intent without changing owner state or repeating callbacks", async () => {
  const f = await fixture("down", false);
  await f.scroll(20);
  await f.scroll(40);
  expect(f.changes).toEqual([true]);
  expect(f.minimized()).toBe(false);
  await act(() => root!.unmount());
  root = undefined;
  await f.scroll(60);
  expect(f.changes).toEqual([true]);
});

// Scroll coverage above has no groups. This catches the optical-layer remount and
// focus loss that occur when a populated navigation collapses during interaction.
test("minimizing retains the row and optical layers while moving focus to an expand control", async () => {
  // Happy DOM's style declarations lack the browser's iterable interface.
  Object.defineProperty(CSSStyleDeclaration.prototype, Symbol.iterator, {
    configurable: true,
    value: function* (this: CSSStyleDeclaration) {
      for (let index = 0; index < this.length; index++) yield this.item(index);
    },
  });
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const render = (minimized: boolean) =>
    act(() =>
      root!.render(
        <TabBar minimized={minimized}>
          <TabBar.Group>
            <TabBar.Link href="#home" icon={<svg />} isCurrent>
              Home
            </TabBar.Link>
            <TabBar.Link href="#library" icon={<svg />}>
              Library
            </TabBar.Link>
          </TabBar.Group>
        </TabBar>,
      ),
    );
  await render(false);
  const current = host.querySelector<HTMLElement>("[data-tab-bar-list] [data-current]")!;
  const indicator = host.querySelector("[data-slot='tab-bar-indicator']");
  const highlight = host.querySelector("[data-slot='tab-bar-highlight']");
  const list = host.querySelector("[data-tab-bar-list]")!;
  current.focus();
  await render(true);
  expect(host.querySelector("[data-slot='tab-bar-indicator']")).toBe(indicator);
  expect(host.querySelector("[data-slot='tab-bar-highlight']")).toBe(highlight);
  expect(host.querySelectorAll("[data-tab-bar-list] [data-tab-bar-item]")).toHaveLength(2);
  expect(list.hasAttribute("inert")).toBe(true);
  expect(list.getAttribute("aria-hidden")).toBe("true");
  expect(document.activeElement).toBe(host.querySelector("[data-tab-bar-expand]"));
  await render(false);
  expect(document.activeElement).toBe(current);
  expect(list.hasAttribute("inert")).toBe(false);
  expect(host.querySelector("[data-slot='tab-bar-indicator']")).toBe(indicator);
});
