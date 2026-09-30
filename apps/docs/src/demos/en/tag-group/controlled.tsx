"use client";
// HeroUI v3.2.6 controlled adaptation (Apache-2.0).
import { useState, type Key } from "react";
import { TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { Categories } from "./categories";
export function TagGroupControlled() {
  const [selected, setSelected] = useState<Set<Key>>(new Set(["news", "travel"]));
  return (
    <TagGroup
      aria-label="Categories (controlled)"
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
    >
      <Label>Categories (controlled)</Label>
      <TagGroup.List>
        <Categories />
      </TagGroup.List>
      <Description>Selected: {selected.size ? [...selected].join(", ") : "None"}</Description>
    </TagGroup>
  );
}
