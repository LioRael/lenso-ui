"use client";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Notifications, styles } from "./_shared";

export function CustomQueue() {
  const [notificationQueue] = useState(() => createToaster());
  const [errorQueue] = useState(() => createToaster());
  const [successQueue] = useState(() => createToaster());
  return (
    <div {...stylex.props(styles.queues)}>
      <>
        <Notifications side="bottom" align="center" toaster={notificationQueue} maxVisible={2} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          size="sm"
          variant="bordered"
          onClick={() =>
            notificationQueue({
              description: "You have a new message",
              title: "New notification",
              type: "default",
            })
          }
        >
          Add notification (max 2)
        </Button>
      </div>
      <>
        <Notifications side="bottom" align="start" toaster={errorQueue} maxVisible={3} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          destructive
          size="sm"
          variant="bordered"
          onClick={() =>
            errorQueue({
              description: "Failed to save changes",
              title: "Error occurred",
              type: "error",
            })
          }
        >
          Add error (max 3)
        </Button>
      </div>
      <>
        <Notifications side="bottom" align="end" toaster={successQueue} maxVisible={1} />
      </>
      <div {...stylex.props(styles.queueButtons)}>
        <Button
          xstyle={styles.successText}
          size="sm"
          variant="bordered"
          onClick={() =>
            successQueue({
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
