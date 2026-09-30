"use client";

// Adapted from HeroUI v3.2.6 popover-interactive (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Avatar, Button, Popover } from "@lenso/ui";
import { useState } from "react";
import { styles } from "./styles";

export function PopoverInteractive() {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div {...stylex.props(styles.profileRow)}>
      <Popover>
        <Popover.Trigger aria-label="User profile">
          <div {...stylex.props(styles.identity)}>
            <Avatar size="sm">
              <Avatar.Image
                alt="Sarah Johnson"
                src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
              />
              <Avatar.Fallback>SJ</Avatar.Fallback>
            </Avatar>
            <div {...stylex.props(styles.identityText)}>
              <p {...stylex.props(styles.name)}>Sarah Johnson</p>
              <p {...stylex.props(styles.handle)}>@sarahj</p>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup xstyle={styles.profilePopup}>
              <Popover.Title render={<div />}>
                <div {...stylex.props(styles.profileHeading)}>
                  <div {...stylex.props(styles.identityLarge)}>
                    <Avatar size="md">
                      <Avatar.Image
                        alt="Sarah Johnson"
                        src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
                      />
                      <Avatar.Fallback>SJ</Avatar.Fallback>
                    </Avatar>
                    <div>
                      <p {...stylex.props(styles.strong)}>Sarah Johnson</p>
                      <p {...stylex.props(styles.muted)}>@sarahj</p>
                    </div>
                  </div>
                  <Button
                    xstyle={styles.follow}
                    size="sm"
                    variant={isFollowing ? "tertiary" : "primary"}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>
              </Popover.Title>
              <Popover.Description xstyle={styles.bio}>
                Product designer and creative director. Building beautiful experiences that matter.
              </Popover.Description>
              <div {...stylex.props(styles.statistics)}>
                <div>
                  <span {...stylex.props(styles.strong)}>892</span>
                  <span {...stylex.props(styles.statisticLabel)}>Following</span>
                </div>
                <div>
                  <span {...stylex.props(styles.strong)}>12.5K</span>
                  <span {...stylex.props(styles.statisticLabel)}>Followers</span>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
