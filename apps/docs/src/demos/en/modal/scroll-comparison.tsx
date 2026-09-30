"use client";
// Adapted from HeroUI v3.2.6 modal-scroll-comparison (Apache-2.0).
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 16 },
  options: { display: "flex", gap: 16, borderWidth: 0, padding: 0 },
  popup: { maxWidth: 360 },
  caption: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  paragraph: { marginBottom: 12 },
});

export function ScrollComparison() {
  const [scroll, setScroll] = useState<"inside" | "outside">("inside");
  return (
    <div {...stylex.props(styles.column)}>
      <fieldset {...stylex.props(styles.options)} aria-label="Scroll behavior">
        {(["inside", "outside"] as const).map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="modal-scroll"
              value={value}
              checked={scroll === value}
              onChange={() => setScroll(value)}
            />
            {value === "inside" ? "Inside" : "Outside"}
          </label>
        ))}
      </fieldset>
      <Modal scroll={scroll}>
        <Modal.Trigger render={<Button variant="secondary" />}>
          Open Modal ({scroll.charAt(0).toUpperCase() + scroll.slice(1)})
        </Modal.Trigger>
        <Modal.Portal>
          <Modal.Backdrop />
          <Modal.Viewport>
            <Modal.Popup xstyle={styles.popup}>
              <Modal.Header>
                <Modal.Title>
                  Scroll: {scroll.charAt(0).toUpperCase() + scroll.slice(1)}
                </Modal.Title>
                <Modal.Description xstyle={styles.caption}>
                  Compare scroll behaviors - inside keeps content scrollable within the modal,
                  outside allows page scrolling
                </Modal.Description>
              </Modal.Header>
              <Modal.Body>
                {Array.from({ length: 30 }).map((_, i) => (
                  <p key={i} {...stylex.props(styles.paragraph)}>
                    Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet
                    hendrerit risus, sed porttitor quam.
                  </p>
                ))}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
                <Modal.Close render={<Button />}>Confirm</Modal.Close>
              </Modal.Footer>
              <Modal.Close aria-label="Close dialog" />
            </Modal.Popup>
          </Modal.Viewport>
        </Modal.Portal>
      </Modal>
    </div>
  );
}
