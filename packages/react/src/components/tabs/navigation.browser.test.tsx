import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Tabs } from "./tabs.js";
import { Breadcrumbs } from "../breadcrumbs/breadcrumbs.js";
import { Pagination } from "../pagination/pagination.js";
import { Link } from "../link/link.js";

test("RTL manual tabs move focus before selection and the indicator follows real tab geometry", async () => {
  const screen = await render(
    <Tabs dir="rtl" defaultValue="one">
      <Tabs.ListContainer>
        <Tabs.List activateOnFocus={false} aria-label="Sections">
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
          <Tabs.Indicator data-testid="indicator" />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="one">First section</Tabs.Panel>
      <Tabs.Panel value="two">Second section</Tabs.Panel>
    </Tabs>,
  );
  const one = screen.getByRole("tab", { name: "One" });
  const two = screen.getByRole("tab", { name: "Two" });
  await userEvent.tab();
  await userEvent.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(two.element());
  await expect.element(one).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{Enter}");
  await expect.element(two).toHaveAttribute("aria-selected", "true");
  await expect.element(screen.getByRole("tabpanel")).toHaveTextContent("Second section");
  const indicator = screen.getByTestId("indicator").element();
  await expect
    .poll(() =>
      Math.abs(indicator.getBoundingClientRect().left - two.element().getBoundingClientRect().left),
    )
    .toBeLessThan(1);
  expect(
    Math.abs(indicator.getBoundingClientRect().width - two.element().getBoundingClientRect().width),
  ).toBeLessThan(1);
  expect(getComputedStyle(two.element()).boxShadow).not.toBe("none");
});

test("navigation preserves real hrefs and current-page semantics while disabled links cannot activate", async () => {
  const activate = vi.fn();
  const screen = await render(
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item href="/home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/current">Current</Breadcrumbs.Item>
      </Breadcrumbs>
      <Pagination>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous href="/previous" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link href="/page/2" isActive>
              2
            </Pagination.Link>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next href="/next" />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
      <Link href="/blocked" disabled onClick={activate}>
        Unavailable
      </Link>
    </>,
  );
  await expect.element(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect
    .element(screen.getByRole("link", { name: "Current" }))
    .toHaveAttribute("aria-current", "page");
  await expect.element(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/page/2");
  await expect
    .element(screen.getByRole("link", { name: "2" }))
    .toHaveAttribute("aria-current", "page");
  const disabled = screen.getByRole("link", { name: "Unavailable" }).element();
  expect(disabled.hasAttribute("href")).toBe(false);
  expect(disabled.getAttribute("aria-disabled")).toBe("true");
  disabled.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(activate).not.toHaveBeenCalled();
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("link", { name: "Home" }).element());
});
