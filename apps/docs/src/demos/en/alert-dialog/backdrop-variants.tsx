"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-backdrop-variants (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  popup: { maxWidth: 400 },
});

export function BackdropVariants() {
  const variants = ["opaque", "blur", "transparent"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {variants.map((variant) => (
        <AlertDialog key={variant}>
          <AlertDialog.Trigger render={<Button variant="secondary" />}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop variant={variant} />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={styles.popup}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="accent" />
                  <AlertDialog.Title>
                    Backdrop: {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    {variant === "opaque"
                      ? "An opaque dark backdrop that completely obscures the background, providing maximum focus on the dialog."
                      : variant === "blur"
                        ? "A blurred backdrop that softly obscures the background while maintaining visual context."
                        : "A transparent backdrop that keeps the background fully visible, useful for less critical confirmations."}
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
