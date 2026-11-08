"use client";
import { Heart, HeartFill } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function Controlled() {
  const [selected, setSelected] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <ToggleButton pressed={selected} onPressedChange={setSelected}>
        <ToggleButton.Icon>{selected ? <HeartFill /> : <Heart />}</ToggleButton.Icon>
        {selected ? "Liked" : "Like"}
      </ToggleButton>
      <p {...stylex.props(styles.muted)}>
        Status:{" "}
        <span {...stylex.props(styles.medium)}>{selected ? "Selected" : "Not selected"}</span>
      </p>
    </div>
  );
}
