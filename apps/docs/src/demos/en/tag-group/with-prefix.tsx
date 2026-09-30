"use client";
// HeroUI v3.2.6 with-prefix adaptation (Apache-2.0).
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
                  src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${["blue", "green", "purple"][index]}.jpg`}
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
