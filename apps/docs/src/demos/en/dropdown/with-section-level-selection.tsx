"use client";

// Adapted from HeroUI v3.2.6 with-section-level-selection, Apache-2.0.
import { useState } from "react";
import { Button, Dropdown, MenuItem } from "@lenso/ui";
import { ActionItem, Checkmark, Dotmark, Popup, Shortcut, styles } from "./_shared";

export function WithSectionLevelSelection() {
  const [textStyles, setTextStyles] = useState(new Set(["bold", "italic"]));
  const [textAlignment, setTextAlignment] = useState("left");
  const [open, setOpen] = useState(false);
  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Styles
      </Dropdown.Trigger>
      <Popup xstyle={styles.wide}>
        <Dropdown.Section>
          <Dropdown.Section.Label>Actions</Dropdown.Section.Label>
          <ActionItem label="Cut" shortcut={<Shortcut letter="X" />} />
          <ActionItem label="Copy" shortcut={<Shortcut letter="C" />} />
          <ActionItem label="Paste" shortcut={<Shortcut letter="U" />} />
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.Section.Label>Text Style</Dropdown.Section.Label>
          {(["bold", "italic", "underline"] as const).map((value) => (
            <Dropdown.CheckboxItem
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
              <Dropdown.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                <Checkmark />
              </Dropdown.CheckboxItemIndicator>
              <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
              <Shortcut letter={value === "underline" ? "U" : value.charAt(0).toUpperCase()} />
            </Dropdown.CheckboxItem>
          ))}
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.Section.Label>Text Alignment</Dropdown.Section.Label>
          <Dropdown.RadioGroup value={textAlignment} onValueChange={setTextAlignment}>
            {(["left", "center", "right"] as const).map((value) => (
              <Dropdown.RadioItem
                key={value}
                value={value}
                aria-label={value.charAt(0).toUpperCase() + value.slice(1)}
                closeOnClick
              >
                <Dropdown.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                  <Dotmark />
                </Dropdown.RadioItemIndicator>
                <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
                <Shortcut
                  modifier="alt"
                  letter={value === "left" ? "A" : value === "center" ? "H" : "D"}
                />
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Section>
      </Popup>
    </Dropdown>
  );
}
