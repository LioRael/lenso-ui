/**
 * Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0
 */
import type { Meta } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { ColorSwatch, type ColorSwatchProps } from "@lenso/ui";
import { colorStoryStyles as s } from "./color.stylex";

export default {
  argTypes: {
    shape: { control: "select", options: ["circle", "square"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    color: { control: "color" },
  },
  component: ColorSwatch,
  parameters: { layout: "centered" },
  title: "Components/Colors/ColorSwatch",
} satisfies Meta<typeof ColorSwatch>;
const defaultArgs: ColorSwatchProps = { color: "#0485F7" };
const colors = ["#0485F7", "#EF4444", "#F59E0B", "#10B981", "#D946EF"];
const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const shapes = ["circle", "square"] as const;
const Template = (props: ColorSwatchProps) => (
  <div {...stylex.props(s.row)}>
    <ColorSwatch xstyle={s.swatch20} {...props} />
  </div>
);
const ShapesTemplate = (props: ColorSwatchProps) => (
  <div {...stylex.props(s.row)}>
    <ColorSwatch {...props} shape="circle" />
    <ColorSwatch {...props} shape="square" />
  </div>
);
const ColorsTemplate = () => (
  <div {...stylex.props(s.row)}>
    {colors.map((color, i) => (
      <ColorSwatch
        key={color}
        color={color}
        aria-label={["Blue", "Red", "Amber", "Green", "Fuchsia"][i]}
      />
    ))}
  </div>
);
const SizesTemplate = (props: ColorSwatchProps) => (
  <div {...stylex.props(s.row)}>
    {sizes.map((size, i) => (
      <ColorSwatch key={size} {...props} color={colors[i]} size={size} />
    ))}
  </div>
);
const TransparencyTemplate = () => (
  <div {...stylex.props(s.row)}>
    {[1, 0.75, 0.5, 0.25, 0].map((alpha) => (
      <ColorSwatch
        key={alpha}
        aria-label={`${alpha * 100}% opacity`}
        color={`rgba(4, 133, 247, ${alpha})`}
      />
    ))}
  </div>
);
const WithColorNameTemplate = () => (
  <div {...stylex.props(s.row)}>
    {colors.map((color, i) => (
      <ColorSwatch
        key={color}
        color={color}
        aria-label={
          ["Primary color", "Danger color", "Warning color", "Success color", "Accent color"][i]
        }
        colorName={
          ["Primary blue", "Danger red", "Warning amber", "Success green", "Accent fuchsia"][i]
        }
      />
    ))}
  </div>
);
const StyleRenderPropsTemplate = () => (
  <div {...stylex.props(s.column6)}>
    {["Custom Border", "Custom Shadow", "Outline Style"].map((title, i) => (
      <div key={title} {...stylex.props(s.column2)}>
        <h3 {...stylex.props(s.heading)}>{title}</h3>
        <div {...stylex.props(s.row)}>
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              size="lg"
              style={({ color: c }) => ({
                boxShadow:
                  i === 0
                    ? `0 0 0 3px ${c.withChannelValue("alpha", 64 / 255).toString("css")}`
                    : i === 1
                      ? `0 4px 14px ${c.withChannelValue("alpha", 128 / 255).toString("css")}`
                      : `inset 0 0 0 2px ${c.toString("css")}, inset 0 0 0 4px white`,
              })}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);
const AllVariantsTemplate = () => (
  <div {...stylex.props(s.column6)}>
    {shapes.map((shape) => (
      <div key={shape} {...stylex.props(s.column3)}>
        <h3 {...stylex.props(s.heading, s.capitalize)}>{shape}</h3>
        <div {...stylex.props(s.column3)}>
          {sizes.map((size) => (
            <div key={size} {...stylex.props(s.row)}>
              <div {...stylex.props(s.width48, s.muted)}>{size}</div>
              {colors.map((color) => (
                <ColorSwatch key={color} color={color} shape={shape} size={size} />
              ))}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
export const Default = { args: defaultArgs, render: Template };
export const Shapes = { args: defaultArgs, render: ShapesTemplate };
export const Colors = { args: defaultArgs, render: ColorsTemplate };
export const Sizes = { args: defaultArgs, render: SizesTemplate };
export const Transparency = { args: defaultArgs, render: TransparencyTemplate };
export const WithColorName = { args: defaultArgs, render: WithColorNameTemplate };
export const StyleRenderProps = { args: defaultArgs, render: StyleRenderPropsTemplate };
export const AllVariants = { args: defaultArgs, render: AllVariantsTemplate };
