// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { Description, ErrorMessage, Label, Tag, TagGroup } from "@lenso/ui";
import type { TagGroupRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
const styles = stylex.create({
  group: {
    width: "100%",
    maxWidth: 320,
    gap: 6,
  },
  error: {
    fontWeight: 500,
    color: "var(--danger)",
  },
});
export function CustomStyles() {
  const [selected, setSelected] = useState<TagGroupRootProps["selectedKeys"]>(new Set());
  const labelId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const invalid = !selected || selected.size === 0;
  return (
    <TagGroup
      xstyle={styles.group}
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
      aria-labelledby={labelId}
      aria-describedby={`${descriptionId}${invalid ? ` ${errorId}` : ""}`}
      aria-invalid={invalid}
    >
      <Label id={labelId} nativeLabel={false}>
        主题
      </Label>
      <TagGroup.List>
        <Tag itemKey="api" textValue="API">
          API
        </Tag>
        <Tag itemKey="design" textValue="设计">
          设计
        </Tag>
        <Tag itemKey="docs" textValue="文档">
          文档
        </Tag>
      </TagGroup.List>
      <Description id={descriptionId}>请至少选择一个主题</Description>
      <ErrorMessage id={errorId} xstyle={styles.error}>
        {invalid && <>请至少选择一个主题</>}
      </ErrorMessage>
    </TagGroup>
  );
}
