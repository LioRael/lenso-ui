"use client";
// HeroUI v3.2.6 with-list-data adaptation (Apache-2.0); native controlled collection.
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, EmptyState, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { styles } from "./categories";
const initial = ["Fred", "Michael", "Jane", "Alice", "Bob", "Charlie"].map((name, index) => ({
  key: name.toLowerCase(),
  textValue: name,
  color: ["blue", "green", "purple", "red", "orange", "black"][index],
}));
export function TagGroupWithListData() {
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Set<Key>>(new Set(["fred", "michael"]));
  const avatar = (user: (typeof initial)[number]) => (
    <Avatar xstyle={styles.avatar} size="sm">
      <Avatar.Image
        alt={user.textValue}
        src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.color}.jpg`}
      />
      <Avatar.Fallback>{user.textValue[0]}</Avatar.Fallback>
    </Avatar>
  );
  return (
    <div {...stylex.props(styles.width)}>
      <TagGroup
        aria-label="Team Members"
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={setSelected}
        onRemove={(keys) => setItems((previous) => previous.filter((user) => !keys.has(user.key)))}
      >
        <Label>Team Members</Label>
        <TagGroup.List>
          {items.length ? (
            items.map((user) => (
              <Tag key={user.key} itemKey={user.key} textValue={user.textValue}>
                {avatar(user)}
                {user.textValue}
              </Tag>
            ))
          ) : (
            <EmptyState>No team members</EmptyState>
          )}
        </TagGroup.List>
        <Description>Select team members for your project</Description>
      </TagGroup>
      {selected.size > 0 && (
        <>
          <p>Selected:</p>
          <div {...stylex.props(styles.selected)}>
            {items
              .filter((user) => selected.has(user.key))
              .map((user) => (
                <div key={user.key} {...stylex.props(styles.selectedUser)}>
                  {avatar(user)}
                  <span>{user.textValue}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
