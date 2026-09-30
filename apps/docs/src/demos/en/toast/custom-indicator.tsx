"use client";

// Adapted from HeroUI v3.2.6 custom-indicator, Apache-2.0.
import { Star } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "./_shared";

function Message() {
  const manager = Toast.useToastManager<ToastData>();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            manager.add({ title: "Custom icon indicator", data: { indicator: <Star /> } })
          }
        >
          Custom indicator
        </Button>
      </div>
      <Notifications />
    </>
  );
}

export function CustomIndicator() {
  return (
    <Toast.Provider>
      <Message />
    </Toast.Provider>
  );
}
