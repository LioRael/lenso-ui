"use client";
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  icon: { backgroundColor: "var(--lenso-control-fill)", color: "var(--lenso-label-primary)" },
  rocket: { width: 20, height: 20 },
  action: { width: "100%" },
});

export function Sizes() {
  const sizes = ["xs", "sm", "md", "lg", "cover", "full"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {sizes.map((size) => (
        <Modal key={size}>
          <Modal.Trigger render={<Button />}>
            {size.charAt(0).toUpperCase() + size.slice(1)}
          </Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content size={size}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Rocket {...stylex.props(styles.rocket)} />
              </Modal.Icon>
              <Modal.Title>Size: {size.charAt(0).toUpperCase() + size.slice(1)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                {size === "cover" ? (
                  <>
                    This modal uses the <code>cover</code> size variant. It spans the full screen
                    with margins: 16px on mobile and 40px on desktop. Maintains rounded corners and
                    standard padding. Perfect for cover-style content that needs maximum width while
                    preserving modal aesthetics.
                  </>
                ) : size === "full" ? (
                  <>
                    This modal uses the <code>full</code> size variant. It occupies the entire
                    viewport without any margins, rounded corners, or shadows, creating a true
                    fullscreen experience. Ideal for immersive content or full-page interactions.
                  </>
                ) : (
                  <>
                    This modal uses the <code>{size}</code> size variant. On mobile devices, all
                    sizes adapt to near full-width for optimal viewing. On desktop, each size
                    provides a different maximum width to suit various content needs.
                  </>
                )}
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="bordered" />}>Cancel</Modal.Close>
              <Modal.Close render={<Button />}>Confirm</Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      ))}
    </div>
  );
}
