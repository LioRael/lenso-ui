// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import { styles } from "../../en/toggle-button/source.stylex";
export function CustomStyles() {
  return (
    <ToggleButton xstyle={styles.custom}>
      <ToggleButton.Icon xstyle={styles.icon}>
        <Heart />
      </ToggleButton.Icon>
      收藏文章
    </ToggleButton>
  );
}
