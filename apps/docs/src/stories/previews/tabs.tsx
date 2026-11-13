"use client";
import { Tabs, type TabsRootProps } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";
import { useState } from "react";
export interface TabsStoryProps {
  value: "overview" | "activity" | "settings";
  orientation?: TabsRootProps["orientation"];
  activation?: TabsRootProps["activation"];
  lift?: TabsRootProps["lift"];
  elastic?: boolean;
  glass?: boolean;
  size?: "sm" | "lg";
}
export function TabsStory({
  value,
  orientation,
  activation,
  elastic,
  lift,
  glass,
  size,
}: TabsStoryProps) {
  const engine = useDataEngine();
  // Shared Story arguments commit after the pointer-release frame; selection must commit locally first.
  const [selection, setSelection] = useState({ value, external: value });
  if (selection.external !== value) setSelection({ value, external: value });
  return (
    <Tabs
      value={selection.value}
      orientation={orientation}
      activation={activation}
      lift={lift}
      elastic={elastic}
      glass={glass}
      size={size}
      onValueChange={(next) => {
        if (next !== "overview" && next !== "activity" && next !== "settings") return;
        setSelection({ value: next, external: value });
        engine.update(["value"], next);
      }}
    >
      <Tabs.List aria-label="Sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs>
  );
}
