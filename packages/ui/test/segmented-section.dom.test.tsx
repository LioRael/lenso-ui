import { afterEach, expect, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SegmentedControl } from "../src/components/segmented-control/index.js";
import { SectionIndex } from "../src/components/section-index/index.js";
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  document.body.replaceChildren();
});
async function mount(children: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root.render(children));
  return host;
}
const items = [
  { value: "a", label: "All" },
  { value: "b", label: "Blocked", disabled: true },
  { value: "c", label: "Current" },
];
const sections = items.map((item) => ({ ...item, href: `#${item.value}` as const }));
async function key(node: HTMLElement, key: string) {
  await act(() => {
    node.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

// Cover native form ownership and focus-only index navigation, which existing
// wheel/page tests cannot establish for these different interaction contracts.
test("segments retain SDK native form values, disabled items and reset", async () => {
  const changes: (string | null)[] = [];
  const host = await mount(
    <form>
      <SegmentedControl
        aria-label="Filter"
        name="filter"
        defaultValue="a"
        items={items}
        onValueChange={(value) => changes.push(value)}
      />
    </form>,
  );
  const radios = host.querySelectorAll<HTMLElement>('[role="radio"]');
  await act(() => radios[1]!.click());
  expect(changes).toEqual([]);
  await act(() => radios[2]!.click());
  expect(changes).toEqual(["c"]);
  expect(new FormData(host.querySelector("form")!).get("filter")).toBe("c");
  await act(async () => {
    host.querySelector("form")!.reset();
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
  expect(new FormData(host.querySelector("form")!).get("filter")).toBe("a");
  expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
});
test("segments preserve controlled rejection and read-only state", async () => {
  const changes: (string | null)[] = [];
  const host = await mount(
    <>
      <SegmentedControl
        aria-label="Rejected"
        items={items}
        value="a"
        onValueChange={(value) => changes.push(value)}
      />
      <SegmentedControl
        aria-label="Read only"
        items={items}
        defaultValue="a"
        readOnly
        onValueChange={() => {
          throw Error("read-only change");
        }}
      />
    </>,
  );
  for (const group of host.querySelectorAll('[role="radiogroup"]'))
    await act(() => group.querySelectorAll<HTMLElement>('[role="radio"]')[2]!.click());
  expect(changes).toEqual(["c"]);
  expect(host.querySelectorAll('[aria-checked="true"]').length).toBe(2);
});
test("index keyboard navigation skips disabled entries without activating a link", async () => {
  const changes: (string | null)[] = [];
  const host = await mount(
    <SectionIndex
      items={sections}
      defaultValue="a"
      onValueChange={(value) => changes.push(value)}
    />,
  );
  const links = host.querySelectorAll("a");
  await act(() => links[0]!.focus());
  await key(links[0]!, "ArrowDown");
  expect(document.activeElement).toBe(links[2]!);
  expect(changes).toEqual([]);
  expect(links[2]!.tabIndex).toBe(0);
  await key(links[2]!, "Home");
  expect(document.activeElement).toBe(links[0]!);
  await act(() => links[1]!.click());
  expect(changes).toEqual([]);
  await act(() => links[2]!.click());
  expect(changes).toEqual(["c"]);
  expect(links[2]!.getAttribute("aria-current")).toBe("location");
  await act(() => root.render(<SectionIndex items={sections} disabled defaultValue="a" />));
  expect(host.querySelectorAll('[tabindex="0"]')).toHaveLength(0);
  expect(host.querySelectorAll('a[aria-disabled="true"]')).toHaveLength(3);
});
test("index drag survives child capture transfer and suppresses the release click", async () => {
  const changes: (string | null)[] = [];
  const host = await mount(
    <SectionIndex items={sections} onValueChange={(value) => changes.push(value)} />,
  );
  const nav = host.querySelector("nav")!;
  const links = host.querySelectorAll("a");
  nav.setPointerCapture = () => {};
  for (let i = 0; i < links.length; i++)
    links[i]!.getBoundingClientRect = () => ({ top: i * 24, height: 24 }) as DOMRect;
  const pointer = async (node: HTMLElement, type: string, y: number) =>
    act(() => {
      node.dispatchEvent(
        new PointerEvent(type, {
          pointerId: 1,
          isPrimary: true,
          button: 0,
          buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
          clientY: y,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
  await pointer(links[0]!, "pointerdown", 12);
  expect(changes).toEqual(["a"]);
  await pointer(nav, "pointermove", 60);
  await pointer(links[0]!, "lostpointercapture", 60);
  await pointer(nav, "pointermove", 12);
  await pointer(nav, "pointerup", 12);
  await act(() =>
    links[0]!.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
    ),
  );
  expect(changes).toEqual(["a", "c", "a"]);
  await pointer(links[0]!, "pointerdown", 12);
  await pointer(nav, "pointercancel", 12);
  await pointer(nav, "pointermove", 60);
  expect(changes).toEqual(["a", "c", "a"]);
  await pointer(links[0]!, "pointerdown", 12);
  await pointer(nav, "pointermove", 60);
  await pointer(nav, "pointerup", 60);
  // A browser may omit the release click; the next keyboard activation has detail 0.
  await key(links[0]!, "Enter");
  expect(changes).toEqual(["a", "c", "a", "c", "a"]);
});

test("selected fragments still navigate and modified links keep browser behavior", async () => {
  let changes = 0;
  const host = await mount(
    <>
      <div id="50%" />
      <SectionIndex
        defaultValue="a"
        items={[{ value: "a", label: "A", href: "#50%" }]}
        onValueChange={() => {
          changes++;
        }}
      />
    </>,
  );
  let scrolls = 0;
  host.querySelector<HTMLElement>('[id="50%"]')!.scrollIntoView = () => {
    scrolls++;
  };
  const link = host.querySelector<HTMLAnchorElement>("a")!;
  await key(link, "Enter");
  expect(scrolls).toBe(1);
  expect(changes).toBe(0);
  await act(() => {
    for (const type of ["pointerdown", "pointerup"])
      link.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 2,
          isPrimary: true,
          button: 0,
          buttons: type === "pointerdown" ? 1 : 0,
          ctrlKey: true,
        }),
      );
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true, detail: 1 }),
    );
  });
  expect(scrolls).toBe(1);
  expect(changes).toBe(0);
});
