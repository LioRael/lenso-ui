// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 virtualization adaptation (Apache-2.0); native fixed-row window.
import * as stylex from "@stylexjs/stylex";
import { ListBox, ListBoxItem } from "@lenso/ui";
import { Description, Label } from "../../en/list-box/text";
const first = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "James",
  "Sophia",
  "Oliver",
  "Isabella",
  "Lucas",
  "Mia",
  "Ethan",
  "Charlotte",
  "Mason",
  "Amelia",
  "Logan",
  "Harper",
  "Alexander",
  "Ella",
  "Benjamin",
];
const last = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
];
const users = Array.from(
  {
    length: 1000,
  },
  (_, index) => ({
    key: index + 1,
    textValue: `${first[index % 20]} ${last[Math.floor(index / 20) % 20]}`,
    email: `${first[index % 20]!.toLowerCase()}.${last[Math.floor(index / 20) % 20]!.toLowerCase()}@acme.com`,
  }),
);
const styles = stylex.create({
  list: {
    width: 300,
  },
  detail: {
    display: "flex",
    flexDirection: "column",
  },
});
export function Virtualization() {
  return (
    <ListBox
      aria-label="包含 1000 项的虚拟化列表"
      xstyle={styles.list}
      items={users}
      virtualized={{
        rowHeight: 50,
        height: 400,
      }}
    >
      {(item) => (
        <ListBoxItem itemKey={item.key} textValue={item.textValue}>
          <div {...stylex.props(styles.detail)}>
            <Label>{item.textValue}</Label>
            <Description>{users[Number(item.key) - 1]!.email}</Description>
          </div>
          <ListBoxItem.Indicator />
        </ListBoxItem>
      )}
    </ListBox>
  );
}
