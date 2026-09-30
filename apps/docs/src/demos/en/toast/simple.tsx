"use client";

// Adapted from HeroUI v3.2.6 simple, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "./_shared";

function Messages() {
  const manager = Toast.useToastManager();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => manager.add({ title: "Simple message", type: "default" })}
          >
            Default
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => manager.add({ title: "Operation completed", type: "success" })}
          >
            Success
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => manager.add({ title: "New update available", type: "accent" })}
          >
            Info
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => manager.add({ title: "Please check your settings", type: "warning" })}
          >
            Warning
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => manager.add({ title: "Something went wrong", type: "danger" })}
          >
            Error
          </Button>
        </div>
      </div>
      <Notifications />
    </>
  );
}

export function Simple() {
  return (
    <Toast.Provider>
      <Messages />
    </Toast.Provider>
  );
}
