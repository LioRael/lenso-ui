import { themeColor } from "../shared/test-theme.js";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type React from "react";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import {
  BotIcon,
  BoxIcon,
  ChevronDownIcon,
  CircleHelpIcon,
  InboxIcon,
  LayersIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Disclosure } from "../disclosure/index.js";
import { IconButton } from "../icon-button/index.js";
import { ThemeScope } from "../theme-scope/index.js";
import { Sidebar } from "./index.js";

const iconProps = { size: 16, strokeWidth: 1.5 };

function BoardSection({
  action,
  children,
  label,
  theme,
}: {
  action?: string;
  children: React.ReactNode;
  label: string;
  theme: "dark" | "light";
}) {
  return (
    <Disclosure.Root defaultValue={[label]}>
      <Disclosure.Item value={label}>
        <Sidebar.Section>
          <Sidebar.SectionHeader>
            <Disclosure.Header>
              <Sidebar.SectionTrigger>
                {label} <Disclosure.Icon />
              </Sidebar.SectionTrigger>
            </Disclosure.Header>
            {action && (
              <Sidebar.SectionAction>
                <IconButton aria-label={action} size="compact" variant="ghost">
                  <PlusIcon />
                </IconButton>
              </Sidebar.SectionAction>
            )}
          </Sidebar.SectionHeader>
          <Sidebar.SectionContent aria-label={`${theme} ${label}`}>
            {children}
          </Sidebar.SectionContent>
        </Sidebar.Section>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

function BoardSidebar({ theme }: { theme: "dark" | "light" }) {
  return (
    <ThemeScope theme={theme}>
      <Sidebar.Root defaultOpen id={`sidebar-${theme}`}>
        <Sidebar.Panel aria-label={`${theme} application navigation`} style={{ height: 720 }}>
          <Sidebar.Header>
            <Sidebar.Workspace icon="TE" indicator={<ChevronDownIcon size={8} />}>
              testABl
            </Sidebar.Workspace>
            <Sidebar.HeaderSpacer />
            <IconButton aria-label={`Search ${theme} workspace`} variant="ghost">
              <SearchIcon />
            </IconButton>
            <IconButton aria-label={`Create in ${theme} workspace`} variant="secondary">
              <PlusIcon />
            </IconButton>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<InboxIcon {...iconProps} />}>Inbox</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<LayersIcon {...iconProps} />}>My issues</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<BotIcon {...iconProps} />}>Agent</Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
            <BoardSection label="Workspace" theme={theme}>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon {...iconProps} />}>Projects</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<LayersIcon {...iconProps} />}>Views</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<MoreHorizontalIcon {...iconProps} />}>More</Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </BoardSection>
            <BoardSection action={`Add ${theme} favorite`} label="Favorites" theme={theme}>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<InboxIcon {...iconProps} />}>Active issues</Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </BoardSection>
            <BoardSection label="Your teams" theme={theme}>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon {...iconProps} />}>TestABl</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Submenu>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<BoxIcon size={14} />} nested selected>
                        Home
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<InboxIcon size={14} />} nested>
                        Issues
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<BoxIcon size={14} />} nested>
                        Projects
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<LayersIcon size={14} />} nested>
                        Views
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                  </Sidebar.Submenu>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </BoardSection>
            <BoardSection label="Try" theme={theme}>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon {...iconProps} />}>Import issues</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BotIcon {...iconProps} />}>Invite people</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<LayersIcon {...iconProps} />}>Connect GitHub</Sidebar.Item>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </BoardSection>
          </Sidebar.Content>
          <Sidebar.Footer>
            <IconButton aria-label={`Help for ${theme} workspace`} size="compact" variant="ghost">
              <CircleHelpIcon />
            </IconButton>
          </Sidebar.Footer>
        </Sidebar.Panel>
      </Sidebar.Root>
    </ThemeScope>
  );
}

