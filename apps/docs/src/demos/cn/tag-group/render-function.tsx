// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 render-function adaptation (Apache-2.0).
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
