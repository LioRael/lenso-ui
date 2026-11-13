"use client";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "./_shared";

const queue = createToaster();

export function Expanded() {
  return (
    <div {...stylex.props(styles.frame)}>
      <>
        <Notifications expanded aria-label="Expanded notifications" toaster={queue} />
      </>
      <Button
        size="sm"
        variant="bordered"
        onClick={() => {
          queue({ title: "Simple message", type: "default" });
          setTimeout(() => queue({ title: "Operation completed", type: "success" }), 400);
          setTimeout(() => queue({ title: "New update available", type: "info" }), 800);
        }}
      >
        Show 3 toasts
      </Button>
    </div>
  );
}
