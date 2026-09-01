import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { CommandMenu } from "./index.js";

const commands = ["Assign to…", "Change status…", "Set due date…"];

function RuntimeCommandMenu({ theme }: { theme: "dark" | "light" }) {
  return (
    <ThemeScope theme={theme}>
      <CommandMenu.Root items={commands}>
        <CommandMenu.Panel data-testid={`${theme}-command-menu`}>
          <CommandMenu.Search>
            <CommandMenu.Input
              aria-label={`${theme} command search`}
              placeholder="Type a command or search…"
            />
            <CommandMenu.SearchHint>Ask Linear　 Tab</CommandMenu.SearchHint>
          </CommandMenu.Search>
          <CommandMenu.GroupLabel>Commands</CommandMenu.GroupLabel>
          <CommandMenu.List>
            {(command: string) => (
              <CommandMenu.Item key={command} value={command}>
                <CommandMenu.ItemText>{command}</CommandMenu.ItemText>
                <CommandMenu.Shortcut>S</CommandMenu.Shortcut>
              </CommandMenu.Item>
            )}
          </CommandMenu.List>
          <CommandMenu.Empty>No commands found</CommandMenu.Empty>
        </CommandMenu.Panel>
      </CommandMenu.Root>
    </ThemeScope>
  );
}

test("Command Menu supports keyboard filtering and Light/Dark semantic themes", async () => {
  const screen = await render(
    <>
      <RuntimeCommandMenu theme="light" />
      <RuntimeCommandMenu theme="dark" />
    </>,
  );
  await document.fonts.load('400 15px "Inter"', "Assign to");

  const input = screen.getByRole("combobox", { name: "light command search" });
  await userEvent.click(input);
  await userEvent.keyboard("{ArrowDown}");
  await expect.poll(() => document.activeElement === input.element()).toBe(true);
  await expect
    .poll(
      () =>
        screen
          .getByTestId("light-command-menu")
          .element()
          .querySelectorAll('[data-slot="command-menu-item"][data-highlighted]').length,
    )
    .toBe(1);

  await userEvent.type(input, "status");
  await expect
    .poll(
      () =>
        screen
          .getByTestId("light-command-menu")
          .element()
          .querySelector('[data-slot="command-menu-item-text"]')?.textContent,
    )
    .toBe("Change status…");
  await expect
    .poll(
      () => getComputedStyle(screen.getByTestId("light-command-menu").element()).backgroundColor,
    )
    .toBe("rgb(255, 255, 255)");
  await expect
    .poll(() => getComputedStyle(screen.getByTestId("dark-command-menu").element()).backgroundColor)
    .toBe("rgb(40, 41, 43)");
  expect(
    (
      await axe.run(screen.getByTestId("light-command-menu").element(), {
        rules: { region: { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
});
