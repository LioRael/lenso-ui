import { useEffect, useRef, useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import {
  useMeasuredHeight,
  useMediaQuery,
  useOverlayState,
  useTheme,
} from "../../react/src/hooks/index.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.classList.remove("custom-dark", "custom-light", "dark", "light");
  document.documentElement.removeAttribute("data-theme");
});

// Upstream accesses localStorage without guarding SecurityError; a sandboxed page must still switch.
it("switches a custom theme when storage reads and writes are denied", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  function Probe() {
    const { theme, setTheme } = useTheme("custom-light");
    return <button onClick={() => setTheme("custom-dark")}>{theme}</button>;
  }
  const screen = await render(<Probe />);
  await screen.getByRole("button", { name: "custom-light" }).click();
  await expect.element(screen.getByRole("button")).toHaveTextContent("custom-dark");
  expect(document.documentElement.dataset["theme"]).toBe("custom-dark");
  expect(document.documentElement.classList.contains("custom-light")).toBe(false);
});

it("keeps controlled overlays closed until the owner accepts the change", async () => {
  const change = vi.fn();
  function Probe() {
    const state = useOverlayState({ isOpen: false, onOpenChange: change });
    return <button onClick={state.toggle}>{state.isOpen ? "open" : "closed"}</button>;
  }
  const screen = await render(<Probe />);
  await screen.getByRole("button").click();
  expect(change).toHaveBeenCalledWith(true);
  await expect.element(screen.getByRole("button")).toHaveTextContent("closed");
});

it("removes the old media subscription when the query changes and on unmount", async () => {
  const first = new EventTarget();
  const second = new EventTarget();
  const removeFirst = vi.spyOn(first, "removeEventListener");
  const removeSecond = vi.spyOn(second, "removeEventListener");
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      Object.assign(query === "(first)" ? first : second, {
        matches: query === "(second)",
        media: query,
      }) as MediaQueryList,
  );
  function Probe() {
    const [query, setQuery] = useState("(first)");
    const matches = useMediaQuery(query);
    return <button onClick={() => setQuery("(second)")}>{String(matches)}</button>;
  }
  const screen = await render(<Probe />);
  await screen.getByRole("button").click();
  await expect.element(screen.getByRole("button")).toHaveTextContent("true");
  expect(removeFirst).toHaveBeenCalledWith("change", expect.any(Function));
  await screen.unmount();
  expect(removeSecond).toHaveBeenCalledWith("change", expect.any(Function));
});

// Width reflow need not mutate text: a MutationObserver alone misses this geometry update.
it("updates measured height when text wraps at a narrower width", async () => {
  function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(320);
    const { height } = useMeasuredHeight(ref);
    const initial = useRef<number | undefined>(undefined);
    useEffect(() => {
      if (initial.current === undefined && height !== undefined) initial.current = height;
    }, [height]);
    return (
      <>
        <button onClick={() => setWidth(80)}>Narrow</button>
        <div ref={ref} style={{ width }}>
          Text whose wrapping changes the natural measured content height.
        </div>
        <output aria-label="height increased">
          {String(
            // oxlint-disable-next-line react/refs -- Write-once effect baseline; height, not the baseline, drives this measurement proof.
            height !== undefined && initial.current !== undefined && height > initial.current,
          )}
        </output>
      </>
    );
  }
  const screen = await render(<Probe />);
  await screen.getByRole("button").click();
  await expect.element(screen.getByLabelText("height increased")).toHaveTextContent("true");
});
