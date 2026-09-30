// Adapted from HeroUI v3.2.6 badge.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment, type ComponentProps, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Badge, Avatar, Separator } from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 32 },
  sample: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  caption: { fontSize: 12, color: "var(--muted)" },
  capitalized: { textTransform: "capitalize" },
  sections: { display: "flex", flexDirection: "column", gap: 32 },
  section: { display: "flex", flexDirection: "column", gap: 16 },
  heading: { fontSize: 14, fontWeight: 600, color: "var(--muted)" },
});
const colors = ["accent", "default", "success", "warning", "danger"] as const;
const sizes = [
  ["lg", "Large"],
  ["md", "Medium"],
  ["sm", "Small"],
] as const;
const variants = ["primary", "secondary", "soft"] as const;
const avatarURL = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg";
const meta = {
  title: "Components/Data Display/Badge",
  component: Badge,
  argTypes: {
    color: { control: "select", options: ["default", "accent", "success", "warning", "danger"] },
    placement: {
      control: "select",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["primary", "secondary", "soft"] },
  },
  args: { color: "accent", placement: "top-right", size: "sm", variant: "primary" },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
function Anchor({
  args,
  avatarSize,
  children,
}: {
  args: ComponentProps<typeof Badge>;
  avatarSize?: "sm" | "md" | "lg";
  children?: ReactNode;
}) {
  return (
    <Badge.Anchor>
      <Avatar size={avatarSize}>
        <Avatar.Image alt="Green avatar" src={avatarURL} />
      </Avatar>
      <Badge {...args}>{children}</Badge>
    </Badge.Anchor>
  );
}
export const Default: Story = { render: (args) => <Anchor args={args}>5</Anchor> };
export const Sizes: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {sizes.map(([size, label]) => (
        <div key={size} {...stylex.props(styles.sample)}>
          <Anchor args={{ ...args, size }} avatarSize={size}>
            99+
          </Anchor>
          <span {...stylex.props(styles.caption)}>{label}</span>
        </div>
      ))}
    </div>
  ),
};
export const Colors: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {colors.map((color) => (
        <div key={color} {...stylex.props(styles.sample)}>
          <Anchor args={{ ...args, color }} />
          <span {...stylex.props(styles.caption, styles.capitalized)}>{color}</span>
        </div>
      ))}
    </div>
  ),
};
export const WithContent: Story = {
  render: (args) => (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["Number", "5"],
          ["Text", "New"],
          ["Overflow", "99+"],
        ] as const
      ).map(([label, content]) => (
        <div key={label} {...stylex.props(styles.sample)}>
          <Anchor args={{ ...args, color: "danger" }}>{content}</Anchor>
          <span {...stylex.props(styles.caption)}>{label}</span>
        </div>
      ))}
      <div {...stylex.props(styles.sample)}>
        <Anchor args={{ ...args, color: "accent" }}>
          <SourceIcon name="bell" />
        </Anchor>
        <span {...stylex.props(styles.caption)}>Icon</span>
      </div>
    </div>
  ),
};
export const Placements: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      {(["top-right", "top-left", "bottom-right", "bottom-left"] as const).map((placement) => (
        <div key={placement} {...stylex.props(styles.sample)}>
          <Anchor args={{ color: "accent", placement, size: "sm" }} />
          <span {...stylex.props(styles.caption)}>{placement}</span>
        </div>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.sections)}>
      {variants.map((variant, index) => (
        <Fragment key={variant}>
          <div {...stylex.props(styles.section)}>
            <h3 {...stylex.props(styles.heading, styles.capitalized)}>{variant}</h3>
            <div {...stylex.props(styles.row)}>
              {colors.map((color) => (
                <div key={color} {...stylex.props(styles.sample)}>
                  <Anchor args={{ color, size: "sm", variant }}>5</Anchor>
                  <span {...stylex.props(styles.caption, styles.capitalized)}>{color}</span>
                </div>
              ))}
            </div>
          </div>
          {index < variants.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  ),
};
export const DotBadge: Story = {
  render: () => (
    <div {...stylex.props(styles.sections)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Status Indicators</h3>
        <div {...stylex.props(styles.row)}>
          {(["accent", "success", "warning", "danger"] as const).map((color) => (
            <Anchor
              key={color}
              avatarSize="sm"
              args={{ color, placement: "bottom-right", size: "sm" }}
            />
          ))}
        </div>
      </div>
      <Separator />
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Sizes</h3>
        <div {...stylex.props(styles.row)}>
          {sizes.map(([size, label]) => (
            <div key={size} {...stylex.props(styles.sample)}>
              <Anchor
                avatarSize={size}
                args={{ color: "success", placement: "bottom-right", size }}
              />
              <span {...stylex.props(styles.caption)}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
