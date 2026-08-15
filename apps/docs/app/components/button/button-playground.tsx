"use client";

import * as React from "react";
import { useDialKitController } from "dialkit";

import { Button, type ButtonSize, type ButtonVariant } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { LivePlayground } from "../docs/live-playground";
import {
  PlaygroundControls,
  PlaygroundSelectControl,
  PlaygroundTextControl,
} from "../docs/playground-controls";

type ButtonState = "default" | "disabled" | "focus-visible" | "hover" | "loading" | "pressed";

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerTheme(): "light" {
  return "light";
}

export function ButtonPlayground() {
  const [copied, setCopied] = React.useState(false);
  const systemTheme = React.useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerTheme,
  );
  const dial = useDialKitController(
    "Button",
    {
      advanced: {
        default: "internal-lab",
        options: [{ label: "Internal lab", value: "internal-lab" }],
        type: "select",
      },
      example: {
        default: "default",
        options: [{ label: "Example · Default", value: "default" }],
        type: "select",
      },
      label: "Continue",
      size: { default: "compact", options: ["compact", "default"], type: "select" },
      state: {
        default: "default",
        options: ["default", "hover", "pressed", "focus-visible", "disabled", "loading"],
        type: "select",
      },
      theme: { default: "system", options: ["system", "light", "dark"], type: "select" },
      variant: {
        default: "primary",
        options: ["primary", "secondary", "ghost", "danger"],
        type: "select",
      },
    },
    { id: "docs-button" },
  );
  const values = dial.values;
  const size = values.size as ButtonSize;
  const state = values.state as ButtonState;
  const theme = values.theme === "system" ? systemTheme : (values.theme as "dark" | "light");
  const variant = values.variant as ButtonVariant;
  const visualState =
    state === "hover" || state === "pressed" || state === "focus-visible" ? state : undefined;
  const code = `<Button variant="${variant}" size="${size}">${values.label}</Button>`;

  return (
    <LivePlayground
      actions={
        <>
          <Button onClick={() => dial.resetValues()} variant="secondary">
            Reset
          </Button>
          <Button
            className="copy-button"
            onClick={async () => {
              await navigator.clipboard.writeText(code);
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
          example={values.example}
          name="Button"
          onExampleChange={(value) => dial.setValue("example", value)}
        >
          <PlaygroundSelectControl
            label="Tone"
            onValueChange={(value) => dial.setValue("variant", value)}
            options={[
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Ghost", value: "ghost" },
              { label: "Danger", value: "danger" },
            ]}
            value={values.variant}
          />
          <PlaygroundSelectControl
            label="Size"
            onValueChange={(value) => dial.setValue("size", value)}
            options={[
              { label: "Compact", value: "compact" },
              { label: "Default", value: "default" },
            ]}
            value={values.size}
          />
          <PlaygroundSelectControl
            label="State"
            onValueChange={(value) => dial.setValue("state", value)}
            options={[
              { label: "Default", value: "default" },
              { label: "Hover", value: "hover" },
              { label: "Pressed", value: "pressed" },
              { label: "Focus visible", value: "focus-visible" },
              { label: "Disabled", value: "disabled" },
              { label: "Loading", value: "loading" },
            ]}
            value={values.state}
          />
          <PlaygroundTextControl
            label="Label"
            onValueChange={(value) => dial.setValue("label", value)}
            value={values.label}
          />
          <PlaygroundSelectControl
            label="Theme"
            onValueChange={(value) => dial.setValue("theme", value)}
            options={[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
            value={values.theme}
          />
          <PlaygroundSelectControl
            label="Advanced"
            onValueChange={(value) => dial.setValue("advanced", value)}
            options={[{ label: "Internal lab", value: "internal-lab" }]}
            value={values.advanced}
          />
        </PlaygroundControls>
      }
      controlsMode="custom"
      description="Try every supported variant on the real component while DialKit keeps the controls and values in sync."
      preview={
        <ThemeScope className="stage-canvas" theme={theme}>
          <Button
            data-visual-state={visualState}
            disabled={state === "disabled"}
            loading={state === "loading"}
            size={size}
            variant={variant}
          >
            {values.label}
          </Button>
          <p>Controls update this example and its generated JSX.</p>
        </ThemeScope>
      }
    />
  );
}
