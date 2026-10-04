// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 custom-indicator, Apache-2.0.
import { Star } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Toast } from "@lenso/ui";
import { Notifications, styles, type ToastData } from "../../en/toast/_shared";
function Message() {
  const manager = Toast.useToastManager<ToastData>();
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            manager.add({
              title: "Custom icon indicator",
              data: {
                indicator: <Star />,
              },
            })
          }
        >
          自定义指示器
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
