// Adapted from HeroUI v3.2.6 chip.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment } from "react";
import * as stylex from "@stylexjs/stylex";
import { Chip, Separator } from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 12 },
  samples: { display: "flex", flexDirection: "column", gap: 16 },
  sections: { display: "flex", flexDirection: "column", gap: 32 },
  rows: { display: "flex", flexDirection: "column", gap: 12 },
  heading: { fontSize: 14, fontWeight: 600, color: "var(--muted)", textTransform: "capitalize" },
  label: {
    width: 96,
    flexShrink: 0,
    fontSize: 14,
    color: "var(--muted)",
    textTransform: "capitalize",
  },
  spacer: { width: 96, flexShrink: 0 },
  sample: {
    display: "flex",
    width: 130,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  color: { fontSize: 12, color: "var(--muted)", textTransform: "capitalize" },
});
const meta = {
  title: "Components/Data Display/Chip",
  component: Chip,
  argTypes: {
    color: { control: "select", options: ["accent", "default", "success", "warning", "danger"] },
    variant: { control: "select", options: ["primary", "secondary", "tertiary", "soft"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { children: "Label", color: "accent", variant: "secondary" },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      <Chip {...args}>Label</Chip>
    </div>
  ),
};
export const Sizes: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      <Chip {...args} size="sm">
        Small
      </Chip>
      <Chip {...args} size="md">
        Medium
      </Chip>
      <Chip {...args} size="lg">
        Large
      </Chip>
    </div>
  ),
};
export const WithIcon: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      <Chip {...args}>
        <SourceIcon name="circle-dashed" />
        <Chip.Label>Label</Chip.Label>
        <SourceIcon name="circle-dashed" />
      </Chip>
    </div>
  ),
};
const variants = ["primary", "secondary", "tertiary", "soft"] as const;
const colors = ["accent", "default", "success", "warning", "danger"] as const;
const sizes = ["lg", "md", "sm"] as const;
export const Statuses: Story = {
  render: (args) => (
    <div {...stylex.props(styles.samples)}>
      {variants.map((variant) => (
        <div key={variant} {...stylex.props(styles.row)}>
          <Chip {...args} variant={variant}>
            <SourceIcon name="circle-fill" width={6} />
            <Chip.Label>Information</Chip.Label>
          </Chip>
          <Chip {...args} color="success" variant={variant}>
            <SourceIcon name="circle-fill" width={6} />
            <Chip.Label>Completed</Chip.Label>
          </Chip>
          <Chip {...args} color="warning" variant={variant}>
            <SourceIcon name="circle-fill" width={6} />
            <Chip.Label>Pending</Chip.Label>
          </Chip>
          <Chip {...args} color="danger" variant={variant}>
            <SourceIcon name="circle-fill" width={6} />
            <Chip.Label>Failed</Chip.Label>
          </Chip>
        </div>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: (args) => (
    <div {...stylex.props(styles.sections)}>
      {sizes.map((size, index) => (
        <Fragment key={size}>
          <div {...stylex.props(styles.samples)}>
            <h3 {...stylex.props(styles.heading)}>{size}</h3>
            <div {...stylex.props(styles.row)}>
              <div {...stylex.props(styles.spacer)} />
              {colors.map((color) => (
                <div key={color} {...stylex.props(styles.sample)}>
                  <span {...stylex.props(styles.color)}>{color}</span>
                </div>
              ))}
            </div>
            <div {...stylex.props(styles.rows)}>
              {variants.map((variant) => (
                <div key={variant} {...stylex.props(styles.row)}>
                  <div {...stylex.props(styles.label)}>{variant}</div>
                  {colors.map((color) => (
                    <div key={color} {...stylex.props(styles.sample)}>
                      <Chip {...args} color={color} size={size} variant={variant}>
                        <SourceIcon name="circle-dashed" />
                        <Chip.Label>Label</Chip.Label>
                        <SourceIcon name="circle-dashed" />
                      </Chip>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {index < sizes.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  ),
};
