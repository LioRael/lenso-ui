import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { BoxIcon, InboxIcon, LayersIcon } from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Sidebar } from "./index.js";

function BoardSidebar({ theme }: { theme: "dark" | "light" }) {
  return (
    <ThemeScope theme={theme}>
      <Sidebar.Root defaultOpen id={`sidebar-${theme}`}>
        <Sidebar.Panel aria-label={`${theme} application navigation`} style={{ height: 720 }}>
          <Sidebar.Header>
            <Sidebar.Workspace icon="TE">testABl</Sidebar.Workspace>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<InboxIcon size={16} />}>Inbox</Sidebar.Item>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.Item icon={<LayersIcon size={16} />}>My issues</Sidebar.Item>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
            <Sidebar.Section>
              <Sidebar.SectionHeader>
                <Sidebar.SectionLabel>Workspace</Sidebar.SectionLabel>
              </Sidebar.SectionHeader>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Item icon={<BoxIcon size={16} />}>Projects</Sidebar.Item>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.Submenu>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<BoxIcon size={14} />} nested selected>
                        Home
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuItem>
                      <Sidebar.Item icon={<LayersIcon size={14} />} nested>
                        Issues
                      </Sidebar.Item>
                    </Sidebar.MenuItem>
                  </Sidebar.Submenu>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Sidebar.Section>
          </Sidebar.Content>
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
  await expect.poll(() => getComputedStyle(items[0]!).fontFamily).toContain("Inter");
  await expect.poll(() => getComputedStyle(panels[1]!).backgroundColor).toBe("rgb(10, 10, 10)");
  expect(
    (await axe.run(board.element(), { rules: { "color-contrast": { enabled: false } } }))
      .violations,
  ).toEqual([]);
  await expect.element(board).toMatchScreenshot("sidebar-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});
