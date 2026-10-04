// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 tooltip-custom-styles (Apache-2.0).
import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { tokens } from "@lenso/tokens/tokens.stylex.const";
const styles = stylex.create({
  popup: {
    borderRadius: tokens.radiusLg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: tokens.surface,
    paddingInline: 10,
    paddingBlock: 4,
    fontSize: 12,
    color: tokens.foreground,
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  },
});
export function CustomStyles() {
  const id = useId();
  return (
    <Tooltip>
      <Tooltip.Trigger delay={0} aria-describedby={id} render={<Button variant="secondary" />}>
        分享链接
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup id={id} xstyle={styles.popup}>
            <p>已复制到剪贴板</p>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip>
  );
}
