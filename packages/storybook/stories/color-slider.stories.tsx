/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { ColorSlider, ColorSwatch, parseColor } from "@lenso/ui";
import { colorStoryStyles as s } from "./color.stylex";

const meta: Meta<typeof ColorSlider> = {
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    colorSpace: { control: { type: "select" }, options: ["hsl", "hsb", "rgb"] },
    channel: {
      control: { type: "select" },
      options: ["hue", "saturation", "brightness", "lightness", "alpha", "red", "green", "blue"],
    },
    orientation: { control: { type: "select" }, options: ["horizontal", "vertical"] },
  },
  component: ColorSlider,
  decorators: [
    (Story) => (
      <div {...stylex.props(s.sliderFrame)}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Colors/ColorSlider",
};
export default meta;
type Story = StoryObj<typeof ColorSlider>;
export const Default: Story = {
  args: {
    channel: "hue",
    defaultValue: "hsl(0, 100%, 50%)",
    isDisabled: false,
    orientation: "horizontal",
    colorSpace: "hsl",
  },
  render: (args) => (
    <div {...stylex.props(args.orientation === "vertical" && s.vertical)}>
      <ColorSlider {...args}>
        <ColorSlider.Label>Hue</ColorSlider.Label>
        <ColorSlider.Output />
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
    </div>
  ),
};
export const SaturationChannel: Story = {
  args: { channel: "saturation", defaultValue: "hsl(0, 100%, 50%)", colorSpace: "hsl" },
  render: (args) => (
    <ColorSlider {...args}>
      <ColorSlider.Label>Saturation</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  ),
};
export const LightnessChannel: Story = {
  args: { channel: "lightness", defaultValue: "hsl(0, 100%, 50%)", colorSpace: "hsl" },
  render: (args) => (
    <ColorSlider {...args}>
      <ColorSlider.Label>Lightness</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  ),
};
export const AlphaChannel: Story = {
  args: { channel: "alpha", defaultValue: "hsla(0, 100%, 50%, 0.5)", colorSpace: "hsl" },
  render: (args) => (
    <ColorSlider {...args}>
      <ColorSlider.Label>Alpha</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  ),
};
export const RGBChannels: Story = {
  render: function RGBColorSliders() {
    const [color, setColor] = React.useState(parseColor("rgb(255, 0, 0)"));
    return (
      <div {...stylex.props(s.column)}>
        {(["red", "green", "blue"] as const).map((channel) => (
          <ColorSlider
            key={channel}
            channel={channel}
            colorSpace="rgb"
            value={color}
            onChange={setColor}
          >
            <ColorSlider.Label>{channel[0]!.toUpperCase() + channel.slice(1)}</ColorSlider.Label>
            <ColorSlider.Output />
            <ColorSlider.Track>
              <ColorSlider.Thumb />
            </ColorSlider.Track>
          </ColorSlider>
        ))}
      </div>
    );
  },
};
export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div {...stylex.props(s.verticalFrame)}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      {(["hue", "saturation", "lightness"] as const).map((channel) => (
        <ColorSlider
          key={channel}
          channel={channel}
          defaultValue="hsl(0, 100%, 50%)"
          orientation="vertical"
        >
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      ))}
    </>
  ),
};
export const Disabled: Story = {
  args: { isDisabled: true, channel: "hue", defaultValue: "hsl(200, 100%, 50%)" },
  render: (args) => (
    <ColorSlider {...args}>
      <ColorSlider.Label>Hue</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  ),
};
export const Controlled: Story = {
  render: function ControlledColorSlider() {
    const [color, setColor] = React.useState(parseColor("hsl(0, 100%, 50%)"));
    return (
      <div {...stylex.props(s.column, s.full)}>
        <div {...stylex.props(s.width200, s.column)}>
          {(["hue", "saturation", "lightness"] as const).map((channel) => (
            <ColorSlider key={channel} channel={channel} value={color} onChange={setColor}>
              <ColorSlider.Label>{channel[0]!.toUpperCase() + channel.slice(1)}</ColorSlider.Label>
              <ColorSlider.Output />
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
          ))}
        </div>
        <div {...stylex.props(s.marginTop, s.width350, s.row)}>
          <ColorSwatch color={color} size="lg" />
          <p {...stylex.props(s.muted)}>
            Current color: <span {...stylex.props(s.mono)}>{color.toString("hsl")}</span>
          </p>
        </div>
      </div>
    );
  },
};
export const WithoutLabel: Story = {
  args: { channel: "hue", defaultValue: "hsl(200, 100%, 50%)", "aria-label": "Hue" },
  render: (args) => (
    <ColorSlider {...args}>
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  ),
};
