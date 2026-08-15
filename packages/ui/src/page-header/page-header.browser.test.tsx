import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { LinkIcon, MoreHorizontalIcon, StarIcon, StoreIcon } from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Breadcrumb } from "../breadcrumb/index.js";
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

function IssuesHeader() {
  return (
    <PageHeader.Root aria-label="Issues navigation" variant="issues">
      <PageHeader.TabsRoot defaultValue="overview">
        <PageHeader.Row>
          <Breadcrumb.Root aria-label="Issues breadcrumb">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link>
                  <Breadcrumb.Icon>
                    <StoreIcon size={14} />
                  </Breadcrumb.Icon>
                  TestABl
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>Issues</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <PageHeader.Actions>
            <IconButton aria-label="Add Issues to favorites" variant="ghost">
              <StarIcon />
            </IconButton>
            <IconButton aria-label="Issues actions" variant="ghost">
              <MoreHorizontalIcon />
            </IconButton>
          </PageHeader.Actions>
        </PageHeader.Row>
        <PageHeader.TabsRow>
          <PageHeader.TabsList aria-label="Issue sections">
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
});

test("Page Header composes the canonical Issues breadcrumb variant", async () => {
  const screen = await render(
    <div style={{ width: 1027 }}>
      <IssuesHeader />
    </div>,
  );
  const header = screen.getByRole("banner", { name: "Issues navigation" });
  const row = header.element().querySelector<HTMLElement>('[data-slot="page-header-row"]')!;
  expect(header.element().getBoundingClientRect().height).toBe(87.5);
  expect(row.getBoundingClientRect().height).toBe(44);
  expect(getComputedStyle(row).paddingLeft).toBe("14px");
  expect(screen.getByRole("navigation", { name: "Issues breadcrumb" }).element().tagName).toBe(
    "NAV",
  );
  expect(
    screen.getByRole("tab", { name: "Overview" }).element().getAttribute("data-active"),
  ).not.toBeNull();
  expect((await axe.run(header.element())).violations).toEqual([]);
});
