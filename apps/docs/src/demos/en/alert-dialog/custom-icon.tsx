"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-custom-icon (Apache-2.0).
import { LockOpen } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  popup: { maxWidth: 400 },
  lock: { width: 20, height: 20 },
});

export function CustomIcon() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="secondary" />}>
        Reset Password
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Icon variant="warning">
                <LockOpen {...stylex.props(styles.lock)} />
              </AlertDialog.Icon>
              <AlertDialog.Title>Reset your password?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                We&apos;ll send a password reset link to your email address. You&apos;ll need to
                create a new password to regain access to your account.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>Cancel</AlertDialog.Close>
              <AlertDialog.Close render={<Button />}>Send Reset Link</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
