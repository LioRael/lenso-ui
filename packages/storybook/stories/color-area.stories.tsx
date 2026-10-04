/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { ColorArea, ColorSwatch, parseColor, type ColorAreaRootProps } from "@lenso/ui";
import { colorStoryStyles as s } from "./color.stylex";

export default {
  argTypes: { showDots: { control: "boolean" } },
  component: ColorArea,
  parameters: { layout: "centered" },
  title: "Components/Colors/ColorArea",
} satisfies Meta<typeof ColorArea>;
const defaultArgs: ColorAreaRootProps = { showDots: false };
const Template = (props: ColorAreaRootProps) => (
  <div {...stylex.props(s.area)}>
    <ColorArea {...props}>
      <ColorArea.Thumb />
    </ColorArea>
  </div>
);
const WithDotsTemplate = (props: ColorAreaRootProps) => (
  <div {...stylex.props(s.area)}>
    <ColorArea {...props} showDots>
      <ColorArea.Thumb />
    </ColorArea>
  </div>
);
function ControlledTemplate() {
  const [color, setColor] = React.useState(parseColor("hsl(50, 100%, 50%)"));
  return (
    <div {...stylex.props(s.column, s.full)}>
      <ColorArea value={color} onChange={setColor}>
        <ColorArea.Thumb />
      </ColorArea>
      <p {...stylex.props(s.full, s.area, s.muted)}>
        Current color: <span {...stylex.props(s.medium)}>{color.toString("hsl")}</span>
      </p>
    </div>
  );
}
function ColorChannelsTemplate() {
  return (
    <div {...stylex.props(s.column8)}>
      <div {...stylex.props(s.column2)}>
        <p {...stylex.props(s.muted, s.medium)}>HSB: Saturation vs Brightness (default)</p>
        <ColorArea defaultValue="hsl(30, 100%, 50%)">
          <ColorArea.Thumb />
        </ColorArea>
      </div>
      <div {...stylex.props(s.column2)}>
        <p {...stylex.props(s.muted, s.medium)}>RGB: Red vs Green</p>
        <ColorArea defaultValue="rgb(255, 100, 50)" xChannel="red" yChannel="green">
          <ColorArea.Thumb />
        </ColorArea>
      </div>
      <div {...stylex.props(s.column2)}>
        <p {...stylex.props(s.muted, s.medium)}>RGB: Blue vs Green</p>
        <ColorArea defaultValue="rgb(50, 100, 255)" xChannel="blue" yChannel="green">
          <ColorArea.Thumb />
        </ColorArea>
      </div>
    </div>
  );
}
const DisabledTemplate = () => (
  <div {...stylex.props(s.area)}>
    <ColorArea isDisabled defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  </div>
);
function WithColorPreviewTemplate() {
  const [color, setColor] = React.useState(parseColor("hsl(200, 100%, 50%)"));
  return (
    <div {...stylex.props(s.column, s.area)}>
      <ColorArea showDots value={color} onChange={setColor}>
        <ColorArea.Thumb />
      </ColorArea>
      <div {...stylex.props(s.row)}>
        <ColorSwatch color={color.toString("css")} size="lg" />
        <div {...stylex.props(s.previewText)}>
          <span {...stylex.props(s.small, s.medium)}>{color.toString("hsl")}</span>
          <span {...stylex.props(s.tiny)}>{color.toString("hex")}</span>
        </div>
      </div>
    </div>
  );
}
export const Default = { args: defaultArgs, render: Template };
export const WithDots = { args: defaultArgs, render: WithDotsTemplate };
export const Controlled = { args: defaultArgs, render: ControlledTemplate };
export const ColorChannels = { args: defaultArgs, render: ColorChannelsTemplate };
export const Disabled = { args: defaultArgs, render: DisabledTemplate };
export const WithColorPreview = { args: defaultArgs, render: WithColorPreviewTemplate };
