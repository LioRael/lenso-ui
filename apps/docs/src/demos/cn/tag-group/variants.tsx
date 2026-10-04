// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 variants adaptation (Apache-2.0).
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
