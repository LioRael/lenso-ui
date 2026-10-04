// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button } from "@lenso/ui";
import { Icon } from "@iconify/react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function Social() {
  return (
    <div {...stylex.props(styles.social)}>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="devicon:google" />
        </Button.Icon>
        使用 Google 登录
      </Button>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="mdi:github" />
        </Button.Icon>
        使用 GitHub 登录
      </Button>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="ion:logo-apple" />
        </Button.Icon>
        使用 Apple 登录
      </Button>
    </div>
  );
}
