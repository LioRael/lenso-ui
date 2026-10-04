// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-custom-portal (Apache-2.0).
import { useCallback, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  text: {
    fontSize: 14,
  },
  caption: {
    fontSize: 14,
    color: "var(--muted)",
  },
  code: {
    borderRadius: 4,
    paddingInline: 4,
    paddingBlock: 2,
    fontSize: 12,
  },
  container: {
    position: "relative",
    display: "flex",
    height: 380,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "var(--radius)",
    backgroundColor: "color-mix(in oklab, var(--muted) 20%, transparent)",
    transform: "translateZ(0)",
  },
  backdrop: {
    height: "100%",
  },
  viewport: {
    height: "100%",
    maxHeight: "100%",
  },
  popup: {
    height: "100%",
    maxHeight: "100%",
    maxWidth: 448,
  },
});
export function CustomPortal() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const setPortalRef = useCallback((node: HTMLDivElement | null) => setPortalContainer(node), []);
  return (
    <div {...stylex.props(styles.column)}>
      <div>
        <p {...stylex.props(styles.text)}>
          将警告对话框渲染到自定义容器，而不是<code>document.body</code>
        </p>
        <p {...stylex.props(styles.caption)}>
          Apply <code {...stylex.props(styles.code)}>transform: translateZ(0)</code> to the
          container to create a new stacking context.
        </p>
      </div>
      <div ref={setPortalRef} {...stylex.props(styles.container)}>
        {!!portalContainer && (
          <AlertDialog>
            <AlertDialog.Trigger render={<Button />}>打开警告对话框</AlertDialog.Trigger>
            <AlertDialog.Portal container={portalContainer}>
              <AlertDialog.Backdrop xstyle={styles.backdrop} />
              <AlertDialog.Viewport xstyle={styles.viewport}>
                <AlertDialog.Popup xstyle={styles.popup}>
                  <AlertDialog.Close aria-label="Close dialog" />
                  <AlertDialog.Header>
                    <AlertDialog.Icon variant="accent" />
                    <AlertDialog.Title>自定义传送门</AlertDialog.Title>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    {Array.from(
                      {
                        length: 3,
                      },
                      (_, index) => (
                        <p key={index} {...stylex.props(styles.caption)}>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                          commodo consequat.
                        </p>
                      ),
                    )}
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <AlertDialog.Close render={<Button variant="tertiary" />}>
                      取消
                    </AlertDialog.Close>
                    <AlertDialog.Close render={<Button />}>确认</AlertDialog.Close>
                  </AlertDialog.Footer>
                </AlertDialog.Popup>
              </AlertDialog.Viewport>
            </AlertDialog.Portal>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
