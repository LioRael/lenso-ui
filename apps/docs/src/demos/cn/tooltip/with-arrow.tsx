"use client";

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
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={arrowId} render={<Button />}>
          带箭头
        </Tooltip.Trigger>
        <Tooltip.Content id={arrowId} sideOffset={7}>
          <Tooltip.Arrow />
          <p>带箭头指示器的工具提示</p>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={offsetId} render={<Button variant="prominent" />}>
          自定义偏移
        </Tooltip.Trigger>
        <Tooltip.Content id={offsetId} sideOffset={12}>
          <Tooltip.Arrow />
          <p>与触发器的自定义偏移</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
