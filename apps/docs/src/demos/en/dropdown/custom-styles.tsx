"use client";

// Adapted from HeroUI v3.2.6 custom-styles, Apache-2.0.
import { Button, Dropdown } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function CustomStyles() {
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button variant="secondary" />}>Actions</Dropdown.Trigger>
      <Popup xstyle={styles.customPopup}>
        <ActionItem label="Rename" xstyle={styles.customItem} />
        <ActionItem label="Duplicate" xstyle={styles.customItem} />
        <ActionItem label="Delete" variant="danger" xstyle={styles.customDangerItem} />
      </Popup>
    </Dropdown>
  );
}
