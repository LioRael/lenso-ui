import * as React from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Drawer, Button } from "@lenso/ui";
import { ScrollableContent } from "../../../../../apps/docs/src/demos/en/drawer/scrollable-content";

// Mounting the source scene did not prove the body had a scroll boundary
// or that the footer remained reachable inside the clipped popup.
test.each([
  { width: 390, height: 844 },
  { width: 1280, height: 900 },
])("source long content scrolls internally at $width", async ({ width, height }) => {
  await page.viewport(width, height);
  try {
    const screen = await render(<ScrollableContent />);
    const trigger = screen.getByRole("button", { name: "Terms & Conditions", exact: true });
    await trigger.click();
    const dialog = screen.getByRole("dialog").element() as HTMLElement;
    const body = dialog.querySelector<HTMLElement>('[data-slot="drawer-body"]')!;
    const footer = dialog.querySelector<HTMLElement>('[data-slot="drawer-footer"]')!;
    await expect.poll(() => body.scrollHeight - body.clientHeight).toBeGreaterThan(0);
    await expect
      .poll(() => dialog.getBoundingClientRect().bottom <= window.innerHeight + 1)
      .toBe(true);
    expect(body.firstElementChild!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      body.getBoundingClientRect().top - 1,
    );
    body.scrollTop = body.scrollHeight;
    await expect
      .poll(
        () =>
          body.lastElementChild!.getBoundingClientRect().bottom <=
          body.getBoundingClientRect().bottom + 1,
      )
      .toBe(true);
    expect(body.lastElementChild!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      body.getBoundingClientRect().top - 1,
    );
    expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    const decline = screen.getByRole("button", { name: "Decline" });
    expect(getComputedStyle(decline.element()).position).not.toBe("absolute");
    await decline.click();
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  } finally {
    await page.viewport(1280, 900);
  }
});

test.each(["up", "down", "left", "right"] as const)(
  "bare close and footer remain usable with %s content",
  async (direction) => {
    const contentRef = React.createRef<HTMLDivElement>();
    const screen = await render(
      <Drawer.Provider>
        <Drawer.Root swipeDirection={direction}>
          <Drawer.Trigger>Open drawer</Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Backdrop />
            <Drawer.Viewport>
              <Drawer.Popup>
                <Drawer.Content ref={contentRef} data-slot="consumer-content">
                  <Drawer.Close />
                  <Drawer.Header>
                    <Drawer.Title>Long drawer</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
                    {Array.from({ length: 50 }, (_, index) => (
                      <p key={index}>
                        Paragraph {index + 1}: Content must scroll inside the drawer.
                      </p>
                    ))}
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Drawer.Close render={<Button />}>Done</Drawer.Close>
                  </Drawer.Footer>
                </Drawer.Content>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.Root>
      </Drawer.Provider>,
    );
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    await trigger.click();
    const dialog = screen.getByRole("dialog").element() as HTMLElement;
    const body = dialog.querySelector<HTMLElement>('[data-slot="drawer-body"]')!;
    const footer = screen.getByRole("button", { name: "Done" }).element();
    const close = screen.getByRole("button", { name: "Close", exact: true });
    await expect.poll(() => body.scrollHeight - body.clientHeight).toBeGreaterThan(100);
    await expect
      .poll(() => dialog.getBoundingClientRect().bottom <= window.innerHeight + 1)
      .toBe(true);
    expect(contentRef.current?.getAttribute("data-slot")).toBe("consumer-content");
    expect(close.element().querySelector("svg")).not.toBeNull();
    expect(close.element().getBoundingClientRect().width).toBe(24);
    expect(close.element().getBoundingClientRect().height).toBe(24);
    expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight + 1);
    expect(getComputedStyle(footer).position).not.toBe("absolute");
    await close.click();
    await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  },
);
