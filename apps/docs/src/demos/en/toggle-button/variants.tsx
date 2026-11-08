"use client";
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
