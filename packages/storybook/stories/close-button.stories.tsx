// Adapted from HeroUI v3.2.6 e385ac2 close-button.stories.tsx, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";

type SceneProps = ComponentProps<typeof CloseButton> & { variant?: "default" };
const meta = {
  title: "Components/Buttons/CloseButton",
  component: CloseButton,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    variant: { control: "select", options: ["default"] },
  },
} satisfies Meta<SceneProps>;
export default meta;
type Story = StoryObj<SceneProps>;
const defaultArgs = { disabled: false, variant: "default" } as const;
export const Default: Story = {
  args: defaultArgs,
  render: ({ variant: _variant, ...args }) => (
    <div {...stylex.props(s.row)}>
      <CloseButton {...args} />
    </div>
  ),
};
export const WithCustomIcon: Story = {
  args: defaultArgs,
  render: ({ variant: _variant, ...args }) => (
    <div {...stylex.props(s.row)}>
      <CloseButton {...args}>
        <ActionIcon icon="gravity-ui:circle-xmark" />
      </CloseButton>
    </div>
  ),
};
function InteractiveScene({ variant: _variant, ...args }: SceneProps) {
  const [count, setCount] = useState(0);
  return (
    <div {...stylex.props(s.centered)}>
      <CloseButton
        {...args}
        aria-label={`Close (clicked ${count} times)`}
        onClick={() => setCount(count + 1)}
      />
      <span {...stylex.props(s.small)}>Clicked: {count} times</span>
    </div>
  );
}
export const Interactive: Story = { args: defaultArgs, render: InteractiveScene };
