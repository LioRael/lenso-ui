// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 with-error-message adaptation (Apache-2.0).
import { useState, type Key } from "react";
import { Tag, TagGroup } from "@lenso/ui";
import { Description, ErrorMessage, Label } from "../../en/tag-group/text";
const amenities = [
  ["laundry", "Laundry"],
  ["fitness", "Fitness center"],
  ["parking", "Parking"],
  ["pool", "Swimming pool"],
  ["breakfast", "Breakfast"],
];
export function TagGroupWithErrorMessage() {
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  return (
    <TagGroup
      aria-label="设施"
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
      aria-invalid={!selected.size}
    >
      <Label>设施</Label>
      <TagGroup.List>
        {amenities.map(([key, name]) => (
          <Tag key={key} itemKey={key!} textValue={name!}>
            {name}
          </Tag>
        ))}
      </TagGroup.List>
      <Description>
        {!selected.size ? "请至少选择一个分类" : `Selected: ${[...selected].join(", ")}`}
      </Description>
      <ErrorMessage>{!selected.size && "请至少选择一个分类"}</ErrorMessage>
    </TagGroup>
  );
}
