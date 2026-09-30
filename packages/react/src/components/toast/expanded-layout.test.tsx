import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Toast } from "./toast.js";

function Notifications({ alwaysExpanded }: { alwaysExpanded: boolean }) {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Viewport alwaysExpanded={alwaysExpanded}>
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast}>
          <Toast.Content>
            <Toast.Title />
          </Toast.Content>
        </Toast.Root>
      ))}
    </Toast.Viewport>
  );
}

// Existing queue tests exercised interaction expansion, not a permanent expanded layout.
for (const alwaysExpanded of [false, true]) {
  test(`toast layout ${alwaysExpanded ? "stays expanded" : "follows native hover"} without replacing native state`, async () => {
    const manager = Toast.createToastManager();
    await render(
      <Toast.Provider toastManager={manager} timeout={0}>
        <button type="button">Outside notifications</button>
        <Notifications alwaysExpanded={alwaysExpanded} />
      </Toast.Provider>,
    );
    for (const title of ["First message", "Second message", "Third message"]) {
      manager.add({ title });
    }
    await userEvent.hover(page.getByRole("button", { name: "Outside notifications" }));
    await expect.poll(() => document.querySelectorAll('[data-slot="toast"]').length).toBe(3);

    const roots = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toast"]')];
    await expect
      .poll(() => roots().every((root) => !root.hasAttribute("data-expanded")))
      .toBe(true);

    if (alwaysExpanded) {
      await expect
        .poll(() =>
          roots().every((root) => {
            const content = root.querySelector<HTMLElement>('[data-slot="toast-content"]')!;
            return getComputedStyle(content).opacity === "1";
          }),
        )
        .toBe(true);
      await expect
        .poll(() => {
          const bounds = roots()
            .map((root) => root.getBoundingClientRect())
            .sort((a, b) => a.top - b.top);
          return bounds.every(
            (bound, index) =>
              bound.height > 0 && (index === 0 || bounds[index - 1]!.bottom <= bound.top),
          );
        })
        .toBe(true);
    } else {
      await expect
        .poll(() =>
          roots().some((root) => {
            const content = root.querySelector<HTMLElement>('[data-slot="toast-content"]')!;
            return getComputedStyle(content).opacity === "0";
          }),
        )
        .toBe(true);
    }

    await userEvent.hover(page.getByText("Third message", { exact: true }));
    await expect.poll(() => roots().every((root) => root.hasAttribute("data-expanded"))).toBe(true);
    await userEvent.hover(page.getByRole("button", { name: "Outside notifications" }));
    await expect
      .poll(() => roots().every((root) => !root.hasAttribute("data-expanded")))
      .toBe(true);
  });
}
