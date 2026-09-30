"use client";

// Adapted from HeroUI v3.2.6 custom-queue, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "./_shared";

export function CustomQueue() {
  const [notificationQueue] = useState(() => Toast.createToastManager());
  const [errorQueue] = useState(() => Toast.createToastManager());
  const [successQueue] = useState(() => Toast.createToastManager());
  return (
    <div {...stylex.props(styles.queues)}>
      <Toast.Provider toastManager={notificationQueue} limit={2}>
        <Notifications placement="bottom" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            notificationQueue.add({
              description: "You have a new message",
              title: "New notification",
              type: "default",
            })
          }
        >
          Add notification (max 2)
        </Button>
      </div>
      <Toast.Provider toastManager={errorQueue} limit={3}>
        <Notifications placement="bottom-start" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="danger-soft"
          onClick={() =>
            errorQueue.add({
              description: "Failed to save changes",
              title: "Error occurred",
              type: "danger",
            })
          }
        >
          Add error (max 3)
        </Button>
      </div>
      <Toast.Provider toastManager={successQueue} limit={1}>
        <Notifications placement="bottom-end" />
      </Toast.Provider>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          xstyle={styles.successText}
          size="sm"
          variant="secondary"
          onClick={() =>
            successQueue.add({
              description: `Operation ${Date.now()}`,
              title: "Success!",
              type: "success",
            })
          }
        >
          Add success (max 1)
        </Button>
      </div>
    </div>
  );
}
