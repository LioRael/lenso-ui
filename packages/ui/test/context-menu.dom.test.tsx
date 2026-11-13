import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ContextMenu } from "../src/components/context-menu/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});
async function mount(compact = false) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <ContextMenu defaultOpen compact={compact}>
        <ContextMenu.Trigger>Document</ContextMenu.Trigger>
        <ContextMenu.Content
          aria-label="Document actions"
          preview={<ContextMenu.Preview>Document preview</ContextMenu.Preview>}
          bar={<ContextMenu.BarItem>Copy</ContextMenu.BarItem>}
        >
          <ContextMenu.Item>Open document</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    ),
  );
}

test("context preview remains outside the material panel inside the native menu", async () => {
  await mount();
  const menu = document.querySelector('[role="menu"]')!;
  const panel = menu.querySelector('[data-lenso-slot="menu-popup"]')!;
  const preview = menu.querySelector('[data-lenso-slot="context-menu-preview"]')!;
  expect(menu.getAttribute("aria-label")).toBe("Document actions");
  expect(preview.parentElement).toBe(panel.parentElement);
  expect(panel.contains(preview)).toBe(false);
  expect(preview.hasAttribute("inert")).toBe(true);
  expect(panel.textContent).toContain("Open document");
  expect(
    document.querySelector('[data-lenso-slot="context-menu-trigger"]')!.getAttribute("tabindex"),
  ).toBe("0");
});

test("compact actions expand in the same open native menu without selecting an action", async () => {
  await mount(true);
  const menu = document.querySelector('[role="menu"]')!;
  expect(menu.textContent).toContain("Copy");
  expect(menu.textContent).not.toContain("Open document");
  const more = menu.querySelector<HTMLElement>('[aria-label="More actions"]')!;
  expect(more).not.toBeNull();
  await act(() => more.click());
  expect(document.querySelector('[role="menu"]')).toBe(menu);
  expect(menu.hasAttribute("data-open")).toBe(true);
  expect(menu.textContent).toContain("Open document");
  expect(menu.querySelector('[data-lenso-slot="context-menu-preview"]')).not.toBeNull();
});
