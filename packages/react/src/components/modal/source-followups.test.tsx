import * as React from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Modal } from "./modal.js";
import { AlertDialog } from "../alert-dialog/alert-dialog.js";
import { Button } from "../button/button.js";
import { DangerIcon, InfoIcon, SuccessIcon, WarningIcon } from "../../icons/index.js";

afterEach(() => cleanup());

// Tone-only proofs never rendered the source icon when children were omitted.
it.each(["default", "accent", "success", "warning", "danger"] as const)(
  "renders the preserved decorative %s alert glyph at the source size",
  async (variant) => {
    const Glyph =
      variant === "success"
        ? SuccessIcon
        : variant === "warning"
          ? WarningIcon
          : variant === "danger"
            ? DangerIcon
            : InfoIcon;
    await render(
      <>
        <AlertDialog.Icon variant={variant} />
        <Glyph data-testid="source-glyph" />
      </>,
    );
    const icon = document.querySelector('[data-slot="alert-dialog-icon"]')!;
    const svg = icon.querySelector("svg")!;
    expect(svg.querySelector("path")?.getAttribute("d")).toBe(
      document.querySelector('[data-testid="source-glyph"] path')?.getAttribute("d"),
    );
    expect(svg.getBoundingClientRect().width).toBe(20);
    expect(svg.getBoundingClientRect().height).toBe(20);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  },
);

it.each(["modal", "alert"] as const)(
  "keeps the bare %s close usable without altering footer composition",
  async (family) => {
    const Dialog = family === "modal" ? Modal : AlertDialog;
    const closeRef = React.createRef<HTMLButtonElement>();
    await render(
      <Dialog>
        <Dialog.Trigger>Open close anatomy</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Viewport>
            <Dialog.Popup>
              <Dialog.Title>Close anatomy</Dialog.Title>
              <Dialog.Close
                ref={closeRef}
                style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
              />
              <Dialog.Footer>
                <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>,
    );
    const trigger = page.getByRole("button", { name: "Open close anatomy" });
    await userEvent.click(trigger);
    const bare = page.getByRole("button", { name: "Close", exact: true });
    await expect.element(bare).toBeVisible();
    expect(closeRef.current?.querySelector("svg path")?.getAttribute("d")).toBe(
      "m4 4 8 8M12 4l-8 8",
    );
    await expect.poll(() => closeRef.current?.getBoundingClientRect().width).toBe(24);
    expect(
      getComputedStyle(page.getByRole("button", { name: "Cancel" }).element()).position,
    ).not.toBe("absolute");
    await userEvent.click(bare);
    await expect
      .poll(() =>
        document.querySelector(
          `[data-slot="${family === "modal" ? "modal" : "alert-dialog"}-popup"]`,
        ),
      )
      .toBeNull();
    await expect.element(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(page.getByRole("button", { name: "Cancel" }));
    await expect
      .poll(() =>
        document.querySelector(
          `[data-slot="${family === "modal" ? "modal" : "alert-dialog"}-popup"]`,
        ),
      )
      .toBeNull();
    await expect.element(trigger).toHaveFocus();
  },
);

function LongOutsideModal({ controlled }: { controlled: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Modal scroll="outside" {...(controlled ? { open, onOpenChange: setOpen } : {})}>
      <Modal.Trigger>Open long content</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup style={{ maxWidth: 360 }}>
            <Modal.Title>Outside scrolling</Modal.Title>
            <Modal.Body>
              <button>First content action</button>
              {Array.from({ length: 30 }, (_, index) => (
                <p key={index} style={{ marginBottom: 12 }}>
                  Paragraph {index + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet
                  hendrerit risus, sed porttitor quam.
                </p>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button />}>Last content action</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}

// Fixed-height spacer tests do not expose flex centering of oversized real source paragraphs.
it.each([
  { width: 1280, controlled: false },
  { width: 1280, controlled: true },
  { width: 390, controlled: false },
  { width: 390, controlled: true },
])(
  "makes the first and last outside-scroll content reachable at $width (controlled=$controlled)",
  async ({ width, controlled }) => {
    await page.viewport(width, 800);
    await render(<LongOutsideModal controlled={controlled} />);
    await userEvent.click(page.getByRole("button", { name: "Open long content" }));
    const viewport = document.querySelector('[data-slot="modal-viewport"]')!;
    const popup = document.querySelector('[data-slot="modal-popup"]')!;
    await expect.poll(() => getComputedStyle(popup).transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
    expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    expect(viewport.scrollTop).toBe(0);
    await expect.element(page.getByRole("button", { name: "First content action" })).toHaveFocus();
    // Native Tab scrolls the last action into the same outside viewport.
    await userEvent.keyboard("{Tab}");
    const last = page.getByRole("button", { name: "Last content action" });
    await expect.element(last).toHaveFocus();
    await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
    expect(last.element().getBoundingClientRect().bottom).toBeLessThanOrEqual(800);
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByRole("button", { name: "First content action" })).toHaveFocus();
    expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector('[data-slot="modal-popup"]')).toBeNull();
    await page.viewport(1280, 900);
  },
);
