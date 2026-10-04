// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-custom-trigger (Apache-2.0).
import { TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: {
      default: "var(--surface)",
      ":hover": "var(--surface-secondary)",
    },
    padding: 16,
    boxShadow: "var(--shadow-xs)",
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
    backgroundColor: "var(--danger-soft)",
    color: "var(--danger-soft-foreground)",
  },
  copy: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: 2,
    textAlign: "start",
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
  },
  caption: {
    fontSize: 12,
    color: "var(--muted)",
  },
  popup: {
    maxWidth: 400,
  },
  largeGlyph: {
    width: 24,
    height: 24,
  },
  glyph: {
    width: 20,
    height: 20,
  },
});
export function CustomTrigger() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger xstyle={styles.trigger}>
        <div {...stylex.props(styles.iconBox)}>
          <TrashBin {...stylex.props(styles.largeGlyph)} />
        </div>
        <div {...stylex.props(styles.copy)}>
          <p {...stylex.props(styles.heading)}>删除条目</p>
          <p {...stylex.props(styles.caption)}>永久移除此条目</p>
        </div>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Icon variant="danger">
                <TrashBin {...stylex.props(styles.glyph)} />
              </AlertDialog.Icon>
              <AlertDialog.Title>要删除此条目吗？</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                Use <code>AlertDialog.Trigger</code> to create custom trigger elements beyond
                standard buttons. This example shows a card-style trigger with icons and descriptive
                text.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>取消</AlertDialog.Close>
              <AlertDialog.Close render={<Button variant="danger" />}>删除条目</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
