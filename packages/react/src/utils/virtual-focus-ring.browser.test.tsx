import type { CSSProperties } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import { Autocomplete } from "../components/autocomplete/index.js";
import { ComboBox } from "../components/combo-box/index.js";
import { ThemeScope } from "./theme-scope.js";

// DOM-focus ring coverage does not exercise options whose input retains focus.
for (const Component of [Autocomplete, ComboBox]) {
  const name = Component === Autocomplete ? "Autocomplete" : "ComboBox";
  for (const modality of ["keyboard", "pointer"] as const) {
    test(`${name} paints only keyboard virtual focus (${modality})`, async () => {
      const onItemHighlighted = vi.fn();
      const onOpenChange = vi.fn();
      const screen = await render(
        <ThemeScope
          theme="dark"
          style={{ padding: 24, "--ring-offset-width": "4px" } as CSSProperties}
        >
          <Component
            items={["Alpha", "Beta"]}
            onItemHighlighted={onItemHighlighted}
            onOpenChange={onOpenChange}
          >
            {Component === Autocomplete ? (
              <Component.Trigger data-testid="trigger">Choose</Component.Trigger>
            ) : (
              <Component.Input aria-label="Search" />
            )}
            <Component.Portal>
              <Component.Positioner>
                <Component.Popup>
                  {Component === Autocomplete && <Component.Input aria-label="Search" />}
                  <Component.List>
                    {(item: string) => (
                      <Component.Item key={item} value={item}>
                        {item}
                      </Component.Item>
                    )}
                  </Component.List>
                </Component.Popup>
              </Component.Positioner>
            </Component.Portal>
          </Component>
          <span
            data-testid="reference"
            style={{
              boxShadow: "0 0 0 4px var(--background), 0 0 0 6px var(--focus)",
            }}
          />
        </ThemeScope>,
      );
      if (Component === Autocomplete) {
        await screen.getByTestId("trigger").click();
      }
      const input = screen.getByRole("combobox", { name: "Search" });
      await input.fill("a");
      if (modality === "keyboard") {
        await userEvent.keyboard("{ArrowDown}");
      } else {
        await screen.getByRole("option", { name: "Beta" }).hover();
      }
      const option = screen.getByRole("option", {
        name: modality === "keyboard" ? "Alpha" : "Beta",
      });
      await expect.element(option).toHaveAttribute("data-highlighted");
      expect(document.activeElement).toBe(input.element());
      expect(option.element().matches(":focus-visible")).toBe(false);
      expect(input.element().getAttribute("aria-activedescendant")).toBe(option.element().id);
      expect(onItemHighlighted).toHaveBeenLastCalledWith(
        modality === "keyboard" ? "Alpha" : "Beta",
        expect.objectContaining({ reason: modality, event: expect.any(Event) }),
      );
      expect(onOpenChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ reason: expect.any(String) }),
      );
      await expect
        .poll(() => getComputedStyle(option.element()).boxShadow)
        .toBe(
          modality === "keyboard"
            ? getComputedStyle(screen.getByTestId("reference").element()).boxShadow
            : "none",
        );
      if (modality === "keyboard") {
        await screen.getByRole("option", { name: "Beta" }).hover();
        await expect
          .poll(
            () =>
              getComputedStyle(screen.getByRole("option", { name: "Beta" }).element()).boxShadow,
          )
          .toBe("none");
      }
    });
  }
}
