"use client";
import { LockOpen } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";

const styles = stylex.create({
  popup: { maxWidth: 400 },
  lock: { width: 20, height: 20 },
});

export function CustomIcon() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button />}>Reset Password</AlertDialog.Trigger>
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
              <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
              <AlertDialog.Action variant="cancel">Send Reset Link</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
