"use client";
// HeroUI v3.2.6 multi-select adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./users";
export function MultiSelect() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList selectionMode="multiple" />
    </div>
  );
}
