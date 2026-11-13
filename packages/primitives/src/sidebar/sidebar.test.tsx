import * as React from "react";
import { createAgent } from "@ui-sdk/react/agent";
import { checkServer, mount } from "@ui-sdk/core/testing";
import { sidebar } from "./sidebar.js";
import { expect, test } from "bun:test";

import { click, dispatch, render } from "../../tests/dom.js";

import { Sidebar, createSidebarController } from "./index.js";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}
globalThis.__UI_SDK_STRICT__ = true;

function RouterLink({
  children,
  to,
  ...props
}: Omit<React.ComponentPropsWithRef<"a">, "href"> & { to: string }) {
  return (
    <a {...props} href={to}>
      {children}
    </a>
  );
}

function button(container: HTMLElement, name: string) {
  const result = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === name,
  );
  if (!result) throw new Error(`Missing button: ${name}`);
  return result;
}

test("left and right sidebars remain independently controllable", async () => {
  const container = await render(
    <div>
      <Sidebar.Root defaultOpen id="left" side="left">
        <Sidebar.Trigger>Toggle left</Sidebar.Trigger>
        <Sidebar.Panel id="left-panel">Left navigation</Sidebar.Panel>
      </Sidebar.Root>
      <main>Workspace</main>
      <Sidebar.Root defaultOpen id="right" side="right">
        <Sidebar.Trigger>Toggle right</Sidebar.Trigger>
        <Sidebar.Panel id="right-panel">Right inspector</Sidebar.Panel>
      </Sidebar.Root>
    </div>,
  );
  const left = button(container, "Toggle left");
  const right = button(container, "Toggle right");
  expect(left.getAttribute("aria-expanded")).toBe("true");
  expect(right.getAttribute("aria-expanded")).toBe("true");
  await click(left);
  expect(left.getAttribute("aria-expanded")).toBe("false");
  expect(right.getAttribute("aria-expanded")).toBe("true");
  expect(container.querySelector<HTMLElement>("#left-panel")?.hidden).toBe(true);
  expect(container.querySelector<HTMLElement>("#right-panel")?.hidden).toBe(false);
});

