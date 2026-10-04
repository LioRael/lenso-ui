// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 sizes adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Label } from "../../en/tag-group/text";
import { Categories, styles } from "../../en/tag-group/categories";
export function TagGroupSizes() {
  return (
    <div {...stylex.props(styles.sizes)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <TagGroup
          key={size}
          aria-label={["小", "中", "大"][index]}
          selectionMode="single"
          size={size}
        >
          <Label>{["Small", "Medium", "Large"][index]}</Label>
          <TagGroup.List>
            <Categories count={3} />
          </TagGroup.List>
        </TagGroup>
      ))}
    </div>
  );
}
