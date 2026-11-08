"use client";

import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { Categories, styles } from "../../en/tag-group/categories";
export function TagGroupSelectionModes() {
  const [single, setSingle] = useState<Set<Key>>(new Set(["news"]));
  const [multiple, setMultiple] = useState<Set<Key>>(new Set(["news", "travel"]));
  return (
    <div {...stylex.props(styles.stack)}>
      <TagGroup
        aria-label="单选"
        selectedKeys={single}
        selectionMode="single"
        onSelectionChange={setSingle}
      >
        <Label>单选</Label>
        <TagGroup.List>
          <Categories />
        </TagGroup.List>
        <Description>选择一个分类</Description>
      </TagGroup>
      <TagGroup
        aria-label="多选"
        selectedKeys={multiple}
        selectionMode="multiple"
        onSelectionChange={setMultiple}
      >
        <Label>多选</Label>
        <TagGroup.List>
          <Categories />
        </TagGroup.List>
        <Description>选择多个分类</Description>
      </TagGroup>
    </div>
  );
}
