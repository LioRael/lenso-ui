"use client";
// HeroUI v3.2.6 custom-styles adaptation (Apache-2.0).
import { UsersList, styles } from "./users";
export function CustomStyles() {
  return (
    <UsersList
      aria-label="Assignee"
      xstyle={styles.custom}
      selectionMode="single"
      customStyles
      count={2}
    />
  );
}
