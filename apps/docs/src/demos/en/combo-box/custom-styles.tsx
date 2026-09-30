"use client";
// HeroUI v3.2.6, Apache-2.0. Native highlighted/selected states replace RAC selectors.
import { ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { styles } from "./styles.stylex";
import { useFocusMenu } from "./shared";
const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];
export function CustomStyles() {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.customField)}>
      <ComboBox {...menu.root} items={frameworks}>
        <ComboBox.Label htmlFor={id} xstyle={styles.customLabel}>
          Framework
        </ComboBox.Label>
        <ComboBox.InputGroup xstyle={styles.customGroup}>
          <ComboBox.Input {...menu.input} id={id} placeholder="Search..." />
          <ComboBox.Trigger aria-label="Show frameworks" xstyle={styles.muted}>
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover xstyle={styles.customPopover}>
              <ComboBox.List>
                {(item: (typeof frameworks)[number]) => (
                  <ComboBox.Item key={item.value} value={item} xstyle={styles.customItem}>
                    {item.label}
                    <ComboBox.ItemIndicator />
                  </ComboBox.Item>
                )}
              </ComboBox.List>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
