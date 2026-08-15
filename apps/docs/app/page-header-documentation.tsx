"use client";

import * as React from "react";
import { LinkIcon, MoreHorizontalIcon, StarIcon, StoreIcon } from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Button } from "@lenso/ui/button";
import { IconButton } from "@lenso/ui/icon-button";
import { PageHeader } from "@lenso/ui/page-header";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { DocsShell } from "./docs-shell";

type StageTheme = "Dark" | "Light" | "System";
type Variant = "issues" | "simple" | "team";

const codeExample = `import { PageHeader } from "@lenso/ui/page-header"

<PageHeader.Root variant="team">
  <PageHeader.TabsRoot defaultValue="overview">
    <PageHeader.Row>
      <PageHeader.Leading>{teamIcon}</PageHeader.Leading>
      <PageHeader.Title>TestABl</PageHeader.Title>
      <PageHeader.Actions>{actions}</PageHeader.Actions>
    </PageHeader.Row>
    <PageHeader.TabsRow>
      <PageHeader.TabsList aria-label="Team sections">
        <PageHeader.Tab value="overview">Overview</PageHeader.Tab>
      </PageHeader.TabsList>
    </PageHeader.TabsRow>
  </PageHeader.TabsRoot>
</PageHeader.Root>`;

function HeaderDemo({ variant }: { variant: Variant }) {
  if (variant === "simple") {
    return (
      <PageHeader.Root variant="simple">
        <PageHeader.Row>
          <PageHeader.Title>Preferences</PageHeader.Title>
        </PageHeader.Row>
      </PageHeader.Root>
    );
  }
  if (variant === "issues") {
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

export function PageHeaderDocumentation() {
  const [copied, setCopied] = React.useState(false);
  const [pageTheme, setPageTheme] = React.useState<"dark" | "light">("light");
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [variant, setVariant] = React.useState<Variant>("team");
  React.useEffect(() => {
    const theme = new URLSearchParams(window.location.search).get("theme");
    if (theme === "dark" || theme === "light") setPageTheme(theme);
  }, []);
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Page Header"]}
      current="page-header"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">PRODUCT COMPONENT · NAVIGATION</p>
          <h1>Page Header</h1>
          <p className="button-description">
            A compact page-level identity and peer-navigation surface for product and settings
            contexts.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Implementation ready</span>
          </div>
        </section>
        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>
                Compare Team, Issues, and Simple geometry, keyboard tabs, action slots, and theme
                parity.
              </p>
            </div>
            <div className="playground-actions">
              <Button
                onClick={() => {
                  setVariant("team");
                  setStageTheme("System");
                }}
                variant="secondary"
              >
                Reset
              </Button>
              <Button
                onClick={async () => {
                  await navigator.clipboard.writeText(codeExample);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1200);
                }}
                variant="secondary"
              >
                {copied ? "Copied" : "Copy JSX"}
              </Button>
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas page-header-stage" theme={resolvedTheme}>
                <div style={{ width: "100%" }}>
                  <HeaderDemo variant={variant} />
                </div>
              </ThemeScope>
            </article>
            <form className="playground-inspector" onSubmit={(event) => event.preventDefault()}>
              <div className="inspector-header">
                <strong>Page Header</strong>
                <button type="button">
                  Example ·{" "}
                  {variant === "team" ? "Team" : variant === "issues" ? "Issues" : "Simple"}{" "}
                  <span aria-hidden="true">⌄</span>
                </button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Variant</span>
                <select
                  onChange={(event) => setVariant(event.target.value as Variant)}
                  value={variant}
                >
                  <option value="team">Team</option>
                  <option value="issues">Issues</option>
                  <option value="simple">Simple</option>
                </select>
              </label>
              <label className="inspector-row">
                <span>Theme</span>
                <select
                  onChange={(event) => setStageTheme(event.target.value as StageTheme)}
                  value={stageTheme}
                >
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </label>
            </form>
          </div>
        </section>
        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>
                Use Team when a page needs identity, compact actions, and peer-view navigation.
              </li>
              <li>Use Simple for settings and focused pages that only need a title.</li>
              <li>Use Issues for a team breadcrumb followed by peer-view navigation.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>Base UI owns roving focus, selected state, and keyboard navigation for tabs.</li>
              <li>Provide an accessible label for the header landmark and every icon action.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>
              All identity, action, and navigation slots are replaceable; geometry remains stable
              across states.
            </p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
