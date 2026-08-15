import { expect, test } from "vitest";
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
  children,
  label,
  theme,
}: {
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
              <Disclosure.Trigger>
                {label} <Disclosure.Icon />
              </Disclosure.Trigger>
            </Disclosure.Header>
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
            <BoardSection label="Favorites" theme={theme}>
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

test("Sidebar matches the approved Figma App geometry in Light and Dark", async () => {
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
  expect(panels).toHaveLength(2);
  await expect.poll(() => panels[0]?.getBoundingClientRect().width).toBe(244);
  await expect.poll(() => items[0]?.getBoundingClientRect().height).toBe(28);
  await expect
    .poll(() => items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().top)
    .toBe(29);
  await expect.poll(() => getComputedStyle(items[0]!).fontFamily).toContain("Inter");
  await expect.poll(() => getComputedStyle(panels[1]!).backgroundColor).toBe("rgb(10, 10, 10)");
  for (const panel of panels) {
    expect(
      (await axe.run(panel, { rules: { "color-contrast": { enabled: false } } })).violations,
    ).toEqual([]);
  }
});
