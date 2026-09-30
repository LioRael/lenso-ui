/**
 * HeroUI v3.2.6 source adaptations. SPDX-License-Identifier: Apache-2.0
 *
 * Component-only coverage does not exercise the archived demos' render callbacks,
 * group label inheritance, formatting, or validation composition.
 */
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@lenso/tokens/styles.css";
import { Controlled as CheckboxControlled } from "../../../../../apps/docs/src/demos/en/checkbox/controlled.js";
import { Controlled as GroupControlled } from "../../../../../apps/docs/src/demos/en/checkbox-group/controlled.js";
import { Validation } from "../../../../../apps/docs/src/demos/en/checkbox-group/validation.js";
import { RenderProps as SwitchRenderProps } from "../../../../../apps/docs/src/demos/en/switch/render-props.js";
import { Range } from "../../../../../apps/docs/src/demos/en/slider/range.js";
import { FullRounded } from "../../../../../apps/docs/src/demos/en/checkbox/full-rounded.js";
import { FeaturesAndAddOns } from "../../../../../apps/docs/src/demos/en/checkbox-group/features-and-addons.js";
import { WithDescription } from "../../../../../apps/docs/src/demos/en/checkbox/with-description.js";
import { Invalid } from "../../../../../apps/docs/src/demos/en/checkbox/invalid.js";
import { Checkbox, Description, Switch, TextField } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { switchSupportingStyles } from "@lenso/tokens/switch";
import { DirectionProvider } from "@base-ui/react/direction-provider";

test("controlled checkbox demo retains keyboard focus and reflects native checked state", async () => {
  await render(<CheckboxControlled />);
  const checkbox = page.getByRole("checkbox", { name: "Email notifications" });
  checkbox.element().focus();
  await userEvent.keyboard(" ");
  await expect.element(checkbox).not.toBeChecked();
  await expect.element(checkbox).toHaveFocus();
  await expect.element(page.getByText("Status:", { exact: false })).toHaveTextContent("Disabled");
});

test("group demo labels its group without overwriting individual checkbox names", async () => {
  await render(<GroupControlled />);
  await expect.element(page.getByRole("group", { name: "Your skills" })).toBeVisible();
  await expect.element(page.getByRole("checkbox", { name: "Coding" })).toBeChecked();
  await expect.element(page.getByRole("checkbox", { name: "Design" })).toBeChecked();
  await page.getByRole("checkbox", { name: "Writing" }).click();
  await expect
    .element(page.getByText("Selected:", { exact: false }))
    .toHaveTextContent("coding, design, writing");
});

test("empty group validation marks native controls invalid and clears after selection", async () => {
  await render(<Validation />);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect
    .element(page.getByText("Please select at least one notification method."))
    .toBeVisible();
  const email = page.getByRole("checkbox", { name: "Email notifications" });
  await expect.element(email).toHaveAttribute("aria-invalid", "true");
  await email.click();
  await expect
    .element(page.getByText("Please select at least one notification method."))
    .not.toBeInTheDocument();
});

test("switch render callback updates its contents without losing native keyboard behavior", async () => {
  await render(<SwitchRenderProps />);
  const control = page.getByRole("switch", { name: "Disabled" });
  control.element().focus();
  await userEvent.keyboard(" ");
  await expect.element(page.getByRole("switch", { name: "Enabled" })).toBeChecked();
  await expect.element(page.getByRole("switch", { name: "Enabled" })).toHaveFocus();
});

test("range demo formats currency and changes only the focused thumb", async () => {
  await render(<Range />);
  const minimum = page.getByRole("slider", { name: "Minimum price" });
  const maximum = page.getByRole("slider", { name: "Maximum price" });
  minimum.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(minimum).toHaveAttribute("aria-valuenow", "150");
  await expect.element(maximum).toHaveAttribute("aria-valuenow", "500");
  await expect.element(page.getByText("$150.00 – $500.00")).toBeVisible();
  expect(minimum.element().getBoundingClientRect().left).toBeLessThan(
    maximum.element().getBoundingClientRect().left,
  );
});

