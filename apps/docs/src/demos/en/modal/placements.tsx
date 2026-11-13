"use client";
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  popup: { maxWidth: 360 },
  icon: { backgroundColor: "var(--lenso-control-fill)", color: "var(--lenso-label-primary)" },
  rocket: { width: 20, height: 20 },
  action: { width: "100%" },
});

export function Placements() {
  const placements = ["auto", "top", "center", "bottom"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <Modal key={placement}>
          <Modal.Trigger render={<Button />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content placement={placement} xstyle={styles.popup}>
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
                This modal uses the <code>{placement}</code>placement option. Try different
                placements to see how the modal positions itself on the screen.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button xstyle={styles.action} />}>Continue</Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      ))}
    </div>
  );
}
