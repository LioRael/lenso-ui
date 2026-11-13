import { mockSwipeGeometry } from "./helpers/dom.js";
import { afterEach, beforeEach, expect, test } from "bun:test";
import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  SwipeActions,
  createSwipeActionsController,
} from "../src/components/swipe-actions/index.js";
import { WheelPicker } from "../src/components/wheel-picker/index.js";
import { ListBox } from "../src/components/list-box/index.js";
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
async function key(node: HTMLElement, name: string) {
  await act(() => {
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }),
    );
  });
}
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Charlie" },
];

// Existing tests cover neither wheel-specific selection-following focus nor the
// requirement that an invisible swipe action remain out of the keyboard tree.
test("SwipeActions exposes actions through buttons and restores focus on Escape", async () => {
  let deleted = 0;
  const host = await mount(
    <SwipeActions endActions={[{ id: "delete", label: "Delete", onAction: () => deleted++ }]}>
      Message
    </SwipeActions>,
  );
  const actions = host.querySelector<HTMLElement>('[data-swipe-actions-side="end"]')!;
  const trigger = host.querySelector<HTMLButtonElement>('[data-swipe-trigger="end"]')!;
  expect(actions.inert).toBe(true);
  await act(() => trigger.click());
  expect(actions.inert).toBe(false);
  const action = actions.querySelector<HTMLButtonElement>("button")!;
  action.focus();
  await key(action, "Escape");
  expect(actions.inert).toBe(true);
  expect(document.activeElement).toBe(trigger);
  await act(() => trigger.click());
  await act(() => action.click());
  expect(deleted).toBe(1);
  expect(actions.inert).toBe(true);
});

