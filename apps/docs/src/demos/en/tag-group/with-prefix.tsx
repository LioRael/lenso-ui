"use client";
import * as stylex from "@stylexjs/stylex";
import { Avatar, Tag, TagGroup } from "@lenso/ui";
import { Description, Label } from "./text";
import { Categories, styles } from "./categories";
export function TagGroupWithPrefix() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TagGroup aria-label="With Icons" selectionMode="single">
        <Label>With Icons</Label>
        <TagGroup.List>
          <Categories icons />
        </TagGroup.List>
        <Description>Tags with icons</Description>
      </TagGroup>
      <TagGroup aria-label="With Avatars" selectionMode="single">
        <Label>With Avatars</Label>
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
        <Description>Tags with avatars</Description>
      </TagGroup>
    </div>
  );
}
