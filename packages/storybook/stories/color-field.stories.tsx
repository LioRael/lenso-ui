/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, ColorField, ColorSwatch, parseColor, type Color } from "@lenso/ui";
import { ColorStoryField, ColorStoryPreview } from "./color-fixtures";
import { colorStoryStyles as s } from "./color.stylex";

const meta = {
  component: ColorField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Colors/ColorField",
} satisfies Meta<typeof ColorField>;
export default meta;
type Story = StoryObj<typeof meta>;
const DEFAULT_COLOR = parseColor("#0485F7");

export const Default: Story = {
  render: function DefaultColorField() {
    const [color, setColor] = useState<Color | null>(DEFAULT_COLOR);
    return (
      <ColorStoryField
        xstyle={s.field}
        name="color"
        value={color}
        onChange={setColor}
        label="Color"
        prefix={<ColorStoryPreview color={color ?? undefined} />}
      />
    );
  },
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.column)}>
      <ColorStoryField
        xstyle={s.field}
        defaultValue={parseColor("#0485F7")}
        name="primary-color"
        label="Primary variant"
        variant="primary"
      />
      <ColorStoryField
        xstyle={s.field}
        defaultValue={parseColor("#F43F5E")}
        name="secondary-color"
        label="Secondary variant"
        variant="secondary"
      />
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.width400, s.column)}>
      <ColorStoryField
        fullWidth
        defaultValue={parseColor("#10B981")}
        name="color"
        label="Brand Color"
      />
      <ColorStoryField
        fullWidth
        defaultValue={parseColor("#8B5CF6")}
        name="color-with-suffix"
        label="Theme Color"
      />
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.column)}>
      <ColorStoryField
        xstyle={s.field}
        defaultValue={parseColor("#3B82F6")}
        name="color"
        label="Primary Color"
        description="Enter your brand's primary color"
      />
      <ColorStoryField
        xstyle={s.field}
        defaultValue={parseColor("#F59E0B")}
        name="accent-color"
        label="Accent Color"
        description="Used for highlights and CTAs"
      />
    </div>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(s.column)}>
      <ColorStoryField
        isRequired
        xstyle={s.field}
        name="color"
        label="Brand Color"
        placeholder="#000000"
      />
      <ColorStoryField
        isRequired
        xstyle={s.field}
        name="theme-color"
        label="Theme Color"
        placeholder="#000000"
        description="Required field"
      />
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(s.column)}>
      <ColorStoryField
        isInvalid
        isRequired
        xstyle={s.field}
        name="color"
        label="Color"
        placeholder="#000000"
        error="Please enter a valid hex color"
      />
      <ColorStoryField
        isInvalid
        xstyle={s.field}
        name="invalid-color"
        label="Background Color"
        inputDefaultValue="not-a-color"
        error="Invalid color format. Use hex (e.g., #FF5733)"
      />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.column)}>
      <ColorStoryField
        isDisabled
        xstyle={s.field}
        defaultValue={parseColor("#0485F7")}
        name="color"
        label="Color"
        description="This color field is disabled"
      />
      <ColorStoryField
        isDisabled
        xstyle={s.field}
        name="color-empty"
        label="Color"
        placeholder="#000000"
        description="This color field is disabled"
      />
    </div>
  ),
};
export const Controlled: Story = {
  render: function ControlledColorField() {
    const [value, setValue] = useState<Color | null>(parseColor("#0485F7"));
    return (
      <div {...stylex.props(s.column)}>
        <ColorStoryField
          xstyle={s.field}
          name="color"
          value={value}
          onChange={setValue}
          label="Color"
          prefix={<ColorStoryPreview color={value ?? undefined} />}
          description={<>Current value: {value ? value.toString("hex") : "(empty)"}</>}
        />
        <div {...stylex.props(s.row2)}>
          <Button variant="tertiary" onClick={() => setValue(parseColor("#EF4444"))}>
            Set Red
          </Button>
          <Button variant="tertiary" onClick={() => setValue(parseColor("#10B981"))}>
            Set Green
          </Button>
          <Button variant="tertiary" onClick={() => setValue(null)}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
};
export const ChannelEditing: Story = {
  render: function HSLChannels() {
    const [color, setColor] = useState<Color | null>(parseColor("#7F007F"));
    return (
      <div {...stylex.props(s.column)}>
        <p {...stylex.props(s.muted)}>Edit individual HSL channels:</p>
        <div {...stylex.props(s.row4)}>
          {(["hue", "saturation", "lightness"] as const).map((channel) => (
            <ColorStoryField
              key={channel}
              channel={channel}
              xstyle={s.width100}
              colorSpace="hsl"
              name={channel}
              value={color}
              onChange={setColor}
              label={channel[0]!.toUpperCase() + channel.slice(1)}
              suffix={channel !== "hue" && <span {...stylex.props(s.muted)}>%</span>}
            />
          ))}
        </div>
        <div {...stylex.props(s.row2)}>
          <ColorSwatch xstyle={s.swatch32} color={color ?? undefined} size="xs" />
          <span {...stylex.props(s.small)}>
            Current: {color ? color.toString("hex") : "(empty)"}
          </span>
        </div>
      </div>
    );
  },
};
export const RGBChannels: Story = {
  render: function RGBChannelFields() {
    const [color, setColor] = useState<Color | null>(parseColor("#3B82F6"));
    return (
      <div {...stylex.props(s.column)}>
        <p {...stylex.props(s.muted)}>Edit individual RGB channels:</p>
        <div {...stylex.props(s.row4)}>
          {(["red", "green", "blue"] as const).map((channel) => (
            <ColorStoryField
              key={channel}
              channel={channel}
              xstyle={s.width80}
              colorSpace="rgb"
              name={channel}
              value={color}
              onChange={setColor}
              label={channel[0]!.toUpperCase() + channel.slice(1)}
            />
          ))}
        </div>
        <div {...stylex.props(s.row2)}>
          <ColorSwatch xstyle={s.swatch32} color={color ?? undefined} size="xs" />
          <span {...stylex.props(s.small)}>Current: {color?.toString("hex")}</span>
        </div>
      </div>
    );
  },
};
export const FormExample: Story = {
  render: function ColorForm() {
    const [value, setValue] = useState<Color | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isInvalid = value === null;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!value) return;
      setIsSubmitting(true);
      setTimeout(() => {
        console.log("Color submitted:", { color: value.toString("hex") });
        setValue(null);
        setIsSubmitting(false);
      }, 1500);
    };
    return (
      <form {...stylex.props(s.field, s.column)} onSubmit={handleSubmit}>
        <ColorStoryField
          fullWidth
          isRequired
          xstyle={s.full}
          isInvalid={Boolean(isInvalid && value !== null)}
          name="brand-color"
          value={value}
          onChange={setValue}
          label="Brand Color"
          prefix={<ColorStoryPreview color={value ?? undefined} />}
          placeholder="#000000"
          description="Choose your brand's primary color"
        />
        <Button
          fullWidth
          disabled={!value}
          isLoading={isSubmitting}
          type="submit"
          variant="primary"
        >
          {isSubmitting ? "Saving..." : "Save Color"}
        </Button>
      </form>
    );
  },
};
export const WithColorPresets: Story = {
  render: function ColorPresets() {
    const [value, setValue] = useState<Color | null>(parseColor("#0485F7"));
    const presets = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
    return (
      <div {...stylex.props(s.column)}>
        <ColorStoryField
          xstyle={s.field}
          name="color"
          value={value}
          onChange={setValue}
          label="Color"
          prefix={<ColorStoryPreview color={value?.toString("hex") || "#E4E4E7"} />}
          description="Select or enter a color"
        />
        <div {...stylex.props(s.row2)}>
          {presets.map((preset) => (
            <Button
              key={preset}
              isIconOnly
              variant="ghost"
              aria-label={`Set ${preset}`}
              onClick={() => setValue(parseColor(preset))}
            >
              <ColorSwatch color={preset} size="lg" />
            </Button>
          ))}
        </div>
      </div>
    );
  },
};
export const AllVariations: Story = {
  render: function AllColorFields() {
    const [color1, setColor1] = useState<Color | null>(parseColor("#0485F7"));
    const [color2, setColor2] = useState<Color | null>(parseColor("#10B981"));
    const [color3, setColor3] = useState<Color | null>(parseColor("#F43F5E"));
    return (
      <div {...stylex.props(s.column6)}>
        <div {...stylex.props(s.column)}>
          <ColorStoryField
            isRequired
            xstyle={s.field}
            name="color1"
            value={color1}
            onChange={setColor1}
            label="With Prefix Icon"
            prefix={<ColorStoryPreview color={color1 ?? undefined} />}
            description="Enter a hex color"
          />
          <ColorStoryField
            isRequired
            xstyle={s.field}
            name="color2"
            value={color2}
            onChange={setColor2}
            label="With Suffix"
            suffix={<ColorStoryPreview color={color2 ?? undefined} />}
            description="Enter a hex color"
          />
          <ColorStoryField
            isRequired
            xstyle={s.field}
            name="color3"
            value={color3}
            onChange={setColor3}
            label="Secondary Variant"
            variant="secondary"
            prefix={<ColorStoryPreview color={color3 ?? undefined} />}
            description="Enter a hex color"
          />
        </div>
      </div>
    );
  },
};
