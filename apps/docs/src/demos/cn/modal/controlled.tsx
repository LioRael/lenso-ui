// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-controlled (Apache-2.0).
// The second controller uses a reducer instead of the React Aria overlay-state hook.
import { CircleCheck } from "@gravity-ui/icons";
import { useReducer, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
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
    color: "var(--foreground)",
  },
  caption: {
    fontSize: 14,
    lineHeight: 1.625,
    textWrap: "pretty",
    color: "var(--muted)",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "var(--surface)",
    padding: 16,
    boxShadow: "var(--shadow-sm)",
  },
  status: {
    fontSize: 12,
    color: "var(--muted)",
  },
  value: {
    fontFamily: "monospace",
    fontWeight: 500,
    color: "var(--foreground)",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  popup: {
    maxWidth: 360,
  },
  accent: {
    backgroundColor: "var(--accent-soft)",
    color: "var(--accent-soft-foreground)",
  },
  success: {
    backgroundColor: "var(--success-soft)",
    color: "var(--success-soft-foreground)",
  },
  circle: {
    width: 20,
    height: 20,
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
                  Control the modal using React&apos;s <code>useState</code> hook for simple state
                  management. Perfect for basic use cases.
                </>
              )}
            </p>
            <div {...stylex.props(styles.panel)}>
              <p {...stylex.props(styles.status)}>
                状态：<span {...stylex.props(styles.value)}>{open ? "打开" : "关闭"}</span>
              </p>
              <div {...stylex.props(styles.actions)}>
                <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                  打开模态框
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => (reducer ? dispatch("toggle") : setIsOpen((value) => !value))}
                >
                  切换
                </Button>
              </div>
            </div>
            <Modal open={open} onOpenChange={setOpen}>
              <Modal.Portal>
                <Modal.Backdrop />
                <Modal.Viewport>
                  <Modal.Popup xstyle={styles.popup}>
                    <Modal.Close aria-label="Close dialog" />
                    <Modal.Header>
                      <Modal.Icon xstyle={reducer ? styles.success : styles.accent}>
                        <CircleCheck {...stylex.props(styles.circle)} />
                      </Modal.Icon>
                      <Modal.Title>
                        Controlled with {reducer ? "useReducer()" : "useState()"}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Modal.Description>
                        {reducer ? (
                          "The reducer handles open, close, and toggle actions while the native Root owns focus and dismissal."
                        ) : (
                          <>
                            This modal is controlled by React&apos;s <code>useState</code> hook.
                            Pass <code>打开</code> and <code>onOpenChange</code> props to manage the
                            modal state externally.
                          </>
                        )}
                      </Modal.Description>
                    </Modal.Body>
                    <Modal.Footer>
                      <Modal.Close render={<Button variant="secondary" />}>取消</Modal.Close>
                      <Modal.Close render={<Button />}>确认</Modal.Close>
                    </Modal.Footer>
                  </Modal.Popup>
                </Modal.Viewport>
              </Modal.Portal>
            </Modal>
          </div>
        );
      })}
    </div>
  );
}
