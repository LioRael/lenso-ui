"use client";

import * as stylex from "@stylexjs/stylex";
import { Avatar, Button, Popover } from "@lenso/ui";
import { useState } from "react";
import { styles } from "../../en/popover/styles";
export function PopoverInteractive() {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div {...stylex.props(styles.profileRow)}>
      <Popover>
        <Popover.Trigger aria-label="用户资料">
          <div {...stylex.props(styles.identity)}>
            <Avatar size="sm">
              <Avatar.Image alt="Sarah Johnson" src="/assets/demo/avatars/green.svg" />
              <Avatar.Fallback>SJ</Avatar.Fallback>
            </Avatar>
            <div {...stylex.props(styles.identityText)}>
              <p {...stylex.props(styles.name)}>Sarah Johnson</p>
              <p {...stylex.props(styles.handle)}>@sarahj</p>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Content xstyle={styles.profilePopup} sideOffset={16}>
          <Popover.Title render={<div />}>
            <div {...stylex.props(styles.profileHeading)}>
              <div {...stylex.props(styles.identityLarge)}>
                <Avatar size="md">
                  <Avatar.Image alt="Sarah Johnson" src="/assets/demo/avatars/green.svg" />
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
                variant={isFollowing ? "borderless" : "prominent"}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "关注"}
              </Button>
            </div>
          </Popover.Title>
          <Popover.Description xstyle={styles.bio}>
            产品设计师兼创意总监，打造有意义的美好体验。
          </Popover.Description>
          <div {...stylex.props(styles.statistics)}>
            <div>
              <span {...stylex.props(styles.strong)}>892</span>
              <span {...stylex.props(styles.statisticLabel)}>Following</span>
            </div>
            <div>
              <span {...stylex.props(styles.strong)}>12.5K</span>
              <span {...stylex.props(styles.statisticLabel)}>粉丝</span>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
}