test("a nested sidebar shadows the outer sidebar context", async () => {
  const container = await render(
    <Sidebar.Root defaultOpen id="outer">
      <Sidebar.Trigger>Toggle outer</Sidebar.Trigger>
      <Sidebar.Panel>
        Outer panel
        <Sidebar.Root defaultOpen={false} id="inner">
          <Sidebar.Trigger>Toggle inner</Sidebar.Trigger>
          <Sidebar.Panel id="inner-panel">Inner panel</Sidebar.Panel>
        </Sidebar.Root>
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  await click(button(container, "Toggle inner"));
  expect(button(container, "Toggle outer").getAttribute("aria-expanded")).toBe("true");
  expect(button(container, "Toggle inner").getAttribute("aria-expanded")).toBe("true");
  expect(container.querySelector<HTMLElement>("#inner-panel")?.hidden).toBe(false);
});

test("an external control targets one native controller", async () => {
  const controller = createSidebarController();
  const container = await render(
    <div>
      <button onClick={() => controller.toggle()}>Toggle inspector</button>
      <Sidebar.Root controller={controller} defaultOpen={false} id="inspector" side="right">
        <Sidebar.Panel id="inspector-panel">Inspector content</Sidebar.Panel>
      </Sidebar.Root>
    </div>,
  );
  await click(button(container, "Toggle inspector"));
  expect(controller.isOpen()).toBe(true);
  expect(container.querySelector<HTMLElement>("#inspector-panel")?.hidden).toBe(false);
});

test("Escape closes a sidebar and restores trigger focus", async () => {
  const container = await render(
    <Sidebar.Root defaultOpen id="navigation">
      <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
      <Sidebar.Panel aria-label="Primary navigation">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <a href="#workspace">Workspace</a>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  const trigger = button(container, "Toggle navigation");
  const link = container.querySelector<HTMLAnchorElement>('a[href="#workspace"]')!;
  link.focus();
  await dispatch(link, new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});

test("Item composes a router Link while preserving state, props, events, and refs", async () => {
  const linkRef = React.createRef<HTMLAnchorElement>();
  let clicks = 0;
  const container = await render(
    <Sidebar.Root>
      <Sidebar.Item
        className="primitive-item"
        onClick={(event) => {
          event.preventDefault();
          clicks += 1;
        }}
        ref={linkRef}
        render={<RouterLink className="router-link" to="/projects" />}
        selected
      >
        Projects
      </Sidebar.Item>
    </Sidebar.Root>,
  );
  const link = container.querySelector<HTMLAnchorElement>('a[href="/projects"]')!;
  expect(link.getAttribute("aria-current")).toBe("page");
  expect(link.getAttribute("data-slot")).toBe("sidebar-item");
  expect(link.hasAttribute("data-selected")).toBe(true);
  expect(link.classList.contains("primitive-item")).toBe(true);
  expect(link.classList.contains("router-link")).toBe(true);
  expect(linkRef.current).toBe(link);
  await click(link);
  expect(clicks).toBe(1);
});

test("structural parts expose the same render contract", async () => {
  const container = await render(
    <section aria-label="Application shell">
      <Sidebar.Root defaultOpen id="navigation-render" render={<div data-root="custom" />}>
        <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
        <Sidebar.Panel id="navigation-render-panel" aria-label="Primary" render={<nav />}>
          Navigation
        </Sidebar.Panel>
      </Sidebar.Root>
    </section>,
  );
  expect(container.querySelector('nav[aria-label="Primary"]')?.getAttribute("id")).toBe(
    "navigation-render-panel",
  );
  expect(
    container.querySelector('[data-slot="sidebar-trigger"]')?.getAttribute("aria-controls"),
  ).toBe("navigation-render-panel");
  expect(container.querySelector('[data-root="custom"]')?.getAttribute("data-slot")).toBe(
    "sidebar",
  );
});

test("core sidebar owns disclosure state and has server-safe attributes", async () => {
  const markup = `<root aria-label="Core navigation"><trigger>Toggle core</trigger><panel aria-label="Core panel"><item href="#core">Core link</item></panel></root>`;
  expect(checkServer(sidebar, { defaultOpen: false }, markup)).toContain("aria-expanded");
  const view = mount(sidebar, { defaultOpen: false }, markup);
  try {
    await view.click(view.part("trigger")!);
    expect(view.state.open).toBe(true);
    expect(view.changes.at(-1)?.reason).toBe("trigger-press");
    const trigger = view.part("trigger")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)).toBe(
      view.part("panel")!,
    );
  } finally {
    view.unmount();
  }
});

test("native cancellation and rejected controlled closes keep focus inside", async () => {
  let requests = 0;
  const controller = createSidebarController();
  const container = await render(
    <Sidebar.Root
      aria-label="Locked navigation"
      open
      controller={controller}
      onOpenChange={(_, details) => {
        requests++;
        details.cancel();
      }}
    >
      <Sidebar.Trigger>Toggle locked</Sidebar.Trigger>
      <Sidebar.Panel>
        <a href="#locked">Locked link</a>
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  const link = container.querySelector("a")!;
  link.focus();
  await dispatch(
    link,
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  expect(requests).toBe(1);
  expect(controller.isOpen()).toBe(true);
  expect(document.activeElement).toBe(link);
  expect(container.querySelector("aside")?.hidden).toBe(false);
});

test("agent drives the same sidebar change contract", async () => {
  const agent = createAgent();
  const container = await render(
    <Sidebar.Root aria-label="Agent navigation" defaultOpen={false}>
      <Sidebar.Trigger>Toggle agent navigation</Sidebar.Trigger>
      <Sidebar.Panel>
        <a href="#agent">Agent link</a>
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  const entry = agent
    .snapshot()
    .find((item) => item.component === "sidebar" && item.label === "Agent navigation");
  expect(entry?.actions).toContain("setOpen");
  let result: Awaited<ReturnType<typeof agent.act>> | undefined;
  await React.act(async () => {
    result = await agent.act({ steps: [{ ref: entry!.ref, action: "setOpen", args: [true] }] });
  });
  expect(result?.ok).toBe(true);
  expect(container.querySelector("aside")?.hidden).toBe(false);
});

test("removing a focused panel recovers focus and inherited RTL stays native", async () => {
  function Example() {
    const [shown, show] = React.useState(true);
    return (
      <div dir="rtl">
        <Sidebar.Root aria-label="RTL navigation">
          <Sidebar.Trigger>Toggle RTL</Sidebar.Trigger>
          {shown && (
            <Sidebar.Panel>
              <button onClick={() => show(false)}>Remove panel</button>
            </Sidebar.Panel>
          )}
        </Sidebar.Root>
      </div>
    );
  }
  const container = await render(<Example />);
  const remove = button(container, "Remove panel");
  remove.focus();
  await click(remove);
  expect(document.activeElement).toBe(button(container, "Toggle RTL"));
  expect(container.querySelector('[data-slot="sidebar"]')?.hasAttribute("dir")).toBe(false);
});

test("uncommitted controlled closes and prevented Escape preserve the panel", async () => {
  let changes = 0;
  const container = await render(
    <Sidebar.Root open onOpenChange={() => changes++}>
      <Sidebar.Trigger>Controlled navigation</Sidebar.Trigger>
      <Sidebar.Panel>
        <input aria-label="Controlled field" />
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  const field = container.querySelector("input")!;
  field.focus();
  await dispatch(
    field,
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  expect(changes).toBe(1);
  expect(document.activeElement).toBe(field);
  expect(container.querySelector("aside")?.hidden).toBe(false);
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
  event.preventDefault();
  await dispatch(field, event);
  expect(changes).toBe(1);
});
