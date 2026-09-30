"use client";
// HeroUI v3.2.6 custom-check-icon adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./users";
export function CustomCheckIcon() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList selectionMode="multiple" customCheck />
    </div>
  );
}
