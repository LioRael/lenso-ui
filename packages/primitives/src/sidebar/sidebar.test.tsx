import * as React from "react";
import { expect, test } from "bun:test";

import { click, dispatch, render } from "../../tests/dom.js";

import { Sidebar } from "./index.js";

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
    <Sidebar.Group>
      <Sidebar.Root defaultOpen id="left" side="left">
        <Sidebar.Trigger>Toggle left</Sidebar.Trigger>
        <Sidebar.Panel>Left navigation</Sidebar.Panel>
      </Sidebar.Root>
      <main>Workspace</main>
      <Sidebar.Root defaultOpen id="right" side="right">
        <Sidebar.Trigger>Toggle right</Sidebar.Trigger>
        <Sidebar.Panel>Right inspector</Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>,
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
          <Sidebar.Panel>Inner panel</Sidebar.Panel>
        </Sidebar.Root>
      </Sidebar.Panel>
    </Sidebar.Root>,
  );
  await click(button(container, "Toggle inner"));
  expect(button(container, "Toggle outer").getAttribute("aria-expanded")).toBe("true");
  expect(button(container, "Toggle inner").getAttribute("aria-expanded")).toBe("true");
  expect(container.querySelector<HTMLElement>("#inner-panel")?.hidden).toBe(false);
});

test("an explicit Group trigger targets a stable Root ID", async () => {
  const container = await render(
    <Sidebar.Group>
      <Sidebar.Trigger targetId="inspector">Toggle inspector</Sidebar.Trigger>
      <Sidebar.Root defaultOpen={false} id="inspector" side="right">
        <Sidebar.Panel>Inspector content</Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>,
  );
  const trigger = button(container, "Toggle inspector");
  await click(trigger);
  expect(trigger.getAttribute("aria-controls")).toBe("inspector-panel");
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
    </Sidebar.Item>,
  );
  const link = container.querySelector<HTMLAnchorElement>('a[href="/projects"]')!;
  expect(link.getAttribute("aria-current")).toBe("page");
  expect(link.getAttribute("data-slot")).toBe("sidebar-item");
  expect(link.getAttribute("data-state")).toBe("selected");
  expect(link.classList.contains("primitive-item")).toBe(true);
  expect(link.classList.contains("router-link")).toBe(true);
  expect(linkRef.current).toBe(link);
  await click(link);
  expect(clicks).toBe(1);
});

test("structural parts expose the same render contract", async () => {
  const container = await render(
    <Sidebar.Group render={<section aria-label="Application shell" />}>
      <Sidebar.Root defaultOpen id="navigation-render" render={<div data-root="custom" />}>
        <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
        <Sidebar.Panel aria-label="Primary" render={<nav />}>
          Navigation
        </Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>,
  );
  expect(
    container.querySelector('section[aria-label="Application shell"]')?.getAttribute("data-slot"),
  ).toBe("sidebar-group");
  expect(container.querySelector('nav[aria-label="Primary"]')?.getAttribute("id")).toBe(
    "navigation-render-panel",
  );
  expect(container.querySelector('[data-root="custom"]')?.getAttribute("data-slot")).toBe(
    "sidebar-root",
  );
});
