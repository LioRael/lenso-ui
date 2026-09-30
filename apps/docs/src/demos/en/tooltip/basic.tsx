"use client";

// Adapted from HeroUI v3.2.6 tooltip-basic (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Tooltip } from "@lenso/ui";
import { useId } from "react";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function TooltipBasic() {
  const textId = useId();
  const informationId = useId();
  return (
    <Tooltip.Provider delay={0}>
      <div {...stylex.props(styles.row)}>
        <Tooltip>
          <Tooltip.Trigger aria-describedby={textId} render={<Button variant="secondary" />}>
            Hover me
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup id={textId}>This is a tooltip</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger
            aria-describedby={informationId}
            render={<Button isIconOnly aria-label="More information" variant="tertiary" />}
          >
            <CircleInfo />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup id={informationId}>More information</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
      </div>
    </Tooltip.Provider>
  );
}