test("Sidebar resolves the semantic App geometry in Light and Dark", async () => {
  const screen = await render(
    <div
      data-testid="sidebar-figma-state-board"
      style={{ display: "flex", gap: 24, padding: 24, width: 560 }}
    >
      <BoardSidebar theme="light" />
      <BoardSidebar theme="dark" />
    </div>,
  );
  await document.fonts.load('500 13px "Inter"', "Inbox Workspace Projects Home");
  const board = screen.getByTestId("sidebar-figma-state-board");
  const panels = board.element().querySelectorAll<HTMLElement>('[data-slot="sidebar-panel"]');
  const items = board.element().querySelectorAll<HTMLElement>('[data-slot="sidebar-item"]');
  const sectionActions = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="sidebar-section-action"]');
  const nestedItems = panels[0]!.querySelectorAll<HTMLElement>(
    '[data-slot="sidebar-item"][data-level="nested"]',
  );
  expect(panels).toHaveLength(2);
  expect(sectionActions).toHaveLength(2);
  expect(nestedItems).toHaveLength(4);
  await expect.poll(() => panels[0]?.getBoundingClientRect().width).toBe(248);
  await expect.poll(() => items[0]?.getBoundingClientRect().height).toBe(36);
  await expect
    .poll(() => items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().top)
    .toBe(37);
  await expect
    .poll(
      () =>
        nestedItems[1]!.getBoundingClientRect().top - nestedItems[0]!.getBoundingClientRect().top,
    )
    .toBe(37);
  await expect.poll(() => sectionActions[0]!.getBoundingClientRect().width).toBe(28);
  await expect
    .poll(
      () =>
        sectionActions[0]!.getBoundingClientRect().right - panels[0]!.getBoundingClientRect().left,
    )
    .toBeLessThanOrEqual(panels[0]!.getBoundingClientRect().width);
  await expect.poll(() => getComputedStyle(items[0]!).fontFamily).toContain("system-ui");
  await expect
    .poll(() => getComputedStyle(panels[1]!).backgroundColor)
    .toBe(themeColor("dark", "color.surface.sidebar"));
  const expectedHoverBackgrounds = [
    themeColor("light", "color.sidebar.itemHover"),
    themeColor("dark", "color.sidebar.itemHover"),
  ];
  for (const [index, panel] of panels.entries()) {
    const sectionHeader = panel.querySelector<HTMLElement>('[data-slot="sidebar-section-header"]')!;
    const sectionTrigger = sectionHeader.querySelector<HTMLElement>(
      '[data-slot="disclosure-trigger"]',
    )!;
    const item = panel.querySelector<HTMLElement>('[data-slot="sidebar-item"]')!;

    await userEvent.hover(sectionTrigger);
    await expect
      .poll(() => getComputedStyle(sectionHeader).backgroundColor)
      .toBe(expectedHoverBackgrounds[index]);
    const sectionHoverBackground = getComputedStyle(sectionHeader).backgroundColor;
    expect(getComputedStyle(sectionTrigger).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(sectionHeader).borderRadius).toBe("8px");
    expect(sectionHeader.getBoundingClientRect().width).toBe(item.getBoundingClientRect().width);

    await userEvent.hover(item);
    await expect.poll(() => getComputedStyle(item).backgroundColor).toBe(sectionHoverBackground);
  }
  for (const panel of panels) {
    expect(
      (await axe.run(panel, { rules: { "color-contrast": { enabled: false } } })).violations,
    ).toEqual([]);
  }
});

test("Sidebar hides its styled panel when closed", async () => {
  const screen = await render(
    <ThemeScope theme="light">
      <Sidebar.Root defaultOpen id="styled-sidebar-visibility">
        <Sidebar.Trigger>Toggle navigation</Sidebar.Trigger>
        <Sidebar.Panel aria-label="Styled navigation">Navigation</Sidebar.Panel>
      </Sidebar.Root>
    </ThemeScope>,
  );

  const trigger = screen.getByRole("button", { name: "Toggle navigation" });
  const panel = document.querySelector<HTMLElement>(
    '#styled-sidebar-visibility-panel[data-slot="sidebar-panel"]',
  )!;
  await expect.poll(() => getComputedStyle(panel).display).toBe("flex");

  await trigger.click();

  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => getComputedStyle(panel).display).toBe("none");
  expect(panel.hidden).toBe(true);
});

test("compact Sidebar destinations preserve the 32px row and one-line icon gap", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <Sidebar.Root defaultOpen id="compact-sidebar">
        <Sidebar.Panel aria-label="Compact navigation" style={{ width: 274, height: 180 }}>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item density="compact" icon={<InboxIcon size={14} />} selected>
                  A very long destination name that cannot wrap
                </Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar.Panel>
      </Sidebar.Root>
    </ThemeScope>,
  );
  const item = screen
    .getByRole("button", {
      name: "A very long destination name that cannot wrap",
    })
    .element();
  const icon = item.querySelector<HTMLElement>('[data-slot="sidebar-item-icon"]')!;
  const label = item.querySelector<HTMLElement>('[data-slot="sidebar-item-label"]')!;
  await expect.poll(() => item.getBoundingClientRect().height).toBe(32);
  expect(getComputedStyle(item).borderRadius).toBe("10px");
  expect(Math.round(label.getBoundingClientRect().left - icon.getBoundingClientRect().right)).toBe(
    8,
  );
  expect(getComputedStyle(label).whiteSpace).toBe("nowrap");
  expect(getComputedStyle(item).backgroundColor).toBe(
    themeColor("dark", "color.sidebar.itemActive"),
  );
  expect(item.getAttribute("aria-current")).toBe("page");
});
