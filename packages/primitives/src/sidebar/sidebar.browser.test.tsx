import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";

import { Sidebar } from "./index.js";

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
