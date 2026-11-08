"use client";
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./users";
export function MultiSelect() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList selectionMode="multiple" />
    </div>
  );
}
