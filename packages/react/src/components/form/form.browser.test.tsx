import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import { Form } from "./form.js";
import { TextField } from "../textfield/textfield.js";
import { Label } from "../label/label.js";
import { Description } from "../description/description.js";
import { FieldError } from "../field-error/field-error.js";
import { TextArea } from "../textarea/textarea.js";
import { SearchField } from "../search-field/search-field.js";
import { NumberField } from "../number-field/number-field.js";
import { InputOTP } from "../input-otp/input-otp.js";
import { InputGroup } from "../input-group/input-group.js";

// Prevents losing Field registration when rendering a textarea instead of an input;
// ordinary input coverage cannot prove textarea validity, labels or multiline submission.
test("native textarea validates and submits through Base Field and Form", async () => {
  const submit = vi.fn();
  const textarea = React.createRef<HTMLTextAreaElement>();
  const screen = await render(
    <Form onFormSubmit={submit}>
      <TextField name="notes">
        <Label>Notes</Label>
        <TextArea ref={textarea} required rows={3} />
        <Description>Provide notes</Description>
        <FieldError match="valueMissing">Notes are required</FieldError>
      </TextField>
      <button type="submit">Save</button>
    </Form>,
  );
  const control = screen.getByRole("textbox", { name: "Notes" });
  expect(textarea.current?.tagName).toBe("TEXTAREA");
  await expect.element(control).toHaveAccessibleDescription("Provide notes");
  await screen.getByRole("button", { name: "Save" }).click();
  await expect.element(control).toHaveAttribute("aria-invalid", "true");
  await expect.element(screen.getByText("Notes are required")).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
  await control.fill("First line\nSecond line");
  await screen.getByRole("button", { name: "Save" }).click();
  expect(submit).toHaveBeenCalledWith({ notes: "First line\nSecond line" }, expect.anything());
});

// Prevents clear actions bypassing controlled onValueChange or moving focus to the
// clear button; no Base UI SearchField exists to provide this behavior for us.
test("search clear and Escape update controlled input and preserve input focus", async () => {
  const changed = vi.fn();
  function Example() {
    const [value, setValue] = React.useState("query");
    return (
      <SearchField>
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            value={value}
            onValueChange={(next) => {
              changed(next);
              setValue(next);
            }}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
    );
  }
  const screen = await render(<Example />);
  const input = screen.getByRole("searchbox", { name: "Search" });
  await screen.getByRole("button", { name: "Clear search" }).click();
  await expect.element(input).toHaveValue("");
  expect(changed).toHaveBeenCalledWith("");
  expect(document.activeElement).toBe(input.element());
  await input.fill("again");
  await userEvent.keyboard("{Escape}");
  await expect.element(input).toHaveValue("");
  await expect.element(screen.getByRole("button", { name: "Clear search" })).toBeDisabled();
});

// Prevents wrapper composition losing native number limits, OTP paste distribution,
// or their hidden form values. These depend on browser events and native form controls.
test("number keyboard limits and OTP paste retain native form values", async () => {
  const submit = vi.fn();
  const screen = await render(
    <Form onFormSubmit={submit}>
      <TextField name="count">
        <NumberField defaultValue={2} min={0} max={3}>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input aria-label="Count" />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </TextField>
      <TextField name="code">
        <Label>Verification code</Label>
        <InputOTP length={4}>
          <InputOTP.Group>
            {[0, 1, 2, 3].map((index) => (
              <InputOTP.Slot key={index} />
            ))}
          </InputOTP.Group>
        </InputOTP>
      </TextField>
      <button type="submit">Send</button>
    </Form>,
  );
  const count = screen.getByRole("textbox", { name: "Count" });
  await count.click();
  await userEvent.keyboard("{ArrowUp}{ArrowUp}");
  await expect.element(count).toHaveValue("3");
  await expect
    .element(screen.getByRole("button", { name: "Increase value" }))
    .toHaveAttribute("aria-disabled", "true");
  await screen.getByRole("textbox", { name: "Verification code", exact: true }).nth(0).fill("1234");
  await screen.getByRole("button", { name: "Send" }).click();
  expect(submit).toHaveBeenCalledWith({ count: 3, code: "1234" }, expect.anything());
});

const geometry = stylex.create({ width: (width: number) => ({ width }) });

// Prevents dynamic StyleX variables and state-dependent style callbacks replacing
// one another; proves actual geometry rather than checking implementation classes.
test("grouped inputs retain dynamic geometry and Base state style callbacks", async () => {
  const screen = await render(
    <div
      dir="rtl"
      style={
        {
          "--field-background": "rgb(12, 34, 56)",
          "--field-foreground": "rgb(240, 241, 242)",
        } as React.CSSProperties
      }
    >
      <InputGroup xstyle={geometry.width(240)}>
        <InputGroup.Prefix>$</InputGroup.Prefix>
        <InputGroup.Input
          aria-label="Amount"
          xstyle={geometry.width(110)}
          style={({ disabled }) => ({ paddingBlock: disabled ? 0 : 7 })}
        />
        <InputGroup.Suffix>USD</InputGroup.Suffix>
      </InputGroup>
    </div>,
  );
  const input = screen.getByRole("textbox", { name: "Amount" }).element();
  await expect.poll(() => getComputedStyle(input).paddingTop).toBe("7px");
  const shell = input.parentElement!;
  await expect.poll(() => shell.getBoundingClientRect().width).toBe(240);
  expect(getComputedStyle(shell).backgroundColor).toBe("rgb(12, 34, 56)");
  expect(getComputedStyle(input).color).toBe("rgb(240, 241, 242)");
  expect(screen.getByText("$").element().getBoundingClientRect().left).toBeGreaterThan(
    input.getBoundingClientRect().left,
  );
  expect(input.getBoundingClientRect().left).toBeGreaterThan(shell.getBoundingClientRect().left);
  expect(input.getBoundingClientRect().right).toBeLessThan(shell.getBoundingClientRect().right);
});
