// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Heart, HeartFill } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/toggle-button/source.stylex";
export function Controlled() {
  const [selected, setSelected] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <ToggleButton pressed={selected} onPressedChange={setSelected}>
        <ToggleButton.Icon>{selected ? <HeartFill /> : <Heart />}</ToggleButton.Icon>
        {selected ? "已点赞" : "点赞"}
      </ToggleButton>
      <p {...stylex.props(styles.muted)}>
        状态： <span {...stylex.props(styles.medium)}>{selected ? "已选" : "未选"}</span>
      </p>
    </div>
  );
}
