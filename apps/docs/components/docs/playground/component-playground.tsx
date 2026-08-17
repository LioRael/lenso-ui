"use client";

import * as React from "react";
import { useDialKitController, type DialConfig, type DialValue } from "dialkit";

import { Button } from "@lenso/ui/button";

import { LivePlayground } from "../live-playground";
import {
  PlaygroundControls,
  PlaygroundSelectControl,
  PlaygroundTextControl,
} from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";
import { optionToPlaygroundOption } from "./config";
import type {
  PlaygroundAdapter,
  PlaygroundConfig,
  PlaygroundControl,
  PlaygroundValue,
} from "./types";

function dialConfigForControl(
  control: PlaygroundControl,
  defaultValue: PlaygroundValue,
): DialValue {
  switch (control.type) {
    case "boolean":
      return defaultValue === true;
    case "select":
      return {
        default: typeof defaultValue === "string" ? defaultValue : control.default,
        options: control.options.map(optionToPlaygroundOption),
        type: "select",
      };
    case "text":
      return {
        default: typeof defaultValue === "string" ? defaultValue : control.default,
        type: "text",
      };
  }
}

function exampleValues(config: PlaygroundConfig, exampleId: string) {
  const example = config.examples.find((candidate) => candidate.id === exampleId);
  if (!example) throw new Error(`Unknown example ${exampleId} for playground ${config.id}`);

  return Object.fromEntries(
    config.controls.map((control) => [control.id, example.values?.[control.id] ?? control.default]),
  ) as Record<string, PlaygroundValue>;
}

function createDialConfig(config: PlaygroundConfig, exampleId: string): DialConfig {
  const values = exampleValues(config, exampleId);
  return Object.fromEntries(
    config.controls.map((control) => [
      control.id,
      dialConfigForControl(control, values[control.id]!),
    ]),
  ) as DialConfig;
}

function controlValue(
  values: Readonly<Record<string, PlaygroundValue>>,
  control: PlaygroundControl,
): PlaygroundValue {
  return values[control.id] ?? control.default;
}

function renderCodeTemplate(template: string, values: Readonly<Record<string, PlaygroundValue>>) {
  return template.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, id: string) => String(values[id] ?? ""));
}

function PlaygroundControlField({
  control,
  onValueChange,
  value,
}: {
  control: PlaygroundControl;
  onValueChange: (value: PlaygroundValue) => void;
  value: PlaygroundValue;
}) {
  if (control.type === "text") {
    return (
      <PlaygroundTextControl
        label={control.label}
        onValueChange={onValueChange}
        value={typeof value === "string" ? value : String(value)}
      />
    );
  }

  const options =
    control.type === "boolean"
      ? [
          { label: "False", value: "false" },
          { label: "True", value: "true" },
        ]
      : control.options.map(optionToPlaygroundOption);
  const selectedValue =
    control.type === "boolean"
      ? value === true
        ? "true"
        : "false"
      : typeof value === "string"
        ? value
        : control.default;

  return (
    <PlaygroundSelectControl
      label={control.label}
      onValueChange={(nextValue) =>
        onValueChange(control.type === "boolean" ? nextValue === "true" : nextValue)
      }
      options={options}
      value={selectedValue}
    />
  );
}

export function ComponentPlayground({
  adapter,
  config,
  initialExample,
}: {
  adapter: PlaygroundAdapter;
  config: PlaygroundConfig;
  initialExample?: string | undefined;
}) {
  const pageTheme = useDocsPageTheme();
  const selectedInitialExample = initialExample ?? config.defaultExample!;
  const dialConfig = React.useMemo(
    () => createDialConfig(config, selectedInitialExample),
    [config, selectedInitialExample],
  );
  const dial = useDialKitController(config.name, dialConfig, {
    id: `docs-${config.id}`,
  });
  const [example, setExample] = React.useState(selectedInitialExample);
  const [copied, setCopied] = React.useState(false);
  const values = dial.values as Record<string, PlaygroundValue>;
  const themeValue = config.themeControl ? values[config.themeControl] : undefined;
  const theme = config.themeControl
    ? themeValue === "dark" || themeValue === "light"
      ? themeValue
      : "system"
    : pageTheme;

  const setValue = (id: string, value: PlaygroundValue) => {
    dial.setValue(id, value as DialValue);
  };

  const selectExample = (nextExample: string) => {
    if (!config.examples.some((candidate) => candidate.id === nextExample)) return;
    setExample(nextExample);
    const nextValues = exampleValues(config, nextExample);
    for (const [id, value] of Object.entries(nextValues)) {
      setValue(id, value);
    }
  };

  const reset = () => {
    setExample(config.defaultExample!);
    dial.resetValues();
  };

  const currentCode = config.codeTemplate
    ? renderCodeTemplate(config.codeTemplate, values)
    : config.examples.find((candidate) => candidate.id === example)?.code;

  return (
    <LivePlayground
      actions={
        <>
          <Button onClick={reset} variant="secondary">
            Reset
          </Button>
          {currentCode && (
            <Button
              className="copy-button"
              onClick={async () => {
                await navigator.clipboard.writeText(currentCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
              variant="secondary"
            >
              {copied ? "Copied" : "Copy JSX"}
            </Button>
          )}
        </>
      }
      controls={
        <PlaygroundControls
          example={example}
          exampleLabel={
            config.examples.find((candidate) => candidate.id === example)?.label ?? "Example"
          }
          exampleOptions={config.examples.map((candidate) => ({
            label: candidate.label,
            value: candidate.id,
          }))}
          name={config.name}
          onExampleChange={selectExample}
        >
          {config.controls.map((control) => (
            <PlaygroundControlField
              control={control}
              key={control.id}
              onValueChange={(value) => setValue(control.id, value)}
              value={controlValue(values, control)}
            />
          ))}
        </PlaygroundControls>
      }
      description={config.description}
      preview={adapter({
        example,
        pageTheme,
        setValue,
        theme,
        values,
      })}
      {...(config.bodyClassName ? { bodyClassName: config.bodyClassName } : {})}
      {...(config.sectionClassName ? { sectionClassName: config.sectionClassName } : {})}
      {...(config.stageClassName ? { stageClassName: config.stageClassName } : {})}
      {...(config.title ? { title: config.title } : {})}
    />
  );
}
