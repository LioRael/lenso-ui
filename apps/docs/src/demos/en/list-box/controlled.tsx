"use client";
// HeroUI v3.2.6 controlled adaptation (Apache-2.0).
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./users";
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
      <p {...stylex.props(styles.muted)}>
        Selected: {selected.size ? [...selected].join(", ") : "None"}
      </p>
    </div>
  );
}
