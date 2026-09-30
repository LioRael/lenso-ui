"use client";
// HeroUI v3.2.6 disabled adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { Categories, styles } from "./categories";
export function TagGroupDisabled() {
  return (
    <div {...stylex.props(styles.disabled)}>
      <TagGroup aria-label="Disabled Tags" selectionMode="single">
        <Label>Disabled Tags</Label>
        <TagGroup.List>
          <Categories disabled count={3} />
        </TagGroup.List>
        <Description>Some tags are disabled</Description>
      </TagGroup>
      <TagGroup
        aria-label="Disabled Keys"
        disabledKeys={new Set(["travel"])}
        selectionMode="single"
      >
        <Label>Disabled Keys</Label>
        <TagGroup.List>
          <Categories count={3} />
        </TagGroup.List>
        <Description>Tags disabled via disabledKeys prop</Description>
      </TagGroup>
    </div>
  );
}
