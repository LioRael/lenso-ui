"use client";
import { TagGroup } from "@lenso/ui";
import { Categories } from "./categories";
export function RenderFunction() {
  return (
    <TagGroup
      aria-label="Tags"
      render={(props) => <div {...props} data-custom="foo" />}
      selectionMode="single"
    >
      <TagGroup.List>
        <Categories icons prefix="default-" />
      </TagGroup.List>
    </TagGroup>
  );
}
