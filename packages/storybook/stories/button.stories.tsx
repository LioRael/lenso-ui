import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { GlassButton, Button, Spinner } from "@lenso/ui";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";

const meta = {
  title: "Components/Buttons/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: {
      control: "select",
      options: ["bordered", "prominent", "borderless"],
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
const defaultArgs = { size: "md" } as const;

export const Default: Story = {
  args: defaultArgs,
  render: ({ disabled, size }) => (
    <div {...stylex.props(s.row)}>
      <Button disabled={disabled} size={size} variant="prominent">
        Prominent
      </Button>
      <Button disabled={disabled} size={size} variant="bordered">
        Bordered
      </Button>
      <Button disabled={disabled} size={size} variant="borderless">
        Borderless
      </Button>
      <Button disabled={disabled} size={size} destructive variant="prominent">
        Delete
      </Button>
    </div>
  ),
};
export const WithLinkButton: Story = {
  args: defaultArgs,
  render: ({ isIconOnly, size, variant }) => (
    <div {...stylex.props(s.stack3)}>
      <div {...stylex.props(s.row)}>
        <a
          {...stylex.props(
            buttonStyles.root,
            buttonSizes[size ?? "md"],
            buttonVariants[variant ?? "bordered"],
            isIconOnly && buttonIconOnlySizes[size ?? "md"],
          )}
          href="https://www.google.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google
        </a>
      </div>
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.aligned)}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div {...stylex.props(s.aligned)}>
        <GlassButton size="sm" variant="default">
          <ActionIcon icon="gravity-ui:plus" />
          Small
        </GlassButton>
        <GlassButton size="md" variant="default">
          <ActionIcon icon="gravity-ui:plus" />
          Medium
        </GlassButton>
        <GlassButton size="lg" variant="default">
          <ActionIcon icon="gravity-ui:plus" />
          Large
        </GlassButton>
      </div>
      <div {...stylex.props(s.aligned)}>
        <GlassButton isIconOnly size="sm" variant="default">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </GlassButton>
        <GlassButton isIconOnly size="md" variant="default">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </GlassButton>
        <GlassButton isIconOnly size="lg" variant="default">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </GlassButton>
      </div>
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.fullWidth)}>
      <Button fullWidth>Primary</Button>
      <GlassButton fullWidth variant="default">
        Secondary
      </GlassButton>
      <GlassButton fullWidth variant="default">
        Tertiary
      </GlassButton>
      <Button fullWidth size="sm">
        Small
      </Button>
      <Button fullWidth size="lg">
        Large
      </Button>
      <Button fullWidth>
        <ActionIcon icon="gravity-ui:plus" />
        With Icon
      </Button>
    </div>
  ),
};
export const WithIcon: Story = {
  args: defaultArgs,
  render: ({ disabled, size }) => (
    <div {...stylex.props(s.row)}>
      <Button disabled={disabled} size={size}>
        <ActionIcon icon="gravity-ui:globe" />
        Search
      </Button>
      <GlassButton disabled={disabled} size={size} variant="default">
        <ActionIcon icon="gravity-ui:plus" />
        Add Member
      </GlassButton>
      <GlassButton disabled={disabled} size={size} variant="default">
        <ActionIcon icon="gravity-ui:envelope" />
        Email
      </GlassButton>
      <Button destructive disabled={disabled} size={size} variant="prominent">
        <ActionIcon icon="gravity-ui:trash-bin" />
        Delete
      </Button>
      <GlassButton destructive disabled={disabled} size={size} variant="default">
        <ActionIcon icon="gravity-ui:trash-bin" />
        Cancel
      </GlassButton>
    </div>
  ),
};
export const WithIconOnly: Story = {
  args: defaultArgs,
  render: ({ disabled, size, variant }) => (
    <div {...stylex.props(s.row)}>
      <Button isIconOnly disabled={disabled} size={size} variant={variant ?? "borderless"}>
        <ActionIcon icon="gravity-ui:ellipsis" />
      </Button>
    </div>
  ),
};
export const WithSpinner: Story = {
  args: defaultArgs,
  render: ({ size, variant }) => (
    <div {...stylex.props(s.row)}>
      <Button isLoading size={size} variant={variant}>
        <Spinner color="current" size="sm" />
        Loading
      </Button>
    </div>
  ),
};
function LoadingScene({ size, variant }: ComponentProps<typeof Button>) {
  const [isLoading, setLoading] = useState(false);
  return (
    <Button
      isLoading={isLoading}
      size={size}
      variant={variant ?? "borderless"}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 4500);
      }}
    >
      {isLoading ? (
        <Spinner color="current" size="sm" />
      ) : (
        <ActionIcon icon="gravity-ui:paperclip" />
      )}
      {isLoading ? "Uploading..." : "Upload File"}
    </Button>
  );
}
export const WithLoadingState: Story = { args: defaultArgs, render: LoadingScene };
export const WithSocialButton: Story = {
  args: defaultArgs,
  render: ({ size, variant }) => (
    <div {...stylex.props(s.social)}>
      <Button size={size} variant={variant ?? "borderless"}>
        <ActionIcon icon="devicon:google" />
        Sign in with Google
      </Button>
      <Button size={size} variant={variant ?? "borderless"}>
        <ActionIcon icon="mdi:github" />
        Sign in with GitHub
      </Button>
      <Button size={size} variant={variant ?? "borderless"}>
        <ActionIcon icon="ion:logo-apple" />
        Sign in with Apple
      </Button>
      <Button size={size} variant={variant ?? "borderless"}>
        <ActionIcon icon="typcn:social-linkedin" />
        Sign in with LinkedIn
      </Button>
    </div>
  ),
};
