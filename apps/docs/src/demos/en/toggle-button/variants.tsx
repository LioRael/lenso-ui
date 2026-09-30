"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Variants() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton>
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        Default
      </ToggleButton>
      <ToggleButton variant="ghost">
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        Ghost
      </ToggleButton>
    </div>
  );
}
