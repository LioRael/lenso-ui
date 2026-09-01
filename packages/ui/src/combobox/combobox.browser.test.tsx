import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Combobox } from "./index.js";

const options = ["Default", "Hover", "Selected", "Disabled"] as const;

function ItemBoard({ theme }: { theme: "dark" | "light" }) {
  return (
    <ThemeScope theme={theme}>
      <Combobox.Root defaultOpen defaultValue={["Selected"]} items={options} multiple>
        <Combobox.Input aria-label={`${theme} labels`} />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.List>
                {(option: string) => (
                  <Combobox.Item
                    data-visual-state={option === "Hover" ? "hover" : undefined}
                    disabled={option === "Disabled"}
                    key={option}
                    value={option}
                  >
                    <Combobox.ItemIndicator />
                    <Combobox.Marker />
                    <Combobox.ItemText>{option}</Combobox.ItemText>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </ThemeScope>
  );
}

for (const [theme, hoverSurface, indicatorBorder] of [
  ["light", "rgb(240, 240, 241)", "rgb(216, 216, 216)"],
  ["dark", "rgb(57, 58, 61)", "rgb(63, 64, 68)"],
] as const) {
  test(`Combobox items match Figma anatomy and states in ${theme} mode`, async () => {
    const screen = await render(<ItemBoard theme={theme} />);
    await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBe(4);

    const defaultItem = screen.getByRole("option", { name: "Default" }).element();
    const hoverItem = screen.getByRole("option", { name: "Hover" }).element();
    const selectedItem = screen.getByRole("option", { name: "Selected" }).element();
    const disabledItem = screen.getByRole("option", { name: "Disabled" }).element();

    const indicator = defaultItem.querySelector<HTMLElement>(
      '[data-slot="combobox-item-indicator"]',
    );
    const marker = defaultItem.querySelector<HTMLElement>('[data-slot="combobox-marker"]');
    const text = defaultItem.querySelector<HTMLElement>('[data-slot="combobox-item-text"]');
    expect(indicator).not.toBeNull();
    expect(marker).not.toBeNull();
    expect(text).not.toBeNull();

    const itemRect = defaultItem.getBoundingClientRect();
    expect(indicator!.getBoundingClientRect().x - itemRect.x).toBe(15);
    expect(marker!.getBoundingClientRect().x - itemRect.x).toBe(39.5);
    expect(text!.getBoundingClientRect().x - itemRect.x).toBe(60);

    const defaultIndicatorStyle = getComputedStyle(indicator!);
    expect(defaultIndicatorStyle.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(defaultIndicatorStyle.borderColor).toBe(indicatorBorder);
    expect(defaultIndicatorStyle.borderRadius).toBe("3px");

    const selectedIndicator = selectedItem.querySelector<HTMLElement>(
      '[data-slot="combobox-item-indicator"]',
    );
    expect(getComputedStyle(selectedIndicator!).backgroundColor).toBe("rgb(94, 106, 210)");
    expect(getComputedStyle(selectedIndicator!).borderColor).toBe("rgb(94, 106, 210)");
    expect(getComputedStyle(selectedIndicator!).color).toBe("rgb(255, 255, 255)");

    const hoverLayer = getComputedStyle(hoverItem, "::before");
    expect(hoverLayer.backgroundColor).toBe(hoverSurface);
    expect(hoverLayer.borderRadius).toBe("8px");
    expect(hoverLayer.left).toBe("6px");
    expect(hoverLayer.right).toBe("6px");
    expect(getComputedStyle(disabledItem).opacity).toBe("0.45");
    await screen.getByRole("option", { name: "Disabled" }).hover();
    expect(getComputedStyle(disabledItem, "::before").backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });
}

test("consumer-owned indicators keep Base UI presence semantics", async () => {
  await render(
    <Combobox.Root defaultOpen items={["Custom"]}>
      <Combobox.Input aria-label="Custom label" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List>
              <Combobox.Item value="Custom">
                <Combobox.ItemIndicator>
                  <span data-testid="custom-indicator">Chosen</span>
                </Combobox.ItemIndicator>
                Custom
              </Combobox.Item>
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>,
  );

  expect(document.querySelector('[data-testid="custom-indicator"]')).toBeNull();
});

test("Combobox input focus does not add a focus decoration", async () => {
  const screen = await render(
    <Combobox.Root items={["One"]}>
      <Combobox.InputGroup>
        <Combobox.Input aria-label="focusless input" />
      </Combobox.InputGroup>
    </Combobox.Root>,
  );

  const input = screen.getByRole("combobox", { name: "focusless input" });
  await userEvent.click(input);

  const inputGroup = document.querySelector<HTMLElement>('[data-slot="combobox-input-group"]');
  expect(inputGroup).not.toBeNull();
  expect(getComputedStyle(inputGroup!).outlineStyle).toBe("none");
  expect(getComputedStyle(inputGroup!).outlineWidth).toBe("0px");
  expect(getComputedStyle(input.element()).outlineStyle).toBe("none");
});

test("single Combobox uses a trailing check, metadata, and an empty input after selection", async () => {
  const screen = await render(
    <Combobox.Root defaultOpen defaultValue="Selected" items={options}>
      <Combobox.Input aria-label="single labels" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List>
              {(option: string) => (
                <Combobox.Item key={option} value={option}>
                  <Combobox.Marker />
                  <Combobox.ItemText>{option}</Combobox.ItemText>
                  <Combobox.ItemIndicator />
                  <Combobox.Trailing>
                    {options.indexOf(option as (typeof options)[number])}
                  </Combobox.Trailing>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>,
  );

  const selectedItem = screen.getByRole("option", { name: "Selected" }).element();
  const defaultItem = screen.getByRole("option", { name: "Default" }).element();
  const indicator = selectedItem.querySelector<HTMLElement>(
    '[data-slot="combobox-item-indicator"]',
  );
  const trailing = selectedItem.querySelector<HTMLElement>('[data-slot="combobox-trailing"]');
  const list = document.querySelector('[data-slot="combobox-list"]');

  expect(selectedItem.getAttribute("data-selection-mode")).toBe("single");
  expect(list?.getAttribute("aria-multiselectable")).toBeNull();
  expect(indicator).not.toBeNull();
  expect(getComputedStyle(indicator!).borderStyle).toBe("none");
  expect(getComputedStyle(indicator!).color).not.toBe("rgba(0, 0, 0, 0)");
  expect(trailing?.textContent).toBe("2");

  const trailingStyle = getComputedStyle(trailing!);
  expect(trailingStyle.color).toBe("rgb(111, 110, 119)");
  expect(trailingStyle.fontFamily).toContain("Inter");
  expect(trailingStyle.fontSize).toBe("13px");
  expect(trailingStyle.fontWeight).toBe("400");
  expect(trailingStyle.fontVariantNumeric).toBe("tabular-nums");
  expect(trailingStyle.marginInlineStart).toBe("-10.5px");

  const indicatorRect = indicator!.getBoundingClientRect();
  const trailingRect = trailing!.getBoundingClientRect();
  const itemRect = selectedItem.getBoundingClientRect();
  expect(trailingRect.left - indicatorRect.right).toBe(0);
  expect(itemRect.right - trailingRect.right).toBe(12);

  const input = screen.getByRole("combobox", { name: "single labels" });
  await input.fill("def");
  await userEvent.click(defaultItem);
  expect((input.element() as HTMLInputElement).value).toBe("");
});
