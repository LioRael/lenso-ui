"use client";
// HeroUI v3.2.6 variants adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Label } from "./text";
import { Categories, styles } from "./categories";
export function TagGroupVariants() {
  return (
    <div {...stylex.props(styles.stack)}>
      {(["default", "surface"] as const).map((variant) => (
        <TagGroup
          key={variant}
          aria-label={variant === "default" ? "Default" : "Surface"}
          selectionMode="single"
          variant={variant}
        >
          <Label>{variant === "default" ? "Default" : "Surface"}</Label>
          <TagGroup.List>
            <Categories count={3} />
          </TagGroup.List>
        </TagGroup>
      ))}
    </div>
  );
}
