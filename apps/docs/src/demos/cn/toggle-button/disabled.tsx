"use client";

import { Heart, HeartFill } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/toggle-button/source.stylex";
export function Disabled() {
  return (
    <div {...stylex.props(styles.row)}>
      <ToggleButton disabled>
        <ToggleButton.Icon>
          <Heart />
        </ToggleButton.Icon>
        点赞
      </ToggleButton>
      <ToggleButton defaultPressed disabled>
        <ToggleButton.Icon>
          <HeartFill />
        </ToggleButton.Icon>
        点赞
      </ToggleButton>
    </div>
  );
}
