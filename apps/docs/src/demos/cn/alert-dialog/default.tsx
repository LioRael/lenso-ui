// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-default (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  popup: {
    maxWidth: 400,
  },
});
export function Default() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="danger" />}>删除项目</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Title>要永久删除项目吗？</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                此操作将永久删除<strong>我的精彩项目</strong>及其全部数据，且无法撤销。
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>取消</AlertDialog.Close>
              <AlertDialog.Close render={<Button variant="danger" />}>删除项目</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
