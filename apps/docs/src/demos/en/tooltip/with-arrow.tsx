"use client";

// Adapted from HeroUI v3.2.6 tooltip-with-arrow (Apache-2.0).
import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function TooltipWithArrow() {
  const arrowId = useId();
  const offsetId = useId();
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip>
        <Tooltip.Trigger
          delay={0}
          aria-describedby={arrowId}
          render={<Button variant="secondary" />}
        >
          With Arrow
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={7}>
            <Tooltip.Popup id={arrowId}>
              <Tooltip.Arrow />
              <p>Tooltip with arrow indicator</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger
          delay={0}
          aria-describedby={offsetId}
          render={<Button variant="primary" />}
        >
          Custom Offset
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={12}>
            <Tooltip.Popup id={offsetId}>
              <Tooltip.Arrow />
              <p>Custom offset from trigger</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  );
}
