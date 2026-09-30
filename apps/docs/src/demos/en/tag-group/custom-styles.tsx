"use client";
// HeroUI v3.2.6 custom-styles adaptation (Apache-2.0).
import { TagGroup } from "@lenso/ui";
import { Categories, styles } from "./categories";
export function CustomStyles() {
  return (
    <TagGroup aria-label="Topics" selectionMode="single">
      <TagGroup.List xstyle={styles.list}>
        <Categories icons custom />
      </TagGroup.List>
    </TagGroup>
  );
}
