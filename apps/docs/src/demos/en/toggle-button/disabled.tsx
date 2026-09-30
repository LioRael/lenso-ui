"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart, HeartFill } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Disabled() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton disabled>
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        Like
      </ToggleButton>
      <ToggleButton defaultPressed disabled>
        <ToggleButton.Icon>
          <HeartFill />
        </ToggleButton.Icon>
        Like
      </ToggleButton>
    </div>
  );
}
