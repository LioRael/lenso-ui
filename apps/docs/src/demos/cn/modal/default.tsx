// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-default (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const styles = stylex.create({
  popup: {
    maxWidth: 360,
  },
  icon: {
    backgroundColor: "var(--default)",
    color: "var(--foreground)",
  },
  rocket: {
    width: 20,
    height: 20,
  },
  continue: {
    width: "100%",
  },
});
export function Default() {
  return (
    <Modal>
      <Modal.Trigger render={<Button variant="secondary" />}>打开模态框</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Rocket {...stylex.props(styles.rocket)} />
              </Modal.Icon>
              <Modal.Title>欢迎使用 HeroUI</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                一套美观、快速、现代的 React UI 库，可轻松构建无障碍且高度可定制的 Web 应用。
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button xstyle={styles.continue} />}>继续</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
