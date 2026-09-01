"use client";

import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

import { Select } from "@lenso/ui/select";
import { TextField } from "@lenso/ui/text-field";
import { styles } from "./playground-controls.stylex";

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
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.header)}>
        <strong {...stylex.props(styles.headerTitle)}>{name}</strong>
        <PlaygroundSelectControl
          label="Example"
          onValueChange={onExampleChange}
          options={exampleOptions ?? [{ label: exampleLabel, value: example }]}
          value={example}
        />
      </div>
      <div {...stylex.props(styles.divider)} />
      <div {...stylex.props(styles.list)}>{children}</div>
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
    <div {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <Select.Root
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue);
        }}
        value={value}
      >
        <Select.Trigger aria-label={label} xstyle={styles.selectTrigger}>
          <Select.Value xstyle={styles.selectValue}>{selectedLabel}</Select.Value>
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner position="item-aligned" align="start" sideOffset={4}>
            <Select.Popup xstyle={styles.selectPopup}>
              <Select.List>
                {options.map((option) => (
                  <Select.Item key={option.value} value={option.value} xstyle={styles.selectItem}>
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
    <div {...stylex.props(styles.row)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <TextField.Root xstyle={styles.textField}>
        <TextField.Control
          aria-label={label}
          onChange={(event) => onValueChange(event.currentTarget.value)}
          value={value}
          xstyle={styles.textControl}
        />
      </TextField.Root>
    </div>
  );
}
