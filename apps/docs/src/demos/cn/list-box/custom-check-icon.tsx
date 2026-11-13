"use client";

import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./custom-check-icon--users";
export function CustomCheckIcon() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList multiple customCheck />
    </div>
  );
}
