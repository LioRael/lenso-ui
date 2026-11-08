"use client";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { SectionIndex, List } from "@lenso/ui";
const groups = [
  { label: "A", names: ["Apricot", "Artichoke", "Avocado"] },
  { label: "B", names: ["Banana", "Beetroot", "Blueberry"] },
  { label: "C", names: ["Cabbage", "Carrot", "Cherry"] },
  { label: "D", names: ["Date", "Dragon fruit"] },
];
const s = stylex.create({
  root: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 44px",
    gap: 8,
    height: 300,
    overflowY: "auto",
    position: "relative",
    overscrollBehaviorY: "contain",
  },
  index: { position: "sticky", top: 0, alignSelf: "start" },
  heading: { fontSize: 15, marginBlock: "16px 8px", scrollMarginBlockStart: 8 },
});
export interface SectionIndexStoryProps {
  disabled: boolean;
}
export function SectionIndexStory({ disabled }: SectionIndexStoryProps) {
  const id = useId();
  const [value, setValue] = useState("A");
  return (
    <div {...stylex.props(s.root)}>
      <div>
        {groups.map((group) => (
          <section key={group.label} aria-labelledby={`${id}-${group.label}`}>
            <h3 id={`${id}-${group.label}`} {...stylex.props(s.heading)}>
              {group.label}
            </h3>
            <List>
              {group.names.map((name) => (
                <List.Item key={name}>
                  <List.Content>
                    <List.Title>{name}</List.Title>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </section>
        ))}
      </div>
      <SectionIndex
        aria-label="Produce sections"
        items={groups.map((group) => ({
          value: group.label,
          label: group.label,
          href: `#${id}-${group.label}`,
        }))}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        xstyle={s.index}
      />
    </div>
  );
}
