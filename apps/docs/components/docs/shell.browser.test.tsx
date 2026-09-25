import * as React from "react";
import axe from "axe-core";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import "@lenso/tokens/styles.css";
import "../../app/docs-shell.css";

vi.mock("./docs-search", () => ({ DocsSearch: () => null }));
vi.mock("./theme-toggle", () => ({ ThemeToggle: () => null }));

import { DocsFrame } from "./shell";

test("opens mobile navigation as an accessible modal and closes it on Escape or navigation", async () => {
  const screen = await render(
    <DocsFrame>
      <h1>Installation</h1>
    </DocsFrame>,
  );
  const trigger = screen.getByRole("button", { name: "Open navigation" });

  await expect.element(trigger).toBeVisible();
  await userEvent.click(trigger);

  const dialog = screen.getByRole("dialog", { name: "Navigation" }).element() as HTMLDialogElement;
  const closeButton = screen.getByRole("button", { name: "Close navigation" });
  await expect.element(dialog).toBeVisible();
  await expect.element(closeButton).toHaveFocus();
  expect(dialog.matches(":modal")).toBe(true);

  const bounds = dialog.getBoundingClientRect();
  expect(bounds.width).toBeGreaterThan(0);
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
  expect(bounds.height).toBeLessThanOrEqual(window.innerHeight);

  await expect
    .element(screen.getByRole("link", { name: "Installation" }))
    .toHaveAttribute("aria-current", "page");
  expect((await axe.run(dialog)).violations).toEqual([]);

  await userEvent.keyboard("{Escape}");
  await vi.waitFor(() => expect(dialog.open).toBe(false));
  expect(document.activeElement).toBe(trigger.element());

  await userEvent.click(trigger);
  const sectionLink = dialog.querySelector<HTMLAnchorElement>(
    'nav[aria-label="Documentation sections"] a',
  );
  expect(sectionLink).not.toBeNull();
  await userEvent.click(sectionLink!);
  await vi.waitFor(() => expect(dialog.open).toBe(false));
});
