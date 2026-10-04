// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6 release-scrollbar-modes adaptation (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { ListBox, ListBoxItem } from "@lenso/ui";
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
    color: "var(--muted)",
  },
  surface: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    boxShadow: "var(--surface-shadow)",
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
          <h3 {...stylex.props(styles.title)}>
            {["HeroUI thin", "Browser default", "Hidden"][index]}
          </h3>
          <div data-scrollbar={mode} {...stylex.props(styles.surface)}>
            <div
              {...stylex.props(
                styles.viewport,
                mode === "thin" && styles.thin,
                mode === "none" && styles.hidden,
              )}
            >
              <ListBox
                aria-label={`${["HeroUI 纤细", "浏览器默认", "隐藏"][index]}动物列表`}
                selectionMode="single"
              >
                {animals.map((name) => (
                  <ListBoxItem
                    key={name}
                    itemKey={`${mode}-${name.toLowerCase()}`}
                    textValue={name}
                  >
                    {name}
                  </ListBoxItem>
                ))}
              </ListBox>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
