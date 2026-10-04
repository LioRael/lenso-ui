/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { ColorSwatchPicker, parseColor, type ColorSwatchPickerRootProps } from "@lenso/ui";
import { ColorStoryIcon } from "./color-fixtures";
import { colorStoryStyles as s } from "./color.stylex";

export default {
  argTypes: {
    layout: { control: "select", options: ["grid", "stack"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    variant: { control: "select", options: ["circle", "square"] },
  },
  component: ColorSwatchPicker,
  parameters: { layout: "centered" },
  title: "Components/Colors/ColorSwatchPicker",
} satisfies Meta<typeof ColorSwatchPicker>;
type Story = StoryObj<typeof ColorSwatchPicker>;
const defaultColors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const variants = ["circle", "square"] as const;
function Items({
  colors = defaultColors,
  disabled = false,
  custom = false,
}: {
  colors?: string[];
  disabled?: boolean;
  custom?: boolean;
}) {
  return colors.map((color) => (
    <ColorSwatchPicker.Item key={color} color={color} isDisabled={disabled}>
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator>
        {custom ? <ColorStoryIcon kind="star" /> : undefined}
      </ColorSwatchPicker.Indicator>
    </ColorSwatchPicker.Item>
  ));
}
const Template = (props: ColorSwatchPickerRootProps) => (
  <ColorSwatchPicker {...props}>
    <Items />
  </ColorSwatchPicker>
);
export const Default: Story = {
  args: { variant: "circle", size: "md", layout: "grid" },
  render: Template,
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.column8)}>
      {sizes.map((size) => (
        <div key={size} {...stylex.props(s.column2)}>
          <span {...stylex.props(s.muted, s.medium, s.capitalize)}>{size}</span>
          <ColorSwatchPicker size={size}>
            <Items />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.column8)}>
      {variants.map((variant) => (
        <div key={variant} {...stylex.props(s.column2)}>
          <span {...stylex.props(s.muted, s.medium, s.capitalize)}>{variant}</span>
          <ColorSwatchPicker variant={variant}>
            <Items />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  ),
};
export const Layouts: Story = {
  render: () => (
    <div {...stylex.props(s.column8)}>
      {(["grid", "stack"] as const).map((layout) => (
        <div key={layout} {...stylex.props(s.column2)}>
          <span {...stylex.props(s.muted, s.medium, s.capitalize)}>{layout}</span>
          <ColorSwatchPicker layout={layout}>
            <Items />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  ),
};
export const AllVariants: Story = {
  render: () => (
    <div {...stylex.props(s.row16)}>
      {variants.map((variant) => (
        <div key={variant} {...stylex.props(s.column6)}>
          <span {...stylex.props(s.heading, s.capitalize)}>{variant}</span>
          {sizes.map((size) => (
            <div key={size} {...stylex.props(s.row4)}>
              <span {...stylex.props(s.width32, s.muted)}>{size}</span>
              <ColorSwatchPicker size={size} variant={variant}>
                <Items />
              </ColorSwatchPicker>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
export const Controlled: Story = {
  render: function ControlledComponent() {
    const [value, setValue] = React.useState(parseColor("#F43F5E"));
    return (
      <div {...stylex.props(s.column)}>
        <ColorSwatchPicker value={value} onChange={setValue}>
          <Items />
        </ColorSwatchPicker>
        <p {...stylex.props(s.muted)}>
          Selected: <span {...stylex.props(s.medium)}>{value.toString("hex")}</span>
        </p>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: () => (
    <ColorSwatchPicker>
      <Items disabled />
    </ColorSwatchPicker>
  ),
};
export const WithDefaultValue: Story = {
  render: () => (
    <ColorSwatchPicker defaultValue="#8B5CF6">
      <Items />
    </ColorSwatchPicker>
  ),
};
export const WithCustomIndicator: Story = {
  render: () => (
    <ColorSwatchPicker>
      <Items custom />
    </ColorSwatchPicker>
  ),
};
export const ExtendedPalette: Story = {
  render: () => (
    <div {...stylex.props(s.palette)}>
      <ColorSwatchPicker xstyle={s.tight} size="sm">
        <Items
          colors={[
            "#FEE2E2",
            "#FECACA",
            "#FCA5A5",
            "#F87171",
            "#EF4444",
            "#DC2626",
            "#FFEDD5",
            "#FED7AA",
            "#FDBA74",
            "#FB923C",
            "#F97316",
            "#EA580C",
            "#FEF3C7",
            "#FDE68A",
            "#FCD34D",
            "#FBBF24",
            "#F59E0B",
            "#D97706",
            "#DCFCE7",
            "#BBF7D0",
            "#86EFAC",
            "#4ADE80",
            "#22C55E",
            "#16A34A",
            "#DBEAFE",
            "#BFDBFE",
            "#93C5FD",
            "#60A5FA",
            "#3B82F6",
            "#2563EB",
            "#EDE9FE",
            "#DDD6FE",
            "#C4B5FD",
            "#A78BFA",
            "#8B5CF6",
            "#7C3AED",
            "#FFFFFF",
            "#000000",
          ]}
        />
      </ColorSwatchPicker>
    </div>
  ),
};
