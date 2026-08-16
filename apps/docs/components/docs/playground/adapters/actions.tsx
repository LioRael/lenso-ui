"use client";

import { PlusIcon } from "lucide-react";

import { Button, type ButtonSize, type ButtonVariant } from "@lenso/ui/button";
import { IconButton, type IconButtonSize, type IconButtonVariant } from "@lenso/ui/icon-button";
import { SettingsRow } from "@lenso/ui/settings-row";
import { Select } from "@lenso/ui/select";
import { Switch } from "@lenso/ui/switch";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";

function stringValue(
  values: Readonly<Record<string, boolean | number | string>>,
  id: string,
  fallback: string,
) {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
}

export const buttonAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const label = stringValue(values, "label", "Continue");
  const size = stringValue(values, "size", "compact") as ButtonSize;
  const state = stringValue(values, "state", "default");
  const variant = stringValue(values, "variant", "primary") as ButtonVariant;
  const visualState = ["hover", "pressed", "focus-visible"].includes(state) ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <Button
        data-visual-state={visualState}
        disabled={state === "disabled"}
        loading={state === "loading"}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
      <p>Controls update this example and its generated JSX.</p>
    </ThemeScope>
  );
};

export const iconButtonAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const size = stringValue(values, "size", "compact") as IconButtonSize;
  const state = stringValue(values, "state", "default");
  const variant = stringValue(values, "variant", "secondary") as IconButtonVariant;
  const visualState = ["hover", "pressed", "focus-visible"].includes(state) ? state : undefined;

  return (
    <ThemeScope className="stage-canvas" theme={theme}>
      <IconButton
        aria-label="Create issue"
        data-visual-state={visualState}
        disabled={state === "disabled"}
        selected={state === "selected"}
        size={size}
        variant={variant}
      >
        <PlusIcon />
      </IconButton>
      <p>Controls update this example only.</p>
    </ThemeScope>
  );
};

function ControlExample({
  control,
  disabled,
}: {
  control: "action" | "select" | "toggle";
  disabled: boolean;
}) {
  if (control === "toggle") {
    return (
      <Switch.Root aria-labelledby="settings-row-example-title" checked disabled={disabled}>
        <Switch.Thumb />
      </Switch.Root>
    );
  }
  if (control === "action") {
    return (
      <Button disabled={disabled} variant="secondary">
        Customize
      </Button>
    );
  }
  return (
    <Select.Root defaultValue="default" disabled={disabled}>
      <Select.Trigger aria-labelledby="settings-row-example-title">
        <Select.Value>Default</Select.Value>
        <Select.Icon />
      </Select.Trigger>
    </Select.Root>
  );
}

export const settingsRowAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const control = stringValue(values, "control", "select") as "action" | "select" | "toggle";
  const disabled = values.disabled === true;

  return (
    <ThemeScope className="stage-canvas settings-row-stage" theme={theme}>
      <SettingsRow.Root disabled={disabled}>
        <SettingsRow.Copy>
          <SettingsRow.Title id="settings-row-example-title">Setting title</SettingsRow.Title>
          <SettingsRow.Description>
            Supporting description for this preference.
          </SettingsRow.Description>
        </SettingsRow.Copy>
        <SettingsRow.Control>
          <ControlExample control={control} disabled={disabled} />
        </SettingsRow.Control>
      </SettingsRow.Root>
    </ThemeScope>
  );
};
