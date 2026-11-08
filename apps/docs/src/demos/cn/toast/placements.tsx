"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "../../en/toast/_shared";
const placements = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"] as const;
const placementQueues = {
  "top-start": Toast.createToastManager(),
  top: Toast.createToastManager(),
  "top-end": Toast.createToastManager(),
  "bottom-start": Toast.createToastManager(),
  bottom: Toast.createToastManager(),
  "bottom-end": Toast.createToastManager(),
};
export function Placements() {
  return (
    <div {...stylex.props(styles.placements)}>
      {placements.map((placement) => (
        <Toast.Provider key={placement} toastManager={placementQueues[placement]} limit={3}>
          <Notifications placement={placement} />
        </Toast.Provider>
      ))}
      <div {...stylex.props(styles.placementButtons)}>
        {placements.map((placement) => (
          <Button
            key={placement}
            size="sm"
            variant="bordered"
            onClick={() =>
              placementQueues[placement].add({
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
