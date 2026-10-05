import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { RenderFunction } from "../../../../../apps/docs/src/demos/en/form/render-function.js";
import { CustomStyles as Profile } from "../../../../../apps/docs/src/demos/en/fieldset/custom-styles.js";
import { CustomStyles as Handle } from "../../../../../apps/docs/src/demos/en/field-error/custom-styles.js";
import { ErrorMessageBasic } from "../../../../../apps/docs/src/demos/en/error-message/basic.js";

// Native control coverage does not prove the pinned demos retain their validators,
// rendered form, success payload, and reset behavior.
test("render-function source form validates, submits its values, and resets", async () => {
  const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
  try {
    const screen = await render(<RenderFunction />);
    const email = screen.getByLabelText("Email", { exact: true });
    const password = screen.getByLabelText("Password", { exact: true });
    const submit = screen.getByRole("button", { name: "Submit", exact: true });
    await submit.click();
    await expect.element(email).toHaveAttribute("aria-invalid", "true");
    expect(alert).not.toHaveBeenCalled();
    await email.fill("john@example.com");
    await password.fill("abcdefgh");
    await submit.click();
    await expect
      .element(screen.getByText("Password must contain at least one uppercase letter"))
      .toBeVisible();
    expect(alert).not.toHaveBeenCalled();
    await password.fill("Abcdefg1");
    await submit.click();
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('"password": "Abcdefg1"'));
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('"email": "john@example.com"'));
    const control = email.element();
    expect(control.closest("form")?.getAttribute("data-custom")).toBe("foo");
    await screen.getByRole("button", { name: "Reset", exact: true }).click();
    await expect.element(email).toHaveValue("");
    await expect.element(password).toHaveValue("");
  } finally {
    alert.mockRestore();
  }
});

// The original basic replaced the real TagGroup with checkboxes. Its controlled
// collection error must instead follow row keyboard selection.
test("source category error follows real TagGroup Space selection", async () => {
  const screen = await render(<ErrorMessageBasic />);
  const news = screen.getByRole("row", { name: "News", exact: true });
  await expect
    .element(screen.getByText("Please select at least one category", { exact: true }))
    .toBeVisible();
  (news.element() as HTMLElement).focus();
  await userEvent.keyboard(" ");
  await expect.element(news).toHaveAttribute("aria-selected", "true");
  await expect
    .element(screen.getByText("Please select at least one category", { exact: true }))
    .not.toBeInTheDocument();
  await userEvent.keyboard(" ");
  await expect
    .element(screen.getByText("Please select at least one category", { exact: true }))
    .toBeVisible();
});

// Base Field.Error defaults to validation data, not an externally controlled
// invalid flag. The source controlled error must appear before any submit.
test("controlled handle error is initially visible and clears on a valid edit", async () => {
  const screen = await render(<Handle />);
  const handle = screen.getByRole("textbox", { name: "Handle", exact: true });
  await expect.element(handle).toHaveValue("jr");
  await expect.element(screen.getByText("Handle must be at least 3 characters")).toBeVisible();
  await handle.fill("john");
  await expect
    .element(screen.getByText("Handle must be at least 3 characters"))
    .not.toBeInTheDocument();
  await expect.element(handle).not.toHaveAttribute("aria-invalid", "true");
});

test("profile source validators cover short names and multiline biography", async () => {
  const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
  try {
    const screen = await render(<Profile />);
    const name = screen.getByLabelText("Name", { exact: true });
    const bio = screen.getByLabelText("Bio", { exact: true });
    await name.fill("Jo");
    await screen.getByLabelText("Email", { exact: true }).fill("john@example.com");
    await bio.fill("short");
    await screen.getByRole("button", { name: "Save changes", exact: true }).click();
    await expect.element(screen.getByText("Name must be at least 3 characters")).toBeVisible();
    await expect.element(screen.getByText("Bio must be at least 10 characters")).toBeVisible();
    expect(alert).not.toHaveBeenCalled();
    await name.fill("John Doe");
    await bio.fill("First line\nSecond line");
    await screen.getByRole("button", { name: "Save changes", exact: true }).click();
    expect(alert).toHaveBeenCalledWith("Form submitted successfully!");
    await screen.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect.element(name).toHaveValue("");
    await expect.element(bio).toHaveValue("");
  } finally {
    alert.mockRestore();
  }
});
