import { createRef, useState, type CSSProperties, type Ref } from "react";
import { Field } from "@base-ui/react/field";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@lenso/tokens/styles.css";
import { Checkbox } from "./index.js";
import { CheckboxGroup } from "../checkbox-group/index.js";
import { Radio } from "../radio/index.js";
import { RadioGroup } from "../radio-group/index.js";
import { Switch } from "../switch/index.js";
import { Slider } from "../slider/index.js";
import { Select } from "../select/index.js";
import { ComboBox } from "../combo-box/index.js";
import { Autocomplete } from "../autocomplete/index.js";
import { ThemeScope } from "../../utils/theme-scope.js";

function CheckboxParts({ controlRef }: { controlRef?: Ref<HTMLSpanElement> }) {
  return (
    <Checkbox.Content>
      <Checkbox.Control ref={controlRef}>
        <Checkbox.Indicator />
      </Checkbox.Control>
      Consent
    </Checkbox.Content>
  );
}

test("controlled and uncontrolled toggles keep native change, input and disabled semantics", async () => {
  const changed = vi.fn();
  const control = createRef<HTMLSpanElement>();
  function Fixture() {
    const [checked, setChecked] = useState(false);
    return (
      <ThemeScope
        theme="dark"
        style={
          {
            "--accent": "rgb(40, 80, 120)",
            "--field-background": "rgb(20, 30, 40)",
          } as CSSProperties
        }
      >
        <div
          aria-hidden="true"
          data-testid="pointer-parking"
          style={{ position: "fixed", right: 0, bottom: 0, width: 16, height: 16 }}
        />
        <Checkbox
          checked={checked}
          onCheckedChange={(next, details) => {
            changed(next, details.reason);
            setChecked(next);
          }}
          name="consent"
        >
          <CheckboxParts controlRef={control} />
        </Checkbox>
        <Switch defaultChecked aria-label="Alerts">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
        <Checkbox disabled defaultChecked aria-label="Locked">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox>
      </ThemeScope>
    );
  }
  const screen = await render(<Fixture />);
  await screen.getByTestId("pointer-parking").hover();
  const consent = page.getByRole("checkbox", { name: "Consent" });
  await expect
    .poll(() => getComputedStyle(control.current!).backgroundColor)
    .toBe("rgb(20, 30, 40)");
  consent.element().focus();
  await userEvent.keyboard(" ");
  await expect.element(consent).toBeChecked();
  await expect
    .poll(() => getComputedStyle(control.current!, "::before").backgroundColor)
    .toBe("rgb(40, 80, 120)");
  await expect.poll(() => getComputedStyle(control.current!, "::before").opacity).toBe("1");
  expect(changed).toHaveBeenCalledWith(true, expect.any(String));
  await userEvent.keyboard(" ");
  await expect.element(consent).not.toBeChecked();
  const alerts = page.getByRole("switch", { name: "Alerts" });
  await expect.element(alerts).toBeChecked();
  await alerts.click();
  await expect.element(alerts).not.toBeChecked();
  await expect.element(page.getByRole("checkbox", { name: "Locked" })).toBeDisabled();
});

test("field validation and indeterminate semantics survive the replacement", async () => {
  await render(
    <Field.Root invalid>
      <Field.Label>Terms</Field.Label>
      <Checkbox indeterminate>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>
      <Field.Error match>Accept the terms</Field.Error>
    </Field.Root>,
  );
  const checkbox = page.getByRole("checkbox", { name: "Terms" });
  await expect.element(checkbox).toHaveAttribute("aria-checked", "mixed");
  await expect.element(checkbox).toHaveAttribute("aria-invalid", "true");
  await expect.element(page.getByText("Accept the terms")).toBeVisible();
});

test("checkbox group values and radio arrow navigation use Base UI group state", async () => {
  const changed = vi.fn();
  await render(
    <>
      <CheckboxGroup defaultValue={["one"]} onValueChange={changed} aria-label="Options">
        <Checkbox value="one" aria-label="One">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox>
        <Checkbox value="two" aria-label="Two">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
        </Checkbox>
      </CheckboxGroup>
      <RadioGroup defaultValue="red" aria-label="Color">
        <Radio value="red" aria-label="Red">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
        </Radio>
        <Radio value="blue" aria-label="Blue">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
        </Radio>
      </RadioGroup>
    </>,
  );
  await expect.element(page.getByRole("checkbox", { name: "One" })).toBeChecked();
  await page.getByRole("checkbox", { name: "Two" }).click();
  expect(changed).toHaveBeenCalledWith(["one", "two"], expect.any(Object));
  await page.getByRole("radio", { name: "Red" }).click();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("radio", { name: "Blue" })).toBeChecked();
  await expect.element(page.getByRole("radio", { name: "Blue" })).toHaveFocus();
});

