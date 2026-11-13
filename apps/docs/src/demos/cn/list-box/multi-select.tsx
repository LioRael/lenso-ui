"use client";

import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./multi-select--users";
export function MultiSelect() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList multiple />
    </div>
  );
}
