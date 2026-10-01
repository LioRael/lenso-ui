import { createRef } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Accordion } from "./accordion.js";
import { Disclosure } from "../disclosure/disclosure.js";
import { DisclosureGroup } from "../disclosure-group/disclosure-group.js";

test("accordion arrows skip disabled and nested items while expansion reveals measured content", async () => {
  const ref = createRef<HTMLElement>();
  const screen = await render(
    <Accordion
      aria-label="Questions"
      onKeyDown={(event) => {
        if (event.key === "Home") event.preventDefault();
      }}
    >
      <Accordion.Item value="one">
        <Accordion.Heading>
          <Accordion.Trigger ref={ref}>
            One
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            First answer
            <Accordion>
              <Accordion.Item value="inner-a">
                <Accordion.Heading>
                  <Accordion.Trigger>Inner A</Accordion.Trigger>
                </Accordion.Heading>
              </Accordion.Item>
              <Accordion.Item value="inner-b">
                <Accordion.Heading>
                  <Accordion.Trigger>Inner B</Accordion.Trigger>
                </Accordion.Heading>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="disabled" disabled>
        <Accordion.Heading>
          <Accordion.Trigger>Unavailable</Accordion.Trigger>
        </Accordion.Heading>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Heading>
          <Accordion.Trigger>
            Two
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>Second answer</Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  );
  const first = screen.getByRole("button", { name: "One" });
  expect(ref.current).toBe(first.element());
  await userEvent.tab();
  await userEvent.keyboard("{Enter}");
  await expect.element(first).toHaveAttribute("aria-expanded", "true");
  const answer = screen.getByText("First answer", { exact: false });
  await expect.element(answer).toBeVisible();
  await expect.poll(() => answer.element().getBoundingClientRect().height).toBeGreaterThan(0);
  (screen.getByRole("button", { name: "Inner A" }).element() as HTMLElement).focus();
  await userEvent.keyboard("{End}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inner B" }).element());
  (first.element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect
    .element(screen.getByRole("button", { name: "Two" }))
    .toHaveAttribute("aria-expanded", "true");
  await expect.element(first).toHaveAttribute("aria-expanded", "false");
  await expect.element(screen.getByText("Second answer")).toBeVisible();
  await userEvent.keyboard("{Home}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Two" }).element());
});

test("standalone and grouped disclosures choose the right behavior owner and measured-height variable", async () => {
  const screen = await render(
    <>
      <Disclosure>
        <Disclosure.Heading>
          <Disclosure.Trigger>Standalone</Disclosure.Trigger>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body>Standalone body</Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <DisclosureGroup>
        <Disclosure value="a">
          <Disclosure.Heading>
            <Disclosure.Trigger>Grouped A</Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body>Body A</Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
        <Disclosure value="b">
          <Disclosure.Heading>
            <Disclosure.Trigger>Grouped B</Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body>Body B</Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </DisclosureGroup>
    </>,
  );
  await screen.getByRole("button", { name: "Standalone" }).click();
  await expect.element(screen.getByText("Standalone body")).toBeVisible();
  await screen.getByRole("button", { name: "Grouped A" }).click();
  await expect.element(screen.getByText("Body A")).toBeVisible();
  await expect
    .poll(() => screen.getByText("Body A").element().getBoundingClientRect().height)
    .toBeGreaterThan(0);
  await screen.getByRole("button", { name: "Grouped B" }).click();
  await expect
    .element(screen.getByRole("button", { name: "Grouped A" }))
    .toHaveAttribute("aria-expanded", "false");
  await expect.element(screen.getByText("Body B")).toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Standalone" }))
    .toHaveAttribute("aria-expanded", "true");
});
