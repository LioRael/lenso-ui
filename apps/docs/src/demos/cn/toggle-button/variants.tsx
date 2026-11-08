"use client";

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
