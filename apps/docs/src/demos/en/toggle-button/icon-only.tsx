"use client";
import { Bookmark, Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton isIconOnly aria-label="Like">
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Bookmark" variant="ghost">
        <ToggleButton.Icon>
          <Bookmark />
        </ToggleButton.Icon>
      </ToggleButton>
    </div>
  );
}
