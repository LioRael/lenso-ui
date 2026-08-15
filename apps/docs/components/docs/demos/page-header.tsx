"use client";

import * as React from "react";
import { LinkIcon, MoreHorizontalIcon, StarIcon, StoreIcon } from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Button } from "@lenso/ui/button";
import { IconButton } from "@lenso/ui/icon-button";
import { PageHeader } from "@lenso/ui/page-header";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

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
  const pageTheme = useDocsPageTheme();
  const [stageTheme, setStageTheme] = React.useState<StageTheme>("System");
  const [variant, setVariant] = React.useState<Variant>("team");
  const resolvedTheme =
    stageTheme === "System" ? pageTheme : (stageTheme.toLowerCase() as "dark" | "light");
  return (
    <ComponentPage
      description="A compact page-level identity and peer-navigation surface for product and settings contexts."
      eyebrow="Product component · Navigation"
      metadata={["Figma canonical", "Implementation ready"]}
      name="Page Header"
      slug="page-header"
    >
      <LivePlayground
        actions={
          <>
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
          </>
        }
        controls={
          <PlaygroundControls
            example="default"
            exampleLabel="Example · Default"
            name="Page Header"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Variant"
              onValueChange={(value) => setVariant(value as Variant)}
              options={[
                { label: "Team", value: "team" },
                { label: "Issues", value: "issues" },
                { label: "Simple", value: "simple" },
              ]}
              value={variant}
            />
            <PlaygroundSelectControl
              label="Theme"
              onValueChange={(value) => setStageTheme(value as StageTheme)}
              options={[
                { label: "System", value: "System" },
                { label: "Light", value: "Light" },
                { label: "Dark", value: "Dark" },
              ]}
              value={stageTheme}
            />
          </PlaygroundControls>
        }
        controlsMode="custom"
        description="Compare Team, Issues, and Simple geometry, keyboard tabs, action slots, and theme parity."
        preview={
          <ThemeScope className="stage-canvas page-header-stage" theme={resolvedTheme}>
            <div style={{ width: "100%" }}>
              <HeaderDemo variant={variant} />
            </div>
          </ThemeScope>
        }
      />
      <section className="button-guidance select-guidance">
        <article>
          <h2>Usage guidance</h2>
          <ul>
            <li>Use Team when a page needs identity, compact actions, and peer-view navigation.</li>
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
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
