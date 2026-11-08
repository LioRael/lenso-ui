"use client";

import * as stylex from "@stylexjs/stylex";
import { Avatar, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "../../en/tag-group/text";
import { Categories, styles } from "../../en/tag-group/categories";
export function TagGroupWithPrefix() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TagGroup aria-label="带图标" selectionMode="single">
        <Label>带图标</Label>
        <TagGroup.List>
          <Categories icons />
        </TagGroup.List>
        <Description>带图标的标签</Description>
      </TagGroup>
      <TagGroup aria-label="带头像" selectionMode="single">
        <Label>带头像</Label>
        <TagGroup.List>
          {["Fred", "Michael", "Jane"].map((name, index) => (
            <Tag key={name} itemKey={name.toLowerCase()} textValue={name}>
              <Avatar xstyle={styles.avatar}>
                <Avatar.Image
                  alt={name}
                  src={`/assets/demo/avatars/${["blue", "green", "purple"][index]}.svg`}
                />
                <Avatar.Fallback>{name[0]}</Avatar.Fallback>
              </Avatar>
              {name}
            </Tag>
          ))}
        </TagGroup.List>
        <Description>带头像的标签</Description>
      </TagGroup>
    </div>
  );
}
