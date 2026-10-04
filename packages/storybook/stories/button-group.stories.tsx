// Adapted from HeroUI v3.2.6 e385ac2 button-group.stories.tsx, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup, Chip, Description, Menu, Label } from "@lenso/ui";
import { buttonStyles } from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { actions as s } from "./actions.stylex";
import { ActionIcon } from "./actions-icons.fixtures";
import { ThreeButtons } from "./button-group.fixtures";

const meta = {
  title: "Components/Buttons/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <ThreeButtons /> };
export const Sizes: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Small</p>
        <ThreeButtons size="sm" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Medium (default)</p>
        <ThreeButtons size="md" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Large</p>
        <ThreeButtons size="lg" />
      </div>
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.fullWidth)}>
      <ThreeButtons fullWidth />
      <ButtonGroup fullWidth>
        <Button isIconOnly>
          <ActionIcon icon="gravity-ui:text-align-left" />
        </Button>
        <Button isIconOnly>
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:text-align-center" />
        </Button>
        <Button isIconOnly>
          <ButtonGroup.Separator />
          <ActionIcon icon="gravity-ui:text-align-right" />
        </Button>
      </ButtonGroup>
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Primary</p>
        <ThreeButtons variant="primary" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Secondary</p>
        <ThreeButtons variant="secondary" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Tertiary</p>
        <ThreeButtons variant="tertiary" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Outline</p>
        <ThreeButtons variant="outline" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Ghost</p>
        <ThreeButtons variant="ghost" />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Danger</p>
        <ThreeButtons variant="danger" />
      </div>
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>All buttons disabled</p>
        <ThreeButtons disabled />
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Group disabled, but one button overrides</p>
        <ThreeButtons disabled enabledThird />
      </div>
    </div>
  ),
};
export const WithIcons: Story = {
  render: () => (
    <div {...stylex.props(s.stack6)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>With icons</p>
        <ButtonGroup variant="secondary">
          <Button>
            <ActionIcon icon="gravity-ui:globe" />
            Search
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:plus" />
            Add
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:trash-bin" />
            Delete
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Icon only buttons</p>
        <ButtonGroup variant="tertiary">
          <Button isIconOnly>
            <ActionIcon icon="gravity-ui:globe" />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:plus" />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:trash-bin" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};
export const WithoutSeparator: Story = { render: () => <ThreeButtons separators={false} /> };
export const Examples: Story = {
  render: () => (
    <div {...stylex.props(s.stack8)}>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Single button with menu</p>
        <ButtonGroup>
          <Button>Merge pull request</Button>
          <Menu>
            <Menu.Trigger
              render={
                <Button
                  xstyle={buttonStyles.groupedHorizontal}
                  isIconOnly
                  aria-label="More options"
                />
              }
            >
              <ButtonGroup.Separator />
              <ActionIcon icon="gravity-ui:chevron-down" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end">
                <Menu.Popup xstyle={s.popup}>
                  <Menu.Item
                    xstyle={s.menuItem}
                    id="merge"
                    label="Create a merge commit"
                    onClick={() => alert("Selected: merge")}
                  >
                    <Label>Create a merge commit</Label>
                    <Description>
                      All commits from this branch will be added to the base branch
                    </Description>
                  </Menu.Item>
                  <Menu.Item
                    xstyle={s.menuItem}
                    id="squash-and-merge"
                    label="Squash and merge"
                    onClick={() => alert("Selected: squash-and-merge")}
                  >
                    <Label>Squash and merge</Label>
                    <Description>
                      The 14 commits from this branch will be combined into one commit in the base
                      branch
                    </Description>
                  </Menu.Item>
                  <Menu.Item
                    xstyle={s.menuItem}
                    id="rebase-and-merge"
                    label="Rebase and merge"
                    onClick={() => alert("Selected: rebase-and-merge")}
                  >
                    <Label>Rebase and merge</Label>
                    <Description>
                      The 14 commits from this branch will be rebased and added to the base branch
                    </Description>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu>
        </ButtonGroup>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Individual buttons</p>
        <div {...stylex.props(s.row2)}>
          <ButtonGroup variant="tertiary">
            <Button>
              <ActionIcon icon="gravity-ui:code-fork" compact />
              Fork
              <Chip color="accent" size="sm" variant="soft">
                24
              </Chip>
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ActionIcon icon="gravity-ui:chevron-down" />
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button isIconOnly>
              <ActionIcon icon="gravity-ui:qr-code" />
            </Button>
            <Button>
              <ButtonGroup.Separator />
              Scan to pay
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <ActionIcon icon="gravity-ui:thumbs-up" />
              <span {...stylex.props(s.count)}>2.4K</span>
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ActionIcon icon="gravity-ui:thumbs-down" />
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <ActionIcon icon="gravity-ui:star" compact />
              Star
            </Button>
            <Button xstyle={s.compactButton}>
              <ButtonGroup.Separator />
              <Chip color="accent" size="sm" variant="soft">
                104
              </Chip>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <ActionIcon icon="gravity-ui:pin" />
              Pinned
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ActionIcon icon="gravity-ui:chevron-down" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Previous/Next navigation</p>
        <ButtonGroup variant="tertiary">
          <Button>
            <ActionIcon icon="gravity-ui:chevron-left" />
            Previous
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Next
            <ActionIcon icon="gravity-ui:chevron-right" />
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Content selection</p>
        <ButtonGroup variant="tertiary">
          <Button>
            <ActionIcon icon="gravity-ui:picture" />
            Photos
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:video" />
            Videos
          </Button>
          <Button isIconOnly aria-label="More options">
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:ellipsis" />
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Text alignment</p>
        <ButtonGroup variant="tertiary">
          <Button>Left</Button>
          <Button>
            <ButtonGroup.Separator />
            Center
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Right
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(s.stack2)}>
        <p {...stylex.props(s.muted)}>Icon-only alignment</p>
        <ButtonGroup variant="tertiary">
          <Button isIconOnly>
            <ActionIcon icon="gravity-ui:text-align-left" />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:text-align-center" />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:text-align-right" />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <ActionIcon icon="gravity-ui:text-align-justify" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};
