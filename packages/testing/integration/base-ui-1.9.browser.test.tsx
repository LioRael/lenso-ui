import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Autocomplete, ComboBox } from "@lenso/ui";

type Family = "Autocomplete" | "ComboBox";
const families: Family[] = ["Autocomplete", "ComboBox"];
const results = ["Alpha", "Gamma", "Unavailable"];

function Search({
  family,
  items,
  autoHighlight,
  onValueChange,
}: {
  family: Family;
  items: string[];
  autoHighlight: boolean;
  onValueChange: (value: string | null, details: BaseCombobox.Root.ChangeEventDetails) => void;
}) {
  const Parts = family === "Autocomplete" ? Autocomplete : ComboBox;
  return (
    <Parts items={items} autoHighlight={autoHighlight} onValueChange={onValueChange}>
      {family === "Autocomplete" ? (
        <Autocomplete.Trigger aria-label="Open search">
          <Autocomplete.Value placeholder="Open search" />
        </Autocomplete.Trigger>
      ) : (
        <ComboBox.Input aria-label="Search" />
      )}
      <Parts.Portal>
        <Parts.Positioner>
          <Parts.Popover>
            {family === "Autocomplete" && <Autocomplete.Input aria-label="Search" />}
            <Parts.List>
              {(item: string) => (
                <Parts.Item key={item} value={item} disabled={item === "Unavailable"}>
                  {item}
                </Parts.Item>
              )}
            </Parts.List>
          </Parts.Popover>
        </Parts.Positioner>
      </Parts.Portal>
    </Parts>
  );
}

// Existing appearance tests never deliver results after typing into an empty collection.
test.each(families)(
  "%s updates autoHighlight when async results arrive and change",
  async (family) => {
    const select = vi.fn();
    const screen = await render(
      <Search family={family} items={[]} autoHighlight onValueChange={select} />,
    );
    if (family === "Autocomplete")
      await screen.getByRole("combobox", { name: "Open search" }).click();
    const input = screen.getByRole("combobox", { name: "Search", exact: true });
    await input.click();
    await userEvent.keyboard("a");
    await expect.element(screen.getByRole("option")).not.toBeInTheDocument();
    await screen.rerender(
      <Search family={family} items={results} autoHighlight onValueChange={select} />,
    );
    await expect
      .element(screen.getByRole("option", { name: "Alpha", exact: true }))
      .toHaveAttribute("data-highlighted");
    await expect
      .element(screen.getByRole("option", { name: "Unavailable", exact: true }))
      .not.toHaveAttribute("data-highlighted");
    await screen.rerender(
      <Search
        family={family}
        items={["Gamma", "Unavailable"]}
        autoHighlight
        onValueChange={select}
      />,
    );
    await expect
      .element(screen.getByRole("option", { name: "Gamma", exact: true }))
      .toHaveAttribute("data-highlighted");
    await expect.element(input).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(select).toHaveBeenCalledWith("Gamma", expect.objectContaining({ reason: "item-press" }));
  },
);

test.each(families)(
  "%s leaves async results unhighlighted when autoHighlight is false",
  async (family) => {
    const select = vi.fn();
    const screen = await render(
      <Search family={family} items={[]} autoHighlight={false} onValueChange={select} />,
    );
    if (family === "Autocomplete")
      await screen.getByRole("combobox", { name: "Open search" }).click();
    await screen.getByRole("combobox", { name: "Search", exact: true }).click();
    await userEvent.keyboard("a");
    await screen.rerender(
      <Search family={family} items={results} autoHighlight={false} onValueChange={select} />,
    );
    await expect.element(screen.getByRole("option", { name: "Alpha", exact: true })).toBeVisible();
    expect(
      screen
        .getByRole("option")
        .elements()
        .some((item) => item.hasAttribute("data-highlighted")),
    ).toBe(false);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(select).toHaveBeenCalledWith("Alpha", expect.anything());
  },
);

// actionsRef used to opt out implicitly. Only an explicit close-event opt-out may retain the popup now.
test.each(families.flatMap((family) => [false, true].map((retain) => ({ family, retain }))))(
  "$family close lifecycle with preventUnmountOnClose=$retain",
  async ({ family, retain }) => {
    const Parts = family === "Autocomplete" ? Autocomplete : ComboBox;
    const actions = React.createRef<BaseCombobox.Root.Actions>();
    const popup = React.createRef<HTMLDivElement>();
    const openChange = vi.fn((open: boolean, details: BaseCombobox.Root.OpenChangeEventDetails) => {
      if (!open && retain) details.preventUnmountOnClose();
    });
    const screen = await render(
      <Parts items={results} actionsRef={actions} onOpenChange={openChange}>
        <Parts.Trigger aria-label="Open search">
          <Parts.Value placeholder="Open search" />
        </Parts.Trigger>
        <Parts.Portal>
          <Parts.Positioner>
            <Parts.Popover ref={popup}>
              <Parts.Input aria-label="Search" />
              <Parts.List>
                {(item: string) => (
                  <Parts.Item key={item} value={item}>
                    {item}
                  </Parts.Item>
                )}
              </Parts.List>
            </Parts.Popover>
          </Parts.Positioner>
        </Parts.Portal>
      </Parts>,
    );
    const trigger = screen.getByRole("combobox", { name: "Open search" });
    await trigger.click();
    await expect.element(screen.getByRole("listbox")).toBeVisible();
    const element = popup.current;
    expect(element).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    expect(openChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "escape-key" }),
    );
    if (retain) {
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
      expect(popup.current).toBe(element);
      expect(element?.isConnected).toBe(true);
      actions.current?.unmount();
    }
    await expect.poll(() => popup.current).toBeNull();
    await expect.element(trigger).toHaveFocus();
  },
);
