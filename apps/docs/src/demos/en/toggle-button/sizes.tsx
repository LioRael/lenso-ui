"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Sizes() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.row)}>
        {(["sm", "md", "lg"] as const).map((size, index) => (
          <ToggleButton key={size} size={size}>
            <ToggleButton.Icon>
              <Heart />
            </ToggleButton.Icon>
            {["Small", "Medium", "Large"][index]}
          </ToggleButton>
        ))}
      </div>
      <div {...stylex.props(styles.row)}>
        {(["sm", "md", "lg"] as const).map((size) => (
          <ToggleButton key={size} isIconOnly aria-label="Like" size={size}>
            <ToggleButton.Icon>
              <Heart />
            </ToggleButton.Icon>
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}
