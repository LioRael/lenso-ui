// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 placements, Apache-2.0.
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
            variant="secondary"
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
