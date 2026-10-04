// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 simple, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles } from "../../en/toast/_shared";
function Messages() {
  const manager = Toast.useToastManager();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <div {...stylex.props(styles.buttons)}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Simple message",
                type: "default",
              })
            }
          >
            默认
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Operation completed",
                type: "success",
              })
            }
          >
            成功
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "New update available",
                type: "accent",
              })
            }
          >
            信息
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Please check your settings",
                type: "warning",
              })
            }
          >
            警告
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              manager.add({
                title: "Something went wrong",
                type: "danger",
              })
            }
          >
            错误
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
