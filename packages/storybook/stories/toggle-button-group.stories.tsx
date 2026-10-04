// Adapted from HeroUI v3.2.6 e385ac2 toggle-button-group.stories.tsx, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";
import { FormattingGroup, AlignmentGroup } from "./toggle-button-group.fixtures";

const meta = {
  title: "Components/Buttons/ToggleButtonGroup",
  component: ToggleButtonGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    fullWidth: { control: "boolean" },
    isDetached: { control: "boolean" },
    disabled: { control: "boolean" },
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    multiple: {
      control: "select",
      options: ["single", "multiple"],
      mapping: { single: false, multiple: true },
      description:
        "Native equivalent of source selectionMode; source scenes intentionally ignore controls.",
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ToggleButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <FormattingGroup multiple /> };
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Small</p>
        <FormattingGroup multiple size="sm" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Medium (default)</p>
        <FormattingGroup multiple size="md" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Large</p>
        <FormattingGroup multiple size="lg" />
      </div>
    </div>
  ),
};
export const Orientation: Story = {
  render: () => (
    <div {...stylex.props(s.columns)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Horizontal</p>
        <FormattingGroup count={3} orientation="horizontal" multiple />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Vertical</p>
        <FormattingGroup count={3} orientation="vertical" multiple />
      </div>
    </div>
  ),
};
export const AttachedVsDetached: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Attached (default)</p>
        <FormattingGroup multiple />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Detached</p>
        <FormattingGroup isDetached multiple separators={false} />
      </div>
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.fullWidth)}>
      <FormattingGroup fullWidth multiple />
      <AlignmentGroup fullWidth />
    </div>
  ),
};
export const SelectionMode: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Single selection</p>
        <AlignmentGroup defaultValue={["center"]} />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Multiple selection</p>
        <FormattingGroup defaultValue={["bold", "underline"]} multiple />
      </div>
    </div>
  ),
};
function ControlledScene() {
  const [selected, setSelected] = useState<string[]>(["bold"]);
  return (
    <div {...stylex.props(s.stack4)}>
      <FormattingGroup multiple value={selected} onValueChange={setSelected} />
      <p {...stylex.props(s.muted)}>
        Selected:{" "}
        <span {...stylex.props(s.medium)}>
          {selected.length > 0 ? selected.join(", ") : "None"}
        </span>
      </p>
    </div>
  );
}
export const Controlled: Story = { render: ControlledScene };
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>All buttons disabled</p>
        <FormattingGroup count={3} disabled multiple />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Individual button disabled</p>
        <FormattingGroup count={3} disabledItalic multiple />
      </div>
    </div>
  ),
};
export const WithoutSeparator: Story = {
  render: () => <FormattingGroup multiple separators={false} />,
};
export const WithLabels: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <ToggleButtonGroup defaultValue={["italic"]} multiple>
        <ToggleButton value="bold">
          <ActionIcon icon="gravity-ui:bold" />
          Bold
        </ToggleButton>
        <ToggleButton value="italic">
          <ToggleButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:italic" />
          Italic
        </ToggleButton>
        <ToggleButton value="underline">
          <ToggleButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:underline" />
          Underline
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  ),
};
function ExamplesScene() {
  const [alignment, setAlignment] = useState<string[]>(["left"]);
  const [formatting, setFormatting] = useState<string[]>(["bold", "underline"]);
  return (
    <div {...stylex.props(s.stack8)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Text formatting toolbar</p>
        <div {...stylex.props(s.row2)}>
          <FormattingGroup multiple value={formatting} onValueChange={setFormatting} />
          <AlignmentGroup
            iconOnly
            value={alignment}
            onValueChange={(next, details) => {
              if (next.length) setAlignment(next);
              else details.cancel();
            }}
          />
        </div>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>View mode switcher</p>
        <ViewModeGroup />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Vertical toolbar</p>
        <FormattingGroup count={3} orientation="vertical" multiple />
      </div>
    </div>
  );
}
function ViewModeGroup() {
  // Cancel the native change to express source disallowEmptySelection.
  const [value, setValue] = useState<string[]>(["grid"]);
  return (
    <ToggleButtonGroup
      value={value}
      size="sm"
      onValueChange={(next, details) => {
        if (next.length) setValue(next);
        else details.cancel();
      }}
    >
      <ToggleButton isIconOnly aria-label="Grid view" value="grid">
        <ActionIcon icon="gravity-ui:layout-cells-large" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="List view" value="list">
        <ToggleButtonGroup.Separator />
        <ActionIcon icon="gravity-ui:list-ul" />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Columns view" value="columns">
        <ToggleButtonGroup.Separator />
        <ActionIcon icon="gravity-ui:layout-columns-3" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
export const Examples: Story = { render: ExamplesScene };
