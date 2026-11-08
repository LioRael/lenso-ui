import { afterEach, expect, test } from "bun:test";
import { act, createRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Command } from "./index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root?.unmount());
  document.body.replaceChildren();
});
async function mount(element: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root?.render(element));
  return host;
}
async function key(input: HTMLElement, value: string, isComposing = false) {
  await act(() =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: value,
        bubbles: true,
        cancelable: true,
        isComposing,
      }),
    ),
  );
}
async function type(input: HTMLInputElement, value: string) {
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// Existing docs tests exercise the old Fumadocs list, not the inline Command
// contract: execution must retain the query and delegate navigation to Base UI.
test("filters, blocks disabled activation and executes once without replacing the query", async () => {
  const selected: string[] = [];
  const inputRef = createRef<HTMLInputElement>();
  const host = await mount(
    <Command items={["Button", "Disabled", "Input"]}>
      <Command.Input aria-label="Commands" ref={inputRef} />
      <Command.Empty>No commands</Command.Empty>
      <Command.List>
        {(item: string) => (
          <Command.Item
            key={item}
            value={item}
            disabled={item === "Disabled"}
            onSelect={(value) => selected.push(value)}
          >
            {item}
          </Command.Item>
        )}
      </Command.List>
    </Command>,
  );
  const input = inputRef.current!;
  await act(() => input.focus());
  expect(document.getElementById(input.getAttribute("aria-controls")!)?.getAttribute("role")).toBe(
    "listbox",
  );
  await key(input, "ArrowDown");
  expect(host.querySelector("[data-highlighted]")?.textContent).toBe("Disabled");
  await key(input, "Enter");
  expect(selected).toEqual([]);
  await key(input, "ArrowDown");
  expect(host.querySelector("[data-highlighted]")?.textContent).toBe("Input");
  await act(() => input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
  await key(input, "Enter", true);
  expect(selected).toEqual([]);
  await act(() => input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
  await key(input, "Enter");
  expect(selected).toEqual(["Input"]);
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  await type(input, "but");
  expect(host.querySelectorAll('[role="option"]').length).toBe(1);
  await key(input, "Enter");
  expect(selected).toEqual(["Input", "Button"]);
  expect(input.value).toBe("but");
  await type(input, "nothing matches");
  expect(host.querySelectorAll('[role="option"]').length).toBe(0);
  expect(host.textContent).toContain("No commands");
});

test("external results, isolated instances, cancellation and disabled pointer activation", async () => {
  const selected: string[] = [];
  function Example() {
    const [query, setQuery] = useState("server query");
    return (
      <>
        <Command.Root
          items={["Unrelated", "Disabled", "Cancelled"]}
          value={query}
          onValueChange={setQuery}
          filter={false}
        >
          <Command.Input aria-label="Remote" />
          <Command.List>
            <Command.Group>
              <Command.GroupLabel>Pages</Command.GroupLabel>
              <Command.Collection>
                {(item: string) => (
                  <Command.Item
                    key={item}
                    value={item}
                    disabled={item === "Disabled"}
                    onClick={(event) => {
                      if (item === "Cancelled") event.preventBaseUIHandler();
                    }}
                    onSelect={(value) => selected.push(value)}
                  >
                    {item}
                  </Command.Item>
                )}
              </Command.Collection>
            </Command.Group>
          </Command.List>
        </Command.Root>
        <Command items={["Other"]} readOnly>
          <Command.Input aria-label="Other" />
          <Command.List>
            {(item: string) => (
              <Command.Item key={item} value={item} onSelect={(value) => selected.push(value)}>
                {item}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </>
    );
  }
  const host = await mount(<Example />);
  const input = host.querySelector<HTMLInputElement>('[aria-label="Remote"]')!;
  const other = host.querySelector<HTMLInputElement>('[aria-label="Other"]')!;
  await act(() => input.focus());
  expect(input.getAttribute("aria-controls")).not.toBe(other.getAttribute("aria-controls"));
  const items = host.querySelectorAll<HTMLElement>('[role="option"]');
  expect(items.length).toBe(4);
  await act(() => items[1]!.click());
  await act(() => items[2]!.click());
  expect(selected).toEqual([]);
  await act(() => items[3]!.click());
  expect(selected).toEqual([]);
  await act(() => items[0]!.click());
  expect(selected).toEqual(["Unrelated"]);
  expect(input.value).toBe("server query");
});
