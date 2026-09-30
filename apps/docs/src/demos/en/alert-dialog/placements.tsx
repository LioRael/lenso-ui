"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-placements (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  popup: { maxWidth: 400 },
});

export function Placements() {
  const placements = ["auto", "top", "center", "bottom"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <AlertDialog key={placement}>
          <AlertDialog.Trigger render={<Button variant="secondary" />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup placement={placement} xstyle={styles.popup}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="accent" />
                  <AlertDialog.Title>
                    {placement === "auto"
                      ? "Auto Placement"
                      : `${placement.charAt(0).toUpperCase() + placement.slice(1)} Position`}
                  </AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    {placement === "auto"
                      ? "Automatically positions at the bottom on mobile and center on desktop for optimal user experience."
                      : `This dialog is positioned at the ${placement} of the viewport. Critical confirmations are typically centered for maximum attention.`}
                  </AlertDialog.Description>
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
      ))}
    </div>
  );
}
