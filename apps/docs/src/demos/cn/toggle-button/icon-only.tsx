"use client";

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
