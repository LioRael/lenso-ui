// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Bookmark, Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/toggle-button/source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton isIconOnly aria-label="点赞">
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="收藏" variant="ghost">
        <ToggleButton.Icon>
          <Bookmark />
        </ToggleButton.Icon>
      </ToggleButton>
    </div>
  );
}
