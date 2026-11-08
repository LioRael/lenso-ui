"use client";

import { useRef } from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 672,
    flexDirection: "column",
    gap: 32,
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
    color: "var(--lenso-label-secondary)",
  },
  popup: {
    maxWidth: 400,
  },
});
export function CloseMethods() {
  const actionsRef = useRef<BaseAlertDialog.Root.Actions | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using AlertDialog.Close</h3>
        <p {...stylex.props(styles.caption)}>
          Compose a Button with <code>AlertDialog.Close</code> to close the dialog automatically.
        </p>
        <AlertDialog>
          <AlertDialog.Trigger render={<Button />}>打开对话框</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={styles.popup}>
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="accent" />
                  <AlertDialog.Title>Using AlertDialog.Close</AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    Click either button below - both use <code>AlertDialog.Close</code>
                    ，点击后会自动关闭对话框。
                  </AlertDialog.Description>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <AlertDialog.Action variant="cancel">取消</AlertDialog.Action>
                  <AlertDialog.Action>确认</AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using Root actions</h3>
        <p {...stylex.props(styles.caption)}>
          Access the native <code>close</code> method through the Root&apos;s{" "}
          <code>actionsRef</code>. This gives you full control over when and how to close the
          dialog, allowing you to add custom logic before closing.
        </p>
        <AlertDialog actionsRef={actionsRef}>
          <AlertDialog.Trigger render={<Button />}>打开对话框</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={styles.popup}>
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="success" />
                  <AlertDialog.Title>Using Root actions</AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description>
                    下方按钮使用 render props 提供的<code>close</code> method from Root actions. You
                    can add validation or other logic before calling{" "}
                    <code>actionsRef.current.close()</code>之前加入校验或其他逻辑。
                  </AlertDialog.Description>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <GlassButton variant="default" onClick={() => actionsRef.current?.close()}>
                    取消
                  </GlassButton>
                  <Button onClick={() => actionsRef.current?.close()}>确认</Button>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog>
      </div>
    </div>
  );
}
