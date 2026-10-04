// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 custom-check-icon adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { UsersList, styles } from "./custom-check-icon--users";
export function CustomCheckIcon() {
  return (
    <div {...stylex.props(styles.surface)}>
      <UsersList selectionMode="multiple" customCheck />
    </div>
  );
}
