"use client";
import { TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog } from "@lenso/ui";

const styles = stylex.create({
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: {
      default: "var(--lenso-background-grouped-secondary)",
      ":hover": "var(--lenso-background-secondary)",
    },
    padding: 16,
    boxShadow: "var(--lenso-surface-shadow)",
    userSelect: "none",
  },
  iconBox: {
    display: "flex",
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "var(--lenso-control-status-error-soft-fill)",
    color: "var(--lenso-status-error-text)",
  },
  copy: { display: "flex", flex: 1, flexDirection: "column", gap: 2, textAlign: "start" },
  heading: { fontSize: 14, fontWeight: 600 },
  caption: { fontSize: 12, color: "var(--lenso-label-secondary)" },
  popup: { maxWidth: 400 },
  largeGlyph: { width: 24, height: 24 },
  glyph: { width: 20, height: 20 },
});

export function CustomTrigger() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger xstyle={styles.trigger}>
        <div {...stylex.props(styles.iconBox)}>
          <TrashBin {...stylex.props(styles.largeGlyph)} />
        </div>
        <div {...stylex.props(styles.copy)}>
          <p {...stylex.props(styles.heading)}>Delete Item</p>
          <p {...stylex.props(styles.caption)}>Permanently remove this item</p>
        </div>
      </AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Content xstyle={styles.popup}>
        <AlertDialog.Close aria-label="Close dialog" />
        <AlertDialog.Header>
          <AlertDialog.Icon variant="danger">
            <TrashBin {...stylex.props(styles.glyph)} />
          </AlertDialog.Icon>
          <AlertDialog.Title>Delete this item?</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <AlertDialog.Description>
            Use <code>AlertDialog.Trigger</code>to create custom trigger elements beyond standard
            buttons. This example shows a card-style trigger with icons and descriptive text.
          </AlertDialog.Description>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
          <AlertDialog.Action variant="destructive">Delete Item</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
