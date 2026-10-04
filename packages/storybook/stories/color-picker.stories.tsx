/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  parseColor,
  type ColorSpace,
} from "@lenso/ui";
import { ColorSpaceSelect, ColorStoryIcon } from "./color-fixtures";
import { colorStoryStyles as s } from "./color.stylex";

const colorPresets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
];
const meta = {
  component: ColorPicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Colors/ColorPicker",
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<Partial<React.ComponentProps<typeof ColorPicker>>>;
function PickerArea() {
  return (
    <ColorArea
      aria-label="Color area"
      xstyle={s.pickerArea}
      colorSpace="hsb"
      xChannel="saturation"
      yChannel="brightness"
    >
      <ColorArea.Thumb />
    </ColorArea>
  );
}
function HueSlider() {
  return (
    <ColorSlider channel="hue" xstyle={s.sliderCompact} colorSpace="hsb">
      <ColorSlider.Label>Hue</ColorSlider.Label>
      <ColorSlider.Output xstyle={s.muted} />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
function Presets() {
  return colorPresets.map((preset) => (
    <ColorSwatchPicker.Item key={preset} color={preset}>
      <ColorSwatchPicker.Swatch />
    </ColorSwatchPicker.Item>
  ));
}
export const Default: Story = {
  render: () => (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>Pick a color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorPicker.Dialog aria-label="Pick a color">
          <PickerArea />
          <HueSlider />
        </ColorPicker.Dialog>
      </ColorPicker.Popover>
    </ColorPicker>
  ),
};
export const Controlled: Story = {
  render: function ControlledColorPicker() {
    const [color, setColor] = React.useState(parseColor("#325578"));
    const shuffleColor = () => {
      const randomHue = Math.floor(Math.random() * 360);
      const randomSaturation = 50 + Math.floor(Math.random() * 50);
      const randomLightness = 40 + Math.floor(Math.random() * 30);
      setColor(parseColor(`hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`));
    };
    return (
      <div {...stylex.props(s.column)}>
        <ColorPicker value={color} onChange={setColor}>
          <ColorPicker.Trigger>
            <ColorSwatch size="lg" />
            <span>Pick a color</span>
          </ColorPicker.Trigger>
          <ColorPicker.Popover xstyle={s.pickerGap}>
            <ColorPicker.Dialog aria-label="Pick a color">
              <ColorSwatchPicker xstyle={s.presets} size="xs">
                <Presets />
              </ColorSwatchPicker>
              <PickerArea />
              <div {...stylex.props(s.row2)}>
                <ColorSlider aria-label="Hue slider" channel="hue" xstyle={s.flex} colorSpace="hsb">
                  <ColorSlider.Track>
                    <ColorSlider.Thumb />
                  </ColorSlider.Track>
                </ColorSlider>
                <Button
                  isIconOnly
                  aria-label="Shuffle color"
                  size="sm"
                  variant="tertiary"
                  onClick={shuffleColor}
                >
                  <ColorStoryIcon kind="shuffle" />
                </Button>
              </div>
              <ColorField aria-label="Color field">
                <ColorField.Group variant="secondary">
                  <ColorField.Prefix>
                    <ColorSwatch size="xs" />
                  </ColorField.Prefix>
                  <ColorField.Input />
                </ColorField.Group>
              </ColorField>
            </ColorPicker.Dialog>
          </ColorPicker.Popover>
        </ColorPicker>
        <p {...stylex.props(s.width240, s.muted)}>
          Selected: <span {...stylex.props(s.medium)}>{color.toString("hex")}</span>
        </p>
      </div>
    );
  },
};
export const WithSwatches: Story = {
  render: () => (
    <ColorPicker defaultValue="#F43F5E">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>Brand Color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorPicker.Dialog aria-label="Brand Color">
          <PickerArea />
          <HueSlider />
          <ColorSwatchPicker xstyle={s.presetsInline} size="xs">
            <Presets />
          </ColorSwatchPicker>
        </ColorPicker.Dialog>
      </ColorPicker.Popover>
    </ColorPicker>
  ),
};
export const WidthFields: Story = {
  render: function PickerWithFields() {
    const [colorSpace, setColorSpace] = React.useState<ColorSpace>("hsl");
    const colorChannelsByColorSpace = {
      hsl: ["hue", "saturation", "lightness"],
      hsb: ["hue", "saturation", "brightness"],
      rgb: ["red", "green", "blue"],
    } as const;
    return (
      <ColorPicker defaultValue="hsla(220, 90%, 50%, 0.8)">
        <ColorPicker.Trigger>
          <ColorSwatch size="lg" />
          <span>Pick a color</span>
        </ColorPicker.Trigger>
        <ColorPicker.Popover xstyle={s.pickerNarrow}>
          <ColorPicker.Dialog aria-label="Pick a color">
            <PickerArea />
            <HueSlider />
            <ColorSpaceSelect value={colorSpace} onChange={setColorSpace} />
            <div {...stylex.props(s.channelGrid)}>
              {colorChannelsByColorSpace[colorSpace].map((channel) => (
                <ColorField
                  key={channel}
                  aria-label={channel}
                  channel={channel}
                  colorSpace={colorSpace}
                >
                  <ColorField.Group variant="secondary">
                    <ColorField.Input />
                  </ColorField.Group>
                </ColorField>
              ))}
            </div>
          </ColorPicker.Dialog>
        </ColorPicker.Popover>
      </ColorPicker>
    );
  },
};

function ChannelSliders({ space }: { space: ColorSpace }) {
  // Branch on space to retain Lenso's typed channel/space correlation.
  const parts = (channel: string) => (
    <>
      <ColorSlider.Label>{channel}</ColorSlider.Label>
      <ColorSlider.Output xstyle={s.muted} />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </>
  );
  if (space === "hsl")
    return (["hue", "saturation", "lightness", "alpha"] as const).map((channel) => (
      <ColorSlider
        key={channel}
        aria-label={channel}
        channel={channel}
        xstyle={s.sliderCompact}
        colorSpace="hsl"
      >
        {parts(channel)}
      </ColorSlider>
    ));
  if (space === "hsb")
    return (["hue", "saturation", "brightness", "alpha"] as const).map((channel) => (
      <ColorSlider
        key={channel}
        aria-label={channel}
        channel={channel}
        xstyle={s.sliderCompact}
        colorSpace="hsb"
      >
        {parts(channel)}
      </ColorSlider>
    ));
  return (["red", "green", "blue", "alpha"] as const).map((channel) => (
    <ColorSlider
      key={channel}
      aria-label={channel}
      channel={channel}
      xstyle={s.sliderCompact}
      colorSpace="rgb"
    >
      {parts(channel)}
    </ColorSlider>
  ));
}
export const WithSliders: Story = {
  render: function PickerWithSliders() {
    const [colorSpace, setColorSpace] = React.useState<ColorSpace>("hsl");
    return (
      <ColorPicker defaultValue="hsl(219, 58%, 93%)">
        <ColorPicker.Trigger>
          <ColorSwatch size="lg" />
          <span>Pick a color</span>
        </ColorPicker.Trigger>
        <ColorPicker.Popover xstyle={s.pickerSliders}>
          <ColorPicker.Dialog aria-label="Pick a color">
            <ColorSpaceSelect value={colorSpace} onChange={setColorSpace} />
            <div {...stylex.props(s.column2)}>
              <ChannelSliders space={colorSpace} />
            </div>
          </ColorPicker.Dialog>
        </ColorPicker.Popover>
      </ColorPicker>
    );
  },
};
