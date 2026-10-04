// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import {
  ChevronDown,
  Globe,
  Plus,
  TrashBin,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
} from "@gravity-ui/icons";
import { Button, ButtonGroup, Menu } from "@lenso/ui";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button-group/source.stylex";
function Three({
  separators = true,
  override = false,
  ...props
}: ComponentProps<typeof ButtonGroup> & {
  separators?: boolean;
  override?: boolean;
}) {
  return (
    <ButtonGroup {...props}>
      <Button>First</Button>
      <Button>{separators && <ButtonGroup.Separator />}Second</Button>
      <Button disabled={override ? false : undefined}>
        {separators && <ButtonGroup.Separator />}
        {override ? "Third (enabled)" : "Third"}
      </Button>
    </ButtonGroup>
  );
}
function Align({
  justify = true,
  ...props
}: ComponentProps<typeof ButtonGroup> & {
  justify?: boolean;
}) {
  return (
    <ButtonGroup {...props}>
      {[
        {
          label: "左对齐",
          icon: <TextAlignLeft />,
        },
        {
          label: "居中对齐",
          icon: <TextAlignCenter />,
        },
        {
          label: "右对齐",
          icon: <TextAlignRight />,
        },
        ...(justify
          ? [
              {
                label: "两端对齐",
                icon: <TextAlignJustify />,
              },
            ]
          : []),
      ].map((item, index) => (
        <Button key={item.label} isIconOnly aria-label={item.label}>
          {index > 0 && <ButtonGroup.Separator />}
          <Button.Icon>{item.icon}</Button.Icon>
        </Button>
      ))}
    </ButtonGroup>
  );
}
export function FullWidth() {
  return (
    <div {...stylex.props(styles.full)}>
      <Three fullWidth />
      <Align fullWidth justify={false} />
    </div>
  );
}
export function Sizes() {
  return (
    <div {...stylex.props(styles.sizes)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <div key={size} {...stylex.props(styles.section)}>
          <p {...stylex.props(styles.caption)}>{["Small", "Medium (default)", "Large"][index]}</p>
          <Three size={size} variant="secondary" />
        </div>
      ))}
    </div>
  );
}
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["primary", "secondary", "tertiary", "outline", "ghost", "danger"] as const).map(
        (variant, index) => (
          <div key={variant} {...stylex.props(styles.section)}>
            <p {...stylex.props(styles.caption)}>
              {["Primary", "Secondary", "Tertiary", "Outline", "Ghost", "Danger"][index]}
            </p>
            <Three variant={variant} />
          </div>
        ),
      )}
    </div>
  );
}
export function WithoutSeparator() {
  return <Three separators={false} />;
}
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>All buttons disabled</p>
        <Three disabled />
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>Group disabled, but one button overrides</p>
        <Three disabled override />
      </div>
    </div>
  );
}
export function Orientation() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["horizontal", "vertical"] as const).map((orientation, index) => (
        <div key={orientation} {...stylex.props(styles.section)}>
          <span {...stylex.props(styles.caption)}>{["Horizontal", "Vertical"][index]}</span>
          <Align orientation={orientation} variant="tertiary" />
        </div>
      ))}
    </div>
  );
}
export function WithIcons() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>With icons</p>
        <ButtonGroup variant="secondary">
          <Button>
            <Button.Icon>
              <Globe />
            </Button.Icon>
            Search
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Button.Icon>
              <Plus />
            </Button.Icon>
            Add
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Button.Icon>
              <TrashBin />
            </Button.Icon>
            Delete
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>Icon only buttons</p>
        <ButtonGroup variant="tertiary">
          <Button isIconOnly aria-label="Search">
            <Button.Icon>
              <Globe />
            </Button.Icon>
          </Button>
          <Button isIconOnly aria-label="Add">
            <ButtonGroup.Separator />
            <Button.Icon>
              <Plus />
            </Button.Icon>
          </Button>
          <Button isIconOnly aria-label="Delete">
            <ButtonGroup.Separator />
            <Button.Icon>
              <TrashBin />
            </Button.Icon>
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
export function CustomStyles() {
  return (
    <ButtonGroup>
      <Button xstyle={styles.merge}>Merge pull request</Button>
      <Menu>
        <Menu.Trigger
          render={<Button isIconOnly aria-label="Merge options" xstyle={styles.merge} />}
        >
          <ButtonGroup.Separator />
          <Button.Icon>
            <ChevronDown />
          </Button.Icon>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end">
            <Menu.Popup xstyle={styles.popup}>
              {[
                {
                  id: "merge",
                  label: "Create a merge commit",
                  description: "All commits from this branch will be added to the base branch",
                },
                {
                  id: "squash-and-merge",
                  label: "Squash and merge",
                  description:
                    "The 14 commits from this branch will be combined into one commit in the base branch",
                },
                {
                  id: "rebase-and-merge",
                  label: "Rebase and merge",
                  description:
                    "The 14 commits from this branch will be rebased and added to the base branch",
                },
              ].map((item) => (
                <Menu.Item key={item.id} xstyle={styles.item}>
                  <span {...stylex.props(styles.menuLabel)}>{item.label}</span>
                  <span {...stylex.props(styles.menuDescription)}>{item.description}</span>
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>
    </ButtonGroup>
  );
}
