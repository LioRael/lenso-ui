"use client";
import { useState } from "react";
import { SegmentedControl, Tabs } from "@lenso/ui";
const items = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "flagged", label: "Flagged", disabled: true },
];
export interface SegmentedControlStoryProps {
  disabled: boolean;
  size?: "sm" | "lg";
  glass?: boolean;
  elastic?: boolean;
  lift?: number;
  compareTabs?: boolean;
}
export function SegmentedControlStory({
  disabled,
  size = "sm",
  glass = false,
  elastic = true,
  lift = 20,
  compareTabs = false,
}: SegmentedControlStoryProps) {
  const [value, setValue] = useState<string | null>("all");
  return (
    <div>
      <SegmentedControl
        aria-label="Message filter"
        items={items}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        size={size}
        glass={glass}
        elastic={elastic}
        lift={lift}
      />
      <p aria-live="polite">Showing {value} messages</p>
      {compareTabs && (
        <Tabs
          value={value}
          onValueChange={setValue}
          size={size}
          glass={glass}
          elastic={elastic}
          lift={lift}
        >
          <Tabs.List aria-label="Message panels">
            {items.map((item) => (
              <Tabs.Tab key={item.value} value={item.value} disabled={disabled || item.disabled}>
                {item.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
          {items.map((item) => (
            <Tabs.Panel key={item.value} value={item.value}>
              {item.label} message panel
            </Tabs.Panel>
          ))}
        </Tabs>
      )}
    </div>
  );
}
