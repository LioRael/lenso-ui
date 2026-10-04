// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { Slider } from "@lenso/ui";
import { choiceStyles as s } from "./choice.styles";

type SliderArgs = ComponentProps<typeof Slider> & { isDisabled?: boolean };
const meta: Meta<SliderArgs> = {
  title: "Components/Slider",
  component: Slider,
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    orientation: { control: { type: "select" }, options: ["horizontal", "vertical"] },
  },
  decorators: [
    (Story) => (
      <div {...stylex.props(s.sliderFrame)}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<SliderArgs>;
function nativeArgs({ isDisabled, ...args }: SliderArgs) {
  return isDisabled === undefined ? args : { ...args, disabled: isDisabled };
}
function VolumeParts() {
  return (
    <>
      <Slider.Label>Volume</Slider.Label>
      <Slider.Output />
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </>
  );
}
export const Default: Story = {
  render: (args) => (
    <Slider defaultValue={30} {...nativeArgs(args)}>
      <VolumeParts />
    </Slider>
  ),
};
export const Vertical: Story = {
  decorators: [
    (Story) => (
      <div {...stylex.props(s.verticalFrame)}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Slider defaultValue={30} orientation="vertical" {...nativeArgs(args)}>
      <VolumeParts />
    </Slider>
  ),
};
export const Disabled: Story = {
  render: (args) => (
    <Slider disabled defaultValue={30} {...nativeArgs(args)}>
      <VolumeParts />
    </Slider>
  ),
};
export const Range: Story = {
  render: (args) => (
    <Slider
      defaultValue={[100, 500]}
      format={{ style: "currency", currency: "USD" }}
      max={1000}
      min={0}
      step={50}
      {...nativeArgs(args)}
      render={(props, { values }) => (
        <div {...props}>
          <Slider.Label>Price Range</Slider.Label>
          <Slider.Output />
          <Slider.Control>
            <Slider.Track>
              <Slider.Fill />
              {values.map((_, index) => (
                <Slider.Thumb
                  key={index}
                  index={index}
                  aria-label={index === 0 ? "Minimum price" : "Maximum price"}
                />
              ))}
            </Slider.Track>
          </Slider.Control>
        </div>
      )}
    />
  ),
};