test("range thumbs retain runtime positions and independent keyboard values", async () => {
  const control = createRef<HTMLDivElement>();
  const minimumThumb = createRef<HTMLDivElement>();
  const maximumThumb = createRef<HTMLDivElement>();
  await render(
    <Slider defaultValue={[20, 80]}>
      <Slider.Label>Price</Slider.Label>
      <Slider.Output />
      <Slider.Control ref={control}>
        <Slider.Track>
          <Slider.Fill />
        </Slider.Track>
        <Slider.Thumb ref={minimumThumb} index={0} aria-label="Minimum" />
        <Slider.Thumb ref={maximumThumb} index={1} aria-label="Maximum" />
      </Slider.Control>
    </Slider>,
  );
  const minimum = page.getByRole("slider", { name: "Minimum" });
  const maximum = page.getByRole("slider", { name: "Maximum" });
  await expect.element(minimum).toHaveAttribute("aria-valuenow", "20");
  minimum.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(minimum).toHaveAttribute("aria-valuenow", "21");
  await expect.element(maximum).toHaveAttribute("aria-valuenow", "80");
  expect(minimum.element().getBoundingClientRect().left).toBeLessThan(
    maximum.element().getBoundingClientRect().left,
  );
  await userEvent.keyboard("{Home}");
  await expect.element(minimum).toHaveAttribute("aria-valuenow", "0");
  maximum.element().focus();
  await userEvent.keyboard("{End}");
  await expect.element(maximum).toHaveAttribute("aria-valuenow", "100");
  await expect
    .poll(() => minimumThumb.current!.getBoundingClientRect().left)
    .toBeGreaterThanOrEqual(control.current!.getBoundingClientRect().left - 1);
  await expect
    .poll(() => maximumThumb.current!.getBoundingClientRect().right)
    .toBeLessThanOrEqual(control.current!.getBoundingClientRect().right + 1);
});

test("select keyboard selection closes popup and restores trigger focus", async () => {
  await render(
    <Select
      defaultValue="one"
      items={[
        { value: "one", label: "One" },
        { value: "two", label: "Two" },
      ]}
    >
      <Select.Label>Number</Select.Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner alignItemWithTrigger={false}>
          <Select.Popover>
            <Select.List>
              <Select.Item value="one">
                <Select.ItemText>One</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
              <Select.Item value="two">
                <Select.ItemText>Two</Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            </Select.List>
          </Select.Popover>
        </Select.Positioner>
      </Select.Portal>
    </Select>,
  );
  const trigger = page.getByRole("combobox", { name: "Number" });
  trigger.element().focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("listbox")).toBeVisible();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.element(trigger).toHaveTextContent("Two");
  await expect.element(trigger).toHaveFocus();
});

test("multiple combobox selection keeps chips and native array values", async () => {
  const changed = vi.fn();
  await render(
    <ComboBox multiple defaultValue={["Apple"]} items={["Apple", "Pear"]} onValueChange={changed}>
      <ComboBox.Label htmlFor="fruit">Fruit</ComboBox.Label>
      <ComboBox.Chips>
        <ComboBox.Value>
          {(values: string[]) =>
            values.map((value) => (
              <ComboBox.Chip key={value}>
                {value}
                <ComboBox.ChipRemove aria-label={`Remove ${value}`}>×</ComboBox.ChipRemove>
              </ComboBox.Chip>
            ))
          }
        </ComboBox.Value>
      </ComboBox.Chips>
      <ComboBox.InputGroup>
        <ComboBox.Input id="fruit" />
        <ComboBox.Trigger aria-label="Show fruit">
          <ComboBox.Indicator />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      <ComboBox.Portal>
        <ComboBox.Positioner>
          <ComboBox.Popover>
            <ComboBox.List>
              {(item: string) => (
                <ComboBox.Item key={item} value={item}>
                  {item}
                  <ComboBox.ItemIndicator />
                </ComboBox.Item>
              )}
            </ComboBox.List>
          </ComboBox.Popover>
        </ComboBox.Positioner>
      </ComboBox.Portal>
    </ComboBox>,
  );
  await page.getByRole("button", { name: "Show fruit" }).click();
  await page.getByRole("option", { name: "Pear" }).click();
  expect(changed).toHaveBeenCalledWith(["Apple", "Pear"], expect.any(Object));
  await userEvent.keyboard("{Escape}");
  await page.getByRole("button", { name: "Remove Apple" }).click();
  expect(changed).toHaveBeenLastCalledWith(["Pear"], expect.any(Object));
});

test("autocomplete popup escapes clipping, inherits scope and constrains its scrollable list", async () => {
  await render(
    <ThemeScope
      theme="dark"
      style={
        {
          width: 240,
          height: 60,
          overflow: "hidden",
          transform: "translateX(12px)",
          "--overlay": "rgb(15, 25, 35)",
        } as CSSProperties
      }
    >
      <Autocomplete items={Array.from({ length: 30 }, (_, index) => `Option ${index}`)}>
        <Autocomplete.Label>Search</Autocomplete.Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value placeholder="Choose an option" />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popover>
              <Autocomplete.Input aria-label="Filter options" />
              <Autocomplete.List>
                {(item: string) => (
                  <Autocomplete.Item key={item} value={item}>
                    {item}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popover>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete>
    </ThemeScope>,
  );
  await page.getByRole("combobox", { name: "Search" }).click();
  const list = page.getByRole("listbox");
  await expect.element(list).toBeVisible();
  const element = list.element();
  const popup = element.parentElement!;
  expect(getComputedStyle(popup).backgroundColor).toBe("rgb(15, 25, 35)");
  expect(element.getBoundingClientRect().height).toBeLessThanOrEqual(320);
  expect(element.scrollHeight).toBeGreaterThan(element.clientHeight);
  const input = page.getByRole("combobox", { name: "Search" }).element();
  await expect
    .poll(() => Math.abs(popup.getBoundingClientRect().width - input.getBoundingClientRect().width))
    .toBeLessThanOrEqual(2);
  const rect = element.getBoundingClientRect();
  expect(element.contains(document.elementFromPoint(rect.left + 8, rect.top + 8))).toBe(true);
  await page.getByLabelText("Filter options").fill("Option 29");
  await expect.element(page.getByRole("option", { name: "Option 29", exact: true })).toBeVisible();
  await expect
    .element(page.getByRole("option", { name: "Option 0", exact: true }))
    .not.toBeInTheDocument();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect
    .element(page.getByRole("combobox", { name: "Search" }))
    .toHaveTextContent("Option 29");
  await expect.element(page.getByRole("combobox", { name: "Search" })).toHaveFocus();
});
