// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 disabled adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { Categories, styles } from "../../en/tag-group/categories";
export function TagGroupDisabled() {
  return (
    <div {...stylex.props(styles.disabled)}>
      <TagGroup aria-label="已禁用的标签" selectionMode="single">
        <Label>已禁用的标签</Label>
        <TagGroup.List>
          <Categories disabled count={3} />
        </TagGroup.List>
        <Description>部分标签已禁用</Description>
      </TagGroup>
      <TagGroup aria-label="禁用的键" disabledKeys={new Set(["travel"])} selectionMode="single">
        <Label>禁用的键</Label>
        <TagGroup.List>
          <Categories count={3} />
        </TagGroup.List>
        <Description>通过 disabledKeys 属性禁用的标签</Description>
      </TagGroup>
    </div>
  );
}
