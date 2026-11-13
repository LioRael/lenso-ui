"use client";

// native fixed-row window.
import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ListBox } from "@lenso/ui";
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
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  const indices = Array.from({ length: Math.min(14, users.length - start) }, (_, i) => start + i);
  if (focused !== null && !indices.includes(focused)) indices.push(focused);
  return (
    <ListBox<number>
      ref={ref}
      aria-label="Virtualized list with 1000 items"
      xstyle={styles.list}
      style={{ height: 400, overflowY: "auto" }}
      items={users.map((item) => ({ value: item.key, label: item.textValue }))}
      onScroll={(event) =>
        setStart(Math.max(0, Math.floor(event.currentTarget.scrollTop / 50) - 3))
      }
      onHighlight={(_, { index }) => {
        setFocused(index);
        if (!ref.current) return;
        const top = index * 50;
        if (top < ref.current.scrollTop) ref.current.scrollTop = top;
        else if (top + 50 > ref.current.scrollTop + 400) ref.current.scrollTop = top - 350;
        setStart(Math.max(0, Math.floor(ref.current.scrollTop / 50) - 3));
      }}
    >
      <div style={{ height: users.length * 50, position: "relative" }}>
        {indices
          .sort((a, b) => a - b)
          .map((index) => {
            const item = users[index]!;
            return (
              <ListBox.Item
                key={item.key}
                value={item.key}
                label={item.textValue}
                index={index}
                style={{ position: "absolute", top: index * 50, height: 50, width: "100%" }}
              >
                <div {...stylex.props(styles.detail)}>
                  <Label>{item.textValue}</Label>
                  <Description>{item.email}</Description>
                </div>
                <ListBox.Item.Indicator />
              </ListBox.Item>
            );
          })}
      </div>
    </ListBox>
  );
}
