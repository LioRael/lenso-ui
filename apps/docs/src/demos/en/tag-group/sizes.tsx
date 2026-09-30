"use client";
// HeroUI v3.2.6 sizes adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Label } from "./text";
import { Categories, styles } from "./categories";
export function TagGroupSizes() {
  return (
    <div {...stylex.props(styles.sizes)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <TagGroup
          key={size}
          aria-label={["Small", "Medium", "Large"][index]}
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
