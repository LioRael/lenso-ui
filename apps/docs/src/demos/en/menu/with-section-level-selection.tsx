"use client";

import { useState } from "react";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Checkmark, Dotmark, Popup, Shortcut, styles } from "./_shared";

export function WithSectionLevelSelection() {
  const [textStyles, setTextStyles] = useState(new Set(["bold", "italic"]));
  const [textAlignment, setTextAlignment] = useState("left");
  const [open, setOpen] = useState(false);
  return (
    <Menu open={open} onOpenChange={setOpen}>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Styles
      </Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.Group>
          <Menu.Group.Label>Actions</Menu.Group.Label>
          <ActionItem label="Cut" shortcut={<Shortcut letter="X" />} />
          <ActionItem label="Copy" shortcut={<Shortcut letter="C" />} />
          <ActionItem label="Paste" shortcut={<Shortcut letter="U" />} />
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Group.Label>Text Style</Menu.Group.Label>
          {(["bold", "italic", "underline"] as const).map((value) => (
            <Menu.CheckboxItem
              key={value}
              checked={textStyles.has(value)}
              aria-label={value.charAt(0).toUpperCase() + value.slice(1)}
              closeOnSelect={false}
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
              value={value}
            >
              <Menu.ItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                <Checkmark />
              </Menu.ItemIndicator>
              <Menu.Item.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</Menu.Item.Label>
              <Shortcut letter={value === "underline" ? "U" : value.charAt(0).toUpperCase()} />
            </Menu.CheckboxItem>
          ))}
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Group.Label>Text Alignment</Menu.Group.Label>
          <Menu.RadioGroup value={textAlignment} onValueChange={setTextAlignment}>
            {(["left", "center", "right"] as const).map((value) => (
              <Menu.RadioItem
                key={value}
                value={value}
                aria-label={value.charAt(0).toUpperCase() + value.slice(1)}
                closeOnSelect
              >
                <Menu.ItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                  <Dotmark />
                </Menu.ItemIndicator>
                <Menu.Item.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</Menu.Item.Label>
                <Shortcut
                  modifier="alt"
                  letter={value === "left" ? "A" : value === "center" ? "H" : "D"}
                />
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Group>
      </Popup>
    </Menu>
  );
}
