// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-placements (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const PLACEMENT_LABELS = {
  auto: "自动",
  bottom: "底部",
  center: "居中",
  top: "顶部",
};
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
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
  action: {
    width: "100%",
  },
});
export function Placements() {
  const placements = ["auto", "top", "center", "bottom"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <Modal key={placement}>
          <Modal.Trigger render={<Button variant="secondary" />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop />
            <Modal.Viewport>
              <Modal.Popup placement={placement} xstyle={styles.popup}>
                <Modal.Close aria-label="Close dialog" />
                <Modal.Header>
                  <Modal.Icon xstyle={styles.icon}>
                    <Rocket {...stylex.props(styles.rocket)} />
                  </Modal.Icon>
                  <Modal.Title>
                    Placement: {placement.charAt(0).toUpperCase() + placement.slice(1)}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description>
                    This modal uses the <code>{PLACEMENT_LABELS[placement]}</code> placement option.
                    Try different placements to see how the modal positions itself on the screen.
                  </Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button xstyle={styles.action} />}>继续</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      ))}
    </div>
  );
}
