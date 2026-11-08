"use client";

import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Label } from "../../en/tag-group/text";
import { Categories, styles } from "../../en/tag-group/categories";
export function TagGroupVariants() {
  return (
    <div {...stylex.props(styles.stack)}>
      {(["default", "surface"] as const).map((variant) => (
        <TagGroup
          key={variant}
          aria-label={variant === "default" ? "默认" : "表面"}
          selectionMode="single"
          variant={variant}
        >
          <Label>{variant === "default" ? "默认" : "表面"}</Label>
          <TagGroup.List>
            <Categories count={3} />
          </TagGroup.List>
        </TagGroup>
      ))}
    </div>
  );
}
