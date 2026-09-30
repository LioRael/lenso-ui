"use client";

// Adapted from HeroUI v3.2.6 expanded, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "./_shared";

const queue = Toast.createToastManager();

export function Expanded() {
  return (
    <div {...stylex.props(styles.frame)}>
      <Toast.Provider toastManager={queue}>
        <Notifications expanded aria-label="Expanded notifications" />
      </Toast.Provider>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => {
          queue.add({ title: "Simple message", type: "default" });
          setTimeout(() => queue.add({ title: "Operation completed", type: "success" }), 400);
          setTimeout(() => queue.add({ title: "New update available", type: "accent" }), 800);
        }}
      >
        Show 3 toasts
      </Button>
    </div>
  );
}
