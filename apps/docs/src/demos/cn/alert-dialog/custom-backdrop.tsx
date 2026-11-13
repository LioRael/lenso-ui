"use client";

import { TriangleExclamation } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  backdrop: {
    backgroundColor: "transparent",
    backgroundImage: {
      default:
        "linear-gradient(to top, color-mix(in srgb, var(--lenso-status-error-fill) 90%, transparent), color-mix(in srgb, var(--lenso-status-error-fill) 50%, transparent), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to top, color-mix(in srgb, var(--lenso-status-error-fill) 95%, transparent), color-mix(in srgb, var(--lenso-status-error-fill) 60%, transparent), transparent)",
    },
  },
  popup: {
    maxWidth: 420,
  },
  header: {
    alignItems: "center",
    textAlign: "center",
  },
  glyph: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: "column-reverse",
  },
  action: {
    width: "100%",
  },
});
export function CustomBackdrop() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button destructive variant="prominent" />}>
        删除账户
      </AlertDialog.Trigger>
      <AlertDialog.Backdrop variant="blur" xstyle={styles.backdrop} />
      <AlertDialog.Content xstyle={styles.popup}>
        <AlertDialog.Close aria-label="Close dialog" />
        <AlertDialog.Header xstyle={styles.header}>
          <AlertDialog.Icon variant="danger">
            <TriangleExclamation {...stylex.props(styles.glyph)} />
          </AlertDialog.Icon>
          <AlertDialog.Title>要永久删除账户吗？</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <AlertDialog.Description>
            此操作无法撤销。你的数据、设置与内容将从服务器永久清除。醒目的红色背景用于强调该决定的严重性与不可逆性。
          </AlertDialog.Description>
        </AlertDialog.Body>
        <AlertDialog.Footer xstyle={styles.footer}>
          <AlertDialog.Close render={<Button xstyle={styles.action} />}>保留账户</AlertDialog.Close>
          <AlertDialog.Close
            render={<Button destructive variant="prominent" xstyle={styles.action} />}
          >
            永久删除
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
