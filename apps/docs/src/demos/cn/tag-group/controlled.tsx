"use client";

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
