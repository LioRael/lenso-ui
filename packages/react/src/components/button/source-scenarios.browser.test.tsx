import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { LoadingState } from "../../../../../apps/docs/src/demos/en/button/loading-state";
import { RippleEffect } from "../../../../../apps/docs/src/demos/en/button/ripple-effect";
import {
  Disabled as DisabledButtons,
  CustomStyles as MergeOptions,
} from "../../../../../apps/docs/src/demos/en/button-group/source";
import { Disabled as DisabledToggles } from "../../../../../apps/docs/src/demos/en/toggle-button-group/source";
import { Overflow } from "../../../../../apps/docs/src/demos/en/tabs/source";
import { PaginationControlled } from "../../../../../apps/docs/src/demos/en/pagination/source";
import { RenderFunction as ComposedLink } from "../../../../../apps/docs/src/demos/en/link/render-function";
import { Controlled as ControlledAccordion } from "../../../../../apps/docs/src/demos/en/accordion/source";
import { WithButtonGroup } from "../../../../../apps/docs/src/demos/en/toolbar/source";
import { Controlled as ControlledDisclosure } from "../../../../../apps/docs/src/demos/en/disclosure-group/controlled";

// Component tests do not prove that the newly translated source-demo compositions retain their native contracts.
test("source upload remains focused while pending and blocks another keyboard activation", async () => {
  const screen = await render(<LoadingState />);
  const upload = screen.getByRole("button", { name: "Upload File" });
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  const pending = screen.getByRole("button", { name: "Uploading..." });
  await expect.element(pending).toHaveAttribute("aria-busy", "true");
  expect(document.activeElement).toBe(pending.element());
  expect((pending.element() as HTMLButtonElement).disabled).toBe(false);
  await userEvent.keyboard("{Enter}");
  await expect.element(upload).toBeVisible();
  expect(document.activeElement).toBe(upload.element());
});

test("source ripple has a real hit surface and responds to a pointer press", async () => {
  const screen = await render(<RippleEffect />);
  const button = screen.getByRole("button", { name: "Click me" }).element();
  const ripple = button.querySelector('[aria-hidden="true"]');
  expect(ripple).not.toBeNull();
  await userEvent.click(button);
  await expect.poll(() => ripple!.getAnimations({ subtree: true }).length).toBeGreaterThan(0);
  expect(button.getBoundingClientRect().width).toBeGreaterThan(80);
});

test("source disabled group permits its explicit child override and toggle arrows skip a disabled item", async () => {
  const screen = await render(
    <>
      <DisabledButtons />
      <DisabledToggles />
    </>,
  );
  const override = screen.getByRole("button", { name: "Third (enabled)" });
  await userEvent.tab();
  expect(document.activeElement).toBe(override.element());
  await userEvent.tab();
  const bold = screen.getByRole("button", { name: "Bold" }).all()[1]!;
  const underline = screen.getByRole("button", { name: "Underline" }).all()[1]!;
  expect(document.activeElement).toBe(bold.element());
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(underline.element());
  await userEvent.keyboard(" ");
  await expect.element(underline).toHaveAttribute("aria-pressed", "true");
});

test("source overflow tabs scroll and their measured indicator follows keyboard selection", async () => {
  const screen = await render(<Overflow />);
  const overview = screen.getByRole("tab", { name: "Overview" }).element();
  const scroller = overview.closest('[data-slot="tabs-list-scroller"]') as HTMLElement;
  expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
  expect(scroller.clientWidth).toBeLessThanOrEqual(400);
  await userEvent.tab();
  await userEvent.keyboard("{End}");
  const settings = screen.getByRole("tab", { name: "Settings" });
  await expect.element(settings).toHaveAttribute("aria-selected", "true");
  await expect.element(screen.getByRole("tabpanel")).toHaveTextContent("Settings panel content.");
  await expect.poll(() => scroller.scrollLeft).toBeGreaterThan(0);
  const indicator = scroller.querySelector('[data-slot="tabs-indicator"]') as HTMLElement;
  await expect
    .poll(() =>
      Math.abs(
        indicator.getBoundingClientRect().left - settings.element().getBoundingClientRect().left,
      ),
    )
    .toBeLessThan(1);
});

test("source pagination is keyboard-operable and composed links retain native href semantics", async () => {
  const screen = await render(
    <>
      <PaginationControlled />
      <ComposedLink />
    </>,
  );
  const next = screen.getByRole("button", { name: "Next page" });
  await userEvent.click(next);
  await expect
    .element(screen.getByRole("navigation", { name: "Pagination" }))
    .toHaveTextContent("Showing 11-20 of 120 results");
  await userEvent.keyboard("{Enter}");
  await expect
    .element(screen.getByRole("navigation", { name: "Pagination" }))
    .toHaveTextContent("Showing 21-30 of 120 results");
  const link = screen.getByRole("link", { name: "Call to action" });
  await expect.element(link).toHaveAttribute("href", "#");
  await expect.element(link).toHaveAttribute("data-custom", "foo");
});

test("source merge split menu opens with keyboard and controlled accordion navigation updates the panel", async () => {
  const screen = await render(
    <>
      <MergeOptions />
      <ControlledAccordion />
    </>,
  );
  const trigger = screen.getByRole("button", { name: "Merge options" }).element();
  trigger.focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(screen.getByRole("menuitem", { name: /Squash and merge/ })).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.activeElement).toBe(trigger);
  await userEvent.click(screen.getByRole("button", { name: "Next item" }));
  await expect
    .element(screen.getByRole("button", { name: "Core Concepts" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect
    .element(screen.getByRole("button", { name: "Getting Started" }))
    .toHaveAttribute("aria-expanded", "false");
});

test("source composed toolbar retains action roving focus and independent toggle-group selection", async () => {
  const screen = await render(<WithButtonGroup />);
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }).element());
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Redo" }).element());
  const bold = screen.getByRole("button", { name: "Bold" });
  await userEvent.click(bold);
  await userEvent.keyboard("{ArrowRight} ");
  await expect.element(bold).toHaveAttribute("aria-pressed", "true");
  await expect
    .element(screen.getByRole("button", { name: "Italic" }))
    .toHaveAttribute("aria-pressed", "true");
});

test("independent React Native-reference disclosure has genuine controlled expansion and bounded previous/next navigation", async () => {
  const screen = await render(<ControlledDisclosure />);
  const previous = screen.getByRole("button", { name: "Previous disclosure" });
  const next = screen.getByRole("button", { name: "Next disclosure" });
  await expect.element(previous).toBeDisabled();
  await expect
    .element(screen.getByRole("button", { name: "Preview HeroUI Native" }))
    .toHaveAttribute("aria-expanded", "true");
  await userEvent.click(next);
  await expect
    .element(screen.getByRole("button", { name: "Download HeroUI Native" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect.element(next).toBeDisabled();
  await userEvent.click(previous);
  await expect
    .element(screen.getByRole("button", { name: "Preview HeroUI Native" }))
    .toHaveAttribute("aria-expanded", "true");
});
