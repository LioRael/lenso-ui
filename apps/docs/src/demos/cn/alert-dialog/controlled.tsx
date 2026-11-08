"use client";

// The second controller uses a reducer instead of the React Aria overlay-state hook.
import { useReducer, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, AlertDialog } from "@lenso/ui";
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    gap: 32,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: 600,
    color: "var(--lenso-label-primary)",
  },
  caption: {
    fontSize: 14,
    lineHeight: 1.625,
    textWrap: "pretty",
    color: "var(--lenso-label-secondary)",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 16,
    boxShadow: "var(--lenso-surface-shadow)",
  },
  status: {
    fontSize: 12,
    color: "var(--lenso-label-secondary)",
  },
  value: {
    fontFamily: "monospace",
    fontWeight: 500,
    color: "var(--lenso-label-primary)",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  popup: {
    maxWidth: 400,
  },
});
export function Controlled() {
  const [isOpen, setIsOpen] = useState(false);
  const [reducerOpen, dispatch] = useReducer(
    (open: boolean, action: "open" | "close" | "toggle") =>
      action === "toggle" ? !open : action === "open",
    false,
  );
  return (
    <div {...stylex.props(styles.column)}>
      {([false, true] as const).map((reducer) => {
        const open = reducer ? reducerOpen : isOpen;
        const setOpen = (value: boolean) =>
          reducer ? dispatch(value ? "open" : "close") : setIsOpen(value);
        return (
          <div key={String(reducer)} {...stylex.props(styles.section)}>
            <h3 {...stylex.props(styles.heading)}>
              {reducer ? "With useReducer()" : "配合 React.useState()"}
            </h3>
            <p {...stylex.props(styles.caption)}>
              {reducer ? (
                "Use a reducer to manage open, close, and toggle actions."
              ) : (
                <>
                  使用 React 的<code>useState</code>管理对话框开关，适合简单场景。
                </>
              )}
            </p>
            <div {...stylex.props(styles.panel)}>
              <p {...stylex.props(styles.status)}>
                状态：<span {...stylex.props(styles.value)}>{open ? "打开" : "关闭"}</span>
              </p>
              <div {...stylex.props(styles.actions)}>
                <Button size="sm" onClick={() => setOpen(true)}>
                  打开对话框
                </Button>
                <Button
                  size="sm"
                  onClick={() => (reducer ? dispatch("toggle") : setIsOpen((value) => !value))}
                >
                  切换
                </Button>
              </div>
            </div>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialog.Portal>
                <AlertDialog.Backdrop />
                <AlertDialog.Viewport>
                  <AlertDialog.Popup xstyle={styles.popup}>
                    <AlertDialog.Close aria-label="Close dialog" />
                    <AlertDialog.Header>
                      <AlertDialog.Icon variant={reducer ? "success" : "accent"} />
                      <AlertDialog.Title>
                        Controlled with {reducer ? "useReducer()" : "useState()"}
                      </AlertDialog.Title>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <AlertDialog.Description>
                        {reducer ? (
                          "The reducer handles open, close, and toggle actions while the native Root owns focus and dismissal."
                        ) : (
                          <>
                            This alert dialog is controlled by React&apos;s <code>useState</code>{" "}
                            hook. Pass <code>打开</code> and <code>onOpenChange</code> props to
                            manage the dialog state externally.
                          </>
                        )}
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
        );
      })}
    </div>
  );
}
