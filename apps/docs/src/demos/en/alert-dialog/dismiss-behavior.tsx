"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-dismiss-behavior (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", maxWidth: 384, flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  heading: { fontSize: 18, fontWeight: 600 },
  caption: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  popup: { maxWidth: 400 },
  circle: { width: 20, height: 20 },
});

export function DismissBehavior() {
  return (
    <div {...stylex.props(styles.column)}>
      {([false, true] as const).map((blockEscape) => (
        <div key={String(blockEscape)} {...stylex.props(styles.section)}>
          <h3 {...stylex.props(styles.heading)}>
            {blockEscape ? "Keyboard dismissal" : "Backdrop dismissal"}
          </h3>
          <p {...stylex.props(styles.caption)}>
            {blockEscape
              ? "ESC is disabled for this critical confirmation. Use the action buttons to dismiss it."
              : "Alert dialogs require explicit action. Backdrop clicks do not dismiss the dialog."}
          </p>
          <AlertDialog
            onOpenChange={(open, details) => {
              if (!open && blockEscape && details.reason === "escape-key") details.cancel();
            }}
          >
            <AlertDialog.Trigger render={<Button variant="secondary" />}>
              Open Alert Dialog
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Backdrop />
              <AlertDialog.Viewport>
                <AlertDialog.Popup xstyle={styles.popup}>
                  <AlertDialog.Close aria-label="Close dialog" />
                  <AlertDialog.Header>
                    <AlertDialog.Icon variant={blockEscape ? "accent" : "danger"}>
                      <CircleInfo {...stylex.props(styles.circle)} />
                    </AlertDialog.Icon>
                    <AlertDialog.Title>
                      {blockEscape ? "Keyboard dismissal disabled" : "Backdrop dismissal disabled"}
                    </AlertDialog.Title>
                    <AlertDialog.Description xstyle={styles.caption}>
                      {blockEscape
                        ? "ESC key is disabled"
                        : "Clicking the backdrop won't close this alert dialog"}
                    </AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p>
                      {blockEscape
                        ? "Press ESC - nothing happens. You must use the action buttons to dismiss this alert dialog."
                        : "Try clicking outside this alert dialog on the overlay - it won't close. You must use the action buttons to dismiss it."}
                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <AlertDialog.Close render={<Button variant="tertiary" />}>
                      Cancel
                    </AlertDialog.Close>
                    <AlertDialog.Close render={<Button />}>Confirm</AlertDialog.Close>
                  </AlertDialog.Footer>
                </AlertDialog.Popup>
              </AlertDialog.Viewport>
            </AlertDialog.Portal>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
