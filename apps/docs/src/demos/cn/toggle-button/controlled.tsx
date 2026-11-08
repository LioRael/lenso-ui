"use client";

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
