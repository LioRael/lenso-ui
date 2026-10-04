// HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// Modified: native Base UI trigger render and Portal/Positioner/Popup anatomy.
import type { Meta } from "@storybook/react-vite";
import React from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Button, Card, Popover } from "@lenso/ui";
import { overlayStyles as s } from "./overlay.stylex";
import { OverlayIcon } from "./overlay.fixtures";
import { position, positionControls, type OverlayPositionArgs } from "./overlay-position.fixtures";

export default {
  argTypes: positionControls,
  component: Popover,
  parameters: { layout: "centered" },
  title: "Components/Overlays/Popover",
} as Meta<OverlayPositionArgs>;
const defaultArgs: OverlayPositionArgs = {};

function Template(props: OverlayPositionArgs) {
  return (
    <div {...stylex.props(s.compactRow)}>
      <Popover.Root>
        <Popover.Trigger
          render={<Button isIconOnly aria-label="Popover trigger" variant="tertiary" />}
        >
          <OverlayIcon name="circle-info" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner {...position(props)}>
            <Popover.Popup>
              <Popover.Title>Popover heading</Popover.Title>
              <p>This is the popover content</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
function TemplateWithArrow(props: OverlayPositionArgs) {
  return (
    <div {...stylex.props(s.compactRow)}>
      <Popover.Root>
        <Popover.Trigger
          render={<Button isIconOnly aria-label="Popover trigger" variant="tertiary" />}
        >
          <OverlayIcon name="circle-info" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner {...position(props)}>
            <Popover.Popup>
              <Popover.Arrow />
              <Popover.Title>Popover heading</Popover.Title>
              <p>This is the popover content</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
const avatarUrl = "https://img.heroui.chat/image/avatar?w=400&h=400&u=5";
function TemplateWithCustomContent(props: OverlayPositionArgs) {
  const [isFollowing, setIsFollowing] = React.useState(false);
  return (
    <div {...stylex.props(s.compactRow)}>
      <Popover.Root>
        <Popover.Trigger aria-label="Popover trigger">
          <div {...stylex.props(s.compactRow)}>
            <Avatar size="sm">
              <Avatar.Image alt="Zoe" src={avatarUrl} />
              <Avatar.Fallback>Z</Avatar.Fallback>
            </Avatar>
            <div>
              <p>Zoe</p>
              <p {...stylex.props(s.small)}>zoe@heroui.com</p>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner {...position(props)}>
            <Popover.Popup xstyle={s.popoverProfile}>
              <div {...stylex.props(s.between)}>
                <div {...stylex.props(s.compactRow)}>
                  <Avatar size="md">
                    <Avatar.Image alt="Zoe" src={avatarUrl} />
                    <Avatar.Fallback>Z</Avatar.Fallback>
                  </Avatar>
                  <div {...stylex.props(s.profileText)}>
                    <Popover.Title>Zoey Lang</Popover.Title>
                    <span {...stylex.props(s.muted)}>@zoe</span>
                  </div>
                </div>
                <Button
                  xstyle={s.follow}
                  size="sm"
                  variant={isFollowing ? "tertiary" : "primary"}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
              <div>
                <p>
                  Design Engineer, @hero_ui lover she/her. SF Bay Area&nbsp;
                  {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Source emoji has a named image role, not an image URL. */}
                  <span aria-label="confetti" role="img">
                    🎉
                  </span>
                </p>
              </div>
              <div {...stylex.props(s.compactRow)}>
                <div {...stylex.props(s.compactRow)}>
                  <p>4</p>
                  <p {...stylex.props(s.muted)}>Following</p>
                </div>
                <div {...stylex.props(s.compactRow)}>
                  <p>97.1K</p>
                  <p {...stylex.props(s.muted)}>Followers</p>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
export const Default = { args: defaultArgs, render: Template };
export const WithArrow = { args: defaultArgs, render: TemplateWithArrow };
export const WithCustomContent = { args: defaultArgs, render: TemplateWithCustomContent };

function SpringAnimationTemplate(props: OverlayPositionArgs) {
  return (
    <div {...stylex.props(s.springStage)}>
      <h1 {...stylex.props(s.springTitle)}>Popover with Spring Animation</h1>
      <p {...stylex.props(s.muted)}>
        The popover now uses a spring easing function for a more dynamic feel
      </p>
      <Popover.Root>
        <Popover.Trigger render={<Button />}>Click for Spring Animation</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner {...position(props)}>
            <Popover.Popup xstyle={s.spring}>
              <Popover.Arrow />
              <Popover.Title>Spring Animation 🎉</Popover.Title>
              <p {...stylex.props(s.muted)}>
                Notice the subtle bounce effect when the popover appears and disappears.
              </p>
              <p {...stylex.props(s.small)}>Easing: cubic-bezier(0.36, 1.66, 0.04, 1)</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <div {...stylex.props(s.small, s.centered)}>
        <p>Animation classes applied:</p>
        <code {...stylex.props(s.code)}>
          data-[entering]:animate-in data-[entering]:zoom-in-90 data-[entering]:fade-in-0
          data-[entering]:ease-spring data-[entering]:duration-600
        </code>
      </div>
    </div>
  );
}
export const SpringAnimation = { args: defaultArgs, render: SpringAnimationTemplate };
function CardWithHelptextTemplate(props: OverlayPositionArgs) {
  return (
    <Card xstyle={s.card400}>
      <Card.Header>
        <div {...stylex.props(s.compactRow)}>
          <Card.Title>Card Title</Card.Title>
          <Popover.Root>
            <Popover.Trigger
              aria-label="Help information"
              render={<Button isIconOnly aria-label="Help" size="sm" variant="ghost" />}
            >
              <OverlayIcon name="circle-info" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner {...position({ ...props, placement: "right" })}>
                <Popover.Popup xstyle={s.help}>
                  <Popover.Arrow />
                  <Popover.Title>Help Information</Popover.Title>
                  <p {...stylex.props(s.muted)}>
                    This is a helptext popover that appears on top of the card surface. It provides
                    additional context or information about the card title.
                  </p>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <Card.Description>
          This card demonstrates how a popover looks when displayed on top of a card surface.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <p>
          The popover help icon is positioned right after the title, allowing users to access
          additional information without cluttering the main content area.
        </p>
      </Card.Content>
    </Card>
  );
}
export const CardWithHelptext = { args: defaultArgs, render: CardWithHelptextTemplate };
