"use client";

import { Button } from "@lenso/ui";
import { Icon } from "@iconify/react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function Social() {
  return (
    <div {...stylex.props(styles.social)}>
      <Button variant="bordered" fullWidth>
        <Button.Icon>
          <Icon icon="devicon:google" />
        </Button.Icon>
        使用 Google 登录
      </Button>
      <Button variant="bordered" fullWidth>
        <Button.Icon>
          <Icon icon="mdi:github" />
        </Button.Icon>
        使用 GitHub 登录
      </Button>
      <Button variant="bordered" fullWidth>
        <Button.Icon>
          <Icon icon="ion:logo-apple" />
        </Button.Icon>
        使用 Apple 登录
      </Button>
    </div>
  );
}
