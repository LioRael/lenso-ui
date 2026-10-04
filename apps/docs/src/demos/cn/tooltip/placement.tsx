// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 tooltip-placement (Apache-2.0).
import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { tokens } from "@lenso/tokens/tokens.stylex.const";
const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontSize: 14,
    color: tokens.muted,
  },
  button: {
    width: "100%",
  },
});
function Placement({ side, label }: { side: "top" | "left" | "right" | "bottom"; label: string }) {
  const id = useId();
  return (
    <Tooltip>
      <Tooltip.Trigger
        delay={0}
        aria-describedby={id}
        render={<Button variant="tertiary" xstyle={styles.button} />}
      >
        {label}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={7}>
          <Tooltip.Popup id={id}>
            <Tooltip.Arrow />
            <p>{label} placement</p>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip>
  );
}
export function TooltipPlacement() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div />
      <Placement side="top" label="Top" />
      <div />
      <Placement side="left" label="Left" />
      <div {...stylex.props(styles.center)}>
        <span {...stylex.props(styles.caption)}>悬停按钮</span>
      </div>
      <Placement side="right" label="Right" />
      <div />
      <Placement side="bottom" label="Bottom" />
      <div />
    </div>
  );
}
