"use client";
// HeroUI v3.2.6 with-error-message adaptation (Apache-2.0).
import { useState, type Key } from "react";
import { Tag, TagGroup } from "@lenso/ui";
import { Description, ErrorMessage, Label } from "./text";
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
      aria-label="Amenities"
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
      aria-invalid={!selected.size}
    >
      <Label>Amenities</Label>
      <TagGroup.List>
        {amenities.map(([key, name]) => (
          <Tag key={key} itemKey={key!} textValue={name!}>
            {name}
          </Tag>
        ))}
      </TagGroup.List>
      <Description>
        {!selected.size ? "Select at least one category" : `Selected: ${[...selected].join(", ")}`}
      </Description>
      <ErrorMessage>{!selected.size && "Please select at least one category"}</ErrorMessage>
    </TagGroup>
  );
}
