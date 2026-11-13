"use client";

import { useState } from "react";
import { PopupButton, Select, Menu } from "@lenso/ui";

export interface PopupButtonStoryProps {
  label: string;
  disabled: boolean;
  example: "button" | "select" | "select-below" | "menu";
}

const items = [
  { value: "never", label: "Never" },
  { value: "daily", label: "Every Day" },
  { value: "weekly", label: "Every Week" },
  { value: "monthly", label: "Every Month" },
];

export function Preview({ label, disabled, example }: PopupButtonStoryProps) {
  const [activations, setActivations] = useState(0);
  const [action, setAction] = useState("");
  if (example === "button")
    return (
      <div>
        <PopupButton disabled={disabled} onClick={() => setActivations((count) => count + 1)}>
          {label}
        </PopupButton>
        <p aria-live="polite">Activations: {activations}</p>
      </div>
    );
  if (example === "menu")
    return (
      <div>
        <Menu elastic={false}>
          <Menu.Trigger render={<PopupButton />} disabled={disabled}>
            {label}
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item onClick={() => setAction("Copied")}>Copy</Menu.Item>
            <Menu.Item onClick={() => setAction("Archived")}>Archive</Menu.Item>
          </Menu.Content>
        </Menu>
        <p aria-live="polite">{action}</p>
      </div>
    );
  return (
    <Select defaultValue="weekly" items={items} disabled={disabled}>
      <Select.Trigger render={<PopupButton />} aria-label="Repeat">
        <Select.Value />
      </Select.Trigger>
      <Select.Content alignItemWithTrigger={example === "select"} sideOffset={4}>
        <Select.List>
          {items.map(({ value, label }) => (
            <Select.Item key={value} value={value}>
              <Select.ItemText>{label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.List>
      </Select.Content>
    </Select>
  );
}
