import { mockSwipeGeometry } from "./helpers/dom.js";
import { afterEach, beforeEach, expect, test } from "bun:test";
import { act, useState, type Key, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { List } from "../src/components/list/index.js";
import { RefreshControl } from "../src/components/refresh-control/index.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root | undefined;
let restoreGeometry: () => void;
beforeEach(() => {
  restoreGeometry = mockSwipeGeometry();
});
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
  restoreGeometry();
});
async function mount(children: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root!.render(children));
  return host;
}
async function key(node: Element, value: string, ctrlKey = false) {
  await act(() => {
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: value, ctrlKey, bubbles: true, cancelable: true }),
    );
  });
}
function rows() {
  return ["A", "B", "C"].map((value) => (
    <List.Item key={value} itemKey={value} textValue={value} disabled={value === "B"}>
      <List.Content>
        <List.Title>{value}</List.Title>
      </List.Content>
    </List.Item>
  ));
}
// Existing static List/SwipeActions tests do not exercise selection ownership,
// editing transitions or cancellation of a keyboard reorder session.
test("List editing selects native row controls, skips disabled rows and preserves list semantics", async () => {
  let accepted: ReadonlySet<Key> = new Set();
  function Example() {
    const [selected, setSelected] = useState<ReadonlySet<Key>>(new Set());
    return (
      <List
        editing
        value={[...selected]}
        onValueChange={(keys) => {
          accepted = new Set(keys);
          setSelected(new Set(keys));
        }}
      >
        {rows()}
      </List>
    );
  }
  const host = await mount(<Example />);
  expect(host.querySelector("ul")?.children.length).toBe(3);
  expect(host.querySelector('[role="listbox"],[role="option"]')).toBeNull();
  await act(() => host.querySelector<HTMLElement>('[aria-label="Select A"]')!.click());
  expect([...accepted]).toEqual(["A"]);
  await key(host.querySelector("ul")!, "a", true);
  expect([...accepted]).toEqual(["A", "C"]);
  expect(host.querySelector('[aria-label="Select B"]')!.getAttribute("aria-disabled")).toBe("true");
});
test("List closes revealed actions when editing starts", async () => {
  function Example() {
    const [editing, setEditing] = useState(false);
    return (
      <>
        <button onClick={() => setEditing(true)}>Edit</button>
        <List editing={editing}>
          <List.Item
            itemKey="a"
            textValue="A"
            endActions={[{ id: "delete", label: "Delete", onAction: () => {} }]}
          >
            <List.Title>A</List.Title>
          </List.Item>
        </List>
      </>
    );
  }
  const host = await mount(<Example />);
  await act(() => host.querySelector<HTMLElement>("[data-swipe-trigger]")!.click());
  expect(host.querySelector('[data-open-side="end"]')).not.toBeNull();
  await act(() => host.querySelector<HTMLButtonElement>("button")!.click());
  expect(host.querySelector('[data-open-side="end"],[data-swipe-trigger]')).toBeNull();
  expect(host.querySelector('[aria-label="Select A"]')).not.toBeNull();
});
test("Keyboard reorder requests a move only on confirmation and cancels on blur or Escape", async () => {
  const moves: unknown[] = [];
  const host = await mount(
    <List editing onReorder={(details) => moves.push(details)}>
      {rows()}
    </List>,
  );
  const handle = host.querySelector<HTMLElement>('[aria-label="Move A"]')!;
  await act(() => handle.focus());
  await key(handle, " ");
  await key(handle, "ArrowDown");
  expect(moves).toHaveLength(0);
  await key(handle, "Escape");
  expect(handle.getAttribute("aria-pressed")).toBe("false");
  await key(handle, " ");
  await key(handle, "ArrowDown");
  await key(handle, "Enter");
  expect(moves).toEqual([{ keys: new Set(["A"]), targetKey: "C", dropPosition: "after" }]);
  await key(handle, " ");
  await act(() => handle.blur());
  expect(handle.getAttribute("aria-pressed")).toBe("false");
});
// Refresh jobs and top-of-scroll touch arbitration are new contracts, absent
// from existing scrolling and swipe tests.
test("RefreshControl deduplicates pending jobs, announces completion and retries rejected jobs", async () => {
  let complete: () => void = () => {};
  let calls = 0;
  let fail = false;
  const host = await mount(
    <RefreshControl
      onRefresh={() => {
        calls++;
        if (fail) throw new Error("offline");
        return new Promise<void>((resolve) => {
          complete = resolve;
        });
      }}
    >
      <RefreshControl.Trigger />
      <RefreshControl.Viewport>Rows</RefreshControl.Viewport>
    </RefreshControl>,
  );
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  await act(() => {
    trigger.click();
    trigger.click();
  });
  expect(calls).toBe(1);
  expect(trigger.disabled).toBe(true);
  await act(async () => complete());
  expect(host.querySelector('[data-state="complete"]')).not.toBeNull();
  fail = true;
  await act(() => trigger.click());
  expect(host.querySelector('[data-state="error"]')).not.toBeNull();
  expect(trigger.disabled).toBe(false);
  fail = false;
  await act(() => trigger.click());
  expect(calls).toBe(3);
  await act(async () => complete());
});
function touch(node: HTMLElement, type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const point = { identifier: 1, clientX: x, clientY: y };
  Object.defineProperties(event, {
    touches: { value: type === "touchend" || type === "touchcancel" ? [] : [point] },
    changedTouches: { value: [point] },
  });
  node.dispatchEvent(event);
  return event;
}
test("Refresh pull claims only downward gestures at the top and never refreshes on cancellation", async () => {
  let calls = 0;
  const host = await mount(
    <RefreshControl
      onRefresh={() => {
        calls++;
      }}
    >
      <RefreshControl.Viewport>
        <span>Rows</span>
        <input aria-label="Filter" />
      </RefreshControl.Viewport>
    </RefreshControl>,
  );
  const view = host.querySelector<HTMLElement>('[data-lenso-slot="refresh-control-viewport"]')!;
  await act(() => {
    touch(view, "touchstart", 100, 100);
    expect(touch(view, "touchmove", 200, 110).defaultPrevented).toBe(false);
    touch(view, "touchend", 200, 110);
  });
  expect(calls).toBe(0);
  view.scrollTop = 30;
  await act(() => {
    touch(view, "touchstart", 100, 100);
    touch(view, "touchmove", 100, 280);
    touch(view, "touchend", 100, 280);
  });
  expect(calls).toBe(0);
  view.scrollTop = 0;
  await act(() => {
    touch(view, "touchstart", 100, 100);
    expect(touch(view, "touchmove", 100, 280).defaultPrevented).toBe(true);
    touch(view, "touchcancel", 100, 280);
  });
  expect(calls).toBe(0);
  await act(async () => {
    touch(view, "touchstart", 100, 100);
    touch(view, "touchmove", 100, 280);
    touch(view, "touchend", 100, 280);
  });
  expect(calls).toBe(1);
});

test("List.Section bounds keyboard sorting and controlled owners may reject selection", async () => {
  const moves: unknown[] = [];
  const host = await mount(
    <List editing value={[]} onValueChange={() => {}} onReorder={(details) => moves.push(details)}>
      <List.Section title="First">
        <List.Item itemKey="a" textValue="A">
          <List.Title>A</List.Title>
        </List.Item>
      </List.Section>
      <List.Section title="Second">
        <List.Item itemKey="b" textValue="B">
          <List.Title>B</List.Title>
        </List.Item>
      </List.Section>
    </List>,
  );
  const check = host.querySelector<HTMLElement>('[aria-label="Select A"]')!;
  await act(() => check.click());
  expect(check.getAttribute("aria-checked")).toBe("false");
  const handle = host.querySelector<HTMLElement>('[aria-label="Move A"]')!;
  await key(handle, " ");
  await key(handle, "ArrowDown");
  await key(handle, "Enter");
  expect(moves).toHaveLength(0);
});
