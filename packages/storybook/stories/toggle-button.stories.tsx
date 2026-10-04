// Adapted from HeroUI v3.2.6 e385ac2 toggle-button.stories.tsx, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";

const meta = {
  title: "Components/Buttons/ToggleButton",
  component: ToggleButton,
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "ghost"] },
  },
} satisfies Meta<typeof ToggleButton>;
export default meta;
type Story = StoryObj<typeof meta>;
const defaultArgs = { size: "md" } as const;
export const Default: Story = {
  args: defaultArgs,
  render: ({ disabled, size, variant }) => (
    <div {...stylex.props(s.row)}>
      <ToggleButton disabled={disabled} size={size} variant={variant}>
        <ActionIcon icon="gravity-ui:heart" />
        Like
      </ToggleButton>
      <ToggleButton disabled={disabled} size={size} variant={variant ?? "ghost"}>
        <ActionIcon icon="gravity-ui:heart" />
        Like
      </ToggleButton>
    </div>
  ),
};
export const Variants: Story = {
  args: defaultArgs,
  render: ({ disabled, size }) => (
    <div {...stylex.props(s.stack4)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.mediumMuted)}>Default</p>
        <div {...stylex.props(s.row)}>
          <ToggleButton disabled={disabled} size={size}>
            <ActionIcon icon="gravity-ui:heart" />
            Like
          </ToggleButton>
          <ToggleButton defaultPressed disabled={disabled} size={size}>
            <ActionIcon icon="gravity-ui:heart-fill" />
            Like
          </ToggleButton>
        </div>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.mediumMuted)}>Ghost</p>
        <div {...stylex.props(s.row)}>
          <ToggleButton disabled={disabled} size={size} variant="ghost">
            <ActionIcon icon="gravity-ui:heart" />
            Like
          </ToggleButton>
          <ToggleButton defaultPressed disabled={disabled} size={size} variant="ghost">
            <ActionIcon icon="gravity-ui:heart-fill" />
            Like
          </ToggleButton>
        </div>
      </div>
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.aligned)}>
        <ToggleButton size="sm">
          <ActionIcon icon="gravity-ui:heart" />
          Small
        </ToggleButton>
        <ToggleButton size="md">
          <ActionIcon icon="gravity-ui:heart" />
          Medium
        </ToggleButton>
        <ToggleButton size="lg">
          <ActionIcon icon="gravity-ui:heart" />
          Large
        </ToggleButton>
      </div>
      <div {...stylex.props(s.aligned)}>
        <ToggleButton isIconOnly size="sm">
          <ActionIcon icon="gravity-ui:heart" />
        </ToggleButton>
        <ToggleButton isIconOnly size="md">
          <ActionIcon icon="gravity-ui:heart" />
        </ToggleButton>
        <ToggleButton isIconOnly size="lg">
          <ActionIcon icon="gravity-ui:heart" />
        </ToggleButton>
      </div>
    </div>
  ),
};
export const IconOnly: Story = {
  args: defaultArgs,
  render: ({ disabled, size, variant }) => (
    <div {...stylex.props(s.row)}>
      <ToggleButton isIconOnly disabled={disabled} size={size} variant={variant}>
        <ActionIcon icon="gravity-ui:heart" />
      </ToggleButton>
      <ToggleButton isIconOnly disabled={disabled} size={size} variant={variant ?? "ghost"}>
        <ActionIcon icon="gravity-ui:bookmark" />
      </ToggleButton>
    </div>
  ),
};
function ControlledScene() {
  const [selected, setSelected] = useState(false);
  return (
    <div {...stylex.props(s.stack4)}>
      <div {...stylex.props(s.row)}>
        <ToggleButton pressed={selected} onPressedChange={setSelected}>
          <ActionIcon icon={selected ? "gravity-ui:heart-fill" : "gravity-ui:heart"} />
          {selected ? "Liked" : "Like"}
        </ToggleButton>
      </div>
      <p {...stylex.props(s.muted)}>
        Status: <span {...stylex.props(s.medium)}>{selected ? "Selected" : "Not selected"}</span>
      </p>
    </div>
  );
}
export const Controlled: Story = { render: ControlledScene };
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.row)}>
      <ToggleButton disabled>
        <ActionIcon icon="gravity-ui:heart" />
        Like
      </ToggleButton>
      <ToggleButton defaultPressed disabled>
        <ActionIcon icon="gravity-ui:heart-fill" />
        Like
      </ToggleButton>
    </div>
  ),
};
function RealWorldScene() {
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [pinned, setPinned] = useState(true);
  return (
    <div {...stylex.props(s.aligned2)}>
      <ToggleButton pressed={liked} size="sm" onPressedChange={setLiked}>
        <ActionIcon icon={liked ? "gravity-ui:heart-fill" : "gravity-ui:heart"} />
        Like
      </ToggleButton>
      <ToggleButton pressed={bookmarked} size="sm" variant="ghost" onPressedChange={setBookmarked}>
        <ActionIcon icon={bookmarked ? "gravity-ui:bookmark-fill" : "gravity-ui:bookmark"} />
        Save
      </ToggleButton>
      <ToggleButton
        isIconOnly
        pressed={pinned}
        size="sm"
        variant="ghost"
        onPressedChange={setPinned}
      >
        <ActionIcon icon={pinned ? "gravity-ui:pin-fill" : "gravity-ui:pin"} />
      </ToggleButton>
    </div>
  );
}
export const RealWorld: Story = { render: RealWorldScene };
