"use client";

import { LockOpen } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";
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
      <AlertDialog.Trigger render={<Button />}>重置密码</AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Content xstyle={styles.popup}>
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
          <AlertDialog.Action variant="cancel">取消</AlertDialog.Action>
          <AlertDialog.Action variant="cancel">发送重置链接</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
