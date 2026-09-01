import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Disclosure } from "./index.js";

function Item({ disabled, label, value }: { disabled?: boolean; label: string; value: string }) {
  return (
    <Disclosure.Item {...(disabled ? { disabled: true } : {})} value={value}>
      <Disclosure.Header>
        <Disclosure.Trigger>
          {label} <Disclosure.Icon />
        </Disclosure.Trigger>
      </Disclosure.Header>
      <Disclosure.Panel>{label} content</Disclosure.Panel>
    </Disclosure.Item>
  );
}

test("Disclosure preserves Base UI state, keyboard semantics, theming, and composition", async () => {
  const screen = await render(
    <>
      <Disclosure.Root defaultValue={["first"]} data-testid="single-root">
        <Item label="First" value="first" />
        <Item label="Second" value="second" />
        <Item disabled label="Disabled" value="disabled" />
      </Disclosure.Root>
      <Disclosure.Root defaultValue={["first"]} data-testid="multiple-root" multiple>
        <Item label="Multiple first" value="first" />
        <Item label="Multiple second" value="second" />
      </Disclosure.Root>
      <ThemeScope style={{ background: "var(--color-surface-canvas)" }} theme="dark">
        <Disclosure.Root>
          <Disclosure.Item value="dark">
            <Disclosure.Header>
              <Disclosure.Trigger data-testid="dark-trigger">
                Dark
                <Disclosure.Icon>
                  <span data-testid="custom-icon">+</span>
                </Disclosure.Icon>
              </Disclosure.Trigger>
            </Disclosure.Header>
            <Disclosure.Panel>Dark content</Disclosure.Panel>
          </Disclosure.Item>
        </Disclosure.Root>
      </ThemeScope>
      <Disclosure.Root defaultValue={["auto"]}>
        <Disclosure.Item value="auto">
          <Disclosure.Header>
            <Disclosure.Trigger>Auto layout</Disclosure.Trigger>
          </Disclosure.Header>
          <Disclosure.Panel data-testid="auto-panel" layout="auto">
            Flexible content
          </Disclosure.Panel>
        </Disclosure.Item>
      </Disclosure.Root>
    </>,
  );

  const singleRoot = screen.getByTestId("single-root");
  const first = singleRoot.getByRole("button", { name: "First" });
  const second = singleRoot.getByRole("button", { name: "Second" });
  const disabled = singleRoot.getByRole("button", { name: "Disabled" });
  expect(first.element().getAttribute("aria-expanded")).toBe("true");
  second.element().focus();
  await userEvent.keyboard(" ");
  expect(first.element().getAttribute("aria-expanded")).toBe("false");
  expect(second.element().getAttribute("aria-expanded")).toBe("true");

  const multipleRoot = screen.getByTestId("multiple-root");
  const multipleSecond = multipleRoot.getByRole("button", { name: "Multiple second" });
  await userEvent.click(multipleSecond);
  expect(
    multipleRoot
      .getByRole("button", { name: "Multiple first" })
      .element()
      .getAttribute("aria-expanded"),
  ).toBe("true");
  expect(multipleSecond.element().getAttribute("aria-expanded")).toBe("true");

  expect(disabled.element().getAttribute("aria-disabled")).toBe("true");
  expect(getComputedStyle(disabled.element()).opacity).toBe("0.5");
  expect(disabled.element().getAttribute("aria-expanded")).toBe("false");
  expect(getComputedStyle(screen.getByTestId("dark-trigger").element()).color).toBe(
    "rgb(212, 212, 212)",
  );
  expect(screen.getByTestId("custom-icon").element().textContent).toBe("+");
  expect(screen.getByTestId("auto-panel").element().getAttribute("data-layout")).toBe("auto");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
