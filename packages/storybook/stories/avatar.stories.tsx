// Adapted from HeroUI v3.2.6 avatar.stories.tsx (Apache-2.0).
// Base UI Fallback uses delay rather than the source delayMs.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Separator } from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({
  columns: { display: "flex", alignItems: "flex-start", gap: 16 },
  column: { display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "flex", alignItems: "center", gap: 16 },
  appearanceRow: { display: "flex", alignItems: "center", gap: 12 },
  sample: {
    display: "flex",
    width: 80,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { width: 96, flexShrink: 0 },
  label: { width: 96, flexShrink: 0, fontSize: 14, color: "var(--muted)" },
  caption: { fontSize: 12, color: "var(--muted)", textTransform: "capitalize" },
  gradient: {
    borderStyle: "none",
    backgroundImage:
      "linear-gradient(to bottom right, oklch(65.6% 0.241 354.308), oklch(62.7% 0.265 303.9))",
    color: "white",
  },
});
const meta = {
  title: "Components/Media/Avatar",
  component: Avatar,
  argTypes: {
    color: { control: "select", options: ["accent", "default", "success", "warning", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
const image = (user: number) => `https://img.heroui.chat/image/avatar?w=400&h=400&u=${user}`;
const circle = (color: string) =>
  `https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${color}.jpg`;
export const Default: Story = {
  render: ({ color, size }) => (
    <div {...stylex.props(styles.columns)}>
      <div {...stylex.props(styles.column)}>
        <Avatar color={color} size={size}>
          <Avatar.Fallback>PG</Avatar.Fallback>
        </Avatar>
        <Avatar color={color} size={size}>
          <Avatar.Fallback>JR</Avatar.Fallback>
        </Avatar>
        <Avatar color={color} size={size}>
          <Avatar.Fallback>
            <SourceIcon name="person" />
          </Avatar.Fallback>
        </Avatar>
        <Avatar color={color} size={size}>
          <Avatar.Fallback>
            <SourceIcon name="person-gear" />
          </Avatar.Fallback>
        </Avatar>
      </div>
      <div {...stylex.props(styles.column)}>
        {(
          [
            [3, "John Doe", "JD"],
            [4, "Junior Garcia", "JG"],
            [5, "Junior Garcia", "JG"],
            [8, "Paul", "PG"],
          ] as const
        ).map(([user, alt, fallback]) => (
          <Avatar key={user} color={color} size={size}>
            <Avatar.Image alt={alt} src={image(user)} />
            <Avatar.Fallback delay={600}>{fallback}</Avatar.Fallback>
          </Avatar>
        ))}
      </div>
      <div {...stylex.props(styles.column)}>
        {(["red", "orange", "green", "white", "black"] as const).map((name) => (
          <Avatar key={name} color={color} size={size}>
            <Avatar.Image alt={`${name[0]?.toUpperCase()}${name.slice(1)}`} src={circle(name)} />
            <Avatar.Fallback>{name[0]?.toUpperCase()}</Avatar.Fallback>
          </Avatar>
        ))}
      </div>
    </div>
  ),
};
export const WithDelay: StoryObj<Avatar["RootProps"] & { delay?: number }> = {
  render: ({ color, size, delay = 300 }) => (
    <div {...stylex.props(styles.column)}>
      <Avatar color={color} size={size}>
        <Avatar.Image
          alt="Delayed avatar"
          src={`https://app.requestly.io/delay/${delay}/${image(3)}`}
        />
      </Avatar>
    </div>
  ),
};
const colors = ["accent", "default", "success", "warning", "danger"] as const;
export const WithColors: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["default", "DF"],
          ["accent", "AC"],
          ["success", "SC"],
          ["warning", "WR"],
          ["danger", "DG"],
        ] as const
      ).map(([color, label]) => (
        <Avatar key={color} color={color}>
          <Avatar.Fallback>{label}</Avatar.Fallback>
        </Avatar>
      ))}
    </div>
  ),
};
export const Fallback: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>
          <SourceIcon name="person" />
        </Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image
          alt="Delayed Avatar"
          src="https://invalid-url-to-show-fallback.com/image.jpg"
        />
        <Avatar.Fallback delay={600}>NA</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback xstyle={styles.gradient}>GB</Avatar.Fallback>
      </Avatar>
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["sm", "Small", 3, "SM"],
          ["md", "Medium", 4, "MD"],
          ["lg", "Large", 5, "LG"],
        ] as const
      ).map(([size, alt, user, fallback]) => (
        <Avatar key={size} size={size}>
          <Avatar.Image alt={alt} src={image(user)} />
          <Avatar.Fallback>{fallback}</Avatar.Fallback>
        </Avatar>
      ))}
    </div>
  ),
};
const appearances = ["letter", "letter soft", "icon", "icon soft", "img"] as const;
const circleColors = ["blue", "black", "green", "orange", "red"] as const;
export const Variants: Story = {
  render: (args) => (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.spacer)} />
        {colors.map((color) => (
          <div key={color} {...stylex.props(styles.sample)}>
            <span {...stylex.props(styles.caption)}>{color}</span>
          </div>
        ))}
      </div>
      <Separator />
      {appearances.map((appearance) => (
        <div key={appearance} {...stylex.props(styles.appearanceRow)}>
          <div {...stylex.props(styles.label)}>{appearance}</div>
          {colors.map((color, index) => (
            <div key={color} {...stylex.props(styles.sample)}>
              <Avatar
                {...args}
                color={color}
                variant={appearance.includes("soft") ? "soft" : undefined}
              >
                {appearance === "img" ? (
                  <>
                    <Avatar.Image alt={`Avatar ${color}`} src={circle(circleColors[index] ?? "")} />
                    <Avatar.Fallback>{color.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </>
                ) : (
                  <Avatar.Fallback>
                    {appearance.startsWith("icon") ? <SourceIcon name="person" /> : "AG"}
                  </Avatar.Fallback>
                )}
              </Avatar>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
