"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./controlled--users";
export function Controlled() {
  const [selected, setSelected] = useState<string[]>(["1"]);
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.surface)}>
        <UsersList
          multiple
          value={selected}
          onValueChange={(value) =>
            setSelected(Array.isArray(value) ? value : value === null ? [] : [value])
          }
          customCheck
        />
      </div>
      <p {...stylex.props(styles.muted)}>
        已选：{selected.length ? [...selected].join(", ") : "无"}
      </p>
    </div>
  );
}
