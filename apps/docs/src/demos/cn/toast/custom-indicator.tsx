"use client";
import type { ReactNode } from "react";

import { Star } from "@gravity-ui/icons";
import { Button, createToaster } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Notifications, styles } from "../../en/toast/_shared";
const toaster = createToaster<ReactNode>();

function Message() {
  const manager = toaster;
  return (
    <>
      <div {...stylex.props(styles.frame)}>
        <Button
          size="sm"
          variant="bordered"
          onClick={() =>
            manager({
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
      <Notifications toaster={toaster} />
    </>
  );
}
export function CustomIndicator() {
  return (
    <>
      <Message />
    </>
  );
}
