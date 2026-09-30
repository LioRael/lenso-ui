"use client";

// Adapted from HeroUI v3.2.6 controlled-open-state, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Dropdown } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        Dropdown is: <strong>{open ? "open" : "closed"}</strong>
      </p>
      <Dropdown open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
          Actions
        </Dropdown.Trigger>
        <Popup>
          <ActionItem label="New file" />
          <ActionItem label="Open file" />
          <ActionItem label="Save file" />
          <ActionItem label="Delete file" variant="danger" />
        </Popup>
      </Dropdown>
    </div>
  );
}
