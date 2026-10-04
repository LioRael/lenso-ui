// Adapted from HeroUI v3.2.6 e385ac2 toolbar.stories.tsx, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroup, Toolbar } from "@lenso/ui";
import { buttonStyles } from "@lenso/tokens/button";
import { FormattingGroup } from "./toggle-button-group.fixtures";
import { ActionIcon } from "./actions-icons.fixtures";

const meta = {
  title: "Components/Layout/Toolbar",
  component: Toolbar,
  parameters: { layout: "centered" },
  argTypes: { orientation: { control: "select", options: ["horizontal", "vertical"] } },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Toolbar aria-label="Text formatting">
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup>
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Copy"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:copy" />
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Cut"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:scissors" />
        </Toolbar.Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const Vertical: Story = {
  render: () => (
    <Toolbar aria-label="Tools" orientation="vertical">
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup>
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Undo"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:arrow-uturn-ccw-left" />
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Redo"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:arrow-uturn-cw-right" />
        </Toolbar.Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const WithButtonGroup: Story = {
  render: () => (
    <Toolbar aria-label="Editor toolbar">
      <ButtonGroup>
        <Toolbar.Button xstyle={buttonStyles.groupedHorizontal} variant="secondary">
          <ActionIcon icon="gravity-ui:arrow-uturn-ccw-left" />
          Undo
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button xstyle={buttonStyles.groupedHorizontal} variant="secondary">
          <ActionIcon icon="gravity-ui:arrow-uturn-cw-right" />
          Redo
        </Toolbar.Button>
      </ButtonGroup>
      <Toolbar.Separator />
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup>
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Align left"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:text-align-left" />
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Align center"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:text-align-center" />
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Align right"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:text-align-right" />
        </Toolbar.Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const Attached: Story = {
  render: () => (
    <Toolbar isAttached aria-label="Attached toolbar">
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup>
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Copy"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:copy" />
        </Toolbar.Button>
        <ButtonGroup.Separator />
        <Toolbar.Button
          xstyle={buttonStyles.groupedHorizontal}
          isIconOnly
          aria-label="Cut"
          variant="secondary"
        >
          <ActionIcon icon="gravity-ui:scissors" />
        </Toolbar.Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
