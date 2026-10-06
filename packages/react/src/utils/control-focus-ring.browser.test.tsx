import type { CSSProperties, ReactNode } from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import { Button } from "../components/button/index.js";
import { ButtonGroup } from "../components/button-group/index.js";
import { Checkbox } from "../components/checkbox/index.js";
import { Link } from "../components/link/index.js";
import { Radio } from "../components/radio/index.js";
import { RadioGroup } from "../components/radio-group/index.js";
import { Select } from "../components/select/index.js";
import { Slider } from "../components/slider/index.js";
import { Switch } from "../components/switch/index.js";
import { Table } from "../components/table/index.js";
import { ToggleButton } from "../components/toggle-button/index.js";
import { ToggleButtonGroup } from "../components/toggle-button-group/index.js";
import { ThemeScope, type Theme } from "./theme-scope.js";

// HeroUI v3.2.6 (e385ac2), focus-ring.css: the gap is painted background,
// not empty outline space. Existing behavior tests did not prove token-driven
// offsets, painted gaps, or the distinction between outer and inset rings.
const outerRing =
  "0 0 0 var(--ring-offset-width) var(--background), " +
  "0 0 0 calc(var(--ring-offset-width) + 2px) var(--focus)";
const insetRing = "inset 0 0 0 2px var(--focus)";
const environments: { theme: Theme; offset: number | undefined }[] = [
  { theme: "light", offset: undefined },
  { theme: "dark", offset: undefined },
  { theme: "light", offset: 4 },
  { theme: "dark", offset: 4 },
];

function Fixture({
  theme,
  offset,
  children,
}: {
  theme: Theme;
  offset: number | undefined;
  children: ReactNode;
}) {
  return (
    <ThemeScope
      theme={theme}
      style={
        {
          padding: 24,
          width: 320,
          ...(offset === undefined ? {} : { "--ring-offset-width": `${offset}px` }),
        } as CSSProperties
      }
    >
      <button type="button">Before control</button>
      {children}
      <span data-testid="outer-reference" style={{ boxShadow: outerRing }} />
      <span data-testid="inset-reference" style={{ boxShadow: insetRing }} />
      <span data-testid="elevation-reference" style={{ boxShadow: "var(--field-shadow)" }} />
    </ThemeScope>
  );
}

function SelectFixture() {
  return (
    <Select defaultValue="first">
      <Select.Trigger aria-label="Choose item" data-testid="focus-owner">
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popover>
            <Select.List>
              <Select.Item value="first">
                <Select.ItemText>First item</Select.ItemText>
              </Select.Item>
              <Select.Item value="second">
                <Select.ItemText>Second item</Select.ItemText>
              </Select.Item>
            </Select.List>
          </Select.Popover>
        </Select.Positioner>
      </Select.Portal>
    </Select>
  );
}

const controls = [
  { name: "Button", element: <Button data-testid="focus-owner">Action</Button> },
  {
    name: "Link",
    element: (
      <Link href="#focus-test" data-testid="focus-owner">
        Navigate
      </Link>
    ),
  },
  {
    name: "Checkbox visual control",
    elevation: true,
    element: (
      <Checkbox aria-label="Receive updates" data-testid="focus-owner">
        <Checkbox.Content>
          <Checkbox.Control data-testid="painted-control" />
          Updates
        </Checkbox.Content>
      </Checkbox>
    ),
  },
  {
    name: "Radio visual control",
    elevation: true,
    element: (
      <RadioGroup aria-label="Delivery" defaultValue="email">
        <Radio value="email" aria-label="Email" data-testid="focus-owner">
          <Radio.Content>
            <Radio.Control data-testid="painted-control" />
            Email
          </Radio.Content>
        </Radio>
      </RadioGroup>
    ),
  },
  {
    name: "Switch visual control",
    element: (
      <Switch aria-label="Enable alerts" data-testid="focus-owner">
        <Switch.Content>
          <Switch.Control data-testid="painted-control">
            <Switch.Thumb />
          </Switch.Control>
          Alerts
        </Switch.Content>
      </Switch>
    ),
  },
  { name: "Select trigger", elevation: true, element: <SelectFixture /> },
  {
    name: "Slider thumb",
    rangeInput: true,
    element: (
      <Slider defaultValue={30}>
        <Slider.Label>Volume</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb data-testid="focus-owner" />
          </Slider.Track>
        </Slider.Control>
      </Slider>
    ),
  },
];

// Split shadow layers without splitting commas in browser-resolved rgb colors.
function shadowLayers(shadow: string): string[] {
  return shadow.split(/,(?![^(]*\))/).map((layer) => layer.trim());
}

