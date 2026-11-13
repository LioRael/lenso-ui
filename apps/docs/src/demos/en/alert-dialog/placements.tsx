"use client";
import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";

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
          <AlertDialog.Trigger render={<Button />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content placement={placement} xstyle={styles.popup}>
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
                  ? "Centers the alert on mobile and desktop."
                  : `This dialog is positioned at the ${placement} of the viewport. Critical confirmations are typically centered for maximum attention.`}
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
              <AlertDialog.Action>Confirm</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      ))}
    </div>
  );
}
