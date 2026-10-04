// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 with-remove-button adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Icon } from "@iconify/react";
import { EmptyState, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { styles } from "../../en/tag-group/categories";
function Removable({ custom = false }: { custom?: boolean }) {
  const [items, setItems] = useState(
    custom ? ["React", "Vue", "Angular", "Svelte"] : ["News", "Travel", "Gaming", "Shopping"],
  );
  const remove = (keys: Set<Key>) =>
    setItems((previous) => previous.filter((name) => !keys.has(name.toLowerCase())));
  return (
    <TagGroup
      aria-label={custom ? "自定义移除按钮" : "默认移除按钮"}
      selectionMode="single"
      onRemove={remove}
    >
      <Label>{custom ? "自定义移除按钮" : "默认移除按钮"}</Label>
      <TagGroup.List>
        {items.length ? (
          items.map((name) => (
            <Tag key={name} itemKey={name.toLowerCase()} textValue={name}>
              {custom
                ? ({ allowsRemoving }) => (
                    <>
                      {name}
                      {allowsRemoving && (
                        <Tag.RemoveButton>
                          <Icon icon="gravity-ui:circle-xmark-fill" width={12} aria-hidden="true" />
                        </Tag.RemoveButton>
                      )}
                    </>
                  )
                : name}
            </Tag>
          ))
        ) : (
          <EmptyState>{custom ? "未找到框架" : "未找到分类"}</EmptyState>
        )}
      </TagGroup.List>
      <Description>{custom ? "带图标的自定义移除按钮" : "点击 × 移除标签"}</Description>
    </TagGroup>
  );
}
export function TagGroupWithRemoveButton() {
  return (
    <div {...stylex.props(styles.stack)}>
      <Removable />
      <Removable custom />
    </div>
  );
}
