"use client";
// HeroUI v3.2.6 selection-modes adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { Categories, styles } from "./categories";
export function TagGroupSelectionModes() {
  const [single, setSingle] = useState<Set<Key>>(new Set(["news"]));
  const [multiple, setMultiple] = useState<Set<Key>>(new Set(["news", "travel"]));
  return (
    <div {...stylex.props(styles.stack)}>
      <TagGroup
        aria-label="Single Selection"
        selectedKeys={single}
        selectionMode="single"
        onSelectionChange={setSingle}
      >
        <Label>Single Selection</Label>
        <TagGroup.List>
          <Categories />
        </TagGroup.List>
        <Description>Choose one category</Description>
      </TagGroup>
      <TagGroup
        aria-label="Multiple Selection"
        selectedKeys={multiple}
        selectionMode="multiple"
        onSelectionChange={setMultiple}
      >
        <Label>Multiple Selection</Label>
        <TagGroup.List>
          <Categories />
        </TagGroup.List>
        <Description>Choose multiple categories</Description>
      </TagGroup>
    </div>
  );
}
