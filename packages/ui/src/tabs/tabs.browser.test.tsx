import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Tabs } from "./index.js";

type VisualState = "default" | "disabled" | "focus-visible" | "hover" | "pressed";

function TabState({ selected, state }: { selected: boolean; state: VisualState }) {
  return (
    <Tabs.Root defaultValue={selected ? "tab" : "other"}>
      <Tabs.List aria-label={`${selected ? "Selected" : "Unselected"} ${state} tab`}>
        <Tabs.Tab
          data-state-board-item=""
          data-visual-state={state === "default" || state === "disabled" ? undefined : state}
          disabled={state === "disabled"}
          style={{ width: 72 }}
          value="tab"
        >
          Tab label
        </Tabs.Tab>
        {!selected && (
          <Tabs.Tab style={{ display: "none" }} value="other">
            Other
          </Tabs.Tab>
        )}
      </Tabs.List>
    </Tabs.Root>
  );
}

test("Tabs match the approved Figma item states and keyboard behavior", async () => {
  const states = ["default", "hover", "pressed", "focus-visible", "disabled"] as const;
  const screen = await render(
    <>
      <div
        data-testid="tabs-figma-state-board"
        style={{
          background: "#e9e9eb",
          boxSizing: "border-box",
          display: "grid",
          gap: "24px 16px",
          gridTemplateColumns: "repeat(5, 72px)",
          gridTemplateRows: "repeat(2, 28px)",
          height: 120,
          paddingBlock: 24,
          width: 456,
        }}
      >
        {states.map((state) => (
          <TabState key={`unselected-${state}`} selected={false} state={state} />
        ))}
        {states.map((state) => (
          <TabState key={`selected-${state}`} selected state={state} />
        ))}
      </div>
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Project sections">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="documents">Documents</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">Overview panel</Tabs.Panel>
        <Tabs.Panel value="documents">Documents panel</Tabs.Panel>
        <Tabs.Panel value="members">Members panel</Tabs.Panel>
      </Tabs.Root>
    </>,
  );
  await document.fonts.load('500 12px "Inter"', "Tab label");
  const board = screen.getByTestId("tabs-figma-state-board");
  const items = board.element().querySelectorAll<HTMLElement>("[data-state-board-item]");
  await expect.poll(() => getComputedStyle(items[4]!).opacity).toBe("0.6");
  expect(items).toHaveLength(10);
  expect(items[0]!.getBoundingClientRect().width).toBe(72);
  expect(getComputedStyle(items[0]!).borderColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(items[0]!, "::after").borderWidth).toBe("1px");
  expect(getComputedStyle(items[0]!, "::after").inset).toBe("0.5px");
  expect(items[3]!.getAttribute("data-visual-state")).toBe("focus-visible");
  expect(items[5]!.getAttribute("data-active")).not.toBeNull();

  const projectTabs = screen.getByRole("tab", { name: "Overview" });
  projectTabs.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement?.textContent).toBe("Documents");
  await userEvent.keyboard("{Enter}");
  expect(
    screen.getByRole("tab", { name: "Documents" }).element().getAttribute("data-active"),
  ).not.toBeNull();
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
  await expect.element(board).toMatchScreenshot("tabs-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.025 },
  });
});