test("WheelPicker skips disabled options, emits one keyboard change and resets its form value", async () => {
  const changes: string[] = [];
  const host = await mount(
    <form>
      <WheelPicker
        aria-label="Letters"
        options={options}
        defaultValue="a"
        name="letter"
        onValueChange={(value) => {
          if (value !== null) changes.push(value);
        }}
      />
    </form>,
  );
  const first = host.querySelector<HTMLElement>('[role="option"]')!;
  first.focus();
  await key(first, "ArrowDown");
  expect(changes).toEqual(["c"]);
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("Charlie");
  expect(new FormData(host.querySelector("form")!).get("letter")).toBe("c");
  await key(document.activeElement as HTMLElement, "ArrowDown");
  expect(changes).toEqual(["c"]);
  await act(async () => {
    host.querySelector("form")!.reset();
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
  expect(new FormData(host.querySelector("form")!).get("letter")).toBe("a");
  expect(host.querySelector('[role="option"][tabindex="0"]')?.textContent).toBe("Charlie");
});

test("SwipeActions preserves controlled rejection and disabled state", async () => {
  const requests: ("start" | "end" | null)[] = [];
  const endActions = [{ id: "archive", label: "Archive", onAction: () => {} }];
  const host = await mount(
    <SwipeActions
      endActions={endActions}
      openSide={null}
      onOpenSideChange={(side) => requests.push(side)}
    >
      Message
    </SwipeActions>,
  );
  await act(() => host.querySelector<HTMLButtonElement>('[data-swipe-trigger="end"]')!.click());
  expect(requests).toEqual(["end"]);
  expect(
    host.querySelector('[data-lenso-slot="swipe-actions"]')?.hasAttribute("data-open-side"),
  ).toBe(false);
  expect(host.querySelector<HTMLElement>('[data-swipe-actions-side="end"]')!.inert).toBe(true);
  await act(() =>
    root!.render(
      <SwipeActions
        endActions={endActions}
        disabled
        openSide="end"
        onOpenSideChange={(side) => requests.push(side)}
      >
        Message
      </SwipeActions>,
    ),
  );
  await act(() => host.querySelector<HTMLButtonElement>('[data-swipe-trigger="end"]')!.click());
  expect(requests).toEqual(["end"]);
  expect(host.querySelector<HTMLElement>('[data-swipe-actions-side="end"]')!.inert).toBe(true);
});

test("WheelPicker accepts controlled state and preserves a rejected value", async () => {
  function Accepted() {
    const [value, setValue] = useState("a");
    return (
      <WheelPicker
        aria-label="Accepted"
        options={options}
        value={value}
        onValueChange={(value) => {
          if (value !== null) setValue(value);
        }}
      />
    );
  }
  const host = await mount(
    <>
      <Accepted />
      <WheelPicker aria-label="Rejected" options={options} value="a" />
    </>,
  );
  const lists = host.querySelectorAll('[role="listbox"]');
  for (const list of lists) {
    const first = list.querySelector<HTMLElement>('[aria-selected="true"]')!;
    first.focus();
    await key(first, "End");
  }
  expect(lists[0]!.querySelector('[aria-selected="true"]')?.textContent).toBe("Charlie");
  expect(lists[1]!.querySelector('[aria-selected="true"]')?.textContent).toBe("Alpha");
});

test("ListBox uses native automatic selection and wraps keyboard navigation", async () => {
  const host = await mount(
    <ListBox defaultValue="a">
      <ListBox.Item value="a" label="Alpha">
        Alpha
      </ListBox.Item>
      <ListBox.Item value="c" label="Charlie">
        Charlie
      </ListBox.Item>
    </ListBox>,
  );
  const first = host.querySelector<HTMLElement>('[role="option"]')!;
  first.focus();
  await key(first, "ArrowDown");
  expect(host.querySelector('[aria-selected="true"]')?.textContent).toBe("Charlie");
  expect(document.activeElement?.textContent).toBe("Charlie");
  await key(document.activeElement as HTMLElement, "ArrowDown");
  expect(document.activeElement).toBe(first);
});

test("touch dragging ignores other pointers and capture handoff, but cancels its own capture loss", async () => {
  let actionsRun = 0;
  const controller = createSwipeActionsController();
  const host = await mount(
    <SwipeActions
      controller={controller}
      endActions={[
        {
          id: "more",
          label: "More",
          fullSwipe: true,
          onAction: () => {
            actionsRun++;
          },
        },
      ]}
    >
      <span>Message</span>
    </SwipeActions>,
  );
  const row = host.querySelector<HTMLElement>('[data-lenso-slot="swipe-actions"]')!;
  const child = row.querySelector<HTMLElement>('[data-lenso-slot="swipe-actions-content"] span')!;
  const actions = row.querySelector<HTMLElement>('[data-swipe-actions-side="end"]')!;
  Object.defineProperty(actions, "offsetWidth", { value: 146 });
  const body = row.querySelector<HTMLElement>("[data-swipe-body]")!;
  let captured = false;
  body.setPointerCapture = () => {
    captured = true;
  };
  body.releasePointerCapture = () => {
    captured = false;
    body.dispatchEvent(new PointerEvent("lostpointercapture", { pointerId: 7, bubbles: true }));
  };
  body.hasPointerCapture = () => captured;
  const pointer = async (
    node: HTMLElement,
    type: string,
    x: number,
    time: number,
    pointerId = 7,
  ) => {
    const event = new PointerEvent(type, {
      pointerId,
      pointerType: "touch",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
      clientX: x,
      clientY: 20,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "timeStamp", { value: time });
    await act(() => {
      node.dispatchEvent(event);
    });
  };
  await pointer(child, "pointerdown", 250, 0);
  await pointer(row, "pointermove", 244, 500);
  await pointer(row, "pointermove", 210, 600);
  await pointer(row, "pointerup", 210, 605);
  expect(row.hasAttribute("data-open-side")).toBe(false);
  await pointer(child, "pointerdown", 250, 1000);
  await pointer(row, "pointermove", 244, 1050);
  await pointer(row, "pointermove", 100, 1080);
  await pointer(child, "lostpointercapture", 100, 1081);
  await pointer(document.body, "pointercancel", 100, 1082, 8);
  await pointer(row, "pointerup", 100, 1085);
  expect(row.getAttribute("data-open-side")).toBe("end");
  await act(() => {
    controller.setOpenSide(null);
  });
  expect(row.hasAttribute("data-open-side")).toBe(false);
  await pointer(child, "pointerdown", 250, 2000);
  await pointer(row, "pointermove", 244, 2050);
  await pointer(row, "pointermove", 140, 2080);
  captured = false;
  await pointer(body, "lostpointercapture", 140, 2081);
  await pointer(row, "pointerup", 140, 2085);
  expect(row.hasAttribute("data-open-side")).toBe(false);
  await pointer(child, "pointerdown", 250, 3000);
  await pointer(row, "pointermove", 244, 3050);
  await pointer(row, "pointermove", -80, 3080);
  await pointer(row, "pointercancel", -80, 3085);
  expect(actionsRun).toBe(0);
  expect(row.hasAttribute("data-open-side")).toBe(false);
  await pointer(child, "pointerdown", 250, 4000);
  await pointer(row, "pointermove", 244, 4050);
  await pointer(row, "pointermove", -80, 4080);
  await act(() =>
    root!.render(
      <SwipeActions
        disabled
        controller={controller}
        endActions={[
          {
            id: "more",
            label: "More",
            fullSwipe: true,
            onAction: () => {
              actionsRun++;
            },
          },
        ]}
      >
        <span>Message</span>
      </SwipeActions>,
    ),
  );
  await pointer(row, "pointerup", -80, 4090);
  expect(actionsRun).toBe(0);
  expect(row.hasAttribute("data-open-side")).toBe(false);
});

test("row text cannot start selection but editable content retains its native selection path", async () => {
  const host = await mount(
    <SwipeActions>
      <span>Row label</span>
      <input aria-label="Editable" defaultValue="Select this text" />
    </SwipeActions>,
  );
  const label = host.querySelector<HTMLElement>('[data-lenso-slot="swipe-actions-content"] span')!;
  const input = host.querySelector("input")!;
  const plain = new Event("selectstart", { bubbles: true, cancelable: true });
  label.dispatchEvent(plain);
  expect(plain.defaultPrevented).toBe(true);
  const editing = new Event("selectstart", { bubbles: true, cancelable: true });
  input.dispatchEvent(editing);
  expect(editing.defaultPrevented).toBe(false);
  input.setSelectionRange(0, 6);
  expect(input.selectionEnd).toBe(6);
});
