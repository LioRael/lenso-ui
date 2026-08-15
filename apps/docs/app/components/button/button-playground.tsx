"use client";

import * as React from "react";
import { DialRoot, useDialKitController } from "dialkit";

import { Button, type ButtonSize, type ButtonVariant } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { LivePlayground } from "../docs/live-playground";

type ButtonState = "default" | "disabled" | "focus-visible" | "hover" | "loading" | "pressed";

export function ButtonPlayground() {
  const [copied, setCopied] = React.useState(false);
  const dial = useDialKitController(
    "Button",
    {
      label: "Continue",
      size: { default: "compact", options: ["compact", "default"], type: "select" },
      state: {
        default: "default",
        options: ["default", "hover", "pressed", "focus-visible", "disabled", "loading"],
        type: "select",
      },
      theme: { default: "light", options: ["light", "dark"], type: "select" },
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
  const theme = values.theme as "dark" | "light";
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
      controls={<DialRoot mode="inline" productionEnabled theme={theme} />}
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
