// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-statuses (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
  popup: {
    maxWidth: 400,
  },
  accent: {
    backgroundColor: "var(--accent-soft)",
    color: "var(--accent-soft-foreground)",
  },
  success: {
    backgroundColor: "var(--success-soft)",
    color: "var(--success-soft-foreground)",
  },
  warning: {
    backgroundColor: "var(--warning-soft)",
    color: "var(--warning-soft-foreground)",
  },
  danger: {
    backgroundColor: "var(--danger-soft)",
    color: "var(--danger-soft-foreground)",
  },
});
export function Statuses() {
  const examples = [
    {
      status: "accent",
      trigger: "退出登录",
      header: "要退出当前账户吗？",
      body: "退出后需要重新登录才能访问账户，未保存的更改将丢失。",
      cancel: "保持登录",
      confirm: "退出登录",
    },
    {
      status: "success",
      trigger: "完成任务",
      header: "要完成此任务吗？",
      body: "将把该任务标记为完成并通知所有成员，任务会移入已完成列表。",
      cancel: "稍后再说",
      confirm: "标记完成",
    },
    {
      status: "warning",
      trigger: "放弃更改",
      header: "要放弃未保存的更改吗？",
      body: "你有未保存的更改，放弃后将永久丢失。确定要放弃吗？",
      cancel: "继续编辑",
      confirm: "放弃更改",
    },
    {
      status: "danger",
      trigger: "删除账户",
      header: "要删除账户吗？",
      body: "将永久删除你的账户并从服务器移除全部数据，此操作不可恢复。",
      cancel: "取消",
      confirm: "删除账户",
    },
  ] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {examples.map(({ status, trigger, header, body, cancel, confirm }) => (
        <AlertDialog key={status}>
          <AlertDialog.Trigger render={<Button xstyle={styles[status]} />}>
            {trigger}
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={styles.popup}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant={status} />
                  <AlertDialog.Title>{header}</AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>{body}</AlertDialog.Description>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <AlertDialog.Close render={<Button variant="tertiary" />}>
                    {cancel}
                  </AlertDialog.Close>
                  <AlertDialog.Close
                    render={<Button variant={status === "danger" ? "danger" : "primary"} />}
                  >
                    {confirm}
                  </AlertDialog.Close>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog>
      ))}
    </div>
  );
}
