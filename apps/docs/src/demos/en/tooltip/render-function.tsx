"use client";

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
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-describedby={textId} render={<Button />}>
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Content id={textId} render={(props) => <div {...props} data-custom="foo" />}>
          <p>This is a tooltip</p>
        </Tooltip.Content>
      </Tooltip>
      <Tooltip delay={0}>
        <Tooltip.Trigger
          aria-describedby={informationId}
          render={<Button isIconOnly aria-label="More information" />}
        >
          <CircleInfo />
        </Tooltip.Trigger>
        <Tooltip.Content
          id={informationId}
          render={(props) => <div {...props} data-custom="foo" />}
        >
          <p>More information</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
