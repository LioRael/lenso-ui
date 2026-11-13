"use client";
import type { ReactNode } from "react";

import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "./_shared";

const toaster = createToaster<ReactNode>();

function Messages() {
  const manager = toaster;
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => manager({ title: "Simple message", type: "default" })}
          >
            Default
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => manager({ title: "Operation completed", type: "success" })}
          >
            Success
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => manager({ title: "New update available", type: "info" })}
          >
            Info
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => manager({ title: "Please check your settings", type: "warning" })}
          >
            Warning
          </Button>
          <Button
            size="sm"
            variant="bordered"
            onClick={() => manager({ title: "Something went wrong", type: "error" })}
          >
            Error
          </Button>
        </div>
      </div>
      <Notifications toaster={toaster} />
    </>
  );
}

export function Simple() {
  return (
    <>
      <Messages />
    </>
  );
}
