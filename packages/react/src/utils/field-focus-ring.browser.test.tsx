import type { CSSProperties, ReactNode } from "react";
import { CalendarDate } from "@internationalized/date";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Input } from "../components/input/index.js";
import { TextArea } from "../components/textarea/index.js";
import { InputGroup } from "../components/input-group/index.js";
import { SearchField } from "../components/search-field/index.js";
import { NumberField } from "../components/number-field/index.js";
import { ComboBox } from "../components/combo-box/index.js";
import { DateField } from "../components/date-field/index.js";
import { ColorField } from "../components/color-field/index.js";
import { ColorInputGroup } from "../components/color-input-group/index.js";
import { InputOTP } from "../components/input-otp/index.js";
import { ThemeScope } from "./theme-scope.js";

type Variant = "primary" | "secondary";
type FieldCase = { name: string; render(variant: Variant): ReactNode; shell?: boolean };
const fields: FieldCase[] = [
  {
    name: "Input",
    render: (variant) => <Input aria-label="Field" variant={variant} data-testid="ring" />,
  },
  {
    name: "Textarea",
    render: (variant) => <TextArea aria-label="Field" variant={variant} data-testid="ring" />,
  },
  {
    name: "InputGroup",
    shell: true,
    render: (variant) => (
      <InputGroup variant={variant} data-testid="ring">
        <InputGroup.Input aria-label="Field" />
      </InputGroup>
    ),
  },
  {
    name: "SearchField",
    shell: true,
    render: (variant) => (
      <SearchField variant={variant}>
        <SearchField.Group data-testid="ring">
          <SearchField.Input aria-label="Field" />
        </SearchField.Group>
      </SearchField>
    ),
  },
  {
    name: "NumberField",
    shell: true,
    render: (variant) => (
      <NumberField variant={variant} defaultValue={3}>
        <NumberField.Group data-testid="ring">
          <NumberField.Input aria-label="Field" />
        </NumberField.Group>
      </NumberField>
    ),
  },
  {
    name: "ComboBox input",
    shell: true,
    render: (variant) => (
      <ComboBox items={["first", "second"]}>
        <ComboBox.InputGroup variant={variant} data-testid="ring">
          <ComboBox.Input aria-label="Field" />
        </ComboBox.InputGroup>
      </ComboBox>
    ),
  },
  {
    name: "DateInputGroup",
    shell: true,
    render: (variant) => (
      <DateField aria-label="Field" defaultValue={new CalendarDate(2026, 5, 12)}>
        <DateField.Group variant={variant} data-testid="ring">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    ),
  },
  {
    name: "ColorInputGroup",
    shell: true,
    render: (variant) => (
      <ColorField aria-label="Field" defaultValue="#123456">
        <ColorInputGroup variant={variant} data-testid="ring">
          <ColorInputGroup.Input />
        </ColorInputGroup>
      </ColorField>
    ),
  },
  {
    name: "InputOTP active slot",
    render: (variant) => (
      <>
        <label htmlFor="focus-otp">Field</label>
        <InputOTP length={1} variant={variant}>
          <InputOTP.Group>
            <InputOTP.Slot id="focus-otp" data-testid="ring" />
          </InputOTP.Group>
        </InputOTP>
      </>
    ),
  },
];

// The source focus-field-ring is flush and composes independently with shadow-field.
// Existing field/invalid tests did not prove ring placement or secondary elevation.
for (const theme of ["light", "dark"] as const) {
  for (const variant of ["primary", "secondary"] as const) {
    for (const field of fields) {
      test(`${field.name} uses a flush field ring (${theme}, ${variant})`, async () => {
        const elevation = variant === "primary" ? "var(--field-shadow)" : "0 0 #0000";
        const screen = await render(
          <ThemeScope
            theme={theme}
            style={{ padding: 24, "--ring-offset-width": "4px" } as CSSProperties}
          >
            <button>Before field</button>
            {field.render(variant)}
            <span
              data-testid="reference"
              style={{ boxShadow: `0 0 0 2px var(--focus), ${elevation}` }}
            />
          </ThemeScope>,
        );
        await screen.getByRole("button", { name: "Before field" }).click();
        await userEvent.tab();
        const target = screen.getByTestId("ring").element();
        expect(
          field.shell ? target.contains(document.activeElement) : document.activeElement === target,
        ).toBe(true);
        const bounds = target.getBoundingClientRect();
        const reference = screen.getByTestId("reference").element();
        await expect
          .poll(() => getComputedStyle(target).boxShadow, { timeout: 600 })
          .toBe(getComputedStyle(reference).boxShadow);
        expect(getComputedStyle(target).outlineStyle).toBe("none");
        expect(target.getBoundingClientRect().width).toBe(bounds.width);
        expect(target.getBoundingClientRect().height).toBe(bounds.height);
      });
    }
  }
}

test("pointer-focused text fields keep the source ring; adornment focus does not focus an InputGroup shell", async () => {
  const screen = await render(
    <>
      <Input aria-label="Pointer field" />
      <InputGroup data-testid="shell">
        <InputGroup.Input aria-label="Group field" />
        <InputGroup.Suffix>
          <button>Adornment</button>
        </InputGroup.Suffix>
      </InputGroup>
      <span
        data-testid="ring-reference"
        style={{ boxShadow: "0 0 0 2px var(--focus), var(--field-shadow)" }}
      />
      <span data-testid="elevation-reference" style={{ boxShadow: "var(--field-shadow)" }} />
    </>,
  );
  const input = screen.getByRole("textbox", { name: "Pointer field" });
  await input.click();
  expect(document.activeElement).toBe(input.element());
  await expect
    .poll(() => getComputedStyle(input.element()).boxShadow, { timeout: 600 })
    .toBe(getComputedStyle(screen.getByTestId("ring-reference").element()).boxShadow);
  await screen.getByRole("button", { name: "Adornment" }).click();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Adornment" }).element());
  await expect
    .poll(() => getComputedStyle(screen.getByTestId("shell").element()).boxShadow, { timeout: 600 })
    .toBe(getComputedStyle(screen.getByTestId("elevation-reference").element()).boxShadow);
});

test("number steppers share the flush group ring rather than adding a second outer ring", async () => {
  const screen = await render(
    <>
      <button>Before number</button>
      <NumberField defaultValue={3}>
        <NumberField.Group data-testid="number-shell">
          <NumberField.DecrementButton />
          <NumberField.Input aria-label="Number" />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
      <span
        data-testid="number-ring-reference"
        style={{ boxShadow: "0 0 0 2px var(--focus), var(--field-shadow)" }}
      />
    </>,
  );
  await screen.getByRole("button", { name: "Before number" }).click();
  await userEvent.tab();
  const stepper = screen.getByRole("button", { name: "Decrease value" }).element();
  (stepper as HTMLElement).focus();
  expect(document.activeElement).toBe(stepper);
  expect(stepper.matches(":focus-visible")).toBe(true);
  await expect
    .poll(() => getComputedStyle(screen.getByTestId("number-shell").element()).boxShadow)
    .toBe(getComputedStyle(screen.getByTestId("number-ring-reference").element()).boxShadow);
  expect(getComputedStyle(stepper).boxShadow).toBe("none");
  expect(getComputedStyle(stepper).outlineStyle).toBe("none");
});
