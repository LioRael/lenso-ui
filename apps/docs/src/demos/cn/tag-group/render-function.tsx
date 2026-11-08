"use client";

import { TagGroup } from "@lenso/ui";
import { Categories } from "../../en/tag-group/categories";
export function RenderFunction() {
  return (
    <TagGroup
      aria-label="标签"
      render={(props) => <div {...props} data-custom="foo" />}
      selectionMode="single"
    >
      <TagGroup.List>
        <Categories icons prefix="default-" />
      </TagGroup.List>
    </TagGroup>
  );
}
