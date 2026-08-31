import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { TextArea } from "./index.js";

test("Text Area keeps native textarea and Base Field semantics", async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <TextArea.Root invalid name="notes">
      <TextArea.Label>Notes</TextArea.Label>
      <TextArea.Control
        data-visual-state="focus-visible"
        defaultValue="Initial note"
        onValueChange={onValueChange}
        placeholder="Add context"
        rows={4}
      />
      <TextArea.Description>Visible to collaborators.</TextArea.Description>
      <TextArea.Error match>Notes need more detail.</TextArea.Error>
    </TextArea.Root>,
  );

  const control = screen.getByRole("textbox", { name: "Notes" });
  expect(control.element().tagName).toBe("TEXTAREA");
  expect((control.element() as HTMLTextAreaElement).rows).toBe(4);
  expect(control.element().getAttribute("aria-invalid")).toBe("true");
  expect(control.element().getAttribute("aria-describedby")).toBeTruthy();
  await expect
    .poll(() => {
      const computed = getComputedStyle(control.element());
      return [computed.outlineWidth, computed.outlineOffset];
    })
    .toEqual(["2px", "2px"]);
  await userEvent.fill(control, "Updated note");
  expect(onValueChange).toHaveBeenLastCalledWith("Updated note", expect.anything());
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
