import * as stylex from "@stylexjs/stylex";
import { Field } from "@base-ui/react/field";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { InputGroup } from "./input-group.js";
import { SearchField } from "../search-field/search-field.js";
import { NumberField } from "../number-field/number-field.js";

// Form workflows prove validation, but did not detect the missing unfocused
// danger outline or the focus ring's geometry on the shared group shell.
for (const theme of ["light", "dark"] as const) {
  for (const variant of ["primary", "secondary"] as const) {
    for (const family of ["input", "search", "number"] as const) {
      test(`${family} ${variant} invalid shell recovers without changing geometry in ${theme}`, async () => {
        function Fixture({ invalid }: { invalid: boolean }) {
          const group =
            family === "search" ? (
              <SearchField invalid={invalid} variant={variant}>
                <SearchField.Group data-testid="shell">
                  <SearchField.Input aria-label="Value" defaultValue="ab" />
                </SearchField.Group>
              </SearchField>
            ) : (
              <Field.Root invalid={invalid} data-testid="field">
                {family === "number" ? (
                  <NumberField variant={variant} defaultValue={-5}>
                    <NumberField.Group data-testid="shell">
                      <NumberField.Input aria-label="Value" />
                    </NumberField.Group>
                  </NumberField>
                ) : (
                  <InputGroup variant={variant} data-testid="shell">
                    <InputGroup.Input aria-label="Value" defaultValue="ab" />
                  </InputGroup>
                )}
              </Field.Root>
            );
          return (
            <div data-theme={theme} data-testid="ancestor">
              {group}
              <button type="button">Outside</button>
              <span
                data-testid="probe"
                style={{
                  outline: "1px solid var(--danger)",
                  borderColor: "var(--danger)",
                  backgroundColor: "var(--field-focus)",
                  boxShadow:
                    variant === "primary"
                      ? "0 0 0 2px var(--danger), var(--field-shadow)"
                      : "0 0 0 2px var(--danger)",
                }}
              />
              <span
                data-testid="valid-probe"
                style={{
                  outline: "2px solid var(--focus)",
                  boxShadow: variant === "primary" ? "var(--field-shadow)" : "none",
                  backgroundColor: "var(--default)",
                }}
              />
            </div>
          );
        }
        const screen = await render(<Fixture invalid />);
        const shell = screen.getByTestId("shell").element();
        const control = screen.getByRole(family === "search" ? "searchbox" : "textbox", {
          name: "Value",
        });
        await screen.getByRole("button", { name: "Outside" }).hover();
        const probe = getComputedStyle(screen.getByTestId("probe").element());
        const validProbe = getComputedStyle(screen.getByTestId("valid-probe").element());
        const rect = shell.getBoundingClientRect();
        await expect.element(control).toHaveAttribute("aria-invalid", "true");
        await expect.poll(() => getComputedStyle(shell).outlineStyle).toBe("solid");
        expect(getComputedStyle(shell).outlineWidth).toBe("1px");
        expect(getComputedStyle(shell).outlineColor).toBe(probe.outlineColor);
        expect(getComputedStyle(shell).outlineOffset).toBe("0px");
        await expect.poll(() => getComputedStyle(shell).boxShadow).toBe(validProbe.boxShadow);
        await expect
          .poll(() => getComputedStyle(shell).backgroundColor)
          .toBe(variant === "primary" ? probe.backgroundColor : validProbe.backgroundColor);
        await screen.getByTestId("shell").hover();
        await expect.poll(() => getComputedStyle(shell).borderTopColor).toBe(probe.borderTopColor);
        await expect
          .poll(() => getComputedStyle(shell).backgroundColor)
          .toBe(variant === "primary" ? probe.backgroundColor : validProbe.backgroundColor);
        await control.element().focus();
        await expect.poll(() => getComputedStyle(shell).boxShadow).toBe(probe.boxShadow);
        expect(getComputedStyle(shell).outlineStyle).toBe("none");
        expect(shell.getBoundingClientRect().width).toBe(rect.width);
        expect(shell.getBoundingClientRect().height).toBe(rect.height);
        for (let ancestor = shell.parentElement; ancestor; ancestor = ancestor.parentElement) {
          expect(getComputedStyle(ancestor).outlineStyle).toBe("none");
          expect(getComputedStyle(ancestor).boxShadow).toBe("none");
        }
        await screen.getByRole("button", { name: "Outside" }).click();
        await expect.poll(() => getComputedStyle(shell).outlineWidth).toBe("1px");
        await expect.poll(() => getComputedStyle(shell).boxShadow).toBe(validProbe.boxShadow);
        await screen.rerender(<Fixture invalid={false} />);
        await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
        await expect.poll(() => getComputedStyle(shell).outlineStyle).toBe("none");
        await control.element().focus();
        await expect.poll(() => getComputedStyle(shell).outlineWidth).toBe("2px");
        expect(getComputedStyle(shell).outlineColor).toBe(validProbe.outlineColor);
        expect(getComputedStyle(shell).outlineOffset).toBe("2px");
        await expect.poll(() => getComputedStyle(shell).boxShadow).toBe(validProbe.boxShadow);
      });
    }
  }
}

