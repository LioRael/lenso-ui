import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { Button, Spinner } from "@lenso/ui";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";

// Adapted from HeroUI v3.2.6 e385ac2 button.stories.tsx, Apache-2.0.
const meta = {
  title: "Components/Buttons/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "outline", "ghost", "danger"],
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
      <Button disabled={disabled} size={size}>
        Primary
      </Button>
      <Button disabled={disabled} size={size} variant="secondary">
        Secondary
      </Button>
      <Button disabled={disabled} size={size} variant="tertiary">
        Tertiary
      </Button>
      <Button disabled={disabled} size={size} variant="outline">
        Outline
      </Button>
      <Button disabled={disabled} size={size} variant="ghost">
        Ghost
      </Button>
      <Button disabled={disabled} size={size} variant="danger">
        Danger
      </Button>
      <Button disabled={disabled} size={size} variant="danger-soft">
        Danger Soft
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
            buttonVariants[variant ?? "primary"],
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
        <Button size="sm" variant="secondary">
          <ActionIcon icon="gravity-ui:plus" />
          Small
        </Button>
        <Button size="md" variant="secondary">
          <ActionIcon icon="gravity-ui:plus" />
          Medium
        </Button>
        <Button size="lg" variant="secondary">
          <ActionIcon icon="gravity-ui:plus" />
          Large
        </Button>
      </div>
      <div {...stylex.props(s.aligned)}>
        <Button isIconOnly size="sm" variant="tertiary">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </Button>
        <Button isIconOnly size="md" variant="tertiary">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </Button>
        <Button isIconOnly size="lg" variant="tertiary">
          <ActionIcon icon="gravity-ui:ellipsis" />
        </Button>
      </div>
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.fullWidth)}>
      <Button fullWidth>Primary</Button>
      <Button fullWidth variant="secondary">
        Secondary
      </Button>
      <Button fullWidth variant="tertiary">
        Tertiary
      </Button>
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
      <Button disabled={disabled} size={size} variant="secondary">
        <ActionIcon icon="gravity-ui:plus" />
        Add Member
      </Button>
      <Button disabled={disabled} size={size} variant="tertiary">
        <ActionIcon icon="gravity-ui:envelope" />
        Email
      </Button>
      <Button disabled={disabled} size={size} variant="danger">
        <ActionIcon icon="gravity-ui:trash-bin" />
        Delete
      </Button>
      <Button disabled={disabled} size={size} variant="danger-soft">
        <ActionIcon icon="gravity-ui:trash-bin" />
        Cancel
      </Button>
    </div>
  ),
};
export const WithIconOnly: Story = {
  args: defaultArgs,
  render: ({ disabled, size, variant }) => (
    <div {...stylex.props(s.row)}>
      <Button isIconOnly disabled={disabled} size={size} variant={variant ?? "tertiary"}>
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
      variant={variant ?? "tertiary"}
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
      <Button size={size} variant={variant ?? "tertiary"}>
        <ActionIcon icon="devicon:google" />
        Sign in with Google
      </Button>
      <Button size={size} variant={variant ?? "tertiary"}>
        <ActionIcon icon="mdi:github" />
        Sign in with GitHub
      </Button>
      <Button size={size} variant={variant ?? "tertiary"}>
        <ActionIcon icon="ion:logo-apple" />
        Sign in with Apple
      </Button>
      <Button size={size} variant={variant ?? "tertiary"}>
        <ActionIcon icon="typcn:social-linkedin" />
        Sign in with LinkedIn
      </Button>
    </div>
  ),
};
