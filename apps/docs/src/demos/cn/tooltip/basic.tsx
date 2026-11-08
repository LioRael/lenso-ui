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
    <Tooltip.Provider delay={0}>
      <div {...stylex.props(styles.row)}>
        <Tooltip>
          <Tooltip.Trigger aria-describedby={textId} render={<Button />}>
            悬停查看
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup id={textId}>这是一个工具提示</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger
            aria-describedby={informationId}
            render={<Button isIconOnly aria-label="更多信息" />}
          >
            <CircleInfo />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup id={informationId}>更多信息</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  );
}
