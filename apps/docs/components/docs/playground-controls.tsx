"use client";

import type { ReactNode } from "react";

import { Select } from "@lenso/ui/select";
import { TextField } from "@lenso/ui/text-field";

interface PlaygroundControlsProps {
  children: ReactNode;
  example: string;
  exampleLabel?: string;
  exampleOptions?: readonly { label: string; value: string }[];
  name: string;
  onExampleChange: (value: string) => void;
}

interface PlaygroundSelectControlProps {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}

interface PlaygroundTextControlProps {
  label: string;
  onValueChange: (value: string) => void;
  value: string;
}

export function PlaygroundControls({
  children,
  example,
  exampleLabel = "Example · Default",
  exampleOptions,
  name,
  onExampleChange,
}: PlaygroundControlsProps) {
  return (
    <div className="lenso-playground-controls">
      <div className="lenso-playground-controls-header">
        <strong>{name}</strong>
        <PlaygroundSelectControl
          label="Example"
          onValueChange={onExampleChange}
          options={exampleOptions ?? [{ label: exampleLabel, value: example }]}
          value={example}
        />
      </div>
      <div className="lenso-playground-controls-divider" />
      <div className="lenso-playground-controls-list">{children}</div>
    </div>
  );
}

export function PlaygroundSelectControl({
  label,
  onValueChange,
  options,
  value,
}: PlaygroundSelectControlProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="lenso-playground-control-row">
      <span>{label}</span>
      <Select.Root
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue);
        }}
        value={value}
      >
        <Select.Trigger aria-label={label} className="lenso-playground-select-trigger">
          <Select.Value>{selectedLabel}</Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner position="item-aligned" align="start" sideOffset={4}>
            <Select.Popup className="lenso-playground-select-popup">
              <Select.List>
                {options.map((option) => (
                  <Select.Item
                    className="lenso-playground-select-item"
                    key={option.value}
                    value={option.value}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function PlaygroundTextControl({ label, onValueChange, value }: PlaygroundTextControlProps) {
  return (
    <div className="lenso-playground-control-row">
      <span>{label}</span>
      <TextField.Root className="lenso-playground-text-field">
        <TextField.Control
          aria-label={label}
          className="lenso-playground-text-control"
          onChange={(event) => onValueChange(event.currentTarget.value)}
          value={value}
        />
      </TextField.Root>
    </div>
  );
}
