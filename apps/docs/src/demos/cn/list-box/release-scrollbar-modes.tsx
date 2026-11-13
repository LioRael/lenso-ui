"use client";

import * as stylex from "@stylexjs/stylex";
import { ListBox } from "@lenso/ui";
const animals = [
  "Aardvark",
  "Alpaca",
  "Antelope",
  "Bear",
  "Cat",
  "Dog",
  "Fox",
  "Giraffe",
  "Kangaroo",
  "Koala",
  "Lemur",
  "Otter",
  "Panda",
  "Penguin",
  "Rabbit",
  "Snake",
  "Turtle",
  "Wombat",
  "Zebra",
];
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  group: {
    display: "flex",
    width: 260,
    flexDirection: "column",
    gap: 8,
  },
  title: {
    paddingInline: 4,
    fontSize: 14,
    fontWeight: 600,
    color: "var(--lenso-label-secondary)",
  },
  surface: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: "var(--lenso-surface-shadow)",
  },
  viewport: {
    height: 208,
    overflowY: "auto",
    padding: 4,
  },
  thin: {
    scrollbarWidth: "thin",
  },
  hidden: {
    scrollbarWidth: "none",
  },
});
export function ScrollbarModes() {
  return (
    <div {...stylex.props(styles.root)}>
      {(["thin", "default", "none"] as const).map((mode, index) => (
        <div key={mode} {...stylex.props(styles.group)}>
          <h3 {...stylex.props(styles.title)}>{["Thin", "Browser default", "Hidden"][index]}</h3>
          <div data-scrollbar={mode} {...stylex.props(styles.surface)}>
            <div
              {...stylex.props(
                styles.viewport,
                mode === "thin" && styles.thin,
                mode === "none" && styles.hidden,
              )}
            >
              <ListBox aria-label={`${["纤细", "浏览器默认", "隐藏"][index]}动物列表`}>
                {animals.map((name) => (
                  <ListBox.Item key={name} value={`${mode}-${name.toLowerCase()}`} label={name}>
                    {name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
