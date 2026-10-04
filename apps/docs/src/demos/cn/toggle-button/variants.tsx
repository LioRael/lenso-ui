// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/toggle-button/source.stylex";
export function Variants() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton>
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        默认
      </ToggleButton>
      <ToggleButton variant="ghost">
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        幽灵
      </ToggleButton>
    </div>
  );
}
