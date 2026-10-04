// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 tooltip-with-arrow (Apache-2.0).
import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
});
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
          带箭头
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={7}>
            <Tooltip.Popup id={arrowId}>
              <Tooltip.Arrow />
              <p>带箭头指示器的工具提示</p>
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
          自定义偏移
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={12}>
            <Tooltip.Popup id={offsetId}>
              <Tooltip.Arrow />
              <p>与触发器的自定义偏移</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  );
}
