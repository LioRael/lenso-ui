"use client";

import { PlusIcon } from "lucide-react";

import { Button, type ButtonSize, type ButtonVariant } from "@lenso/ui/button";
import { IconButton, type IconButtonSize, type IconButtonVariant } from "@lenso/ui/icon-button";
import { SettingsRow } from "@lenso/ui/settings-row";
import { Select } from "@lenso/ui/select";
import { Switch } from "@lenso/ui/switch";
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

export const buttonAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const label = stringValue(values, "label", "Continue");
  const size = stringValue(values, "size", "compact") as ButtonSize;
  const state = stringValue(values, "state", "default");
  const variant = stringValue(values, "variant", "primary") as ButtonVariant;
  const visualState = ["hover", "pressed", "focus-visible"].includes(state) ? state : undefined;

  return (
    <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
      <Button
        data-visual-state={visualState}
        disabled={state === "disabled"}
        loading={state === "loading"}
        size={size}
        variant={variant}
      >
        {label}
      </Button>
    </ThemeScope>
  );
};

export const iconButtonAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const size = stringValue(values, "size", "compact") as IconButtonSize;
  const state = stringValue(values, "state", "default");
  const variant = stringValue(values, "variant", "secondary") as IconButtonVariant;
  const visualState = ["hover", "pressed", "focus-visible"].includes(state) ? state : undefined;

  return (
    <ThemeScope theme={theme} xstyle={stageStyles.canvas}>
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
    </ThemeScope>
  );
};

function ControlExample({
  control,
  controlId,
  disabled,
  labelId,
  visualState,
}: {
  control: "action" | "select" | "toggle";
  controlId: string;
  disabled: boolean;
  labelId: string;
  visualState: "hover" | undefined;
}) {
  if (control === "toggle") {
    return (
      <Switch.Root
        aria-labelledby={labelId}
        defaultChecked
        data-visual-state={visualState}
        disabled={disabled}
        id={controlId}
        layout="control-only"
      >
        <Switch.Thumb />
      </Switch.Root>
    );
  }
  if (control === "action") {
    return (
      <Button data-visual-state={visualState} disabled={disabled} variant="secondary">
        Customize
      </Button>
    );
  }
  return (
    <Select.Root defaultValue="default" disabled={disabled}>
      <Select.Trigger aria-labelledby={labelId} data-visual-state={visualState} id={controlId}>
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
    <ThemeScope theme={theme} xstyle={[stageStyles.canvas, stageStyles.settingsRow]}>
      <SettingsRow.Root disabled={disabled}>
        <SettingsRow.Copy>
          {control === "toggle" ? (
            <SettingsRow.Label>Setting title</SettingsRow.Label>
          ) : (
            <SettingsRow.Title>Setting title</SettingsRow.Title>
          )}
          <SettingsRow.Description>
            Supporting description for this preference.
          </SettingsRow.Description>
        </SettingsRow.Copy>
        <SettingsRow.Control>
          {({ controlId, disabled: rowDisabled, labelId, visualState }) => (
            <ControlExample
              control={control}
              controlId={controlId}
              disabled={rowDisabled}
              labelId={labelId}
              visualState={visualState}
            />
          )}
        </SettingsRow.Control>
      </SettingsRow.Root>
    </ThemeScope>
  );
};