test.each(["self", "descendant", "field"] as const)(
  "invalid attribute on %s paints only the group shell",
  async (at) => {
    const screen = await render(
      <Field.Root invalid={at === "field"}>
        <InputGroup data-testid="shell" data-invalid={at === "self" ? "" : undefined}>
          {at !== "self" ? (
            <input aria-label="Value" data-invalid={at === "descendant" ? "" : undefined} />
          ) : (
            <InputGroup.Input aria-label="Value" />
          )}
        </InputGroup>
      </Field.Root>,
    );
    const shell = screen.getByTestId("shell").element();
    expect(getComputedStyle(shell).outlineStyle).toBe("solid");
    expect(getComputedStyle(shell).outlineWidth).toBe("1px");
    expect(getComputedStyle(shell.parentElement!).outlineStyle).toBe("none");
  },
);

test.each(["data-focused", "data-focus-visible", "data-focus-within"] as const)(
  "%s switches an invalid shell to a zero-offset danger ring",
  async (attribute) => {
    const screen = await render(
      <InputGroup data-invalid="" {...{ [attribute]: "true" }} data-testid="shell">
        <InputGroup.Input aria-label="Value" />
        <span
          data-testid="probe"
          style={{ boxShadow: "0 0 0 2px var(--danger), var(--field-shadow)" }}
        />
      </InputGroup>,
    );
    const shell = screen.getByTestId("shell").element();
    expect(getComputedStyle(shell).outlineStyle).toBe("none");
    expect(getComputedStyle(shell).outlineOffset).toBe("0px");
    expect(getComputedStyle(shell).boxShadow).toBe(
      getComputedStyle(screen.getByTestId("probe").element()).boxShadow,
    );
  },
);

const override = stylex.create({
  shell: { outline: "4px solid rgb(0, 128, 0)", boxShadow: "none", width: 240 },
});

test("caller xstyle remains last on the invalid shared shell", async () => {
  const screen = await render(
    <InputGroup data-invalid="" data-testid="shell" xstyle={override.shell}>
      <InputGroup.Input aria-label="Value" />
    </InputGroup>,
  );
  const shell = screen.getByTestId("shell").element();
  const control = screen.getByRole("textbox");
  expect(getComputedStyle(shell).outlineWidth).toBe("4px");
  await control.element().focus();
  expect(getComputedStyle(shell).outlineWidth).toBe("4px");
  expect(getComputedStyle(shell).outlineColor).toBe("rgb(0, 128, 0)");
  expect(getComputedStyle(shell).boxShadow).toBe("none");
  expect(shell.getBoundingClientRect().width).toBe(240);
});
