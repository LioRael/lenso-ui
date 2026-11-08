"use client";

import * as stylex from "@stylexjs/stylex";
import { descriptionStyles } from "@lenso/tokens/description";
import { labelStyles } from "@lenso/tokens/label";
import { Avatar, ListBox } from "@lenso/ui";

const users = [
  { key: "1", textValue: "Bob", color: "blue" },
  { key: "2", textValue: "Fred", color: "green" },
  { key: "3", textValue: "Martha", color: "purple" },
] as const;
const styles = stylex.create({
  root: { width: 220 },
  details: { display: "flex", flexDirection: "column" },
});

export function Default() {
  return (
    <ListBox aria-label="Users" xstyle={styles.root} selectionMode="single">
      {users.map((user) => (
        <ListBox.Item key={user.key} itemKey={user.key} textValue={user.textValue}>
          <Avatar size="sm">
            <Avatar.Image alt={user.textValue} src={`/assets/demo/avatars/${user.color}.svg`} />
            <Avatar.Fallback>{user.textValue[0]}</Avatar.Fallback>
          </Avatar>
          <div {...stylex.props(styles.details)}>
            <span {...stylex.props(labelStyles.label)}>{user.textValue}</span>
            <span {...stylex.props(descriptionStyles.description)}>
              {user.textValue.toLowerCase()}@example.com
            </span>
          </div>
          <ListBox.Item.Indicator />
        </ListBox.Item>
      ))}
    </ListBox>
  );
}