test("native RTL context reverses range geometry and its increase key", async () => {
  await render(
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Range />
      </div>
    </DirectionProvider>,
  );
  const minimum = page.getByRole("slider", { name: "Minimum price" });
  const maximum = page.getByRole("slider", { name: "Maximum price" });
  minimum.element().focus();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(minimum).toHaveAttribute("aria-valuenow", "150");
  expect(minimum.element().getBoundingClientRect().left).toBeGreaterThan(
    maximum.element().getBoundingClientRect().left,
  );
});

test("rounded demo preserves source control dimensions and constrained checkmark sizing", async () => {
  const screen = await render(<FullRounded />);
  const widths = ["Small size", "Default size", "Large size", "Extra large size"].map((name) => {
    const checkbox = screen.getByRole("checkbox", { name, exact: true }).element();
    return checkbox.querySelector("[data-slot='checkbox-control']")!.getBoundingClientRect().width;
  });
  expect(widths).toEqual([12, 16, 20, 24]);
  const small = screen.getByRole("checkbox", { name: "Small size" }).element();
  const large = screen.getByRole("checkbox", { name: "Extra large size" }).element();
  expect(small.querySelector("svg")!.getBoundingClientRect().width).toBe(8);
  expect(large.querySelector("svg")!.getBoundingClientRect().width).toBe(12);
});

test("addon cards expose independent names and the corresponding descriptions", async () => {
  await render(<FeaturesAndAddOns />);
  const email = page.getByRole("checkbox", { name: "Email Notifications" });
  const sms = page.getByRole("checkbox", { name: "SMS Alerts" });
  await expect.element(email).toHaveAccessibleDescription("Receive updates via email");
  await expect.element(sms).toHaveAccessibleDescription("Get instant SMS notifications");
  await email.click();
  await sms.click();
  await expect.element(email).toBeChecked();
  await expect.element(sms).toBeChecked();
});

test("source descriptions and validation messages align under the checkbox label", async () => {
  const screen = await render(
    <>
      <WithDescription />
      <Invalid />
    </>,
  );
  const help = screen.getByText("Get notified when someone mentions you in a comment").element();
  const error = screen.getByText("You must accept the terms to continue").element();
  expect(getComputedStyle(help).paddingInlineStart).toBe("28px");
  expect(getComputedStyle(error).paddingInlineStart).toBe("28px");
  expect(getComputedStyle(error).color).toBe(getComputedStyle(help).color);
});

test("supporting maps compose across families and indent only direct help at every switch size", async () => {
  const supporting = [checkboxSupportingStyles.direct, switchSupportingStyles.direct];
  const screen = await render(
    <>
      <TextField>
        <Checkbox>
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Consent
          </Checkbox.Content>
          <Description xstyle={supporting}>Checkbox help</Description>
        </Checkbox>
      </TextField>
      {(["sm", "md", "lg"] as const).map((size) => (
        <TextField key={size}>
          <Switch size={size}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              {size}
            </Switch.Content>
            <Description xstyle={supporting}>{size} help</Description>
          </Switch>
        </TextField>
      ))}
      <TextField>
        <Switch>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <span>
              Inline label<Description xstyle={supporting}>Inline help</Description>
            </span>
          </Switch.Content>
        </Switch>
      </TextField>
    </>,
  );
  expect(getComputedStyle(screen.getByText("Checkbox help").element()).paddingInlineStart).toBe(
    "28px",
  );
  expect(getComputedStyle(screen.getByText("sm help").element()).paddingInlineStart).toBe("44px");
  expect(getComputedStyle(screen.getByText("md help").element()).paddingInlineStart).toBe("52px");
  expect(getComputedStyle(screen.getByText("lg help").element()).paddingInlineStart).toBe("60px");
  expect(getComputedStyle(screen.getByText("Inline help").element()).paddingInlineStart).toBe(
    "0px",
  );
});
