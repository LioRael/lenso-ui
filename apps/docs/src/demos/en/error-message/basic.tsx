"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Description, ErrorMessage, Label, Tag, TagGroup } from "@lenso/ui";
import type { TagGroupRootProps } from "@lenso/ui";
import { useId, useState } from "react";

const categories = ["News", "Travel", "Gaming", "Shopping"];
export function ErrorMessageBasic() {
  const [selected, setSelected] = useState<TagGroupRootProps["selectedKeys"]>(new Set());
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const invalid = !selected || selected.size === 0;
  return (
    <TagGroup
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
      aria-labelledby={labelId}
      aria-describedby={`${descriptionId}${invalid ? ` ${errorId}` : ""}`}
      aria-invalid={invalid}
    >
      <Label id={labelId} nativeLabel={false}>
        Required Categories
      </Label>
      <TagGroup.List>
        {categories.map((category) => (
          <Tag key={category} itemKey={category.toLowerCase()} textValue={category}>
            {category}
          </Tag>
        ))}
      </TagGroup.List>
      <Description id={descriptionId}>Select at least one category</Description>
      <ErrorMessage id={errorId}>
        {invalid && <>Please select at least one category</>}
      </ErrorMessage>
    </TagGroup>
  );
}
