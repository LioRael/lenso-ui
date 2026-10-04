"use client";

// Adapted from HeroUI v3.2.6 with-section-level-selection, Apache-2.0.
import { useState } from "react";
import { Button, Menu, MenuItem } from "@lenso/ui";
import { ActionItem, Checkmark, Dotmark, Popup, Shortcut, styles } from "./_shared";

export function WithSectionLevelSelection() {
  const [textStyles, setTextStyles] = useState(new Set(["bold", "italic"]));
  const [textAlignment, setTextAlignment] = useState("left");
  const [open, setOpen] = useState(false);
  return (
    <Menu open={open} onOpenChange={setOpen}>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Styles</Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.Section>
          <Menu.Section.Label>Actions</Menu.Section.Label>
          <ActionItem label="Cut" shortcut={<Shortcut letter="X" />} />
          <ActionItem label="Copy" shortcut={<Shortcut letter="C" />} />
          <ActionItem label="Paste" shortcut={<Shortcut letter="U" />} />
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <Menu.Section.Label>Text Style</Menu.Section.Label>
          {(["bold", "italic", "underline"] as const).map((value) => (
            <Menu.CheckboxItem
              key={value}
              checked={textStyles.has(value)}
              aria-label={value.charAt(0).toUpperCase() + value.slice(1)}
              closeOnClick={false}
              onKeyDown={(event) => {
                if (event.key === "Enter") setOpen(false);
              }}
              onCheckedChange={(checked) =>
                setTextStyles((previous) => {
                  const next = new Set(previous);
                  if (checked) next.add(value);
                  else next.delete(value);
                  return next;
                })
              }
            >
              <Menu.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                <Checkmark />
              </Menu.CheckboxItemIndicator>
              <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
              <Shortcut letter={value === "underline" ? "U" : value.charAt(0).toUpperCase()} />
            </Menu.CheckboxItem>
          ))}
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <Menu.Section.Label>Text Alignment</Menu.Section.Label>
          <Menu.RadioGroup value={textAlignment} onValueChange={setTextAlignment}>
            {(["left", "center", "right"] as const).map((value) => (
              <Menu.RadioItem
                key={value}
                value={value}
                aria-label={value.charAt(0).toUpperCase() + value.slice(1)}
                closeOnClick
              >
                <Menu.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                  <Dotmark />
                </Menu.RadioItemIndicator>
                <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
                <Shortcut
                  modifier="alt"
                  letter={value === "left" ? "A" : value === "center" ? "H" : "D"}
                />
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Section>
      </Popup>
    </Menu>
  );
}
