/**
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 * Supporting labels use the exported color context parts, not ordinary Field.
 */
import React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ColorField,
  ColorSwatch,
  Select,
  type ColorSpace,
  type ColorFieldRootProps,
} from "@lenso/ui";
import { colorStoryStyles as s } from "./color.stylex";

export function ColorStoryField({
  label,
  description,
  error,
  prefix,
  suffix,
  placeholder,
  inputDefaultValue,
  variant,
  ...props
}: Omit<ColorFieldRootProps, "prefix"> & {
  label: string;
  description?: React.ReactNode;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  inputDefaultValue?: string;
  variant?: "primary" | "secondary";
}) {
  const [inputValue, setInputValue] = React.useState(inputDefaultValue);
  return (
    <ColorField {...props}>
      <ColorField.Label>{label}</ColorField.Label>
      <ColorField.Group variant={variant}>
        {prefix && <ColorField.Prefix>{prefix}</ColorField.Prefix>}
        <ColorField.Input
          placeholder={placeholder}
          value={inputDefaultValue === undefined ? undefined : inputValue}
          onChange={
            inputDefaultValue === undefined
              ? undefined
              : (event) => setInputValue(event.target.value)
          }
        />
        {suffix && <ColorField.Suffix>{suffix}</ColorField.Suffix>}
      </ColorField.Group>
      {description && <ColorField.Description>{description}</ColorField.Description>}
      {error && <ColorField.Error>{error}</ColorField.Error>}
    </ColorField>
  );
}

export function ColorStoryPreview({
  color,
}: {
  color: React.ComponentProps<typeof ColorSwatch>["color"];
}) {
  return <ColorSwatch color={color} size="xs" />;
}

export function ColorSpaceSelect({
  value,
  onChange,
}: {
  value: ColorSpace;
  onChange: (space: ColorSpace) => void;
}) {
  // Keep the nested Select popup inside the color picker's focus boundary.
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  return (
    <Select
      value={value}
      variant="secondary"
      onValueChange={(space) => {
        if (space) onChange(space);
      }}
    >
      <Select.Trigger aria-label="Color space">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <div ref={setContainer} />
      <Select.Portal container={container}>
        <Select.Positioner>
          <Select.Popover>
            <Select.List>
              {(["hsl", "hsb", "rgb"] as const).map((space) => (
                <Select.Item key={space} value={space}>
                  <Select.ItemText>{space}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popover>
        </Select.Positioner>
      </Select.Portal>
    </Select>
  );
}

/** Gravity UI icons, MIT, Copyright YANDEX LLC; see ../GRAVITY-ICONS-LICENSE.txt. */
export function ColorStoryIcon({ kind }: { kind: "star" | "shuffle" }) {
  return (
    <svg {...stylex.props(s.icon)} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {kind === "star" ? (
        <path d="M6.886.773C7.29-.231 8.71-.231 9.114.773l1.472 3.667 3.943.268c1.08.073 1.518 1.424.688 2.118L12.185 9.36l.964 3.832c.264 1.05-.886 1.884-1.802 1.31L8 12.4l-3.347 2.101c-.916.575-2.066-.26-1.802-1.309l.964-3.832L.783 6.826c-.83-.694-.391-2.045.688-2.118l3.943-.268z" />
      ) : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.75 12.5a.75.75 0 0 1 0-1.5h2.044c.86 0 1.644-.49 2.021-1.262L6.665 8l-.85-1.738A2.25 2.25 0 0 0 3.794 5H1.75a.75.75 0 1 1 0-1.5h2.044a3.75 3.75 0 0 1 3.369 2.103l.337.69.337-.69A3.75 3.75 0 0 1 11.206 3.5h1.233l-.97-.97a.75.75 0 0 1 1.061-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97h-1.234c-.86 0-1.644.49-2.021 1.262l-2.022 4.135A3.75 3.75 0 0 1 3.794 12.5zm6.639-1.542.696-1.424.1.204A2.25 2.25 0 0 0 11.206 11h1.233l-.97-.97a.75.75 0 1 1 1.061-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97h-1.234a3.75 3.75 0 0 1-2.905-1.378q.046-.08.088-.164"
        />
      )}
    </svg>
  );
}
