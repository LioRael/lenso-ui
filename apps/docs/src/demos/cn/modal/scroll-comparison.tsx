// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-scroll-comparison (Apache-2.0).
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  options: {
    display: "flex",
    gap: 16,
    borderWidth: 0,
    padding: 0,
  },
  popup: {
    maxWidth: 360,
  },
  caption: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--muted)",
  },
  paragraph: {
    marginBottom: 12,
  },
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
            {value === "inside" ? "内部" : "外部"}
          </label>
        ))}
      </fieldset>
      <Modal scroll={scroll}>
        <Modal.Trigger render={<Button variant="secondary" />}>
          打开模态框（{scroll.charAt(0).toUpperCase() + scroll.slice(1)})
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
                  对比滚动行为——内部在模态框内滚动内容，外部允许页面滚动
                </Modal.Description>
              </Modal.Header>
              <Modal.Body>
                {Array.from({
                  length: 30,
                }).map((_, i) => (
                  <p key={i} {...stylex.props(styles.paragraph)}>
                    段落{i + 1}： Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                    pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                    risus, sed porttitor quam.
                  </p>
                ))}
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close render={<Button variant="secondary" />}>取消</Modal.Close>
                <Modal.Close render={<Button />}>确认</Modal.Close>
              </Modal.Footer>
              <Modal.Close aria-label="Close dialog" />
            </Modal.Popup>
          </Modal.Viewport>
        </Modal.Portal>
      </Modal>
    </div>
  );
}
