// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-dismiss-behavior (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
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
    maxWidth: 360,
  },
  icon: {
    backgroundColor: "var(--default)",
    color: "var(--foreground)",
  },
  circle: {
    width: 20,
    height: 20,
  },
  action: {
    width: "100%",
  },
});
export function DismissBehavior() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["outside-press", "escape-key"] as const).map((blockedReason) => (
        <div key={blockedReason} {...stylex.props(styles.section)}>
          <h3 {...stylex.props(styles.heading)}>
            {blockedReason === "outside-press" ? "Backdrop dismissal" : "Keyboard dismissal"}
          </h3>
          <p {...stylex.props(styles.caption)}>
            {blockedReason === "outside-press"
              ? "This modal requires an explicit close action or ESC instead of a backdrop click."
              : "ESC is disabled. Use an explicit close action or click the backdrop."}
          </p>
          <Modal
            onOpenChange={(open, details) => {
              if (!open && details.reason === blockedReason) details.cancel();
            }}
          >
            <Modal.Trigger render={<Button variant="secondary" />}>打开模态框</Modal.Trigger>
            <Modal.Portal>
              <Modal.Backdrop />
              <Modal.Viewport>
                <Modal.Popup xstyle={styles.popup}>
                  <Modal.Close aria-label="Close dialog" />
                  <Modal.Header>
                    <Modal.Icon xstyle={styles.icon}>
                      <CircleInfo {...stylex.props(styles.circle)} />
                    </Modal.Icon>
                    <Modal.Title>
                      {blockedReason === "outside-press"
                        ? "Backdrop dismissal disabled"
                        : "Keyboard dismissal disabled"}
                    </Modal.Title>
                    <Modal.Description xstyle={styles.caption}>
                      {blockedReason === "outside-press"
                        ? "点击遮罩不会关闭此模态框"
                        : "已禁用 ESC 键"}
                    </Modal.Description>
                  </Modal.Header>
                  <Modal.Body>
                    <p>
                      {blockedReason === "outside-press"
                        ? "尝试点击遮罩区域——模态框不会关闭，必须使用关闭按钮或按 ESC 键关闭。"
                        : "按 ESC 无反应。必须使用关闭按钮或点击遮罩才能关闭此模态框。"}
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Modal.Close render={<Button xstyle={styles.action} />}>关闭</Modal.Close>
                  </Modal.Footer>
                </Modal.Popup>
              </Modal.Viewport>
            </Modal.Portal>
          </Modal>
        </div>
      ))}
    </div>
  );
}
