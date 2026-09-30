"use client";

// Adapted from HeroUI v3.2.6 tooltip-render-function (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import { Button, Tooltip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function RenderFunction() {
  const textId = useId();
  const informationId = useId();
  return (
    <div {...stylex.props(styles.row)}>
      <Tooltip>
        <Tooltip.Trigger
          delay={0}
          aria-describedby={textId}
          render={<Button variant="secondary" />}
        >
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup id={textId} render={(props) => <div {...props} data-custom="foo" />}>
              <p>This is a tooltip</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
      <Tooltip>
        <Tooltip.Trigger
          delay={0}
          aria-describedby={informationId}
          render={<Button isIconOnly aria-label="More information" variant="tertiary" />}
        >
          <CircleInfo />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup
              id={informationId}
              render={(props) => <div {...props} data-custom="foo" />}
            >
              <p>More information</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  );
}
