// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 custom-styles adaptation (Apache-2.0).
import { TagGroup } from "@lenso/ui";
import { Categories, styles } from "../../en/tag-group/categories";
export function CustomStyles() {
  return (
    <TagGroup aria-label="主题" selectionMode="single">
      <TagGroup.List xstyle={styles.list}>
        <Categories icons custom />
      </TagGroup.List>
    </TagGroup>
  );
}
