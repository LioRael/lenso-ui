import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { SidebarRecipe } from "../../../../registry/recipes/sidebar.js";

test("Sidebar Recipe canonical Light and Dark state board", async () => {
  const screen = await render(
    <div
      data-testid="sidebar-state-board"
      style={{ display: "flex", gap: 24, padding: 24, width: 584 }}
    >
      {(["light", "dark"] as const).map((theme) => (
        <div data-theme={theme} key={theme} style={{ height: 300 }}>
          <SidebarRecipe.Root defaultOpen id={`sidebar-${theme}`}>
            <SidebarRecipe.Panel>
              <SidebarRecipe.Header>Workspace</SidebarRecipe.Header>
              <SidebarRecipe.Content>
                <SidebarRecipe.Item selected>Home</SidebarRecipe.Item>
                <SidebarRecipe.Item>Projects</SidebarRecipe.Item>
                <SidebarRecipe.Item nested>Nested project</SidebarRecipe.Item>
              </SidebarRecipe.Content>
              <SidebarRecipe.Footer>Account</SidebarRecipe.Footer>
            </SidebarRecipe.Panel>
          </SidebarRecipe.Root>
        </div>
      ))}
    </div>,
  );

  const home = screen
    .getByTestId("sidebar-state-board")
    .element()
    .querySelector('[data-slot="sidebar-item"]');
  expect(home).not.toBeNull();
  await expect.poll(() => getComputedStyle(home!).borderRadius).toBe("8px");
  await expect.poll(() => getComputedStyle(home!).borderWidth).toBe("0px");
  await expect.poll(() => getComputedStyle(home!).fontFamily).toContain("Inter");
  const panels = screen
    .getByTestId("sidebar-state-board")
    .element()
    .querySelectorAll('[data-slot="sidebar-panel"]');
  expect(panels).toHaveLength(2);
  await expect.poll(() => getComputedStyle(panels[1]!).backgroundColor).toBe("rgb(10, 10, 10)");

  await expect
    .element(screen.getByTestId("sidebar-state-board"))
    .toMatchScreenshot("sidebar-state-board", {
      comparatorName: "pixelmatch",
      comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
    });
});
