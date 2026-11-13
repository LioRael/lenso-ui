import { afterEach, expect, test } from "bun:test";
import { act, type CSSProperties } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Toolbar } from "../src/components/toolbar/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});

test("detaching preserves toolbar controls, refs, native render and group disabled state", async () => {
  let assigned = 0,
    cleaned = 0,
    clicks = 0;
  const ref = (node: HTMLButtonElement | null) => {
    if (!node) return;
    assigned++;
    return () => {
      cleaned++;
    };
  };
  function Example({
    detached = false,
    disabled = false,
  }: {
    detached?: boolean;
    disabled?: boolean;
  }) {
    return (
      <Toolbar aria-label="Editing">
        <Toolbar.Group
          isDetached={detached}
          disabled={disabled}
          render={<section data-owner="caller" />}
          style={(state) => ({ "--test-orientation": state.orientation }) as CSSProperties}
        >
          <Toolbar.Button ref={ref} onClick={() => clicks++}>
            First
          </Toolbar.Button>
          <Toolbar.Button>Second</Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root!.render(<Example />));
  const group = host.querySelector<HTMLElement>('[data-lenso-slot="toolbar-group"]')!;
  const buttons = [...host.querySelectorAll<HTMLButtonElement>("[data-toolbar-item]")];
  expect(group.tagName).toBe("SECTION");
  expect(group.querySelector("[data-lenso-glass-fusion]")).not.toBeNull();
  expect(group.dataset["owner"]).toBe("caller");
  expect(group.style.getPropertyValue("--test-orientation")).toBe("horizontal");
  buttons[0]!.focus();
  await act(() => root!.render(<Example detached />));
  expect([...host.querySelectorAll("[data-toolbar-item]")]).toEqual(buttons);
  expect(document.activeElement).toBe(buttons[0]!);
  expect(group.dataset["toolbarDetached"]).toBe("true");
  await act(() => buttons[0]!.click());
  expect(clicks).toBe(1);
  expect(assigned).toBe(1);
  expect(cleaned).toBe(0);
  await act(() => root!.render(<Example detached disabled />));
  expect(buttons.every((button) => button.getAttribute("aria-disabled") === "true")).toBe(true);
  await act(() => buttons[0]!.click());
  expect(clicks).toBe(1);
  await act(() => root!.render(<Example />));
  expect(group.dataset["toolbarDetached"]).toBe("false");
  expect(cleaned).toBe(assigned - 1);
  await act(() => root!.unmount());
  root = undefined;
  expect(cleaned).toBe(assigned);
});

test("detachable groups retain native children state alongside the fusion surface", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <Toolbar orientation="vertical" aria-label="Editing">
        <Toolbar.Group isDetached={false}>
          {(state) => <Toolbar.Button>{state.orientation}</Toolbar.Button>}
        </Toolbar.Group>
      </Toolbar>,
    ),
  );
  expect(host.querySelector("button")?.textContent).toBe("vertical");
  expect(host.querySelector("[data-lenso-glass-fusion]")).not.toBeNull();
});
