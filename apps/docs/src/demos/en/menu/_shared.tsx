"use client";

import type { ComponentProps, ReactNode } from "react";
import { cloneElement, isValidElement, useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu, Kbd } from "@lenso/ui";

export const styles = stylex.create({
  controlled: {
    display: "flex",
    minWidth: 384,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  status: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  wide: { minWidth: 256 },
  disabledWidth: { minWidth: 220 },
  icon: { width: 16, height: 16, flexShrink: 0, color: "var(--lenso-label-secondary)" },
  dangerIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
    color: "var(--lenso-status-error-indicator)",
  },
  smallIcon: { width: 14, height: 14, color: "var(--lenso-label-secondary)" },
  smallDangerIcon: { width: 14, height: 14, color: "var(--lenso-status-error-indicator)" },
  iconWrap: {
    display: "flex",
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 1,
  },
  text: { display: "flex", flexDirection: "column" },
  shortcut: { marginInlineStart: "auto" },
  customPopup: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 4,
    boxShadow: "var(--lenso-surface-shadow)",
  },
  customItem: {
    borderRadius: 8,
    "--lenso-menu-highlight": "var(--lenso-control-fill)",
  },
  customDangerItem: {
    borderRadius: 8,
    "--lenso-menu-highlight": "var(--lenso-control-status-error-soft-fill)",
  },
  round: { borderRadius: 9999 },
  profile: { paddingInline: 12, paddingTop: 12, paddingBottom: 4 },
  profileRow: { display: "flex", alignItems: "center", gap: 8 },
  profileName: { fontSize: 14, lineHeight: "20px", fontWeight: 500 },
  profileEmail: { fontSize: 12, lineHeight: 1, color: "var(--lenso-label-secondary)" },
  itemRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  accent: { color: "var(--lenso-tint-text)" },
  selectionIndicator: { visibility: { default: "visible", ":is([data-unchecked])": "hidden" } },
  dot: { width: 6, height: 6, borderRadius: 9999, backgroundColor: "currentColor" },
});

export function Popup({ children, ...props }: ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup {...props}>{children}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function Shortcut({
  id,
  letter,
  modifier = "command",
  shift = false,
}: {
  id?: string;
  letter: string;
  modifier?: "command" | "alt";
  shift?: boolean;
}) {
  return (
    <Kbd id={id} xstyle={styles.shortcut} variant="light">
      <Kbd.Abbr keyValue={modifier} />
      {shift && <Kbd.Abbr keyValue="shift" />}
      <Kbd.Content>{letter}</Kbd.Content>
    </Kbd>
  );
}

export function ActionItem({
  label,
  description,
  icon,
  shortcut,
  navigationLabel,
  ...props
}: ComponentProps<typeof Menu.Item> & {
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: ReactNode;
  navigationLabel?: string;
}) {
  const descriptionId = useId();
  const shortcutId = useId();
  const keyboard = isValidElement<{ id?: string }>(shortcut)
    ? cloneElement(shortcut, { id: shortcutId })
    : shortcut;
  return (
    <Menu.Item
      label={navigationLabel ?? label}
      aria-label={label}
      aria-describedby={
        [description && descriptionId, shortcut && shortcutId].filter(Boolean).join(" ") ||
        undefined
      }
      {...props}
    >
      {icon && <Menu.Item.Icon>{icon}</Menu.Item.Icon>}
      {description ? (
        <Menu.Item.Content>
          <Menu.Item.Label>{label}</Menu.Item.Label>
          <Menu.Item.Description id={descriptionId}>{description}</Menu.Item.Description>
        </Menu.Item.Content>
      ) : (
        <Menu.Item.Label>{label}</Menu.Item.Label>
      )}
      {keyboard}
    </Menu.Item>
  );
}

export function Checkmark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 18"
      fill="none"
      aria-hidden="true"
      role="presentation"
      stroke="currentColor"
      strokeDasharray={22}
      strokeDashoffset={44}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <polyline points="1 9 7 14 15 4" />
    </svg>
  );
}

export function Dotmark() {
  return (
    <svg
      {...stylex.props(styles.dot)}
      aria-hidden="true"
      role="presentation"
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path clipRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14" fillRule="evenodd" />
    </svg>
  );
}
