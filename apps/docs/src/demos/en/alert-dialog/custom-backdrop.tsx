"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-custom-backdrop (Apache-2.0).
import { TriangleExclamation } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  backdrop: {
    backgroundColor: "transparent",
    backgroundImage: {
      default: "linear-gradient(to top, rgb(69 10 10 / 90%), rgb(69 10 10 / 50%), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to top, rgb(69 10 10 / 95%), rgb(69 10 10 / 60%), transparent)",
    },
  },
  popup: { maxWidth: 420 },
  header: { alignItems: "center", textAlign: "center" },
  glyph: { width: 20, height: 20 },
  footer: { flexDirection: "column-reverse" },
  action: { width: "100%" },
});

export function CustomBackdrop() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="danger" />}>Delete Account</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop variant="blur" xstyle={styles.backdrop} />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header xstyle={styles.header}>
              <AlertDialog.Icon variant="danger">
                <TriangleExclamation {...stylex.props(styles.glyph)} />
              </AlertDialog.Icon>
              <AlertDialog.Title>Permanently delete your account?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                This action cannot be undone. All your data, settings, and content will be
                permanently removed from our servers. The dramatic red backdrop emphasizes the
                severity and irreversibility of this decision.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer xstyle={styles.footer}>
              <AlertDialog.Close render={<Button xstyle={styles.action} />}>
                Keep Account
              </AlertDialog.Close>
              <AlertDialog.Close render={<Button variant="danger" xstyle={styles.action} />}>
                Delete Forever
              </AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
