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
        Share link
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup id={id} xstyle={styles.popup}>
            <p>Copied to clipboard</p>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip>
  );
}
