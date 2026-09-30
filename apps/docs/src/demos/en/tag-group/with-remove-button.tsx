"use client";
// HeroUI v3.2.6 with-remove-button adaptation (Apache-2.0).
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Icon } from "@iconify/react";
import { EmptyState, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { styles } from "./categories";
function Removable({ custom = false }: { custom?: boolean }) {
  const [items, setItems] = useState(
    custom ? ["React", "Vue", "Angular", "Svelte"] : ["News", "Travel", "Gaming", "Shopping"],
  );
  const remove = (keys: Set<Key>) =>
    setItems((previous) => previous.filter((name) => !keys.has(name.toLowerCase())));
  return (
    <TagGroup
      aria-label={custom ? "Custom Remove Button" : "Default Remove Button"}
      selectionMode="single"
      onRemove={remove}
    >
      <Label>{custom ? "Custom Remove Button" : "Default Remove Button"}</Label>
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
          <EmptyState>{custom ? "No frameworks found" : "No categories found"}</EmptyState>
        )}
      </TagGroup.List>
      <Description>
        {custom ? "Custom remove button with icon" : "Click the X to remove tags"}
      </Description>
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
