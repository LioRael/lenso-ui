// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 controlled adaptation (Apache-2.0).
import { useState, type Key } from "react";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { Categories } from "../../en/tag-group/categories";
export function TagGroupControlled() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(["news", "travel"]));
  return (
    <TagGroup
      aria-label="分类（受控）"
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
    >
      <Label>分类（受控）</Label>
      <TagGroup.List>
        <Categories />
      </TagGroup.List>
      <Description>已选：{selected.size ? [...selected].join(", ") : "无"}</Description>
    </TagGroup>
  );
}