async function expectRing(target: Element, reference: Element, elevation?: Element) {
  const expected = shadowLayers(getComputedStyle(reference).boxShadow);
  expect(expected).toHaveLength(
    reference.getAttribute("data-testid") === "inset-reference" ? 1 : 2,
  );
  expect(getComputedStyle(reference).boxShadow).not.toBe("none");
  if (elevation) expected.push(...shadowLayers(getComputedStyle(elevation).boxShadow));
  await expect
    .poll(() => shadowLayers(getComputedStyle(target).boxShadow), { timeout: 500 })
    .toEqual(expected);
  expect(getComputedStyle(target).outlineStyle).toBe("none");
  expect(target.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(target.getBoundingClientRect().height).toBeGreaterThan(0);
}

for (const { theme, offset } of environments) {
  const environment = `${theme}, ${offset === undefined ? "theme default" : `${offset}px`} offset`;
  for (const control of controls) {
    test(`${control.name}: keyboard ring paints source colors and gap (${environment})`, async () => {
      const screen = await render(
        <Fixture theme={theme} offset={offset}>
          {control.element}
        </Fixture>,
      );
      const root = screen.getByTestId("focus-owner").element();
      const owner = "rangeInput" in control ? root.querySelector("input[type=range]") : root;
      expect(owner).not.toBeNull();
      await screen.getByRole("button", { name: "Before control" }).click();
      await userEvent.tab();
      expect(document.activeElement).toBe(owner);
      expect(owner!.matches(":focus-visible")).toBe(true);
      const target = screen.container.querySelector('[data-testid="painted-control"]') ?? root;
      const reference = screen.getByTestId("outer-reference").element();
      expect(getComputedStyle(reference).getPropertyValue("--ring-offset-width").trim()).toBe(
        `${offset ?? 2}px`,
      );
      await expectRing(
        target,
        reference,
        "elevation" in control ? screen.getByTestId("elevation-reference").element() : undefined,
      );
    });
  }

  test(`Select item has an outer ring, not a negative-offset outline (${environment})`, async () => {
    const screen = await render(
      <Fixture theme={theme} offset={offset}>
        <SelectFixture />
      </Fixture>,
    );
    await screen.getByRole("button", { name: "Before control" }).click();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByTestId("focus-owner").element());
    await userEvent.keyboard("{Enter}");
    const selected = screen.getByRole("option", { name: "First item" });
    await expect.element(selected).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const item = screen.getByRole("option", { name: "Second item" }).element();
    await expect.poll(() => document.activeElement).toBe(item);
    expect(item.matches(":focus-visible")).toBe(true);
    await expectRing(item, screen.getByTestId("outer-reference").element());
    await userEvent.keyboard("{Escape}");
  });

  for (const kind of ["ButtonGroup", "ToggleButtonGroup"] as const) {
    const referenceId = kind === "ButtonGroup" ? "outer-reference" : "inset-reference";
    const geometry = kind === "ButtonGroup" ? "outer ring and painted gap" : "true 2px inset ring";
    test(`${kind} keeps its source ${geometry} (${environment})`, async () => {
      const screen = await render(
        <Fixture theme={theme} offset={offset}>
          {kind === "ButtonGroup" ? (
            <ButtonGroup aria-label="Actions">
              <Button>First action</Button>
              <Button>Second action</Button>
            </ButtonGroup>
          ) : (
            <ToggleButtonGroup aria-label="Actions">
              <ToggleButton value="first">First action</ToggleButton>
              <ToggleButton value="second">Second action</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Fixture>,
      );
      await screen.getByRole("button", { name: "Before control" }).click();
      await userEvent.tab();
      const first = screen.getByRole("button", { name: "First action" }).element();
      expect(document.activeElement).toBe(first);
      expect(first.matches(":focus-visible")).toBe(true);
      await expectRing(first, screen.getByTestId(referenceId).element());
    });
  }

  test(`Table header and cell retain inset focus (${environment})`, async () => {
    const screen = await render(
      <Fixture theme={theme} offset={offset}>
        <Table>
          <Table.Content aria-label="People">
            <Table.Header>
              <Table.Column columnKey="name">Name</Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row itemKey="a">
                <Table.Cell>Alpha</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table>
      </Fixture>,
    );
    await screen.getByRole("button", { name: "Before control" }).click();
    const reference = screen.getByTestId("inset-reference").element();
    for (const owner of [
      screen.getByRole("columnheader", { name: "Name" }).element(),
      screen.getByRole("cell", { name: "Alpha" }).element(),
    ]) {
      await userEvent.tab();
      expect(document.activeElement).toBe(owner);
      expect(owner.matches(":focus-visible")).toBe(true);
      await expectRing(owner, reference);
    }
  });
}

test("pointer focus on an ordinary action does not paint a keyboard ring", async () => {
  const screen = await render(
    <Fixture theme="light" offset={4}>
      <Button>Action</Button>
    </Fixture>,
  );
  await screen.getByRole("button", { name: "Before control" }).click();
  const button = screen.getByRole("button", { name: "Action" });
  await button.click();
  expect(document.activeElement).toBe(button.element());
  expect(button.element().matches(":focus-visible")).toBe(false);
  await expect
    .poll(() => getComputedStyle(button.element()).boxShadow, { timeout: 500 })
    .toBe("none");
  expect(getComputedStyle(button.element()).outlineStyle).toBe("none");
});
