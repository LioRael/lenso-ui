// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 with-list-data adaptation (Apache-2.0); native controlled collection.
import { useState, type Key } from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, EmptyState, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { styles } from "../../en/tag-group/categories";
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
        aria-label="团队成员"
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={setSelected}
        onRemove={(keys) => setItems((previous) => previous.filter((user) => !keys.has(user.key)))}
      >
        <Label>团队成员</Label>
        <TagGroup.List>
          {items.length ? (
            items.map((user) => (
              <Tag key={user.key} itemKey={user.key} textValue={user.textValue}>
                {avatar(user)}
                {user.textValue}
              </Tag>
            ))
          ) : (
            <EmptyState>暂无团队成员</EmptyState>
          )}
        </TagGroup.List>
        <Description>为项目选择团队成员</Description>
      </TagGroup>
      {selected.size > 0 && (
        <>
          <p>已选：</p>
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
