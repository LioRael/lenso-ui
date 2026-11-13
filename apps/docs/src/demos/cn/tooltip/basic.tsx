"use client";

import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Tooltip } from "@lenso/ui";
import { useId } from "react";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
});
export function TooltipBasic() {
  const textId = useId();
  const informationId = useId();
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={textId} render={<Button />}>
          悬停查看
        </Tooltip.Trigger>
        <Tooltip.Content id={textId}>这是一个工具提示</Tooltip.Content>
      </Tooltip>
      <Tooltip delay={0}>
        <Tooltip.Trigger
          aria-describedby={informationId}
          render={<Button isIconOnly aria-label="更多信息" />}
        >
          <CircleInfo />
        </Tooltip.Trigger>
        <Tooltip.Content id={informationId}>更多信息</Tooltip.Content>
      </Tooltip>
    </div>
  );
}
