"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./controlled--users";
export function Controlled() {
  const [selected, setSelected] = useState<Set<React.Key>>(new Set(["1"]));
  return (
    <div {...stylex.props(styles.stack)}>
      <div {...stylex.props(styles.surface)}>
        <UsersList
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          customCheck
        />
      </div>
      <p {...stylex.props(styles.muted)}>已选：{selected.size ? [...selected].join(", ") : "无"}</p>
    </div>
  );
}
