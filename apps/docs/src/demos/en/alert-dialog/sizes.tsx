"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-sizes (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  icon: { backgroundColor: "var(--default)", color: "var(--foreground)" },
  rocket: { width: 20, height: 20 },
});

export function Sizes() {
  const sizes = ["xs", "sm", "md", "lg", "cover"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {sizes.map((size) => (
        <AlertDialog key={size}>
          <AlertDialog.Trigger render={<Button variant="secondary" />}>
            {size.charAt(0).toUpperCase() + size.slice(1)}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup size={size}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="default" xstyle={styles.icon}>
                    <Rocket {...stylex.props(styles.rocket)} />
                  </AlertDialog.Icon>
                  <AlertDialog.Title>
                    Size: {size.charAt(0).toUpperCase() + size.slice(1)}
                  </AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    {size === "cover" ? (
                      <>
                        This alert dialog uses the <code>cover</code> size variant. It spans the
                        full screen with margins: 16px on mobile and 40px on desktop. Maintains
                        rounded corners and standard padding. Perfect for critical confirmations
                        that need maximum width while preserving alert dialog aesthetics.
                      </>
                    ) : (
                      <>
                        This alert dialog uses the <code>{size}</code> size variant. On mobile
                        devices, all sizes adapt to near full-width for optimal viewing. On desktop,
                        each size provides a different maximum width to suit various content needs.
                      </>
                    )}
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
