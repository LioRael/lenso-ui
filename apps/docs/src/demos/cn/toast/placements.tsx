"use client";
import { Fragment } from "react";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "../../en/toast/_shared";
const placements = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"] as const;
const placementQueues = {
  "top-start": createToaster(),
  top: createToaster(),
  "top-end": createToaster(),
  "bottom-start": createToaster(),
  bottom: createToaster(),
  "bottom-end": createToaster(),
};

export function Placements() {
  return (
    <div {...stylex.props(styles.placements)}>
      {placements.map((placement) => (
        <Fragment key={placement}>
          <Notifications
            side={placement.startsWith("top") ? "top" : "bottom"}
            align={
              placement.endsWith("start") ? "start" : placement.endsWith("end") ? "end" : "center"
            }
            toaster={placementQueues[placement]}
            maxVisible={3}
          />
        </Fragment>
      ))}
      <div {...stylex.props(styles.placementButtons)}>
        {placements.map((placement) => (
          <Button
            key={placement}
            size="sm"
            variant="bordered"
            onClick={() =>
              placementQueues[placement]({
                description: "活动已创建",
                title: "活动已创建",
                type: "default",
              })
            }
          >
            {placement.replace("-", " ")}
          </Button>
        ))}
      </div>
    </div>
  );
}
