"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Button } from "@lenso/ui";
import { Icon } from "@iconify/react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Social() {
  return (
    <div {...stylex.props(styles.social)}>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="devicon:google" />
        </Button.Icon>
        Sign in with Google
      </Button>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="mdi:github" />
        </Button.Icon>
        Sign in with GitHub
      </Button>
      <Button variant="tertiary" fullWidth>
        <Button.Icon>
          <Icon icon="ion:logo-apple" />
        </Button.Icon>
        Sign in with Apple
      </Button>
    </div>
  );
}
