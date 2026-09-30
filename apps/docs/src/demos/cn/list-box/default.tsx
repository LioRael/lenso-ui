// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 list-box-default (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { descriptionStyles } from "@lenso/tokens/description";
import { labelStyles } from "@lenso/tokens/label";
import { Avatar, ListBox, ListBoxItem } from "@lenso/ui";
const users = [
  {
    key: "1",
    textValue: "Bob",
    color: "blue",
  },
  {
    key: "2",
    textValue: "Fred",
    color: "green",
  },
  {
    key: "3",
    textValue: "Martha",
    color: "purple",
  },
] as const;
const styles = stylex.create({
  root: {
    width: 220,
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
});
export function Default() {
  return (
    <ListBox aria-label="用户" xstyle={styles.root} selectionMode="single">
      {users.map((user) => (
        <ListBoxItem key={user.key} itemKey={user.key} textValue={user.textValue}>
          <Avatar size="sm">
            <Avatar.Image
              alt={user.textValue}
              src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.color}.jpg`}
            />
            <Avatar.Fallback>{user.textValue[0]}</Avatar.Fallback>
          </Avatar>
          <div {...stylex.props(styles.details)}>
            <span {...stylex.props(labelStyles.label)}>{user.textValue}</span>
            <span {...stylex.props(descriptionStyles.description)}>
              {user.textValue.toLowerCase()}@heroui.com
            </span>
          </div>
          <ListBoxItem.Indicator />
        </ListBoxItem>
      ))}
    </ListBox>
  );
}
