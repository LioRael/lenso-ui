"use client";

import * as stylex from "@stylexjs/stylex";
import Link from "@/components/docs/LocalLink";
import { ArrowUpRightIcon, ChevronRightIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react";

import { Breadcrumb } from "@lenso/ui/breadcrumb";
import { Disclosure } from "@lenso/ui/disclosure";
import { QuickLink } from "@lenso/ui/quick-link";
import { SegmentedControl } from "@lenso/ui/segmented-control";
import { Tabs } from "@lenso/ui/tabs";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";
import { stageStyles } from "./stage.stylex";

function stringValue(
  values: Readonly<Record<string, boolean | number | string>>,
  id: string,
  fallback: string,
) {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
}

function TeamIcon() {
  return (
    <svg aria-hidden="true" height="14" viewBox="0 0 14 14" width="14">
      <path
        d="M1.327 2.625h9.1l1.2 4.35c.22.82-.4 1.65-1.25 1.65a1.3 1.3 0 0 1-1.3-1.3 1.3 1.3 0 0 1-2.6 0 1.3 1.3 0 0 1-2.6 0 1.3 1.3 0 0 1-2.6 0c-.85 0-1.47-.83-1.25-1.65l1.3-4.35Z"
        fill="currentColor"
        transform="translate(1.2)"
      />
      <path
        d="M0 0h8.6v3.7H0Zm3.1 1.15V3.7h2.4V1.15Z"
        fill="currentColor"
        fillRule="evenodd"
        transform="translate(2.7 8.14)"
      />
    </svg>
  );
}

export const breadcrumbAdapter: PlaygroundAdapter = ({ example, theme }) => {
  return (
    <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link nativeButton={false} render={<Link href="#workspace" />}>
              {example === "external" && (
                <Breadcrumb.Icon>
                  <ArrowUpRightIcon size={14} />
                </Breadcrumb.Icon>
              )}
              {example === "team" && (
                <Breadcrumb.Icon>
                  <TeamIcon />
                </Breadcrumb.Icon>
              )}
              {example === "external" ? "Project" : example === "team" ? "TestABI" : "Workspace"}
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          {example !== "team" && (
            <>
              <Breadcrumb.Item>
                {example === "overflow" ? (
                  <Breadcrumb.Ellipsis />
                ) : (
                  <Breadcrumb.Link nativeButton={false} render={<Link href="#project" />}>
                    Workspace
                  </Breadcrumb.Link>
                )}
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
            </>
          )}
          <Breadcrumb.Item>
            <Breadcrumb.Page>{example === "team" ? "Issues" : "Workspace"}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </ThemeScope>
  );
};

function DisclosurePreview({ multiple }: { multiple: boolean }) {
  return (
    <Disclosure.Root defaultValue={["workspace"]} key={String(multiple)} multiple={multiple}>
      <Disclosure.Item value="workspace">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Workspace <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Projects and workspace views.</Disclosure.Panel>
      </Disclosure.Item>
      <Disclosure.Item value="projects">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Projects <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel layout="list">
          <div {...stylex.props(stageStyles.disclosureList)}>
            <span>Active</span>
            <span>Archived</span>
            <span>More</span>
          </div>
        </Disclosure.Panel>
      </Disclosure.Item>
      <Disclosure.Item value="views">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Views <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Saved filters and shared views.</Disclosure.Panel>
      </Disclosure.Item>
    </Disclosure.Root>
  );
}

export const disclosureAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
    <DisclosurePreview multiple={values.multiple === true} />
  </ThemeScope>
);

export const quickLinkAdapter: PlaygroundAdapter = ({ theme, values }) => (
  <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
    <QuickLink
      disabled={values.disabled === true}
      leadingIcon={<SettingsIcon size={16} />}
      trailingIcon={<ChevronRightIcon size={14} />}
    >
      Team settings
    </QuickLink>
  </ThemeScope>
);

export const tabsAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const selected = stringValue(values, "selected", "overview");
  const density = stringValue(values, "density", "default") as "compact" | "default";
  return (
    <ThemeScope theme={theme} xstyle={[stageStyles.canvas, stageStyles.tabs]}>
      <Tabs.Root onValueChange={(value) => setValue("selected", value)} value={selected}>
        <Tabs.List aria-label="Project sections" density={density}>
          <Tabs.Tab density={density} value="overview">
            Overview
          </Tabs.Tab>
          <Tabs.Tab density={density} value="documents">
            Documents
          </Tabs.Tab>
          <Tabs.Tab density={density} value="members">
            Members
          </Tabs.Tab>
        </Tabs.List>
        {(["overview", "documents", "members"] as const).map((value) => (
          <Tabs.Panel key={value} value={value}>
            <p>{value[0]!.toUpperCase() + value.slice(1)} content</p>
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </ThemeScope>
  );
};

export const segmentedControlAdapter: PlaygroundAdapter = ({ setValue, theme, values }) => {
  const selected = stringValue(values, "selected", "light");
  const width = stringValue(values, "width", "fit") as "fill" | "fit";
  return (
    <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
      <SegmentedControl.Root
        aria-label="Theme mode"
        onValueChange={(value) => setValue("selected", value)}
        value={selected}
        width={width}
      >
        <SegmentedControl.Item value="light">
          <SunIcon aria-hidden="true" size={13} />
          Light
        </SegmentedControl.Item>
        <SegmentedControl.Item value="dark">
          <MoonIcon aria-hidden="true" size={13} />
          Dark
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </ThemeScope>
  );
};
