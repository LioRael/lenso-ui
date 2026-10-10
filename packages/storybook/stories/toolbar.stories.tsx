// HeroUI v3.2.6 story cases with the docs' tertiary toolbar composition, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup, Toolbar } from "@lenso/ui";
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
      <ButtonGroup variant="tertiary">
        <Button
          isIconOnly
          aria-label="Copy"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ActionIcon icon="gravity-ui:copy" />
        </Button>
        <Button
          isIconOnly
          aria-label="Cut"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:scissors" />
        </Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const Vertical: Story = {
  render: () => (
    <Toolbar aria-label="Tools" orientation="vertical">
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup variant="tertiary">
        <Button
          isIconOnly
          aria-label="Undo"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ActionIcon icon="gravity-ui:arrow-uturn-ccw-left" />
        </Button>
        <Button
          isIconOnly
          aria-label="Redo"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:arrow-uturn-cw-right" />
        </Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const WithButtonGroup: Story = {
  render: () => (
    <Toolbar aria-label="Editor toolbar">
      <ButtonGroup variant="tertiary">
        <Button render={<Toolbar.Button variant="tertiary" />}>
          <ActionIcon icon="gravity-ui:arrow-uturn-ccw-left" />
          Undo
        </Button>
        <Button render={<Toolbar.Button variant="tertiary" />}>
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:arrow-uturn-cw-right" />
          Redo
        </Button>
      </ButtonGroup>
      <Toolbar.Separator />
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup variant="tertiary">
        <Button
          isIconOnly
          aria-label="Align left"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ActionIcon icon="gravity-ui:text-align-left" />
        </Button>
        <Button
          isIconOnly
          aria-label="Align center"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:text-align-center" />
        </Button>
        <Button
          isIconOnly
          aria-label="Align right"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:text-align-right" />
        </Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
export const Attached: Story = {
  render: () => (
    <Toolbar isAttached aria-label="Attached toolbar">
      <FormattingGroup count={3} aria-label="Text style" multiple />
      <Toolbar.Separator />
      <ButtonGroup variant="tertiary">
        <Button
          isIconOnly
          aria-label="Copy"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ActionIcon icon="gravity-ui:copy" />
        </Button>
        <Button
          isIconOnly
          aria-label="Cut"
          render={<Toolbar.Button isIconOnly variant="tertiary" />}
        >
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:scissors" />
        </Button>
      </ButtonGroup>
    </Toolbar>
  ),
};
