// Adapted from HeroUI v3.2.6 avatar-group.stories.tsx (Apache-2.0).
// Playground selectors become explicit StyleX on native parts; Base UI owns its controls.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { Avatar, AvatarGroup, Checkbox, CheckboxGroup, Radio, RadioGroup } from "@lenso/ui";

const stripes = stylex.keyframes({ to: { backgroundPosition: "24px 24px" } });
const styles = stylex.create({
  sections: { display: "flex", flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  caption: { fontSize: 14, color: "var(--muted)" },
  playground: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 },
  features: { maxWidth: 448 },
  sizeOptions: { display: "flex", flexDirection: "row" },
  backdrop: { position: "relative", display: "inline-flex", borderRadius: 12, padding: 24 },
  background: {
    pointerEvents: "none",
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    backgroundColor: "var(--background)",
  },
  stripes: {
    backgroundColor: "color-mix(in oklab, var(--danger) 6%, var(--surface))",
    backgroundImage:
      "repeating-linear-gradient(-45deg, transparent 0 10px, color-mix(in oklab, var(--danger) 12%, transparent) 10px 11px, transparent 11px 21px, color-mix(in oklab, var(--danger) 28%, transparent) 21px 22px)",
    backgroundSize: "24px 24px",
    animationName: stripes,
    animationDuration: "2.8s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  foreground: { position: "relative", zIndex: 10 },
  mixedGroups: { display: "flex", flexDirection: "column", gap: 20 },
  uncentered: { paddingInlineEnd: 0 },
});
const meta = {
  title: "Components/Media/AvatarGroup",
  component: AvatarGroup,
  argTypes: {
    color: { control: "select", options: ["accent", "default", "success", "warning", "danger"] },
    isGrid: { control: "boolean" },
    max: { control: "number" },
    overlap: { control: "select", options: ["clip", "ring"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "soft"] },
  },
} satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
const users = [
  { id: 1, name: "John", image: "https://img.heroui.chat/image/avatar?w=400&h=400&u=3" },
  { id: 2, name: "Kate", image: "https://img.heroui.chat/image/avatar?w=400&h=400&u=5" },
  { id: 3, name: "Emily", image: "https://img.heroui.chat/image/avatar?w=400&h=400&u=20" },
  { id: 4, name: "Michael", image: "https://img.heroui.chat/image/avatar?w=400&h=400&u=23" },
  { id: 5, name: "Olivia", image: "https://img.heroui.chat/image/avatar?w=400&h=400&u=16" },
];
const circles = ["red", "orange", "green", "white", "black"].map((color, id) => ({
  id,
  name: color.charAt(0).toUpperCase(),
  image: `https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${color}.jpg`,
}));
function avatars(items = users) {
  return items.map((user) => (
    <Avatar key={user.id}>
      <Avatar.Image alt={user.name} src={user.image} />
      <Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
    </Avatar>
  ));
}
function letters() {
  return ["A", "B", "C", "D"].map((letter) => (
    <Avatar key={letter}>
      <Avatar.Fallback>{letter}</Avatar.Fallback>
    </Avatar>
  ));
}
export const Default: Story = {
  render: () => <AvatarGroup>{avatars(users.slice(0, 4))}</AvatarGroup>,
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(styles.sections)}>
      {(
        [
          ["sm", "Small"],
          ["md", "Medium (default)"],
          ["lg", "Large"],
        ] as const
      ).map(([size, label]) => (
        <div key={size} {...stylex.props(styles.section)}>
          <p {...stylex.props(styles.caption)}>{label}</p>
          <AvatarGroup size={size}>{avatars(users.slice(0, 4))}</AvatarGroup>
        </div>
      ))}
    </div>
  ),
};
export const Colors: Story = {
  render: () => (
    <div {...stylex.props(styles.sections)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} {...stylex.props(styles.section)}>
          <p {...stylex.props(styles.caption)}>
            {color[0]?.toUpperCase()}
            {color.slice(1)}
          </p>
          <AvatarGroup color={color}>{letters()}</AvatarGroup>
        </div>
      ))}
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.sections)}>
      {(["default", "soft"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.section)}>
          <p {...stylex.props(styles.caption)}>
            {variant[0]?.toUpperCase()}
            {variant.slice(1)}
          </p>
          <AvatarGroup color="accent" variant={variant}>
            {letters()}
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};
export const Max: Story = { render: () => <AvatarGroup max={3}>{avatars()}</AvatarGroup> };
export const WithCount: Story = {
  render: () => (
    <AvatarGroup size="sm">
      {avatars(users.slice(0, 3))}
      <AvatarGroup.Count>+9</AvatarGroup.Count>
    </AvatarGroup>
  ),
};
export const Grid: Story = {
  render: () => (
    <AvatarGroup isGrid max={7}>
      {avatars()}
    </AvatarGroup>
  ),
};
const features = [
  ["clip", "Clip", 'overlap="clip"'],
  ["opticalCenter", "Optically center", "Clip only — nudge fallback glyphs into the crescent"],
  ["backdrop", "Backdrop", "Animated stripes to prove the seam is transparent"],
] as const;
function mixed(
  items: typeof users,
  fallbacks: { color: "accent" | "warning" | "success" | "danger"; label: string }[],
  uncentered: boolean,
) {
  const children: ReactNode[] = [];
  for (let index = 0; index < Math.max(items.length, fallbacks.length); index++) {
    const user = items[index];
    if (user)
      children.push(
        <Avatar key={`image-${user.id}`}>
          <Avatar.Image alt={user.name} src={user.image} />
          <Avatar.Fallback xstyle={uncentered && styles.uncentered}>
            {user.name.charAt(0)}
          </Avatar.Fallback>
        </Avatar>,
      );
    const fallback = fallbacks[index];
    if (fallback)
      children.push(
        <Avatar key={`fallback-${fallback.label}`} color={fallback.color}>
          <Avatar.Fallback xstyle={uncentered && styles.uncentered}>
            {fallback.label}
          </Avatar.Fallback>
        </Avatar>,
      );
  }
  return children;
}
function Playground() {
  const featuresId = useId();
  const sizeId = useId();
  const [selected, setSelected] = useState<string[]>(["clip", "opticalCenter", "backdrop"]);
  const [size, setSize] = useState<"sm" | "md" | "lg">("lg");
  const clip = selected.includes("clip");
  const uncentered = clip && !selected.includes("opticalCenter");
  const group = {
    overlap: clip ? ("clip" as const) : ("ring" as const),
    size,
    "data-optical": uncentered ? "false" : undefined,
  };
  return (
    <div {...stylex.props(styles.playground)}>
      <CheckboxGroup
        aria-labelledby={featuresId}
        xstyle={styles.features}
        value={selected}
        onValueChange={setSelected}
      >
        <span id={featuresId} {...stylex.props(labelStyles.label)}>
          Features
        </span>
        {features.map(([value, label, description]) => (
          <Checkbox
            key={value}
            name="overlap-playground-features"
            disabled={value === "opticalCenter" && !clip}
            value={value}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {label}
            </Checkbox.Content>
            <span {...stylex.props(descriptionStyles.description)}>{description}</span>
          </Checkbox>
        ))}
      </CheckboxGroup>
      <div {...stylex.props(styles.section)}>
        <span id={sizeId} {...stylex.props(labelStyles.label)}>
          Size
        </span>
        <RadioGroup
          aria-labelledby={sizeId}
          name="overlap-playground-size"
          aria-orientation="horizontal"
          xstyle={styles.sizeOptions}
          value={size}
          onValueChange={(value) => {
            if (value === "sm" || value === "md" || value === "lg") setSize(value);
          }}
        >
          {(["sm", "md", "lg"] as const).map((value) => (
            <Radio key={value} value={value}>
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                {value}
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
      </div>
      <div {...stylex.props(styles.backdrop)}>
        <div
          aria-hidden="true"
          {...stylex.props(styles.background, selected.includes("backdrop") && styles.stripes)}
        />
        <div {...stylex.props(styles.foreground)}>
          <div {...stylex.props(styles.mixedGroups)}>
            <div {...stylex.props(styles.section)}>
              <p {...stylex.props(styles.caption)}>Users</p>
              <AvatarGroup {...group}>
                {mixed(
                  users.slice(0, 3),
                  [
                    { color: "accent", label: "AB" },
                    { color: "warning", label: "JD" },
                    { color: "success", label: "SM" },
                  ],
                  uncentered,
                )}
                <AvatarGroup.Count>+2</AvatarGroup.Count>
              </AvatarGroup>
            </div>
            <div {...stylex.props(styles.section)}>
              <p {...stylex.props(styles.caption)}>Circles</p>
              <AvatarGroup {...group}>
                {mixed(
                  circles.slice(0, 3),
                  [
                    { color: "danger", label: "Q" },
                    { color: "accent", label: "ZK" },
                  ],
                  uncentered,
                )}
                <AvatarGroup.Count>+2</AvatarGroup.Count>
              </AvatarGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export const OverlapPlayground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Storybook-only: toggle clip/ring, optical centering, animated backdrop, and size. Shows Users and Circles with a few fallback-only avatars mixed in.",
      },
    },
  },
  render: () => <Playground />,
};
