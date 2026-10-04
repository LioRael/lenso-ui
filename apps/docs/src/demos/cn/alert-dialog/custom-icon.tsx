// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-custom-icon (Apache-2.0).
import { LockOpen } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  popup: {
    maxWidth: 400,
  },
  lock: {
    width: 20,
    height: 20,
  },
});
export function CustomIcon() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="secondary" />}>重置密码</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Icon variant="warning">
                <LockOpen {...stylex.props(styles.lock)} />
              </AlertDialog.Icon>
              <AlertDialog.Title>要重置密码吗？</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                我们会向你的邮箱发送重置链接。你需要设置新密码以恢复账户访问。
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>取消</AlertDialog.Close>
              <AlertDialog.Close render={<Button />}>发送重置链接</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
