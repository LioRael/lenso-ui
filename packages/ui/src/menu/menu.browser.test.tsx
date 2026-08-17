import * as stylex from "@stylexjs/stylex";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { CalendarIcon, FileIcon, FlagIcon, LinkIcon, StarIcon, Trash2Icon } from "lucide-react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Menu } from "./index.js";
import { styles } from "./menu.stylex.js";

const rows = [
  ["Due date", CalendarIcon, "⇧ D", "hover"],
  ["Add link…", LinkIcon, "⌃ L"],
  ["Add document…", FileIcon],
  null,
  ["Create related", StarIcon, "›"],
  ["Mark as", FlagIcon, "›"],
  null,
  ["Copy", FileIcon, "›"],
  ["Convert to", FileIcon, "›"],
  null,
  ["Favorite", StarIcon, "⌥ F"],
  ["Remind me", CalendarIcon, "⇧ H ›"],
  null,
  ["Run loop on TES-14…", FileIcon],
  null,
  ["Show description history", FileIcon],
  ["Delete", Trash2Icon, "⌘ ⌫", "danger"],
] as const;

const overlayShadow =
  "rgba(0, 0, 0, 0.125) 0px 1px 1px 0px, rgba(0, 0, 0, 0.125) 0px 2px 5px 0px, rgba(0, 0, 0, 0.125) 0px 3px 8px 0px";

function PreviewRow({ row }: { row: Exclude<(typeof rows)[number], null> }) {
  const [label, Icon, shortcut, state] = row;
  return (
    <div
      data-visual-state={state}
      {...stylex.props(styles.item, state === "danger" && styles.danger)}
    >
      <span {...stylex.props(styles.leading)}>
        <Icon size={16} strokeWidth={1.5} />
      </span>
      <span {...stylex.props(styles.label)}>{label}</span>
      {shortcut && (
        <span data-slot="menu-trailing" {...stylex.props(styles.trailing, styles.shortcut)}>
          {shortcut}
        </span>
      )}
    </div>
  );
}

test("Menu matches Figma and preserves Base UI interaction", async () => {
  const screen = await render(
    <>
      <div
        data-testid="menu-figma-state-board"
        style={{
          alignItems: "center",
          background: "#fafafa",
          display: "flex",
          height: 489,
          justifyContent: "center",
          width: 242,
        }}
      >
        <div data-testid="menu-preview" {...stylex.props(styles.popup)}>
          {rows.map((row, index) =>
            row ? (
              <PreviewRow key={row[0]} row={row} />
            ) : (
              <div
                key={`separator-${index}`}
                data-slot="menu-separator"
                {...stylex.props(styles.separator)}
              >
                <span {...stylex.props(styles.separatorLine)} />
              </div>
            ),
          )}
        </div>
      </div>
      <ThemeScope theme="light">
        <Menu.Root>
          <Menu.Trigger>Issue actions</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup aria-label="Issue actions" data-testid="runtime-menu">
                <Menu.LinkItem href="#open">Open issue</Menu.LinkItem>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger icon={<span data-testid="custom-submenu-icon">→</span>}>
                    Create related
                  </Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner side="right">
                      <Menu.Popup submenu aria-label="Related actions">
                        <Menu.Item>Create sub-issue</Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
                <Menu.Item tone="danger">Delete</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </ThemeScope>
    </>,
  );
  await document.fonts.load('400 13px "Inter"', "Due date");
  const preview = screen.getByTestId("menu-preview");
  await expect.poll(() => getComputedStyle(preview.element()).width).toBe("210px");
  expect(getComputedStyle(preview.element()).borderColor).toBe("rgb(216, 216, 216)");
  expect(getComputedStyle(preview.element()).boxShadow).toBe(overlayShadow);
  const highlightedRow = preview
    .element()
    .querySelector<HTMLElement>('[data-visual-state="hover"]')!;
  await expect
    .poll(() => getComputedStyle(highlightedRow).backgroundColor)
    .toBe("rgb(240, 240, 241)");
  expect(getComputedStyle(highlightedRow.querySelector('[data-slot="menu-trailing"]')!).color).toBe(
    "rgb(51, 51, 51)",
  );
  expect(
    preview.element().querySelector('[data-slot="menu-separator"]')?.getBoundingClientRect().width,
  ).toBe(209);
  expect(Math.round(preview.element().getBoundingClientRect().height)).toBe(457);
  const trigger = screen.getByRole("button", { name: "Issue actions" });
  await userEvent.click(trigger);
  await expect.element(screen.getByTestId("runtime-menu")).toBeVisible();
  expect(screen.getByRole("menuitem", { name: "Open issue" }).element().tagName).toBe("A");
  expect(screen.getByTestId("custom-submenu-icon").element().textContent).toBe("→");
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
  const submenuItem = screen.getByRole("menuitem", { name: "Create sub-issue" });
  await expect.element(submenuItem).toBeVisible();
  expect(
    getComputedStyle(submenuItem.element().closest('[data-slot="menu-popup"]')!).boxShadow,
  ).toBe(overlayShadow);
  await userEvent.keyboard("{Escape}");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.activeElement === trigger.element()).toBe(true);
});
