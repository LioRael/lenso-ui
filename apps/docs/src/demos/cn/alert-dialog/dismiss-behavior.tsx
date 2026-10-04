// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-dismiss-behavior (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 384,
    flexDirection: "column",
    gap: 24,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: 600,
  },
  caption: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--muted)",
  },
  popup: {
    maxWidth: 400,
  },
  circle: {
    width: 20,
    height: 20,
  },
});
export function DismissBehavior() {
  return (
    <div {...stylex.props(styles.column)}>
      {([false, true] as const).map((blockEscape) => (
        <div key={String(blockEscape)} {...stylex.props(styles.section)}>
          <h3 {...stylex.props(styles.heading)}>
            {blockEscape ? "Keyboard dismissal" : "Backdrop dismissal"}
          </h3>
          <p {...stylex.props(styles.caption)}>
            {blockEscape
              ? "ESC is disabled for this critical confirmation. Use the action buttons to dismiss it."
              : "Alert dialogs require explicit action. Backdrop clicks do not dismiss the dialog."}
          </p>
          <AlertDialog
            onOpenChange={(open, details) => {
              if (!open && blockEscape && details.reason === "escape-key") details.cancel();
            }}
          >
            <AlertDialog.Trigger render={<Button variant="secondary" />}>
              打开警告对话框
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Backdrop />
              <AlertDialog.Viewport>
                <AlertDialog.Popup xstyle={styles.popup}>
                  <AlertDialog.Close aria-label="Close dialog" />
                  <AlertDialog.Header>
                    <AlertDialog.Icon variant={blockEscape ? "accent" : "danger"}>
                      <CircleInfo {...stylex.props(styles.circle)} />
                    </AlertDialog.Icon>
                    <AlertDialog.Title>
                      {blockEscape ? "Keyboard dismissal disabled" : "Backdrop dismissal disabled"}
                    </AlertDialog.Title>
                    <AlertDialog.Description xstyle={styles.caption}>
                      {blockEscape ? "已禁用 ESC 关闭" : "点击遮罩不会关闭此对话框"}
                    </AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p>
                      {blockEscape
                        ? "按下 ESC 不会有任何反应，必须通过操作按钮关闭此对话框。"
                        : "尝试点击遮罩区域——对话框不会关闭，必须通过底部操作按钮关闭。"}
                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <AlertDialog.Close render={<Button variant="tertiary" />}>
                      取消
                    </AlertDialog.Close>
                    <AlertDialog.Close render={<Button />}>确认</AlertDialog.Close>
                  </AlertDialog.Footer>
                </AlertDialog.Popup>
              </AlertDialog.Viewport>
            </AlertDialog.Portal>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
