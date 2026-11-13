"use client";

import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function TooltipWithArrow() {
  const arrowId = useId();
  const offsetId = useId();
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={arrowId} render={<Button />}>
          With Arrow
        </Tooltip.Trigger>
        <Tooltip.Content id={arrowId} sideOffset={7}>
          <Tooltip.Arrow />
          <p>Tooltip with arrow indicator</p>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={offsetId} render={<Button variant="prominent" />}>
          Custom Offset
        </Tooltip.Trigger>
        <Tooltip.Content id={offsetId} sideOffset={12}>
          <Tooltip.Arrow />
          <p>Custom offset from trigger</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
