import * as React from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";

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

test("left and right sidebars remain independently controllable", async () => {
  const screen = await render(
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

  const leftTrigger = screen.getByRole("button", { name: "Toggle left" });
  const rightTrigger = screen.getByRole("button", { name: "Toggle right" });
  await expect.element(leftTrigger).toHaveAttribute("aria-expanded", "true");
  await expect.element(rightTrigger).toHaveAttribute("aria-expanded", "true");

  await leftTrigger.click();

  await expect.element(leftTrigger).toHaveAttribute("aria-expanded", "false");
  await expect.element(rightTrigger).toHaveAttribute("aria-expanded", "true");
  await expect.element(screen.getByText("Left navigation")).not.toBeVisible();
  await expect.element(screen.getByText("Right inspector")).toBeVisible();
});

test("a nested sidebar shadows the outer sidebar context", async () => {
  const screen = await render(
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

  await screen.getByRole("button", { name: "Toggle inner" }).click();

  await expect
    .element(screen.getByRole("button", { name: "Toggle outer" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect
    .element(screen.getByRole("button", { name: "Toggle inner" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect.element(screen.getByText("Inner panel")).toBeVisible();
});

test("an explicit Group trigger targets a stable Root ID", async () => {
  const screen = await render(
    <Sidebar.Group>
      <Sidebar.Trigger targetId="inspector">Toggle inspector</Sidebar.Trigger>
      <Sidebar.Root defaultOpen={false} id="inspector" side="right">
        <Sidebar.Panel>Inspector content</Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>,
  );

  const trigger = screen.getByRole("button", { name: "Toggle inspector" });
  await trigger.click();

  await expect.element(trigger).toHaveAttribute("aria-controls", "inspector-panel");
  await expect.element(screen.getByText("Inspector content")).toBeVisible();
});

test("Escape closes a sidebar, restores trigger focus, and passes axe", async () => {
  const screen = await render(
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

  const trigger = screen.getByRole("button", { name: "Toggle navigation" });
  await screen.getByRole("link", { name: "Workspace" }).click();
  await userEvent.keyboard("{Escape}");

  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.element(trigger).toHaveFocus();
  expect((await axe.run(document.body)).violations).toEqual([]);
});

test("Item composes a router Link while preserving state, props, events, and refs", async () => {
  const linkRef = React.createRef<HTMLAnchorElement>();
  let clicks = 0;
  const screen = await render(
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

  const link = screen.getByRole("link", { name: "Projects" });
  await expect.element(link).toHaveAttribute("href", "/projects");
  await expect.element(link).toHaveAttribute("aria-current", "page");
  await expect.element(link).toHaveAttribute("data-slot", "sidebar-item");
  await expect.element(link).toHaveAttribute("data-state", "selected");
  await expect.element(link).toHaveClass("primitive-item", "router-link");
  expect(linkRef.current).toBe(link.element());

  await link.click();
  expect(clicks).toBe(1);
});

test("structural parts expose the same render contract", async () => {
  const screen = await render(
    <Sidebar.Group render={<section aria-label="Application shell" />}>
      <Sidebar.Root defaultOpen id="navigation-render" render={<div data-root="custom" />}>
        <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
        <Sidebar.Panel aria-label="Primary" render={<nav />}>
          Navigation
        </Sidebar.Panel>
      </Sidebar.Root>
    </Sidebar.Group>,
  );

  await expect
    .element(screen.getByRole("region", { name: "Application shell" }))
    .toHaveAttribute("data-slot", "sidebar-group");
  await expect
    .element(screen.getByRole("navigation", { name: "Primary" }))
    .toHaveAttribute("id", "navigation-render-panel");
  expect(document.querySelector('[data-root="custom"]')).toHaveAttribute(
    "data-slot",
    "sidebar-root",
  );
});
