"use client";

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
