import { themeColor } from "../shared/test-theme.js";
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

function MenuPreview({ theme }: { theme: "light" | "dark" }) {
  return (
    <ThemeScope theme={theme}>
      <div
        aria-hidden="true"
        data-testid={`menu-${theme}-state-board`}
        style={{
          alignItems: "center",
          background: theme === "light" ? "#fafafa" : "#121212",
          display: "flex",
          height: 489,
          justifyContent: "center",
          width: 242,
        }}
      >
        <div data-testid={`menu-${theme}-preview`} {...stylex.props(styles.popup)}>
          {rows.map((row, index) =>
            row ? (
              <PreviewRow key={row[0]} row={row} />
            ) : (
              <div
                data-testid={`menu-${theme}-separator-${index}`}
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
    </ThemeScope>
  );
}

test("Menu resolves semantic tokens and preserves Base UI interaction", async () => {
  const screen = await render(
    <>
      <MenuPreview theme="light" />
      <MenuPreview theme="dark" />
      <ThemeScope theme="light">
        <Menu.Root>
          <Menu.Trigger>Issue actions</Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner>
              <Menu.Popup aria-label="Issue actions" data-testid="runtime-menu">
                <Menu.LinkItem href="#open">Open issue</Menu.LinkItem>
                <Menu.Separator data-testid="runtime-separator" />
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
  const preview = screen.getByTestId("menu-light-preview");
  await expect.poll(() => getComputedStyle(preview.element()).width).toBe("210px");
  expect(getComputedStyle(preview.element()).borderColor).toBe(
    themeColor("light", "color.border.decorative"),
  );

  const highlightedRow = preview
    .element()
    .querySelector<HTMLElement>('[data-visual-state="hover"]')!;
  await expect
    .poll(() => getComputedStyle(highlightedRow).backgroundColor)
    .toBe(themeColor("light", "color.surface.interactiveHover"));
  expect(getComputedStyle(highlightedRow.querySelector('[data-slot="menu-trailing"]')!).color).toBe(
    themeColor("light", "color.content.secondary"),
  );
  expect(
    preview.element().querySelector('[data-slot="menu-separator"]')?.getBoundingClientRect().width,
  ).toBe(209);
  expect(Math.round(preview.element().getBoundingClientRect().height)).toBe(457);
  const lightSeparator = screen.getByTestId("menu-light-separator-3").element();
  const darkSeparator = screen.getByTestId("menu-dark-separator-3").element();
  expect(lightSeparator.getBoundingClientRect().width).toBe(209);
  expect(darkSeparator.getBoundingClientRect().width).toBe(209);
  expect(getComputedStyle(lightSeparator.firstElementChild!).backgroundColor).toBe(
    themeColor("light", "color.border.decorative"),
  );
  expect(getComputedStyle(darkSeparator.firstElementChild!).backgroundColor).toBe(
    themeColor("dark", "color.border.menuSeparator"),
  );
  expect(getComputedStyle(screen.getByTestId("menu-dark-preview").element()).backgroundColor).toBe(
    themeColor("dark", "color.surface.popover"),
  );
  const trigger = screen.getByRole("button", { name: "Issue actions" });
  await userEvent.click(trigger);
  await expect.element(screen.getByTestId("runtime-menu")).toBeVisible();
  const openIssue = screen.getByRole("menuitem", { name: "Open issue" }).element();
  const runtimeSeparator = screen.getByTestId("runtime-separator").element();
  const createRelated = screen.getByRole("menuitem", { name: "Create related" }).element();
  expect(openIssue.tagName).toBe("A");
  expect(runtimeSeparator.tagName).toBe("HR");
  await expect.poll(() => Math.round(runtimeSeparator.getBoundingClientRect().width)).toBe(209);
  expect(Math.round(runtimeSeparator.getBoundingClientRect().height)).toBe(12);
  expect(getComputedStyle(runtimeSeparator).marginBlockStart).toBe("0px");
  expect(getComputedStyle(runtimeSeparator).marginBlockEnd).toBe("0px");
  expect(
    Math.round(
      runtimeSeparator.getBoundingClientRect().top - openIssue.getBoundingClientRect().bottom,
    ),
  ).toBe(0);
  expect(
    Math.round(
      createRelated.getBoundingClientRect().top - runtimeSeparator.getBoundingClientRect().bottom,
    ),
  ).toBe(0);
  expect(screen.getByTestId("custom-submenu-icon").element().textContent).toBe("→");
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
  const submenuItem = screen.getByRole("menuitem", { name: "Create sub-issue" });
  await expect.element(submenuItem).toBeVisible();

  await userEvent.keyboard("{Escape}");
  expect(
    (
      await axe.run(screen.getByTestId("runtime-menu").element(), {
        rules: { region: { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.activeElement === trigger.element()).toBe(true);
});

test("stacked radio menu rows keep context readable and selection keyboard-operable", async () => {
  let selection = "agent";
  const screen = await render(
    <ThemeScope theme="dark">
      <Menu.Root>
        <Menu.Trigger>Choose workspace</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup aria-label="Workspaces">
              <Menu.RadioGroup
                defaultValue="agent"
                onValueChange={(value) => {
                  selection = value;
                }}
              >
                <Menu.RadioItem layout="stacked" value="agent">
                  <Menu.Leading>
                    <StarIcon size={16} />
                  </Menu.Leading>
                  <Menu.Copy>
                    <Menu.Label>Agent</Menu.Label>
                    <Menu.Description>Current App Agent</Menu.Description>
                  </Menu.Copy>
                  <Menu.RadioItemIndicator />
                </Menu.RadioItem>
                <Menu.RadioItem layout="stacked" value="projects">
                  <Menu.Leading>
                    <FileIcon size={16} />
                  </Menu.Leading>
                  <Menu.Copy>
                    <Menu.Label>Projects</Menu.Label>
                    <Menu.Description>Boards and schedules</Menu.Description>
                  </Menu.Copy>
                  <Menu.RadioItemIndicator />
                </Menu.RadioItem>
              </Menu.RadioGroup>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </ThemeScope>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Choose workspace" }));
  const agent = screen.getByRole("menuitemradio", { name: /Agent Current App Agent/ }).element();
  const projects = screen
    .getByRole("menuitemradio", { name: /Projects Boards and schedules/ })
    .element();
  await expect.poll(() => agent.getBoundingClientRect().height).toBeGreaterThanOrEqual(52);
  expect(getComputedStyle(agent).borderRadius).toBe("7px");
  expect(agent.getAttribute("aria-checked")).toBe("true");
  expect(getComputedStyle(agent).backgroundColor).toBe(
    themeColor("dark", "color.menu.itemSelected"),
  );
  projects.focus();
  await expect
    .poll(() => getComputedStyle(projects).backgroundColor)
    .toBe(themeColor("dark", "color.menu.itemHover"));
  await userEvent.keyboard("{Enter}");
  expect(selection).toBe("projects");
});
