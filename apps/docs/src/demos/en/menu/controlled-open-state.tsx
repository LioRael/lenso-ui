"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        Menu is: <strong>{open ? "open" : "closed"}</strong>
      </p>
      <Menu open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
          Actions
        </Menu.Trigger>
        <Popup>
          <ActionItem label="New file" />
          <ActionItem label="Open file" />
          <ActionItem label="Save file" />
          <ActionItem label="Delete file" variant="danger" />
        </Popup>
      </Menu>
    </div>
  );
}
