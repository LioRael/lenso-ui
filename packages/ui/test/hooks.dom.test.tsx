import { afterEach, expect, test } from "bun:test";
import { act, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useMeasuredHeight, useMediaQuery, useOverlayState, useTheme } from "../src/hooks/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | undefined;
const originalMatchMedia = window.matchMedia;
const storage = Object.getOwnPropertyDescriptor(window, "localStorage")!;

async function mount(element: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() => root!.render(element));
  return container;
}

afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  Object.defineProperty(window, "localStorage", storage);
  window.matchMedia = originalMatchMedia;
  localStorage.clear();
  document.body.replaceChildren();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
});

function Theme() {
  const { theme, setTheme } = useTheme("custom-light");
  return <button onClick={() => setTheme("custom-dark")}>{theme}</button>;
}

test("switches a custom theme when storage reads and writes are denied", async () => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("denied", "SecurityError");
    },
    configurable: true,
  });
  const container = await mount(<Theme />);
  await act(() => container.querySelector("button")!.click());
  expect(container.textContent).toBe("custom-dark");
  expect(document.documentElement.getAttribute("data-theme")).toBe("custom-dark");
  expect(document.documentElement.classList.contains("custom-light")).toBe(false);
});

test("persists the selected theme under Lenso's storage key", async () => {
  const container = await mount(<Theme />);
  await act(() => container.querySelector("button")!.click());
  expect(localStorage.getItem("lenso-theme")).toBe("custom-dark");
  await act(() => root!.unmount());
  root = undefined;
  container.remove();
  const remounted = await mount(<Theme />);
  expect(remounted.textContent).toBe("custom-dark");
  expect(document.documentElement.getAttribute("data-theme")).toBe("custom-dark");
});

test("keeps controlled overlays closed until the owner accepts the change", async () => {
  function Overlay() {
    const [requested, setRequested] = useState(false);
    const state = useOverlayState({ isOpen: false, onOpenChange: setRequested });
    return (
      <>
        <button onClick={state.toggle}>{state.isOpen ? "open" : "closed"}</button>
        <output>{String(requested)}</output>
      </>
    );
  }
  const container = await mount(<Overlay />);
  await act(() => container.querySelector("button")!.click());
  expect(container.querySelector("output")?.textContent).toBe("true");
  expect(container.querySelector("button")?.textContent).toBe("closed");
});

test("removes media subscriptions when the query changes and on unmount", async () => {
  const removals: string[] = [];
  window.matchMedia = (query) => {
    const target = new EventTarget();
    const remove = target.removeEventListener.bind(target);
    target.removeEventListener = (...args) => {
      if (args[0] === "change") removals.push(query);
      remove(...args);
    };
    return Object.assign(target, { matches: query === "(second)", media: query }) as MediaQueryList;
  };
  function Media() {
    const [query, setQuery] = useState("(first)");
    const matches = useMediaQuery(query);
    return <button onClick={() => setQuery("(second)")}>{String(matches)}</button>;
  }
  const container = await mount(<Media />);
  await act(() => container.querySelector("button")!.click());
  expect(container.textContent).toBe("true");
  expect(removals).toContain("(first)");
  await act(() => root!.unmount());
  root = undefined;
  expect(removals).toContain("(second)");
});

test("remeasures height after an observed width change", async () => {
  const originalObserver = globalThis.ResizeObserver;
  const originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
  let observed: ResizeObserverCallback | undefined;
  let height = 100;
  class TestResizeObserver implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      observed = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = TestResizeObserver;
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => height,
  });
  try {
    function Measured() {
      const ref = useRef<HTMLDivElement>(null);
      const measured = useMeasuredHeight(ref);
      return (
        <>
          <div ref={ref}>Content</div>
          <output>{measured.height}</output>
        </>
      );
    }
    const container = await mount(<Measured />);
    expect(container.querySelector("output")?.textContent).toBe("100");
    height = 200;
    await act(async () => {
      observed!([{ contentRect: { width: 80 } } as ResizeObserverEntry], {} as ResizeObserver);
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(container.querySelector("output")?.textContent).toBe("200");
  } finally {
    globalThis.ResizeObserver = originalObserver;
    if (originalHeight)
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", originalHeight);
    else delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
  }
});
