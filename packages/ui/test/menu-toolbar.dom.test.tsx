import { afterEach, expect, test } from "bun:test";
import { act, createRef, useCallback, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Menu } from "../src/components/menu/index.js";
import { Toolbar } from "../src/components/toolbar/index.js";
import { useMenuPopupRef } from "../src/utils/interaction/menu.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root | undefined;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
});
async function step(work: () => void) {
  await act(async () => {
    work();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}
function pointer(target: EventTarget, type: string, x: number) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: "mouse",
      button: 0,
      clientX: x,
      clientY: 20,
    }),
  );
}
async function mount(onMore: () => void = () => {}) {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await step(() =>
    root!.render(
      <Toolbar>
        <Toolbar.Group>
          <Menu>
            <Menu.Trigger render={<Toolbar.Button />}>Filter</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>All Photos</Menu.Item>
            </Menu.Content>
          </Menu>
          <Toolbar.Button disabled onClick={onMore}>
            More
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>,
    ),
  );
  return {
    trigger: host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!,
    group: host.querySelector<HTMLElement>('[data-lenso-slot="toolbar-group"]')!,
    disabled: [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (e) => e.textContent === "More",
    )!,
  };
}
test("menu follows SDK pointer activation and returns focus after Escape", async () => {
  const { trigger } = await mount();
  await step(() => {
    pointer(trigger, "pointerdown", 20);
    trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
  });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.querySelector('[role="menu"]')).not.toBeNull();
  await step(() =>
    document
      .querySelector<HTMLElement>('[role="menu"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      ),
  );
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
test("compact menu bars keep native action buttons and morph from the whole bar", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  let copied = 0;
  await step(() =>
    root!.render(
      <Menu>
        <Menu.Bar aria-label="Edit actions">
          <Menu.BarItem onClick={() => copied++}>Copy</Menu.BarItem>
          <Menu.ExpandTrigger />
        </Menu.Bar>
        <Menu.Content>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Content>
      </Menu>,
    ),
  );
  const bar = host.querySelector<HTMLElement>('[data-lenso-slot="menu-bar"]')!;
  const copy = host.querySelector<HTMLButtonElement>('[data-lenso-slot="menu-bar-item"]')!;
  expect(copy.tagName).toBe("BUTTON");
  expect(copy.getAttribute("role")).not.toBe("menuitem");
  await step(() => copy.click());
  expect(copied).toBe(1);
  const trigger = bar.querySelector<HTMLButtonElement>("[data-menu-expand]")!;
  await step(() => trigger.click());
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  for (let frame = 0; frame < 10; frame++) await step(() => {});
  expect(bar.style.opacity).toContain("--lg-menu-trigger-opacity");
  expect(trigger.style.opacity).not.toContain("--lg-menu-trigger-opacity");
});
test("disabled toolbar members retain surface press feedback without becoming actionable", async () => {
  let clicked = 0;
  const { group, disabled } = await mount(() => clicked++);
  expect(group.hasAttribute("data-menu-source")).toBe(true);
  expect(disabled.disabled || disabled.getAttribute("aria-disabled") === "true").toBe(true);
  await step(() => pointer(disabled, "pointerdown", 20));
  expect(group.hasAttribute("data-lenso-pressed")).toBe(true);
  await step(() => {
    pointer(window, "pointerup", 20);
    disabled.click();
  });
  expect(group.hasAttribute("data-lenso-pressed")).toBe(false);
  expect(clicked).toBe(0);
});

test("a closing menu cannot unmask a shared toolbar source still owned by another menu", async () => {
  const source = createRef<HTMLElement>();
  source.current = document.createElement("div");
  source.current.style.opacity = ".75";
  source.current.getBoundingClientRect = () => new DOMRect(0, 0, 88, 44);
  document.body.append(source.current);
  const unmount = () => {};
  function Popup() {
    const popup = useRef<HTMLElement>(null);
    const ref = useMenuPopupRef(undefined, popup, source, unmount, true);
    const attach = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          node.getBoundingClientRect = () => new DOMRect(0, 0, 250, 180);
          Object.defineProperties(node, {
            offsetWidth: { value: 250 },
            offsetHeight: { value: 180 },
          });
        }
        return ref(node);
      },
      [ref],
    );
    return (
      <div ref={attach} data-open="">
        <div data-lenso-slot="menu-surface" />
        <div data-lenso-slot="menu-glyph" />
        <div data-lenso-slot="menu-content">
          <div data-lenso-slot="menu-plate" />
        </div>
      </div>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  async function render(first: boolean, second: boolean) {
    await step(() =>
      root!.render(
        <>
          {first && <Popup key="first" />}
          {second && <Popup key="second" />}
        </>,
      ),
    );
    await act(async () => {
      for (let i = 0; i < 12; i++)
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
  }
  await render(true, false);
  await render(true, true);
  await render(false, true);
  expect(source.current.style.opacity).toBe("var(--lg-menu-trigger-opacity, 1)");
  await render(false, false);
  expect(source.current.style.opacity).toBe(".75");
});

test("a menu without trigger morph preserves its source through open and close", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await step(() =>
    root!.render(
      <Menu morphTrigger={false}>
        <Menu.Trigger>Language</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>English</Menu.Item>
        </Menu.Content>
      </Menu>,
    ),
  );
  const trigger = host.querySelector<HTMLButtonElement>("button")!;
  trigger.style.opacity = ".8";
  await step(() => trigger.click());
  for (let i = 0; i < 12; i++) await step(() => {});
  expect(trigger.style.opacity).toBe(".8");
  expect(trigger.style.getPropertyValue("--lg-menu-trigger-opacity")).toBe("");
  expect(trigger.style.transform).toBe("");
  await step(() =>
    document
      .querySelector<HTMLElement>('[role="menu"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
      ),
  );
  expect(trigger.style.opacity).toBe(".8");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
