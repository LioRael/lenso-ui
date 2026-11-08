import { afterEach, expect, test } from "bun:test";
import { act, createRef, type Ref } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useFocusMethodRef } from "../src/utils/interaction/focus-method.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root;
let container: HTMLDivElement;
const method = () => document.documentElement.getAttribute("data-lenso-focus-method");

function Field({ forwardedRef }: { forwardedRef?: Ref<HTMLInputElement> }) {
  return <input ref={useFocusMethodRef(forwardedRef)} />;
}

afterEach(async () => {
  await act(() => root?.unmount());
  container?.remove();
});

async function mount() {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
}

test("pointer editing keeps its caret presentation until keyboard navigation, without cancelling native events", async () => {
  await mount();
  await act(() =>
    root.render(
      <>
        <Field />
        <button>Action</button>
      </>,
    ),
  );
  const input = container.querySelector("input")!;
  const pointer = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
  input.dispatchEvent(pointer);
  expect(method()).toBe("pointer");
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
  expect(method()).toBe("pointer");
  const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  input.dispatchEvent(tab);
  expect(method()).toBe("keyboard");
  expect(pointer.defaultPrevented).toBe(false);
  expect(tab.defaultPrevented).toBe(false);
  input.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  container
    .querySelector("button")!
    .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(method()).toBe("keyboard");
});

test("repeated navigation does not invalidate observers of the document's focus mode", async () => {
  await mount();
  await act(() => root.render(<Field />));
  const observer = new MutationObserver(() => {});
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-lenso-focus-method"],
  });
  try {
    for (const key of ["ArrowDown", "ArrowUp", "Escape"])
      document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    expect(method()).toBe("keyboard");
    expect(observer.takeRecords()).toHaveLength(1);
    for (let i = 0; i < 2; i++)
      document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(method()).toBe("pointer");
    expect(observer.takeRecords()).toHaveLength(1);
  } finally {
    observer.disconnect();
  }
});

test("shared tracking survives one field unmount and releases listeners with the last field and forwarded ref", async () => {
  await mount();
  const ref = createRef<HTMLInputElement>();
  await act(() =>
    root.render(
      <>
        <Field key="a" forwardedRef={ref} />
        <Field key="b" />
      </>,
    ),
  );
  expect(ref.current).toBe(container.querySelector("input"));
  ref.current!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  await act(() => root.render(<Field key="a" forwardedRef={ref} />));
  expect(method()).toBe("pointer");
  await act(() => root.render(null));
  expect(ref.current).toBeNull();
  expect(method()).toBeNull();
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  expect(method()).toBeNull();
});
