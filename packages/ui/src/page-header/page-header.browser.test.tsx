import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { LinkIcon, MoreHorizontalIcon, StarIcon, StoreIcon } from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { IconButton } from "../icon-button/index.js";
import { PageHeader } from "./index.js";

function TeamHeader() {
  return (
    <PageHeader.Root aria-label="Team navigation" variant="team">
      <PageHeader.TabsRoot defaultValue="overview">
        <PageHeader.Row>
          <PageHeader.Leading>
            <StoreIcon size={16} />
          </PageHeader.Leading>
          <PageHeader.Title>TestABl</PageHeader.Title>
          <PageHeader.Actions>
            <IconButton aria-label="Add to favorites" variant="ghost">
              <StarIcon />
            </IconButton>
            <IconButton aria-label="Team actions" variant="ghost">
              <MoreHorizontalIcon />
            </IconButton>
          </PageHeader.Actions>
          <PageHeader.Spacer />
          <IconButton aria-label="Copy team URL" variant="ghost">
            <LinkIcon />
          </IconButton>
        </PageHeader.Row>
        <PageHeader.TabsRow>
          <PageHeader.TabsList aria-label="Team sections">
            <PageHeader.Tab value="overview">Overview</PageHeader.Tab>
            <PageHeader.Tab value="documents">Documents</PageHeader.Tab>
            <PageHeader.Tab value="members">Members</PageHeader.Tab>
          </PageHeader.TabsList>
        </PageHeader.TabsRow>
      </PageHeader.TabsRoot>
    </PageHeader.Root>
  );
}

test("Page Header matches the approved Team and Simple Figma variants", async () => {
  const screen = await render(
    <div
      data-testid="page-header-figma-state-board"
      style={{
        background: "#f9f9fa",
        boxSizing: "border-box",
        height: 180,
        padding: 24,
        width: 1075,
      }}
    >
      <div style={{ width: 1027 }}>
        <TeamHeader />
      </div>
      <div style={{ marginTop: 24, width: 640 }}>
        <PageHeader.Root variant="simple">
          <PageHeader.Row>
            <PageHeader.Title>Preferences</PageHeader.Title>
          </PageHeader.Row>
        </PageHeader.Root>
      </div>
    </div>,
  );
  await document.fonts.load('500 13px "Inter"', "TestABl Overview Documents Members Preferences");
  const board = screen.getByTestId("page-header-figma-state-board");
  const headers = board.element().querySelectorAll<HTMLElement>('[data-slot="page-header"]');
  const tabs = board.element().querySelectorAll<HTMLElement>('[data-slot="page-header-tab"]');
  expect(headers[0]?.getBoundingClientRect().height).toBe(87.5);
  expect(headers[1]?.getBoundingClientRect().height).toBe(32);
  expect(tabs[0]?.getBoundingClientRect().height).toBe(28);
  expect(tabs[0]?.getAttribute("data-active")).not.toBeNull();
  await userEvent.click(tabs[1]!);
  expect(tabs[1]?.getAttribute("data-active")).not.toBeNull();
  await userEvent.click(tabs[0]!);
  expect(
    (
      await axe.run(board.element(), {
        rules: { "landmark-no-duplicate-banner": { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
  await expect.element(board).toMatchScreenshot("page-header-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});
