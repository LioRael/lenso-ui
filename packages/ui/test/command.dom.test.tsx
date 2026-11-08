import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Command } from "../src/components/command/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  document.body.replaceChildren();
});

// The primitive tests cover navigation and execution. This checks the styled
// boundary retains native refs, state styles and the clear action after wrapping.
test("styled parts retain refs, state styles and clear behavior", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const surface = createRef<HTMLDivElement>();
  const input = createRef<HTMLInputElement>();
  await act(() =>
    root.render(
      <Command items={["Settings"]} defaultValue="set" ref={surface} style={{ width: 320 }}>
        <Command.Input aria-label="Commands" ref={input} />
        <Command.Clear />
        <Command.List>
          {(item: string) => (
            <Command.Item
              key={item}
              value={item}
              style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
            >
              {item}
            </Command.Item>
          )}
        </Command.List>
      </Command>,
    ),
  );
  expect(surface.current).toBe(host.querySelector('[data-slot="command"]'));
  expect(surface.current?.style.width).toBe("320px");
  expect(surface.current?.className).not.toBe("");
  expect(input.current?.value).toBe("set");
  expect(host.querySelector('[data-slot="command-item"]')?.getAttribute("style")).toContain(
    "opacity: 1",
  );
  expect(host.querySelector('[data-slot="command-clear"] svg')).not.toBeNull();
  await act(() => host.querySelector<HTMLButtonElement>('[aria-label="Clear search"]')!.click());
  expect(input.current?.value).toBe("");
});
