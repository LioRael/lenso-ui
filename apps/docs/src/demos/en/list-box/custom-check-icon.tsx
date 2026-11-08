"use client";
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./users";
export function CustomCheckIcon() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList selectionMode="multiple" customCheck />
    </div>
  );
}
