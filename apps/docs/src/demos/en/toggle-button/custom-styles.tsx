"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import { styles } from "./source.stylex";
export function CustomStyles() {
  return (
    <ToggleButton xstyle={styles.custom}>
      <ToggleButton.Icon xstyle={styles.icon}>
        <Heart />
      </ToggleButton.Icon>
      Save article
    </ToggleButton>
  );
}
